import * as vscode from 'vscode';
import { SECRET_API_KEY } from '../constants';

export class SecretService {
  public constructor(private readonly context: vscode.ExtensionContext) {}

  public async getApiKey(): Promise<string | undefined> {
    const value = await this.context.secrets.get(SECRET_API_KEY);
    return value && value.trim().length > 0 ? value.trim() : undefined;
  }

  public async setApiKey(apiKey: string): Promise<void> {
    await this.context.secrets.store(SECRET_API_KEY, apiKey.trim());
  }

  public async clearApiKey(): Promise<void> {
    await this.context.secrets.delete(SECRET_API_KEY);
  }
}
