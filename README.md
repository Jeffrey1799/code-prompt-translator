# Code Prompt Translator

<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="Code Prompt Translator Logo">
</p>

Since Large Language Models (LLMs) are trained on vast amounts of English text and programming resources, interacting with them using English prompts often yields significantly more accurate, high-quality, and contextually precise results. **Code Prompt Translator** is designed to provide native Chinese-speaking developers with a fast and seamless way to translate their coding prompts into English.

It is tailored for workflows where the right side of the editor contains Claude Code, Aider, Codex CLI, or another terminal-based coding tool, while the left sidebar is used to prepare an English prompt.

The extension only translates and copies. It does not call Claude Code, Aider, Codex CLI, or any terminal tool. It does not press Enter, submit prompts, read workspace source code, or optimize your prompt.

## Features

- Chinese to English coding prompt translation
- OpenAI-compatible Chat Completions API
- Sidebar Webview UI in the Activity Bar
- Auto append Chinese reply instruction
- Auto copy to clipboard
- Editable output textarea
- VS Code SecretStorage for API key
- VS Code settings for Base URL, model, temperature, and defaults
- Keyboard shortcuts inside the webview:
  - `Ctrl+Enter`: Translate & Copy
  - `Ctrl+L`: Clear input and output

## How it works

1. Open the Code Prompt Translator sidebar.
2. Enter a Chinese coding prompt in the Chinese Prompt textarea.
3. Click **Translate & Copy** or press `Ctrl+Enter`.
4. The extension sends the Chinese prompt to your configured OpenAI-compatible Chat Completions API.
5. The extension reads `choices[0].message.content` from the API response.
6. The extension locally appends this instruction when enabled:

   ```text
   Please respond and communicate with me in Chinese.
   ```

7. The final prompt is shown in the editable English Output textarea.
8. The final prompt is copied to the system clipboard when auto-copy is enabled or when using Translate & Copy.
9. You manually paste and submit the prompt in Claude Code, Aider, Codex CLI, or another tool.

## Install dependencies

```bash
npm install
```

## Development

Compile the extension:

```bash
npm run compile
```

Then open the project in VS Code and press `F5` to launch an Extension Development Host.

## Set API key

Run this command from the Command Palette:

```text
Code Prompt Translator: Set API Key
```

The API key is stored in VS Code SecretStorage. It is not stored in `settings.json` and is not rendered into the webview HTML.

## Configuration

The following settings are available in VS Code settings:

| Setting | Default | Description |
| --- | --- | --- |
| `codePromptTranslator.baseUrl` | `https://api.openai.com/v1` | OpenAI-compatible API base URL. The extension posts to `{baseUrl}/chat/completions`. |
| `codePromptTranslator.model` | `gpt-4o-mini` | Model name used for translation. |
| `codePromptTranslator.temperature` | `0` | Temperature used for translation requests. Use `0` for deterministic translation. |
| `codePromptTranslator.appendChineseReplyInstruction` | `true` | Append `Please respond and communicate with me in Chinese.` after translation. |
| `codePromptTranslator.autoCopyAfterTranslation` | `true` | Automatically copy the final prompt after translation. |
| `codePromptTranslator.requestTimeoutMs` | `60000` | Request timeout in milliseconds. |

## API request format

The extension calls:

```text
POST {baseUrl}/chat/completions
```

Example request body:

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0,
  "messages": [
    {
      "role": "system",
      "content": "<system prompt>"
    },
    {
      "role": "user",
      "content": "<Chinese prompt>"
    }
  ]
}
```

The translation result is read from:

```text
choices[0].message.content
```

## Commands

- `Code Prompt Translator: Open`
- `Code Prompt Translator: Translate Current Prompt`
- `Code Prompt Translator: Set API Key`
- `Code Prompt Translator: Clear API Key`
- `Code Prompt Translator: Copy Output`
- `Code Prompt Translator: Clear`

## Package VSIX

Install vsce globally if needed:

```bash
npm install -g @vscode/vsce
```

Package the extension:

```bash
vsce package
```

Or use the project script:

```bash
npm run package
```

This generates a file similar to:

```text
code-prompt-translator-0.1.0.vsix
```

## Install VSIX

In VS Code or Cursor, run:

```text
Extensions: Install from VSIX...
```

Or install from the command line:

```bash
code --install-extension code-prompt-translator-<version>.vsix
```

For Cursor, use the Cursor UI command for installing from VSIX, or run the equivalent Cursor command-line installation command if available in your environment.

## Manual verification checklist

Use this checklist before publishing or sharing a build:

1. Clicking Translate & Copy with empty input shows `Input is empty`.
2. Clicking Translate & Copy without an API key shows `API key is missing. Please run "Code Prompt Translator: Set API Key".`
3. After setting an API key, a Chinese prompt can be translated through the configured API.
4. The translation result appears in the output textarea.
5. When Append Chinese reply instruction is enabled, the output ends with `Please respond and communicate with me in Chinese.`
6. When Append Chinese reply instruction is disabled, that sentence is not appended.
7. Translate & Copy writes the final prompt to the system clipboard.
8. Copy Output copies the manually edited output text.
9. Clear empties both input and output.
10. An invalid Base URL does not crash the extension and shows `Invalid Base URL`.
11. Non-2xx API responses show useful status text such as `API error 401: ...`.
12. Invalid JSON API responses show `Invalid JSON response`.
13. Empty model content shows `Empty model response`.
14. The generated VSIX installs successfully in VS Code or Cursor.

## Privacy

- Chinese prompts are sent only to the OpenAI-compatible API configured by the user.
- Prompts are not sent to Claude Code, Aider, Codex CLI, or any terminal tool.
- The extension does not read workspace source code.
- The extension does not automatically submit prompts.
- The API key is stored in VS Code SecretStorage.
- The translation result is written to the system clipboard when copy is requested or auto-copy is enabled.
