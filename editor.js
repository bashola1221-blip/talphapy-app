// editor.js - Reusable In-App Python Editor

let pyodideReady = false;
let pyodideLoading = false;

// Function to insert text at the cursor position (Works for both main editor and quiz)
function insertSymbol(symbol, targetId = 'code-input') {
    const ta = document.getElementById(targetId);
    if (!ta) return;
    
    const startPos = ta.selectionStart;
    const endPos = ta.selectionEnd;
    
    // Check if we need to move the cursor back (like for print())
    let cursorOffset = symbol.length;
    if (symbol === 'print()') {
        cursorOffset = 6; // Put cursor inside the parentheses
    }

    ta.value = ta.value.substring(0, startPos) + symbol + ta.value.substring(endPos, ta.value.length);
    ta.selectionStart = ta.selectionEnd = startPos + cursorOffset;
    ta.focus();
}

// Function to run the code
async function runPythonCode(outputId, runBtnId) {
    const code = document.getElementById('code-input').value;
    const output = document.getElementById(outputId);
    const runBtn = document.getElementById(runBtnId);
    
    if (!code.trim()) return;

    output.innerHTML = "⏳ Running...";
    runBtn.disabled = true;

    try {
        if (!pyodideReady) {
            if (!pyodideLoading) {
                pyodideLoading = true;
                output.innerHTML = "⏳ Loading Python engine (this takes a few seconds the first time)...";
                window.pyodide = await loadPyodide({
                    stdout: (text) => {
                        output.innerHTML += text + "<br>";
                    }
                });
                pyodideReady = true;
            } else {
                while (!pyodideReady) { await new Promise(r => setTimeout(r, 500)); }
            }
        }

        output.innerHTML = ""; 
        await window.pyodide.runPythonAsync(code);
        
        if (output.innerHTML === "") {
            output.innerHTML = "<span style='color: gray;'>[Program finished with no output]</span>";
        }
    } catch (error) {
        output.innerHTML = `<span style="color: #ef4444;">${error.message}</span>`;
    }
    
    runBtn.disabled = false;
}

// Builds the Floating Action Button and the Modal
function setupGlobalEditor() {
    // 1. Add the floating button
    const fab = document.createElement('button');
    fab.className = 'fab-editor';
    fab.innerHTML = '💻';
    fab.onclick = openEditorModal;
    document.body.appendChild(fab);

    // 2. Add the Modal HTML
    const modal = document.createElement('div');
    modal.id = 'editor-modal';
    modal.className = 'editor-modal-overlay';
    modal.innerHTML = `
        <div class="editor-modal-content">
            <div class="editor-modal-header">
                <span>🐍 Python Playground</span>
                <button class="close-modal" onclick="document.getElementById('editor-modal').style.display='none'">✖</button>
            </div>
            
            <textarea id="modal-code" class="code-area" placeholder="Type Python code here..." spellcheck="false" style="height: 200px;"></textarea>
            
            <div class="symbol-bar">
                <button onclick="insertSymbol(':', 'modal-code')">:</button>
                <button onclick="insertSymbol(';', 'modal-code')">;</button>
                <button onclick="insertSymbol('&#39;', 'modal-code')">'</button>
                <button onclick="insertSymbol('&quot;', 'modal-code')">"</button>
                <button onclick="insertSymbol('#', 'modal-code')">#</button>
                <button onclick="insertSymbol('(', 'modal-code')">(</button>
                <button onclick="insertSymbol(')', 'modal-code')">)</button>
                <button onclick="insertSymbol('[', 'modal-code')">[</button>
                <button onclick="insertSymbol(']', 'modal-code')">]</button>
                <button onclick="insertSymbol('=', 'modal-code')">=</button>
                <button onclick="insertSymbol('print()', 'modal-code')" style="color: var(--gold); font-weight: bold;">print()</button>
            </div>
            
            <button id="modal-run-btn" class="run-btn" onclick="runModalCode()">▶ Run Code</button>
            
            <div class="output-header">Output:</div>
            <div id="modal-output" class="code-output" style="max-height: 150px; overflow-y: auto;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Load Pyodide script dynamically
    if (!document.getElementById('pyodide-script')) {
        const script = document.createElement('script');
        script.id = 'pyodide-script';
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        document.head.appendChild(script);
    }
}

function openEditorModal() {
    document.getElementById('editor-modal').style.display = 'flex';
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
                        output.innerHTML += text + "<br>";
                    }
                });
                pyodideReady = true;
            } else {
                while (!pyodideReady) { await new Promise(r => setTimeout(r, 500)); }
            }
        }

        output.innerHTML = ""; 
        await window.pyodide.runPythonAsync(code);
        
        if (output.innerHTML === "") {
            output.innerHTML = "<span style='color: gray;'>[Program finished with no output]</span>";
        }
    } catch (error) {
        output.innerHTML = `<span style="color: #ef4444;">${error.message}</span>`;
    }
    
    runBtn.disabled = false;
}

// Add the styles for the modal and FAB
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
        .close-modal {
            background: none; border: none; color: #fff; font-size: 18px; cursor: pointer;
        }
        /* Re-using the classes from lesson1 */
        .code-area { width: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 14px; resize: none; outline: none; }
        .symbol-bar { display: flex; overflow-x: auto; background: #2d2d2d; padding: 8px; gap: 8px; -webkit-overflow-scrolling: touch; }
        .symbol-bar::-webkit-scrollbar { display: none; }
        .symbol-bar button { background: #3c3c3c; color: #fff; border: none; padding: 8px 12px; border-radius: 6px; font-size: 14px; font-family: monospace; cursor: pointer; flex-shrink: 0; }
        .symbol-bar button:active { background: #555; }
        .run-btn { width: 100%; padding: 12px; background: #4CAF50; color: white; font-weight: bold; border: none; font-size: 14px; cursor: pointer; }
        .run-btn:disabled { background: #2e7d32; opacity: 0.7; }
        .output-header { background: #2d2d2d; color: #ccc; font-size: 12px; padding: 4px 12px; }
        .code-output { background: #000; color: #fff; min-height: 60px; padding: 12px; font-family: 'Courier New', Courier, monospace; font-size: 14px; white-space: pre-wrap; line-height: 1.4; }
    `;
    document.head.appendChild(style);
    setupGlobalEditor();
});
