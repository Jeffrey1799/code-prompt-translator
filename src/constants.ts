export const EXTENSION_DISPLAY_NAME = 'Code Prompt Translator';

export const CONFIG_SECTION = 'codePromptTranslator';

export const VIEW_CONTAINER_ID = 'codePromptTranslator';
export const TRANSLATOR_VIEW_ID = 'codePromptTranslator.translatorView';

export const SECRET_API_KEY = 'codePromptTranslator.apiKey';

export const COMMANDS = {
  open: 'codePromptTranslator.open',
  translateCurrentPrompt: 'codePromptTranslator.translateCurrentPrompt',
  setApiKey: 'codePromptTranslator.setApiKey',
  clearApiKey: 'codePromptTranslator.clearApiKey',
  copyOutput: 'codePromptTranslator.copyOutput',
  clear: 'codePromptTranslator.clear'
} as const;

export const DEFAULT_SETTINGS = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  temperature: 0,
  appendChineseReplyInstruction: true,
  autoCopyAfterTranslation: true,
  sendToTerminalAfterTranslation: true,
  requestTimeoutMs: 60000
} as const;

export const CHINESE_REPLY_INSTRUCTION = 'Please respond and communicate with me in Chinese.';

export const TRANSLATION_SYSTEM_PROMPT = `You are a Chinese-to-English translator for software engineering prompts.

Translate the user's Chinese text into natural English suitable for coding, debugging, refactoring, testing, code review, and software development conversations.

Rules:
- Translate only. Do not optimize, expand, summarize, or restructure the prompt.
- Preserve the user's original meaning, tone, and level of detail.
- Preserve code, commands, file paths, variable names, function names, class names, package names, API names, URLs, error logs, stack traces, JSON, YAML, SQL, XML, and Markdown code blocks exactly.
- If the input contains both Chinese and English, translate only the Chinese parts unless minor grammatical adjustment is necessary.
- Output only the English translation.`;

export const STATUS = {
  ready: 'Ready',
  translating: 'Translating...',
  translationCompleted: 'Translation completed',
  copiedToClipboard: 'Copied to clipboard',
  translationCompletedAndCopied: 'Translation completed and copied',
  translationCompletedAndSentToTerminal: 'Translation completed and sent to active terminal',
  translationCompletedCopiedAndSentToTerminal: 'Translation completed, copied & sent to terminal',
  inputIsEmpty: 'Input is empty',
  missingApiKey: 'API key is missing. Please run "Code Prompt Translator: Set API Key".',
  invalidBaseUrl: 'Invalid Base URL',
  requestTimedOut: 'Request timed out',
  invalidJsonResponse: 'Invalid JSON response',
  emptyModelResponse: 'Empty model response'
} as const;
