import * as vscode from 'vscode';
import {
  CHINESE_REPLY_INSTRUCTION,
  EXTENSION_DISPLAY_NAME,
  STATUS,
  TRANSLATOR_VIEW_ID,
  VIEW_CONTAINER_ID
} from '../constants';
import { ClipboardService } from '../services/ClipboardService';
import { SecretService } from '../services/SecretService';
import { SettingsService } from '../services/SettingsService';
import { TranslationError, TranslationService } from '../services/TranslationService';
import { ExtensionToWebviewMessage, TranslationMode, TranslatorSettings, WebviewToExtensionMessage } from '../types';
import { getWebviewHtml } from './webviewHtml';

export class TranslatorViewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
  public static readonly viewType = TRANSLATOR_VIEW_ID;

  private view?: vscode.WebviewView;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly pendingMessages: ExtensionToWebviewMessage[] = [];

  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly settingsService: SettingsService,
    private readonly secretService: SecretService,
    private readonly translationService: TranslationService,
    private readonly clipboardService: ClipboardService
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
    };

    webviewView.webview.html = getWebviewHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      (message: WebviewToExtensionMessage) => {
        void this.handleMessage(message);
      },
      undefined,
      this.disposables
    );

    webviewView.onDidDispose(
      () => {
        if (this.view === webviewView) {
          this.view = undefined;
        }
      },
      undefined,
      this.disposables
    );

    this.flushPendingMessages();
  }

  public async open(): Promise<void> {
    await vscode.commands.executeCommand(`workbench.view.extension.${VIEW_CONTAINER_ID}`);

    try {
      await vscode.commands.executeCommand(`${TRANSLATOR_VIEW_ID}.focus`);
    } catch {
      // Some VS Code-compatible hosts may not expose the generated focus command.
    }
  }

  public async translateCurrentPrompt(): Promise<void> {
    await this.open();
    this.postOrQueue({ type: 'performTranslate', mode: 'translateAndCopy' });
  }

  public async copyOutput(): Promise<void> {
    await this.open();
    this.postOrQueue({ type: 'performCopyOutput' });
  }

  public async clear(): Promise<void> {
    await this.open();
    this.postOrQueue({ type: 'clear' });
  }

  public async refreshSettings(): Promise<void> {
    const settings = this.settingsService.getSettings();
    const apiKey = await this.secretService.getApiKey();
    this.postOrQueue({
      type: 'settings',
      settings: {
        ...settings,
        hasApiKey: !!apiKey
      }
    });
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private async handleMessage(message: WebviewToExtensionMessage): Promise<void> {
    switch (message.type) {
      case 'ready':
        await this.refreshSettings();
        break;
      case 'translate':
        await this.handleTranslate(message.text, message.mode, {
          appendChineseReplyInstruction: message.appendChineseReplyInstruction,
          autoCopyAfterTranslation: message.autoCopyAfterTranslation
        });
        break;
      case 'copyOutput':
        await this.handleCopyOutput(message.text);
        break;
      case 'clear':
        this.postStatus(STATUS.ready);
        break;
      case 'configure':
        await this.handleConfigure();
        break;
      case 'setApiKey':
        await this.setApiKey();
        break;
      case 'openSettings':
        await this.openSettings();
        break;
      case 'updateSetting':
        await this.settingsService.updateBooleanSetting(message.key, message.value);
        break;
      case 'saveConfiguration':
        await this.handleSaveConfiguration(message.apiKey, message.baseUrl, message.model);
        break;
      case 'clearApiKey':
        await this.clearApiKey();
        break;
    }
  }

  private async handleSaveConfiguration(
    apiKey: string,
    baseUrl: string,
    model: string
  ): Promise<void> {
    try {
      const trimmedKey = apiKey.trim();
      if (trimmedKey.length > 0 && trimmedKey !== '•••••••• (Saved)') {
        await this.secretService.setApiKey(trimmedKey);
      }

      if (baseUrl.trim().length > 0) {
        await this.settingsService.updateSetting('baseUrl', baseUrl.trim());
      }
      if (model.trim().length > 0) {
        await this.settingsService.updateSetting('model', model.trim());
      }

      vscode.window.showInformationMessage('Code Prompt Translator configuration saved.');
      await this.refreshSettings();
      this.postStatus(STATUS.ready);
    } catch (error) {
      this.postStatus(`Failed to save configuration: ${this.getErrorMessage(error)}`, true);
    }
  }

  private async handleTranslate(
    inputText: string,
    mode: TranslationMode,
    overrides: Pick<TranslatorSettings, 'appendChineseReplyInstruction' | 'autoCopyAfterTranslation'>
  ): Promise<void> {
    if (inputText.trim().length === 0) {
      this.postStatus(STATUS.inputIsEmpty, true);
      return;
    }

    const apiKey = await this.secretService.getApiKey();
    if (!apiKey) {
      this.postStatus(STATUS.missingApiKey, true);
      return;
    }

    const settings = {
      ...this.settingsService.getSettings(),
      appendChineseReplyInstruction: overrides.appendChineseReplyInstruction,
      autoCopyAfterTranslation: overrides.autoCopyAfterTranslation
    };

    try {
      const translated = await this.translationService.translate(inputText, settings, apiKey);
      const finalPrompt = this.buildFinalPrompt(translated, settings.appendChineseReplyInstruction);
      const shouldCopy = mode === 'translateAndCopy' || settings.autoCopyAfterTranslation;

      if (!shouldCopy) {
        this.postOrQueue({
          type: 'translationResult',
          output: finalPrompt,
          copied: false,
          status: STATUS.translationCompleted
        });
        return;
      }

      try {
        await this.clipboardService.writeText(finalPrompt);
        this.postOrQueue({
          type: 'translationResult',
          output: finalPrompt,
          copied: true,
          status: STATUS.translationCompletedAndCopied
        });
      } catch (clipboardError) {
        this.postOrQueue({
          type: 'translationResult',
          output: finalPrompt,
          copied: false,
          status: `Translation completed, but failed to copy: ${this.getErrorMessage(clipboardError)}`,
          isError: true
        });
      }
    } catch (error) {
      this.postStatus(this.getTranslationErrorStatus(error), true);
    }
  }

  private async handleCopyOutput(text: string): Promise<void> {
    try {
      await this.clipboardService.writeText(text);
      this.postStatus(STATUS.copiedToClipboard);
    } catch (error) {
      this.postStatus(`Failed to copy: ${this.getErrorMessage(error)}`, true);
    }
  }

  private async handleConfigure(): Promise<void> {
    const selected = await vscode.window.showQuickPick(
      [
        {
          label: 'Set API Key',
          description: 'Save the key in VS Code SecretStorage'
        },
        {
          label: 'Open Extension Settings',
          description: 'Configure Base URL, model, temperature, and defaults'
        },
        {
          label: 'Clear API Key',
          description: 'Delete the saved API key from SecretStorage'
        }
      ],
      {
        title: EXTENSION_DISPLAY_NAME,
        placeHolder: 'Choose a configuration action'
      }
    );

    if (!selected) {
      return;
    }

    if (selected.label === 'Set API Key') {
      await this.setApiKey();
      return;
    }

    if (selected.label === 'Open Extension Settings') {
      await this.openSettings();
      return;
    }

    await this.clearApiKey();
  }

  public async setApiKey(): Promise<void> {
    const apiKey = await vscode.window.showInputBox({
      title: 'Code Prompt Translator: Set API Key',
      prompt: 'Enter your OpenAI-compatible API key. It will be stored in VS Code SecretStorage.',
      password: true,
      ignoreFocusOut: true,
      placeHolder: 'sk-...'
    });

    if (apiKey === undefined) {
      return;
    }

    if (apiKey.trim().length === 0) {
      vscode.window.showWarningMessage('API key was not saved because the input was empty.');
      return;
    }

    await this.secretService.setApiKey(apiKey);
    vscode.window.showInformationMessage('Code Prompt Translator API key saved.');
    this.postStatus(STATUS.ready);
  }

  public async clearApiKey(): Promise<void> {
    await this.secretService.clearApiKey();
    vscode.window.showInformationMessage('Code Prompt Translator API key cleared.');
    this.postStatus(STATUS.ready);
  }

  private async openSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'codePromptTranslator');
  }

  private buildFinalPrompt(translated: string, shouldAppendInstruction: boolean): string {
    let finalPrompt = translated.trim();

    if (shouldAppendInstruction) {
      finalPrompt += `\n\n${CHINESE_REPLY_INSTRUCTION}`;
    }

    return finalPrompt;
  }

  private getTranslationErrorStatus(error: unknown): string {
    if (error instanceof TranslationError) {
      switch (error.code) {
        case 'invalidBaseUrl':
          return STATUS.invalidBaseUrl;
        case 'timeout':
          return STATUS.requestTimedOut;
        case 'api':
          return `API error ${error.statusCode ?? ''}: ${error.message}`.replace('API error :', 'API error:');
        case 'invalidJson':
          return STATUS.invalidJsonResponse;
        case 'emptyModelResponse':
          return STATUS.emptyModelResponse;
        case 'network':
          return `Network error: ${error.message}`;
        case 'invalidResponse':
          return `Invalid response: ${error.message}`;
      }
    }

    return `Network error: ${this.getErrorMessage(error)}`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return String(error);
  }

  private postStatus(status: string, isError = false): void {
    this.postOrQueue({ type: 'status', status, isError });
  }

  private postOrQueue(message: ExtensionToWebviewMessage): void {
    if (!this.view) {
      this.pendingMessages.push(message);
      return;
    }

    void this.view.webview.postMessage(message);
  }

  private flushPendingMessages(): void {
    if (!this.view) {
      return;
    }

    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      if (message) {
        void this.view.webview.postMessage(message);
      }
    }
  }
}
