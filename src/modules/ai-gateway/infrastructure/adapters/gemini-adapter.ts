import {
  IProviderAdapter,
  GatewayChatRequest,
  GatewayChatResponse,
  GatewayStreamChunk,
  ProviderCapabilities,
} from '../../domain/adapter.interface';
import { ApplicationError } from '@shared/errors';

export class GeminiAdapter implements IProviderAdapter {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  public getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    };
  }

  private mapMessages(request: GatewayChatRequest) {
    const contents = [];
    let systemInstruction = undefined;

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemInstruction = { parts: [{ text: msg.content }] };
        continue;
      }
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    return { contents, systemInstruction };
  }

  public async chat(request: GatewayChatRequest, apiKey: string): Promise<GatewayChatResponse> {
    try {
      const { contents, systemInstruction } = this.mapMessages(request);
      const modelName = request.model.startsWith('models/') ? request.model : `models/${request.model}`;

      const response = await fetch(`${this.baseUrl}/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
            responseMimeType: request.jsonMode ? 'application/json' : undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          'PROVIDER_ERROR',
          errorData?.error?.message || `Gemini request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        id: `gemini-${Date.now()}`,
        model: request.model,
        choices: [
          {
            message: {
              role: 'assistant',
              content: text,
            },
            finish_reason: data.candidates?.[0]?.finishReason || 'stop',
          },
        ],
        usage: {
          prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (e: any) {
      if (e instanceof ApplicationError) throw e;
      throw new ApplicationError('PROVIDER_ERROR', e.message || 'Gemini connection failed');
    }
  }

  public async stream(request: GatewayChatRequest, apiKey: string): Promise<ReadableStream<GatewayStreamChunk>> {
    try {
      const { contents, systemInstruction } = this.mapMessages(request);
      const modelName = request.model.startsWith('models/') ? request.model : `models/${request.model}`;

      const response = await fetch(`${this.baseUrl}/${modelName}:streamGenerateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
            responseMimeType: request.jsonMode ? 'application/json' : undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          'PROVIDER_ERROR',
          errorData?.error?.message || `Gemini streaming failed with status ${response.status}`
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

              // Gemini streams can return a single JSON array, or newline separated JSON chunks.
              // Let's parse JSON lines or extract pieces using a regex.
              // A safer approach for streaming JSON blocks:
              let match;
              // Look for content objects inside JSON
              const textRegex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
              while ((match = textRegex.exec(buffer)) !== null) {
                const escapedText = match[1];
                // Unescape JSON string
                let text = '';
                try {
                  text = JSON.parse(`"${escapedText}"`);
                } catch {
                  text = escapedText;
                }
                
                controller.enqueue({
                  id: `gemini-stream-${Date.now()}`,
                  model: request.model,
                  delta: { content: text },
                  finish_reason: null,
                });
              }
              // Keep last chunk of buffer to avoid cutting tokens
              if (buffer.length > 5000) {
                buffer = buffer.substring(buffer.length - 1000);
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
      throw new ApplicationError('PROVIDER_ERROR', e.message || 'Gemini connection failed');
    }
  }

  public async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
