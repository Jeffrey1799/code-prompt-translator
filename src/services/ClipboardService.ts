import * as vscode from 'vscode';

export class ClipboardService {
  public async writeText(text: string): Promise<void> {
    await vscode.env.clipboard.writeText(text);
  }
}
