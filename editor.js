// editor.js - Reusable In-App Python Editor

let pyodideReady = false;
let pyodideLoading = false;

// Function to insert text at the cursor position
function insertSymbol(symbol, targetId) {
    const ta = document.getElementById(targetId);
    if (!ta) return;
    
    const startPos = ta.selectionStart;
    const endPos = ta.selectionEnd;
    
    let cursorOffset = symbol.length;
    if (symbol === 'print()' || symbol === 'input()' || symbol === 'len()') {
        cursorOffset = symbol.length - 1; // Put cursor inside the parentheses
    } else if (symbol === '    ') {
        cursorOffset = 4; // Indentation
    }

    ta.value = ta.value.substring(0, startPos) + symbol + ta.value.substring(endPos, ta.value.length);
    ta.selectionStart = ta.selectionEnd = startPos + cursorOffset;
    ta.focus();
}

// Function to open the modal, optionally with pre-filled code
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
            
            <textarea id="modal-code" class="code-area" placeholder="Type Python code here..." spellcheck="false" style="height: 150px;"></textarea>
            
            <!-- EXPANDED SYMBOL BAR -->
            <div class="symbol-bar">
                <!-- Indentation -->
                <button onclick="insertSymbol('    ', 'modal-code')" style="color:var(--gold); font-weight:bold;">Tab ⤵</button>
                <!-- Math & Comparison -->
                <button onclick="insertSymbol('==', 'modal-code')">==</button>
                <button onclick="insertSymbol('!=', 'modal-code')">!=</button>
                <button onclick="insertSymbol('<', 'modal-code')"><</button>
                <button onclick="insertSymbol('>', 'modal-code')">></button>
                <button onclick="insertSymbol('+', 'modal-code')">+</button>
                <button onclick="insertSymbol('-', 'modal-code')">-</button>
                <button onclick="insertSymbol('*', 'modal-code')">*</button>
                <button onclick="insertSymbol('/', 'modal-code')">/</button>
                <!-- Syntax -->
                <button onclick="insertSymbol(':', 'modal-code')">:</button>
                <button onclick="insertSymbol('&#39;', 'modal-code')">'</button>
                <button onclick="insertSymbol('&quot;', 'modal-code')">"</button>
                <button onclick="insertSymbol('(', 'modal-code')">(</button>
                <button onclick="insertSymbol(')', 'modal-code')">)</button>
                <button onclick="insertSymbol('[', 'modal-code')">[</button>
                <button onclick="insertSymbol(']', 'modal-code')">]</button>
                <button onclick="insertSymbol('{', 'modal-code')">{</button>
                <button onclick="insertSymbol('}', 'modal-code')">}</button>
                <!-- Keywords -->
                <button onclick="insertSymbol('if ', 'modal-code')" style="color:#c678dd; font-weight:bold;">if</button>
                <button onclick="insertSymbol('else:', 'modal-code')" style="color:#c678dd; font-weight:bold;">else:</button>
                <button onclick="insertSymbol('elif ', 'modal-code')" style="color:#c678dd; font-weight:bold;">elif</button>
                <button onclick="insertSymbol('for ', 'modal-code')" style="color:#c678dd; font-weight:bold;">for</button>
                <button onclick="insertSymbol('while ', 'modal-code')" style="color:#c678dd; font-weight:bold;">while</button>
                <button onclick="insertSymbol('def ', 'modal-code')" style="color:#c678dd; font-weight:bold;">def</button>
                <button onclick="insertSymbol('return ', 'modal-code')" style="color:#c678dd; font-weight:bold;">return</button>
                <!-- Functions -->
                <button onclick="insertSymbol('print()', 'modal-code')" style="color:#61afef; font-weight:bold;">print()</button>
                <button onclick="insertSymbol('input()', 'modal-code')" style="color:#61afef; font-weight:bold;">input()</button>
                <button onclick="insertSymbol('len()', 'modal-code')" style="color:#61afef; font-weight:bold;">len()</button>
            </div>
            
            <button id="modal-run-btn" class="run-btn" onclick="runModalCode()">▶ Run Code</button>
            
            <div class="output-header">Output:</div>
            <pre id="modal-output" class="code-output" style="max-height: 120px; overflow-y: auto; margin:0; font-family:monospace;"></pre>
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
            z-index: 2000; padding: 20px;
        }
        .editor-modal-content {
            background: #1e1e1e; width: 100%; max-width: 480px; border-radius: 12px;
            border: 1px solid #333; overflow: hidden; display: flex; flex-direction: column;
        }
        .editor-modal-header {
            background: #2d2d2d; color: #ccc; padding: 12px; font-weight: bold;
            display: flex; justify-content: space-between; align-items: center;
        }
        .close-modal { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
        .code-area { width: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 14px; resize: none; outline: none; }
        .symbol-bar { display: flex; overflow-x: auto; background: #2d2d2d; padding: 8px; gap: 6px; -webkit-overflow-scrolling: touch; }
        .symbol-bar::-webkit-scrollbar { display: none; }
        .symbol-bar button { background: #3c3c3c; color: #fff; border: none; padding: 8px 12px; border-radius: 6px; font-size: 14px; font-family: monospace; cursor: pointer; flex-shrink: 0; }
        .symbol-bar button:active { background: #555; }
        .run-btn { width: 100%; padding: 12px; background: #4CAF50; color: white; font-weight: bold; border: none; font-size: 14px; cursor: pointer; }
        .run-btn:disabled { background: #2e7d32; opacity: 0.7; }
        .output-header { background: #2d2d2d; color: #ccc; font-size: 12px; padding: 4px 12px; }
        .code-output { background: #000; color: #fff; min-height: 60px; padding: 12px; font-size: 14px; white-space: pre-wrap; line-height: 1.4; }
        .btn-practice { display: inline-block; background: rgba(240,192,64,0.1); color: var(--gold); border: 1px dashed var(--gold); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-top: -16px; margin-bottom: 24px; cursor: pointer; }
    `;
    document.head.appendChild(style);
    setupGlobalEditor();
});
