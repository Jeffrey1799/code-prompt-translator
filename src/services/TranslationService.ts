import { TRANSLATION_SYSTEM_PROMPT } from '../constants';
import { TranslatorSettings } from '../types';

export type TranslationErrorCode =
  | 'invalidBaseUrl'
  | 'network'
  | 'timeout'
  | 'api'
  | 'invalidJson'
  | 'emptyModelResponse'
  | 'invalidResponse';

export class TranslationError extends Error {
  public constructor(
    public readonly code: TranslationErrorCode,
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
}

export class TranslationService {
  public async translate(inputText: string, settings: TranslatorSettings, apiKey: string): Promise<string> {
    const endpoint = this.buildChatCompletionsUrl(settings.baseUrl);
    const controller = new AbortController();
    const timeoutMs = Math.max(1000, settings.requestTimeoutMs);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          temperature: settings.temperature,
          messages: [
            {
              role: 'system',
              content: TRANSLATION_SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: inputText
            }
          ]
        }),
        signal: controller.signal
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new TranslationError(
          'api',
          this.extractApiErrorMessage(responseText, response.statusText),
          response.status
        );
      }

      let json: ChatCompletionResponse;
      try {
        json = JSON.parse(responseText) as ChatCompletionResponse;
      } catch {
        throw new TranslationError('invalidJson', 'Invalid JSON response');
      }

      const content = json.choices?.[0]?.message?.content;
      const translated = this.extractTextContent(content);

      if (translated.trim().length === 0) {
        throw new TranslationError('emptyModelResponse', 'Empty model response');
      }

      return translated;
    } catch (error) {
      if (error instanceof TranslationError) {
        throw error;
      }

      if (this.isAbortError(error)) {
        throw new TranslationError('timeout', 'Request timed out');
      }

      throw new TranslationError('network', this.getErrorMessage(error));
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildChatCompletionsUrl(baseUrl: string): string {
    let parsed: URL;

    try {
      parsed = new URL(baseUrl.trim());
    } catch {
      throw new TranslationError('invalidBaseUrl', 'Invalid Base URL');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new TranslationError('invalidBaseUrl', 'Invalid Base URL');
    }

    const normalizedPath = parsed.pathname.replace(/\/+$/, '');
    if (normalizedPath.endsWith('/chat/completions')) {
      parsed.pathname = normalizedPath;
    } else {
      parsed.pathname = `${normalizedPath}/chat/completions`;
    }

    return parsed.toString();
  }

  private extractTextContent(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') {
            return part;
          }

          if (part && typeof part === 'object' && 'text' in part) {
            const text = (part as { text?: unknown }).text;
            return typeof text === 'string' ? text : '';
          }

          return '';
        })
        .join('');
    }

    throw new TranslationError('invalidResponse', 'Invalid response');
  }

  private extractApiErrorMessage(responseText: string, fallback: string): string {
    if (responseText.trim().length === 0) {
      return fallback || 'Unknown API error';
    }

    try {
      const json = JSON.parse(responseText) as {
        error?: { message?: unknown; type?: unknown; code?: unknown } | string;
        message?: unknown;
      };

      if (typeof json.error === 'string') {
        return this.truncate(json.error);
      }

      if (json.error && typeof json.error.message === 'string') {
        return this.truncate(json.error.message);
      }

      if (typeof json.message === 'string') {
        return this.truncate(json.message);
      }
    } catch {
      // Fall back to the raw response body below.
    }

    return this.truncate(responseText);
  }

  private truncate(value: string): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > 1000 ? `${normalized.slice(0, 1000)}...` : normalized;
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return String(error);
  }
}
