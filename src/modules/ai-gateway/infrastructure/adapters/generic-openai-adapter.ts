import {
  IProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  GatewayStreamChunk,
  ProviderCapabilities,
} from '../../domain/adapter.interface';
import { ApplicationError } from '@shared/errors';

export interface OpenAICompatibleOptions {
  /** Extra static headers to send with every request (e.g. HTTP-Referer for OpenRouter, etc). */
  headers?: Record<string, string>;
  /** Request timeout in ms. Default 60000. */
  timeoutMs?: number;
  /** Number of retry attempts on network failure / 429 / 5xx. Default 2. */
  maxRetries?: number;
  /** Header name to use for the API key. Default 'Authorization' with 'Bearer ' prefix. Some providers (Azure) use 'api-key' with no prefix. */
  authHeader?: string;
  /** Prefix prepended to the api key when placed in authHeader. Default 'Bearer '. Set to '' for raw key headers. */
  authPrefix?: string;
  /** Path appended to baseUrl for chat completions. Default '/chat/completions'. */
  chatPath?: string;
  /** Path appended to baseUrl for the models list endpoint used by testConnection. Default '/models'. */
  modelsPath?: string;
}

const DEFAULT_OPTIONS: Required<OpenAICompatibleOptions> = {
  headers: {},
  timeoutMs: 60_000,
  maxRetries: 2,
  authHeader: 'Authorization',
  authPrefix: 'Bearer ',
  chatPath: '/chat/completions',
  modelsPath: '/models',
};

/**
 * Generic adapter for any provider that exposes an OpenAI-compatible REST API.
 * Used both for the hardcoded named providers below (DeepSeek, Groq, etc.)
 * and for fully user-defined "Custom Providers" via `createDynamicAdapter()`.
 */
export class OpenAICompatibleAdapter implements IProviderAdapter {
  protected readonly options: Required<OpenAICompatibleOptions>;

  constructor(
    public readonly id: string,
    public readonly name: string,
    protected readonly baseUrl: string,
    private readonly capabilities: ProviderCapabilities,
    options: OpenAICompatibleOptions = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options, headers: { ...options.headers } };
  }

  public getCapabilities(): ProviderCapabilities {
    return this.capabilities;
  }

  private buildAuthHeaders(apiKey: string): Record<string, string> {
    const { authHeader, authPrefix, headers } = this.options;
    return {
      'Content-Type': 'application/json',
      ...headers,
      ...(apiKey ? { [authHeader]: `${authPrefix}${apiKey}` } : {}),
    };
  }

  private async fetchWithRetry(url: string, init: any): Promise<Response> {
    const { timeoutMs, maxRetries } = this.options;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timer);

        // Retry on 429 (rate limit) and 5xx (server error) if attempts remain
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const backoffMs = Math.min(1000 * 2 ** attempt, 8000);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
        return response;
      } catch (e: any) {
        clearTimeout(timer);
        lastError = e;
        if (attempt < maxRetries) {
          const backoffMs = Math.min(1000 * 2 ** attempt, 8000);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
      }
    }
    throw lastError || new Error('Request failed after retries');
  }

  public async chat(request: GatewayChatRequest, apiKey: string): Promise<GatewayChatResponse> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}${this.options.chatPath}`, {
        method: 'POST',
        headers: this.buildAuthHeaders(apiKey),
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          response_format: request.jsonMode ? { type: 'json_object' } : undefined,
          tools: request.tools ? request.tools.map((t) => ({ type: 'function', function: t })) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          'PROVIDER_ERROR',
          errorData?.error?.message || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      return {
        id: data.id,
        model: data.model,
        choices: data.choices.map((c: any) => ({
          message: {
            role: c.message.role,
            content: c.message.content || '',
          },
          finish_reason: c.finish_reason || 'stop',
        })),
        usage: {
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (e: any) {
      if (e instanceof ApplicationError) throw e;
      if (e?.name === 'AbortError') throw new ApplicationError('PROVIDER_ERROR', 'Request timed out');
      throw new ApplicationError('PROVIDER_ERROR', e.message || 'API connection failed');
    }
  }

  public async stream(request: GatewayChatRequest, apiKey: string): Promise<ReadableStream<GatewayStreamChunk>> {
    try {
      const response = await fetch(`${this.baseUrl}${this.options.chatPath}`, {
        method: 'POST',
        headers: this.buildAuthHeaders(apiKey),
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          response_format: request.jsonMode ? { type: 'json_object' } : undefined,
          tools: request.tools ? request.tools.map((t) => ({ type: 'function', function: t })) : undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          'PROVIDER_ERROR',
          errorData?.error?.message || `Streaming request failed with status ${response.status}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      return new ReadableStream<GatewayStreamChunk>({
        async start(controller) {
          if (!reader) {
            controller.close();
            return;
          }
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine.startsWith('data: ')) continue;
                const dataStr = cleanLine.substring(6);
                if (dataStr === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(dataStr);
                  const choice = parsed.choices?.[0];
                  if (choice) {
                    controller.enqueue({
                      id: parsed.id,
                      model: parsed.model,
                      delta: {
                        content: choice.delta?.content || '',
                        role: choice.delta?.role || undefined,
                      },
                      finish_reason: choice.finish_reason || null,
                    });
                  }
                } catch {
                  // Ignore JSON parse errors in partial stream lines
                }
              }
            }
            controller.close();
          } catch (err: any) {
            controller.error(err);
          }
        },
      });
    } catch (e: any) {
      if (e instanceof ApplicationError) throw e;
      throw new ApplicationError('PROVIDER_ERROR', e.message || 'API connection failed');
    }
  }

  public async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.options.modelsPath}`, {
        method: 'GET',
        headers: this.buildAuthHeaders(apiKey),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Factory for a fully runtime-configured "Custom Provider" — the piece the
 * spec calls the OpenAI-Compatible Wizard / Custom Provider Wizard feeds into.
 * Any provider a user adds by giving a name + base URL + key becomes one of these.
 */
export interface DynamicProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxRetries?: number;
  authHeader?: string;
  authPrefix?: string;
  capabilities?: Partial<ProviderCapabilities>;
}

export function createDynamicAdapter(config: DynamicProviderConfig): OpenAICompatibleAdapter {
  const capabilities: ProviderCapabilities = {
    supportsStreaming: true,
    supportsVision: false,
    supportsTools: true,
    supportsReasoning: false,
    ...config.capabilities,
  };

  return new OpenAICompatibleAdapter(
    config.id,
    config.name,
    config.baseUrl.replace(/\/+$/, ''),
    capabilities,
    {
      headers: config.headers,
      timeoutMs: config.timeoutMs,
      maxRetries: config.maxRetries,
      authHeader: config.authHeader,
      authPrefix: config.authPrefix,
    }
  );
}
