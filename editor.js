// editor.js - Reusable In-App Python Editor

let pyodideReady = false;
let pyodideLoading = false;

// Function to insert text at the cursor position
function insertSymbol(symbol) {
    const ta = document.getElementById('code-input');
    const startPos = ta.selectionStart;
    const endPos = ta.selectionEnd;
    ta.value = ta.value.substring(0, startPos) + symbol + ta.value.substring(endPos, ta.value.length);
    ta.selectionStart = ta.selectionEnd = startPos + symbol.length;
    ta.focus();
}

// Function to run the code
async function runPythonCode() {
    const code = document.getElementById('code-input').value;
    const output = document.getElementById('code-output');
    const runBtn = document.getElementById('run-btn');
    
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
                // Wait for it to load if it's already loading
                while (!pyodideReady) { await new Promise(r => setTimeout(r, 500)); }
            }
        }

        output.innerHTML = ""; // Clear output before running
        await window.pyodide.runPythonAsync(code);
        
        if (output.innerHTML === "") {
            output.innerHTML = "<span style='color: gray;'>[Program finished with no output]</span>";
        }
    } catch (error) {
        output.innerHTML = `<span style="color: #ef4444;">${error.message}</span>`;
    }
    
    runBtn.disabled = false;
}

// Function to build the UI
function createEditor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="in-app-editor">
            <div class="editor-header">Python Playground</div>
            <textarea id="code-input" class="code-area" placeholder="Write your Python code here..." spellcheck="false"></textarea>
            
            <!-- The custom keyboard bar from your Pydroid screenshot -->
            <div class="symbol-bar">
                <button onclick="insertSymbol(':')">:</button>
                <button onclick="insertSymbol(';')">;</button>
                <button onclick="insertSymbol("'")">'</button>
                <button onclick="insertSymbol('"')">"</button>
                <button onclick="insertSymbol('#')">#</button>
                <button onclick="insertSymbol('(')">(</button>
                <button onclick="insertSymbol(')')">)</button>
                <button onclick="insertSymbol('[')">[</button>
                <button onclick="insertSymbol(']')">]</button>
                <button onclick="insertSymbol('=')">=</button>
                <button onclick="insertSymbol('print()')" style="color: var(--gold); font-weight: bold;">print()</button>
            </div>
            
            <button id="run-btn" class="run-btn" onclick="runPythonCode()">▶ Run Code</button>
            
            <div class="output-header">Output:</div>
            <div id="code-output" class="code-output"></div>
        </div>
    `;
    
    // Load Pyodide script dynamically
    if (!document.getElementById('pyodide-script')) {
        const script = document.createElement('script');
        script.id = 'pyodide-script';
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        document.head.appendChild(script);
    }
}
