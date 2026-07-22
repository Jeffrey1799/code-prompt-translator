import * as vscode from 'vscode';
import { STATUS } from '../constants';

export function getWebviewHtml(webview: vscode.Webview): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Prompt Translator</title>
  <style nonce="${nonce}">
    :root {
      color-scheme: light dark;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      height: 100%;
    }

    body {
      margin: 0;
      padding: 10px;
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 10px;
      min-width: 0;
    }

    /* Header Bar */
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-editorWidget-background);
      color: var(--vscode-foreground);
      line-height: 1.3;
      word-break: break-word;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--vscode-charts-green, #4ec9b0);
      flex-shrink: 0;
    }

    .status-pill.error .status-dot {
      background: var(--vscode-errorForeground, #f14c4c);
    }

    .status-pill.info .status-dot {
      background: var(--vscode-charts-green, #4ec9b0);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-btn {
      width: 26px;
      height: 26px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
      font-size: 13px;
    }

    .icon-btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-header label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--vscode-descriptionForeground);
    }

    .section.flex-grow {
      flex: 1;
      min-height: 100px;
    }

    .section.flex-grow textarea {
      flex: 1;
      min-height: 80px;
    }

    textarea {
      width: 100%;
      min-height: 100px;
      resize: vertical;
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 6px;
      padding: 8px 10px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 12px);
      line-height: 1.45;
      outline: none;
    }

    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }

    textarea::placeholder {
      color: var(--vscode-input-placeholderForeground);
    }

    /* Input Actions Bar below textarea */
    .input-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-top: 4px;
    }

    #inputText {
      width: 100%;
      min-height: 60px;
      max-height: 180px;
      height: 60px;
      resize: none;
      overflow-y: hidden;
      box-sizing: border-box;
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 6px;
      padding: 8px 10px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 12px);
      line-height: 1.45;
      outline: none;
    }

    #inputText:focus {
      border-color: var(--vscode-focusBorder);
    }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 26px;
      padding: 0 12px;
      border-radius: 13px;
      border: none;
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      cursor: pointer;
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--vscode-button-hoverBackground);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .clear-icon-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }

    .clear-icon-btn:hover {
      background: var(--vscode-toolbar-hoverBackground, rgba(128,128,128,0.2));
      color: var(--vscode-foreground);
    }

    .mini-btn {
      height: 20px;
      padding: 0 6px;
      font-size: 10px;
      border-radius: 3px;
      border: 1px solid var(--vscode-button-border, transparent);
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
    }

    .mini-btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .checkboxes {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 2px 0;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
    }

    .checkbox-row input {
      margin: 0;
      cursor: pointer;
    }

    .settings-panel {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 10px;
      background: var(--vscode-editorWidget-background);
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 4px;
    }

    .settings-panel.hidden {
      display: none;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .form-group label {
      font-size: 10px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .form-group input {
      width: 100%;
      height: 26px;
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 4px;
      padding: 0 6px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      font-family: var(--vscode-font-family);
      font-size: 11px;
      outline: none;
    }

    .settings-buttons {
      display: flex;
      gap: 6px;
      margin-top: 2px;
    }

    .settings-buttons button {
      flex: 1;
      height: 24px;
      padding: 0 4px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <main class="container">
    <!-- 顶部状态胶囊与功能栏 -->
    <header class="top-header">
      <div id="status" role="status" aria-live="polite" class="status-pill info">
        <span class="status-dot"></span>
        <span id="statusText">${STATUS.ready}</span>
      </div>
      <div class="header-actions">
        <button id="translateOnlyButton" type="button" class="mini-btn" title="Translate without copying">Trans Only</button>
        <button id="setApiKeyButton" type="button" class="icon-btn" title="Settings / Configure API Key">⚙️</button>
      </div>
    </header>

    <!-- 设置面板（平滑折叠） -->
    <div id="settingsPanel" class="settings-panel hidden">
      <div class="form-group">
        <label for="apiKeyInput">API Key</label>
        <input id="apiKeyInput" type="password" placeholder="Enter API Key">
      </div>
      <div class="form-group">
        <label for="baseUrlInput">Base URL</label>
        <input id="baseUrlInput" type="text" placeholder="https://api.openai.com/v1">
      </div>
      <div class="form-group">
        <label for="modelInput">Model Name</label>
        <input id="modelInput" type="text" placeholder="gpt-4.1-mini">
      </div>
      <div class="settings-buttons">
        <button id="saveSettingsButton" type="button">Save</button>
        <button id="clearSettingsApiKeyButton" type="button" class="secondary">Clear Key</button>
        <button id="cancelSettingsButton" type="button" class="secondary">Cancel</button>
      </div>
    </div>

    <!-- 选项配置 -->
    <section class="checkboxes" aria-label="Translation options">
      <label class="checkbox-row" for="appendInstructionCheckbox">
        <input id="appendInstructionCheckbox" type="checkbox" checked>
        <span>Append Chinese reply instruction</span>
      </label>
      <label class="checkbox-row" for="autoCopyCheckbox">
        <input id="autoCopyCheckbox" type="checkbox" checked>
        <span>Auto copy after translation</span>
      </label>
      <label class="checkbox-row" for="sendToTerminalCheckbox">
        <input id="sendToTerminalCheckbox" type="checkbox" checked>
        <span>Send to active terminal &amp; focus</span>
      </label>
    </section>

    <!-- 中部：英文输出区 -->
    <section class="section flex-grow">
      <div class="section-header">
        <label for="outputText">English Output</label>
        <button id="copyButton" type="button" class="mini-btn" title="Copy Output">Copy</button>
      </div>
      <textarea id="outputText" spellcheck="false" placeholder="Translation output will appear here..."></textarea>
    </section>

    <!-- 底部：中文输入框（置底与终端平齐） -->
    <section class="section">
      <div class="section-header">
        <label for="inputText">Chinese Prompt</label>
      </div>
      <textarea id="inputText" spellcheck="false" placeholder="Enter Chinese coding prompt... (Enter to translate &amp; send to Agent CLI)"></textarea>
      <div class="input-actions-bar">
        <button id="clearButton" type="button" class="mini-btn" title="Clear text">Clear</button>
        <button id="translateCopyButton" type="button" class="submit-btn" title="Translate &amp; Copy (Enter)">
          <span>Translate &amp; Send</span>
          <span style="font-size: 12px; font-weight: bold;">↵</span>
        </button>
      </div>
      <div class="shortcut-row" style="margin-top: 4px; font-size: 11px;">Enter: Translate &amp; Send · Shift+Enter: New Line · Ctrl+L: Clear</div>
    </section>
  </main>

  <script nonce="${nonce}">
    (function () {
      const vscode = acquireVsCodeApi();
      const inputText = document.getElementById('inputText');
      const outputText = document.getElementById('outputText');
      const translateCopyButton = document.getElementById('translateCopyButton');
      const translateOnlyButton = document.getElementById('translateOnlyButton');
      const copyButton = document.getElementById('copyButton');
      const clearButton = document.getElementById('clearButton');
      const setApiKeyButton = document.getElementById('setApiKeyButton');
      const appendInstructionCheckbox = document.getElementById('appendInstructionCheckbox');
      const autoCopyCheckbox = document.getElementById('autoCopyCheckbox');
      const sendToTerminalCheckbox = document.getElementById('sendToTerminalCheckbox');
      const status = document.getElementById('status');
      const statusText = document.getElementById('statusText');

      const settingsPanel = document.getElementById('settingsPanel');
      const apiKeyInput = document.getElementById('apiKeyInput');
      const baseUrlInput = document.getElementById('baseUrlInput');
      const modelInput = document.getElementById('modelInput');
      const saveSettingsButton = document.getElementById('saveSettingsButton');
      const clearSettingsApiKeyButton = document.getElementById('clearSettingsApiKeyButton');
      const cancelSettingsButton = document.getElementById('cancelSettingsButton');

      const state = vscode.getState() || {};
      inputText.value = typeof state.inputText === 'string' ? state.inputText : '';
      outputText.value = typeof state.outputText === 'string' ? state.outputText : '';
      if (statusText) {
        statusText.textContent = typeof state.status === 'string' ? state.status : '${STATUS.ready}';
      }
      status.className = 'status-pill ' + (state.isError ? 'error' : 'info');

      if (state.settingsPanelVisible) {
        settingsPanel.classList.remove('hidden');
      }
      apiKeyInput.value = typeof state.apiKeyInputValue === 'string' ? state.apiKeyInputValue : '';
      baseUrlInput.value = typeof state.baseUrlInputValue === 'string' ? state.baseUrlInputValue : '';
      modelInput.value = typeof state.modelInputValue === 'string' ? state.modelInputValue : '';

      function saveState() {
        vscode.setState({
          inputText: inputText.value,
          outputText: outputText.value,
          appendChineseReplyInstruction: appendInstructionCheckbox.checked,
          autoCopyAfterTranslation: autoCopyCheckbox.checked,
          sendToTerminalAfterTranslation: sendToTerminalCheckbox.checked,
          status: statusText ? statusText.textContent : status.textContent,
          isError: status.classList.contains('error'),
          settingsPanelVisible: !settingsPanel.classList.contains('hidden'),
          apiKeyInputValue: apiKeyInput.value,
          baseUrlInputValue: baseUrlInput.value,
          modelInputValue: modelInput.value
        });
      }

      function setStatus(message, isError) {
        if (statusText) {
          statusText.textContent = message;
        } else {
          status.textContent = message;
        }
        status.className = 'status-pill ' + (isError ? 'error' : 'info');
        saveState();
      }

      function setBusy(isBusy) {
        translateCopyButton.disabled = isBusy;
        translateOnlyButton.disabled = isBusy;
        setApiKeyButton.disabled = isBusy;
      }

      function translate(mode) {
        const text = inputText.value;
        if (!text.trim()) {
          setStatus('${STATUS.inputIsEmpty}', true);
          return;
        }

        setBusy(true);
        setStatus('${STATUS.translating}', false);
        vscode.postMessage({
          type: 'translate',
          text: text,
          mode: mode,
          appendChineseReplyInstruction: appendInstructionCheckbox.checked,
          autoCopyAfterTranslation: autoCopyCheckbox.checked,
          sendToTerminalAfterTranslation: sendToTerminalCheckbox.checked
        });
      }

      function copyOutput() {
        vscode.postMessage({
          type: 'copyOutput',
          text: outputText.value
        });
      }

      function autoResizeInputText() {
        inputText.style.height = 'auto';
        const minH = 60;
        const maxH = 180;
        const scrollH = inputText.scrollHeight;
        const newH = Math.min(Math.max(scrollH, minH), maxH);
        inputText.style.height = newH + 'px';
        inputText.style.overflowY = scrollH > maxH ? 'auto' : 'hidden';
      }

      autoResizeInputText();

      function clearAll() {
        inputText.value = '';
        outputText.value = '';
        setBusy(false);
        setStatus('${STATUS.ready}', false);
        saveState();
        autoResizeInputText();
        inputText.focus();
      }

      translateCopyButton.addEventListener('click', function () {
        translate('translateAndCopy');
      });

      translateOnlyButton.addEventListener('click', function () {
        translate('translateOnly');
      });

      copyButton.addEventListener('click', copyOutput);
      clearButton.addEventListener('click', clearAll);

      setApiKeyButton.addEventListener('click', function () {
        settingsPanel.classList.toggle('hidden');
        saveState();
      });

      cancelSettingsButton.addEventListener('click', function () {
        settingsPanel.classList.add('hidden');
        saveState();
      });

      saveSettingsButton.addEventListener('click', function () {
        vscode.postMessage({
          type: 'saveConfiguration',
          apiKey: apiKeyInput.value,
          baseUrl: baseUrlInput.value,
          model: modelInput.value
        });
        settingsPanel.classList.add('hidden');
        saveState();
      });

      clearSettingsApiKeyButton.addEventListener('click', function () {
        vscode.postMessage({ type: 'clearApiKey' });
        apiKeyInput.value = '';
        saveState();
      });

      inputText.addEventListener('input', function () {
        saveState();
        autoResizeInputText();
      });
      inputText.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          translate('translateAndCopy');
        }
      });
      outputText.addEventListener('input', saveState);

      appendInstructionCheckbox.addEventListener('change', function () {
        updateBooleanSetting('appendChineseReplyInstruction', appendInstructionCheckbox.checked);
      });

      autoCopyCheckbox.addEventListener('change', function () {
        updateBooleanSetting('autoCopyAfterTranslation', autoCopyCheckbox.checked);
      });

      sendToTerminalCheckbox.addEventListener('change', function () {
        updateBooleanSetting('sendToTerminalAfterTranslation', sendToTerminalCheckbox.checked);
      });

      document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.key === 'Enter') {
          event.preventDefault();
          translate('translateAndCopy');
          return;
        }

        if (event.ctrlKey && event.key.toLowerCase() === 'l') {
          event.preventDefault();
          clearAll();
        }
      });

      window.addEventListener('message', function (event) {
        const message = event.data;

        if (!message || typeof message.type !== 'string') {
          return;
        }

        switch (message.type) {
          case 'settings':
            appendInstructionCheckbox.checked = Boolean(message.settings.appendChineseReplyInstruction);
            autoCopyCheckbox.checked = Boolean(message.settings.autoCopyAfterTranslation);
            sendToTerminalCheckbox.checked = Boolean(message.settings.sendToTerminalAfterTranslation);
            if (typeof message.settings.baseUrl === 'string') {
              baseUrlInput.value = message.settings.baseUrl;
            }
            if (typeof message.settings.model === 'string') {
              modelInput.value = message.settings.model;
            }
            if (message.settings.hasApiKey) {
              apiKeyInput.placeholder = '•••••••• (Saved)';
            } else {
              apiKeyInput.placeholder = 'Enter API Key';
            }
            saveState();
            break;
          case 'status':
            setBusy(false);
            setStatus(message.status, Boolean(message.isError));
            break;
          case 'translationResult':
            setBusy(false);
            outputText.value = message.output;
            setStatus(message.status, Boolean(message.isError));
            if (!message.sentToTerminal) {
              outputText.focus();
              outputText.select();
            }
            saveState();
            break;
          case 'performTranslate':
            translate(message.mode || 'translateAndCopy');
            break;
          case 'performCopyOutput':
            copyOutput();
            break;
          case 'clear':
            clearAll();
            break;
        }
      });

      vscode.postMessage({ type: 'ready' });
    }());
  </script>
</body>
</html>`;
}

function getNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
