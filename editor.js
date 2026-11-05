// editor.js - Reusable In-App Python Editor

let pyodideReady = false;
let pyodideLoading = false;

function insertSymbol(symbol, targetId) {
    const ta = document.getElementById(targetId);
    if (!ta) return;
    
    const startPos = ta.selectionStart;
    const endPos = ta.selectionEnd;
    
    let cursorOffset = symbol.length;
    if (symbol === 'print()' || symbol === 'input()' || symbol === 'range()') {
        cursorOffset = symbol.length - 1; 
    }
    if (symbol === 'for i in range():') {
        cursorOffset = 15; 
    }

    ta.value = ta.value.substring(0, startPos) + symbol + ta.value.substring(endPos, ta.value.length);
    ta.selectionStart = ta.selectionEnd = startPos + cursorOffset;
    ta.focus();
}

function openEditorModal(initialCode = '') {
    document.getElementById('editor-modal').style.display = 'flex';
    const ta = document.getElementById('modal-code');
    
    if (initialCode) {
        let div = document.createElement('div');
        div.innerHTML = initialCode;
        ta.value = div.textContent;
    }
    ta.focus();
}

async function runModalCode() {
    const code = document.getElementById('modal-code').value;
    const output = document.getElementById('modal-output');
    const runBtn = document.getElementById('modal-run-btn');
    
    if (!code.trim()) return;

    output.innerHTML = "⏳ Running...";
    runBtn.disabled = true;

    try {
        if (!pyodideReady) {
            if (!pyodideLoading) {
                pyodideLoading = true;
                output.innerHTML = "⏳ Loading Python engine...";
                window.pyodide = await loadPyodide({
                    stdout: (text) => {
                        if (output.innerHTML.includes("⏳ Running...") || output.innerHTML.includes("⏳ Loading")) {
                            output.innerHTML = "";
                        }
                        output.innerText += text; 
                    }
                });
                pyodideReady = true;
            } else {
                while (!pyodideReady) { await new Promise(r => setTimeout(r, 500)); }
            }
        }

        output.innerText = ""; 
        await window.pyodide.runPythonAsync(code);
        
        if (output.innerText === "") {
            output.innerText = "[Program finished with no output]";
        }
    } catch (error) {
        output.innerHTML += `<br><span style="color: #ef4444;">${error.message}</span>`;
    }
    
    runBtn.disabled = false;
}

function setupGlobalEditor() {
    const fab = document.createElement('button');
    fab.className = 'fab-editor';
    fab.innerHTML = '💻';
    fab.onclick = () => openEditorModal(); 
    document.body.appendChild(fab);

    const modal = document.createElement('div');
    modal.id = 'editor-modal';
    modal.className = 'editor-modal-overlay';
    modal.innerHTML = `
        <div class="editor-modal-content">
            <div class="editor-modal-header">
                <span>🐍 Python Playground</span>
                <button class="close-modal" onclick="document.getElementById('editor-modal').style.display='none'">✖</button>
            </div>
            
            <textarea id="modal-code" class="code-area" placeholder="Type Python code here..." spellcheck="false" style="height: 120px; flex-shrink: 0;"></textarea>
            
            <!-- SCROLL FIX IS HERE -->
            <div class="symbol-bar">
                <button onclick="insertSymbol(',', 'modal-code')">,</button>
                <button onclick="insertSymbol('[', 'modal-code')">[</button>
                <button onclick="insertSymbol(']', 'modal-code')">]</button>
                <button onclick="insertSymbol('+', 'modal-code')">+</button>
                <button onclick="insertSymbol('-', 'modal-code')">-</button>
                <button onclick="insertSymbol('*', 'modal-code')">*</button>
                <button onclick="insertSymbol('/', 'modal-code')">/</button>
                <button onclick="insertSymbol('%', 'modal-code')">%</button>
                <button onclick="insertSymbol('=', 'modal-code')">=</button>
                <button onclick="insertSymbol('==', 'modal-code')">==</button>
                <button onclick="insertSymbol('!=', 'modal-code')">!=</button>
                <button onclick="insertSymbol('<', 'modal-code')">&lt;</button>
                <button onclick="insertSymbol('>', 'modal-code')">&gt;</button>
                <button onclick="insertSymbol(':', 'modal-code')">:</button>
                <button onclick="insertSymbol('#', 'modal-code')">#</button>
                <button onclick="insertSymbol('&#39;', 'modal-code')">'</button>
                <button onclick="insertSymbol('&quot;', 'modal-code')">"</button>
                <button onclick="insertSymbol('(', 'modal-code')">(</button>
                <button onclick="insertSymbol(')', 'modal-code')">)</button>
                <button onclick="insertSymbol('print()', 'modal-code')" style="color: var(--gold); font-weight: bold;">print()</button>
                <button onclick="insertSymbol('input()', 'modal-code')" style="color: var(--gold); font-weight: bold;">input()</button>
                <button onclick="insertSymbol('range()', 'modal-code')" style="color: #61afef; font-weight: bold;">range()</button>
                <button onclick="insertSymbol('if ', 'modal-code')" style="color: #c678dd; font-weight: bold;">if</button>
                <button onclick="insertSymbol('else:', 'modal-code')" style="color: #c678dd; font-weight: bold;">else:</button>
                <button onclick="insertSymbol('for i in range():', 'modal-code')" style="color: #c678dd; font-weight: bold;">for</button>
                <button onclick="insertSymbol('import ', 'modal-code')" style="color: #61afef; font-weight: bold;">import</button>
                <button onclick="insertSymbol('time.sleep(1)', 'modal-code')" style="color: #61afef; font-weight: bold;">sleep()</button>
            </div>
            
            <button id="modal-run-btn" class="run-btn" onclick="runModalCode()">▶ Run Code</button>
            
            <div class="output-header">Output:</div>
            <pre id="modal-output" class="code-output" style="max-height: 100px; overflow-y: auto; margin:0; font-family:monospace;"></pre>
        </div>
    `;
    document.body.appendChild(modal);

    if (!document.getElementById('pyodide-script')) {
        const script = document.createElement('script');
        script.id = 'pyodide-script';
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        document.head.appendChild(script);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .fab-editor {
            position: fixed; bottom: 85px; right: 20px;
            width: 56px; height: 56px; border-radius: 50%;
            background: var(--gold); color: var(--bg-color);
            font-size: 24px; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            z-index: 1500; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .fab-editor:active { transform: scale(0.95); }
        
        .editor-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: none; justify-content: center; align-items: center;
            z-index: 2000; padding: 15px;
        }
        
        .editor-modal-content {
            background: #1e1e1e; width: 100%; max-width: 480px; border-radius: 12px;
            border: 1px solid #333; display: flex; flex-direction: column;
            max-height: 95dvh; /* Fits the keyboard opening */
            overflow-y: auto; /* Allows vertical scroll of the whole modal if needed */
        }
        
        .editor-modal-header {
            background: #2d2d2d; color: #ccc; padding: 12px; font-weight: bold;
            display: flex; justify-content: space-between; align-items: center;
            position: sticky; top: 0; z-index: 10;
        }
        
        .close-modal { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
        .code-area { width: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 14px; resize: none; outline: none; }
        
        /* THE SCROLL FIX */
        .symbol-bar { 
            display: flex; 
            flex-wrap: nowrap; /* Forces single line */
            overflow-x: auto; /* Enables side scrolling */
            background: #2d2d2d; 
            padding: 8px; 
            gap: 8px; 
            -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
            touch-action: pan-x; /* Tells phone to only scroll sideways here */
            scrollbar-width: none; /* Hides scrollbar on Firefox */
        }
        .symbol-bar::-webkit-scrollbar { display: none; } /* Hides scrollbar on Chrome */
        .symbol-bar button { background: #3c3c3c; color: #fff; border: none; padding: 8px 12px; border-radius: 6px; font-size: 14px; font-family: monospace; cursor: pointer; flex-shrink: 0; /* Prevents buttons from squishing */ }
        .symbol-bar button:active { background: #555; }
        .run-btn { width: 100%; padding: 12px; background: #4CAF50; color: white; font-weight: bold; border: none; font-size: 14px; cursor: pointer; flex-shrink: 0; }
        .run-btn:disabled { background: #2e7d32; opacity: 0.7; }
        .output-header { background: #2d2d2d; color: #ccc; font-size: 12px; padding: 4px 12px; }
        .code-output { background: #000; color: #fff; min-height: 40px; padding: 12px; font-size: 14px; white-space: pre-wrap; line-height: 1.4; }
        
        @media (min-width: 768px) {
            .symbol-bar { display: none; }
            .editor-modal-content { max-width: 800px; }
        }
    `;
    document.head.appendChild(style);
    setupGlobalEditor();
});
