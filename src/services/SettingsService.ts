import * as vscode from 'vscode';
import { CONFIG_SECTION, DEFAULT_SETTINGS } from '../constants';
import { BooleanSettingKey, TranslatorSettings } from '../types';

export class SettingsService {
  public getSettings(): TranslatorSettings {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

    return {
      baseUrl: this.getString(config, 'baseUrl', DEFAULT_SETTINGS.baseUrl),
      model: this.getString(config, 'model', DEFAULT_SETTINGS.model),
      temperature: this.getNumber(config, 'temperature', DEFAULT_SETTINGS.temperature),
      appendChineseReplyInstruction: this.getBoolean(
        config,
        'appendChineseReplyInstruction',
        DEFAULT_SETTINGS.appendChineseReplyInstruction
      ),
      autoCopyAfterTranslation: this.getBoolean(
        config,
        'autoCopyAfterTranslation',
        DEFAULT_SETTINGS.autoCopyAfterTranslation
      ),
      sendToTerminalAfterTranslation: this.getBoolean(
        config,
        'sendToTerminalAfterTranslation',
        DEFAULT_SETTINGS.sendToTerminalAfterTranslation
      ),
      requestTimeoutMs: this.getNumber(
        config,
        'requestTimeoutMs',
        DEFAULT_SETTINGS.requestTimeoutMs
      )
    };
  }

  public async updateSetting(key: string, value: unknown): Promise<void> {
    await vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .update(key, value, vscode.ConfigurationTarget.Global);
  }

  public async updateBooleanSetting(key: BooleanSettingKey, value: boolean): Promise<void> {
    await this.updateSetting(key, value);
  }

  private getString(config: vscode.WorkspaceConfiguration, key: string, fallback: string): string {
    const value = config.get<unknown>(key);
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  }

  private getNumber(config: vscode.WorkspaceConfiguration, key: string, fallback: number): number {
    const value = config.get<unknown>(key);
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private getBoolean(config: vscode.WorkspaceConfiguration, key: string, fallback: boolean): boolean {
    const value = config.get<unknown>(key);
    return typeof value === 'boolean' ? value : fallback;
  }
}
