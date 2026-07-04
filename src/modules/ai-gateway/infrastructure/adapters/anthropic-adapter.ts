import {
  IProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  GatewayStreamChunk,
  ProviderCapabilities,
} from '../../domain/adapter.interface';
import { ApplicationError } from '@shared/errors';

export class AnthropicAdapter implements IProviderAdapter {
  public readonly id = 'anthropic';
  public readonly name = 'Anthropic Claude';
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  public getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    };
  }

  public async chat(request: GatewayChatRequest, apiKey: string): Promise<GatewayChatResponse> {
    try {
      // Map OpenAI roles to Anthropic (system is a top-level parameter in Anthropic, not inside messages)
      const systemMessage = request.messages.find((m) => m.role === 'system');
      const messages = request.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model,
          messages,
          system: systemMessage?.content,
          temperature: request.temperature,
          max_tokens: request.maxTokens || 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          'PROVIDER_ERROR',
          errorData?.error?.message || `Anthropic request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      return {
        id: data.id,
        model: data.model,
        choices: [
          {
            message: {
              role: 'assistant',
              content: data.content?.[0]?.text || '',
            },
            finish_reason: data.stop_reason || 'stop',
          },
        ],
        usage: {
          prompt_tokens: data.usage?.input_tokens || 0,
          completion_tokens: data.usage?.output_tokens || 0,
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (e: any) {
      if (e instanceof ApplicationError) throw e;
      throw new ApplicationError('PROVIDER_ERROR', e.message || 'Anthropic connection failed');
    }
  }

  public async stream(request: GatewayChatRequest, apiKey: string): Promise<ReadableStream<GatewayStreamChunk>> {
    try {
      const systemMessage = request.messages.find((m) => m.role === 'system');
      const messages = request.messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model,
          messages,
          system: systemMessage?.content,
          temperature: request.temperature,
          max_tokens: request.maxTokens || 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          'PROVIDER_ERROR',
          errorData?.error?.message || `Anthropic streaming failed with status ${response.status}`
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

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    controller.enqueue({
                      id: 'anthropic-stream-id',
                      model: request.model,
                      delta: {
                        content: parsed.delta.text,
                      },
                      finish_reason: null,
                    });
                  } else if (parsed.type === 'message_delta') {
                    controller.enqueue({
                      id: 'anthropic-stream-id',
                      model: request.model,
                      delta: {},
                      finish_reason: parsed.delta?.stop_reason || 'stop',
                    });
                  }
                } catch {
                  // Ignore JSON parse errors
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
      throw new ApplicationError('PROVIDER_ERROR', e.message || 'Anthropic connection failed');
    }
  }

  public async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });
      return response.status === 200 || response.status === 400; // 400 still indicates auth succeeded but bad body, 401 is auth error
    } catch {
      return false;
    }
  }
}
