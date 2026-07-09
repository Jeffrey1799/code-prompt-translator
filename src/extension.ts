import * as vscode from 'vscode';
import { COMMANDS, CONFIG_SECTION, TRANSLATOR_VIEW_ID } from './constants';
import { ClipboardService } from './services/ClipboardService';
import { SecretService } from './services/SecretService';
import { SettingsService } from './services/SettingsService';
import { TranslationService } from './services/TranslationService';
import { TranslatorViewProvider } from './webview/TranslatorViewProvider';

export function activate(context: vscode.ExtensionContext): void {
  const settingsService = new SettingsService();
  const secretService = new SecretService(context);
  const translationService = new TranslationService();
  const clipboardService = new ClipboardService();

  const translatorViewProvider = new TranslatorViewProvider(
    context,
    settingsService,
    secretService,
    translationService,
    clipboardService
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TRANSLATOR_VIEW_ID, translatorViewProvider, {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }),
    translatorViewProvider,
    vscode.commands.registerCommand(COMMANDS.open, () => translatorViewProvider.open()),
    vscode.commands.registerCommand(COMMANDS.translateCurrentPrompt, () =>
      translatorViewProvider.translateCurrentPrompt()
    ),
    vscode.commands.registerCommand(COMMANDS.setApiKey, () => translatorViewProvider.setApiKey()),
    vscode.commands.registerCommand(COMMANDS.clearApiKey, () => translatorViewProvider.clearApiKey()),
    vscode.commands.registerCommand(COMMANDS.copyOutput, () => translatorViewProvider.copyOutput()),
    vscode.commands.registerCommand(COMMANDS.clear, () => translatorViewProvider.clear()),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(CONFIG_SECTION)) {
        translatorViewProvider.refreshSettings();
      }
    })
  );
}

export function deactivate(): void {
  // No background resources to clean up.
}
