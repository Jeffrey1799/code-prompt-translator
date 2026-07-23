# Code Prompt Translator

<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="Code Prompt Translator Logo">
</p>

Since Large Language Models (LLMs) are trained on vast amounts of English text and programming resources, interacting with them using English prompts often yields significantly more accurate, high-quality, and contextually precise results. **Code Prompt Translator** is designed to provide native Chinese-speaking developers with a fast and seamless way to translate their coding prompts into English.

It is tailored for workflows where the right side of the editor contains Claude Code, Aider, Codex CLI, or another terminal-based coding tool, while the left sidebar is used to prepare an English prompt.

The extension translates the prompt, can copy the result, and can paste it into the active terminal when enabled. Terminal paste only fills the prompt and focuses the terminal: it does not press Enter or submit the prompt. The extension does not read workspace source code or optimize your prompt.

## Features

- Chinese to English coding prompt translation
- OpenAI-compatible Chat Completions API
- Sidebar Webview UI in the Activity Bar
- Compact chat-style layout with an auto-resizing Chinese Prompt textarea
- Preserves a leading slash command such as `/light-5s6a` while translating the remaining Chinese text
- Configurable Prompt Tags for one-click slash command insertion
- Auto append Chinese reply instruction
- Auto copy to clipboard
- Separate **Trans Only** action that does not force an explicit copy
- Optional paste to the active terminal and focus without execution
- Editable output textarea
- VS Code SecretStorage for API key
- Inline controls for API key, Base URL, model, and common boolean options
- VS Code settings for Base URL, model, temperature, behavior defaults, and timeout
- Keyboard shortcuts inside the webview:
  - `Enter` (inside the Chinese Prompt input): Translate & Send
  - `Shift+Enter` (inside the Chinese Prompt input): Insert a new line
  - `Ctrl+Enter`: Translate & Send
  - `Ctrl+L`: Clear input and output

## Install VSIX

In VS Code or Cursor, run: `Ctrl+Shift+P`

```text
Extensions: Install from VSIX...
```

`code-prompt-translator-0.1.8.vsix`

Or install from the command line:

```bash
code --install-extension code-prompt-translator-<version>.vsix
```

For Cursor, use the Cursor UI command for installing from VSIX, or run the equivalent Cursor command-line installation command if available in your environment.

## How it works

1. Open the Code Prompt Translator sidebar.
2. Enter a Chinese coding prompt in the Chinese Prompt textarea. You can optionally click a configured Prompt Tag to insert a slash command at the beginning.
3. Click **Translate & Send**, press `Enter` inside the input, or press `Ctrl+Enter`.
4. If the prompt starts with a supported slash command, the extension temporarily removes that prefix and sends only the remaining text to the configured OpenAI-compatible Chat Completions API.
5. The extension reads `choices[0].message.content` from the API response and restores the slash command prefix.
6. The extension locally appends this instruction when enabled:

   ```text
   Please respond and communicate with me in Chinese.
   ```

7. The final prompt is shown in the editable English Output textarea.
8. The final prompt is copied to the system clipboard when auto-copy is enabled or when using Translate & Send.
9. When **Send to active terminal & focus** is enabled, the final prompt is pasted into the active terminal and the terminal receives focus. The extension does not press Enter.
10. Review the prompt and submit it manually in Claude Code, Aider, Codex CLI, or another terminal tool.

Use **Trans Only** when the action itself should not force a clipboard copy. The **Auto copy after translation** and **Send to active terminal & focus** options still apply when enabled.

## Prompt Tags

Prompt Tags provide shortcuts for frequently used slash commands:

1. Click **+Tag** below the Chinese Prompt input.
2. Enter a slash command such as `/light-5s6a`, then click **Save** or press `Enter`.
3. Click the generated Tag to insert it at the beginning of the Chinese Prompt.
4. Click the `×` button on a Tag to remove it.

Tags must start with `/` and may contain letters, numbers, `_`, and `-`. Duplicate Tags are ignored, and clicking a Tag does not duplicate the same prefix when it is already present. Configured Tags are persisted with the webview state and restored after the view is recreated or the editor restarts.

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

You can also use the gear button in the sidebar to set or clear the API key and edit the Base URL and model.

## Configuration

The following settings are available in VS Code settings:

| Setting | Default | Description |
| --- | --- | --- |
| `codePromptTranslator.baseUrl` | `https://api.openai.com/v1` | OpenAI-compatible API base URL. The extension posts to `{baseUrl}/chat/completions`. |
| `codePromptTranslator.model` | `gpt-4o-mini` | Model name used for translation. |
| `codePromptTranslator.temperature` | `0` | Temperature used for translation requests. Use `0` for deterministic translation. |
| `codePromptTranslator.appendChineseReplyInstruction` | `true` | Append `Please respond and communicate with me in Chinese.` after translation. |
| `codePromptTranslator.autoCopyAfterTranslation` | `true` | Automatically copy the final prompt after translation. |
| `codePromptTranslator.sendToTerminalAfterTranslation` | `true` | Paste the final prompt into the active terminal and focus it without executing. |
| `codePromptTranslator.requestTimeoutMs` | `60000` | Request timeout in milliseconds. |

The three boolean options can also be changed directly from the sidebar. Base URL and model can be edited from the sidebar gear panel. Temperature and request timeout are available in VS Code settings.

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
code-prompt-translator-0.1.8.vsix
```

## Manual verification checklist

Use this checklist before publishing or sharing a build:

1. Clicking Translate & Send with empty input shows `Input is empty`.
2. Clicking Translate & Send without an API key shows `API key is missing. Please run "Code Prompt Translator: Set API Key".`
3. After setting an API key, a Chinese prompt can be translated through the configured API.
4. The translation result appears in the output textarea.
5. When Append Chinese reply instruction is enabled, the output ends with `Please respond and communicate with me in Chinese.`
6. When Append Chinese reply instruction is disabled, that sentence is not appended.
7. Translate & Send writes the final prompt to the system clipboard.
8. Copy Output copies the manually edited output text.
9. `Ctrl+L` and the `Code Prompt Translator: Clear` command empty both input and output.
10. Pressing `Enter` inside the Chinese Prompt textarea triggers translation and send.
11. Pressing `Shift+Enter` inside the Chinese Prompt textarea inserts a new line.
12. Adding `/light-5s6a` with **+Tag** creates a persistent Tag button.
13. Clicking the Tag inserts `/light-5s6a` at the beginning of the Chinese Prompt without duplicating an existing identical prefix.
14. Clicking `×` removes the configured Tag.
15. A leading slash command is preserved while only the remaining Chinese text is translated.
16. When terminal sending is enabled and an active terminal exists, the final prompt is pasted and focused without being executed.
17. An invalid Base URL does not crash the extension and shows `Invalid Base URL`.
18. Non-2xx API responses show useful status text such as `API error 401: ...`.
19. Invalid JSON API responses show `Invalid JSON response`.
20. Empty model content shows `Empty model response`.
21. The generated VSIX installs successfully in VS Code or Cursor.

## Privacy

- Chinese prompts are sent only to the OpenAI-compatible API configured by the user.
- When terminal sending is enabled, the translated final prompt is pasted into the active terminal through VS Code's terminal paste command.
- The extension does not read workspace source code.
- The extension does not automatically submit prompts.
- The API key is stored in VS Code SecretStorage.
- The translation result is written to the system clipboard when copy is requested, auto-copy is enabled, or terminal paste is enabled.
