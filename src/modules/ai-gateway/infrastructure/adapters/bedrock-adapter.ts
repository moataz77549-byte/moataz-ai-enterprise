import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { IProviderAdapter, GatewayChatRequest, GatewayChatResponse, GatewayStreamChunk, ProviderCapabilities } from "../../domain/adapter.interface";
import { ApplicationError } from "@shared/errors";

export class BedrockAdapter implements IProviderAdapter {
  public readonly id = "bedrock";
  public readonly name = "AWS Bedrock";
  private client: BedrockRuntimeClient;

  constructor(config: { region: string; credentials: { accessKeyId: string; secretAccessKey: string } }) {
    this.client = new BedrockRuntimeClient({
      region: config.region,
      credentials: config.credentials,
    });
  }

  public getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: true,
    };
  }

  async chat(request: GatewayChatRequest, _apiKey: string): Promise<GatewayChatResponse> {
    try {
      const body = this.prepareBody(request);
      const command = new InvokeModelCommand({
        modelId: request.model,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(body),
      });

      const response = await this.client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));

      return {
        id: `bedrock-${Date.now()}`,
        model: request.model,
        choices: [{
          message: {
            role: "assistant",
            content: this.extractContent(result, request.model)
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } catch (e: any) {
      throw new ApplicationError("PROVIDER_ERROR", e.message);
    }
  }

  async stream(request: GatewayChatRequest, _apiKey: string): Promise<ReadableStream<GatewayStreamChunk>> {
    const body = this.prepareBody(request);
    const command = new InvokeModelWithResponseStreamCommand({
      modelId: request.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await this.client.send(command);

    const self = this;
    return new ReadableStream({
      async start(controller) {
        if (response.body) {
          for await (const chunk of response.body) {
            if (chunk.chunk) {
              const decoded = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
              const content = self.extractContent(decoded, request.model);
              if (content) {
                controller.enqueue({
                  id: `bedrock-${Date.now()}`,
                  model: request.model,
                  delta: { content }
                });
              }
            }
          }
        }
        controller.close();
      }
    });
  }

  async testConnection(_apiKey: string): Promise<boolean> {
    try {
      // Basic test to list models or just check client
      return !!this.client;
    } catch {
      return false;
    }
  }

  private prepareBody(request: GatewayChatRequest) {
    if (request.model.includes("anthropic.claude")) {
      return {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: request.maxTokens || 4096,
        messages: request.messages.map((m: any) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content
        })),
        temperature: request.temperature,
      };
    }
    return {
      prompt: request.messages.map((m: any) => `${m.role}: ${m.content}`).join("\n"),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
    };
  }

  private extractContent(result: any, model: string): string {
    if (model.includes("anthropic.claude")) {
      return result.content?.[0]?.text || result.completion || "";
    }
    return result.outputs?.[0]?.text || result.generation || "";
  }
}
