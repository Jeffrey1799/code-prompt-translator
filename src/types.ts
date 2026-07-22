export type TranslationMode = 'translateAndCopy' | 'translateOnly';

export interface TranslatorSettings {
  baseUrl: string;
  model: string;
  temperature: number;
  appendChineseReplyInstruction: boolean;
  autoCopyAfterTranslation: boolean;
  sendToTerminalAfterTranslation: boolean;
  requestTimeoutMs: number;
}

export type BooleanSettingKey =
  | 'appendChineseReplyInstruction'
  | 'autoCopyAfterTranslation'
  | 'sendToTerminalAfterTranslation';

export type WebviewToExtensionMessage =
  | { type: 'ready' }
  | {
      type: 'translate';
      text: string;
      mode: TranslationMode;
      appendChineseReplyInstruction: boolean;
      autoCopyAfterTranslation: boolean;
      sendToTerminalAfterTranslation: boolean;
    }
  | { type: 'copyOutput'; text: string }
  | { type: 'clear' }
  | { type: 'configure' }
  | { type: 'setApiKey' }
  | { type: 'openSettings' }
  | { type: 'updateSetting'; key: BooleanSettingKey; value: boolean }
  | { type: 'saveConfiguration'; apiKey: string; baseUrl: string; model: string }
  | { type: 'clearApiKey' };

export type ExtensionToWebviewMessage =
  | { type: 'settings'; settings: TranslatorSettings & { hasApiKey: boolean } }
  | { type: 'status'; status: string; isError?: boolean }
  | { type: 'translationResult'; output: string; copied: boolean; status: string; isError?: boolean }
  | { type: 'performTranslate'; mode: TranslationMode }
  | { type: 'performCopyOutput' }
  | { type: 'clear' };
