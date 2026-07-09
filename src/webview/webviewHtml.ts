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

    body {
      margin: 0;
      padding: 14px;
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    textarea {
      width: 100%;
      min-height: 168px;
      resize: vertical;
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 4px;
      padding: 8px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: var(--vscode-editor-font-size, 13px);
      line-height: 1.45;
      outline: none;
    }

    textarea:focus {
      border-color: var(--vscode-focusBorder);
    }

    textarea::placeholder {
      color: var(--vscode-input-placeholderForeground);
    }

    .action-bar {
      display: flex;
      gap: 8px;
    }

    .action-bar button {
      flex: 1;
    }

    .button-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    button {
      min-height: 30px;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      padding: 5px 8px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      font-family: var(--vscode-font-family);
      cursor: pointer;
    }

    button:hover:not(:disabled) {
      background: var(--vscode-button-hoverBackground);
    }

    button:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }

    button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }

    button.secondary:hover:not(:disabled) {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .checkboxes {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0 0;
    }

    .checkbox-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .checkbox-row input {
      margin-top: 2px;
    }

    .hint {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }

    #status {
      min-height: 28px;
      padding: 7px 8px;
      border-radius: 4px;
      border: 1px solid var(--vscode-panel-border);
      color: var(--vscode-foreground);
      background: var(--vscode-editorWidget-background);
      overflow-wrap: anywhere;
    }

    #status.error {
      color: var(--vscode-errorForeground);
      border-color: var(--vscode-inputValidation-errorBorder, var(--vscode-errorForeground));
      background: var(--vscode-inputValidation-errorBackground, var(--vscode-editorWidget-background));
    }

    #status.info {
      color: var(--vscode-foreground);
    }

    .shortcut-row {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }

    .settings-panel {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      padding: 12px;
      background: var(--vscode-editorWidget-background);
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .settings-panel.hidden {
      display: none;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-group label {
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .form-group input {
      width: 100%;
      height: 28px;
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 4px;
      padding: 0 8px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      font-family: var(--vscode-font-family);
      font-size: 12px;
      outline: none;
    }

    .form-group input:focus {
      border-color: var(--vscode-focusBorder);
    }

    .settings-buttons {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }

    .settings-buttons button {
      flex: 1;
      min-height: 28px;
      padding: 2px 6px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="section">
      <label for="inputText">Chinese Prompt</label>
      <div class="action-bar">
        <button id="translateCopyButton" type="button">Translate &amp; Copy</button>
        <button id="clearButton" type="button" class="secondary">Clear</button>
      </div>
      <textarea id="inputText" spellcheck="false" placeholder="Enter Chinese coding prompt here..."></textarea>
    </section>

    <section class="section">
      <label for="outputText">English Output</label>
      <textarea id="outputText" spellcheck="false" placeholder="Translation output will appear here. You can edit it before copying."></textarea>
    </section>

    <section class="section">
      <div class="button-grid">
        <button id="translateOnlyButton" type="button" class="secondary">Translate Only</button>
        <button id="copyButton" type="button" class="secondary">Copy Output</button>
      </div>
      <button id="setApiKeyButton" type="button" class="secondary">Settings / Configure API Key</button>

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
    </section>

    <section class="checkboxes" aria-label="Translation options">
      <label class="checkbox-row" for="appendInstructionCheckbox">
        <input id="appendInstructionCheckbox" type="checkbox" checked>
        <span>Append Chinese reply instruction</span>
      </label>
      <label class="checkbox-row" for="autoCopyCheckbox">
        <input id="autoCopyCheckbox" type="checkbox" checked>
        <span>Auto copy after translation</span>
      </label>
      <div class="hint">Translate Only still follows the auto-copy checkbox. Translate &amp; Copy always copies.</div>
    </section>

    <section class="section">
      <label for="status">Status</label>
      <div id="status" role="status" aria-live="polite" class="info">${STATUS.ready}</div>
      <div class="shortcut-row">Ctrl+Enter: Translate &amp; Copy · Ctrl+L: Clear</div>
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
      const status = document.getElementById('status');

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
      status.textContent = typeof state.status === 'string' ? state.status : '${STATUS.ready}';
      status.className = state.isError ? 'error' : 'info';

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
          status: status.textContent,
          isError: status.classList.contains('error'),
          settingsPanelVisible: !settingsPanel.classList.contains('hidden'),
          apiKeyInputValue: apiKeyInput.value,
          baseUrlInputValue: baseUrlInput.value,
          modelInputValue: modelInput.value
        });
      }

      function setStatus(message, isError) {
        status.textContent = message;
        status.className = isError ? 'error' : 'info';
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
          autoCopyAfterTranslation: autoCopyCheckbox.checked
        });
      }

      function copyOutput() {
        vscode.postMessage({
          type: 'copyOutput',
          text: outputText.value
        });
      }

      function clearAll() {
        inputText.value = '';
        outputText.value = '';
        setBusy(false);
        setStatus('${STATUS.ready}', false);
        inputText.focus();
        saveState();
      }

      function updateBooleanSetting(key, value) {
        saveState();
        vscode.postMessage({
          type: 'updateSetting',
          key: key,
          value: value
        });
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

      inputText.addEventListener('input', saveState);
      outputText.addEventListener('input', saveState);

      appendInstructionCheckbox.addEventListener('change', function () {
        updateBooleanSetting('appendChineseReplyInstruction', appendInstructionCheckbox.checked);
      });

      autoCopyCheckbox.addEventListener('change', function () {
        updateBooleanSetting('autoCopyAfterTranslation', autoCopyCheckbox.checked);
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
            outputText.focus();
            outputText.select();
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
