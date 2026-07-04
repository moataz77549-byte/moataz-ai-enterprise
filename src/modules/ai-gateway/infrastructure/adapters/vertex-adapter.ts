import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform";
import { IProviderAdapter, GatewayChatRequest, GatewayChatResponse, GatewayStreamChunk, ProviderCapabilities } from "../../domain/adapter.interface";
import { ApplicationError } from "@shared/errors";

export class VertexAdapter implements IProviderAdapter {
  public readonly id = "vertex";
  public readonly name = "Google Vertex AI";
  private client: PredictionServiceClient;
  private project: string;
  private location: string;

  constructor(config: { project: string; location: string; credentials: any }) {
    this.client = new PredictionServiceClient({
      credentials: config.credentials,
      apiEndpoint: `${config.location}-aiplatform.googleapis.com`,
    });
    this.project = config.project;
    this.location = config.location;
  }

  public getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    };
  }

  async chat(request: GatewayChatRequest, _apiKey: string): Promise<GatewayChatResponse> {
    try {
      const endpoint = `projects/${this.project}/locations/${this.location}/publishers/google/models/${request.model}`;
      
      const instance = {
        contents: request.messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      };
      const instances = [helpers.toValue(instance) as any];

      const parameter = {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      };
      const parameters = helpers.toValue(parameter) as any;

      const [response] = await (this.client.predict({
        endpoint,
        instances,
        parameters,
      }) as any);

      const result = response.predictions?.[0] as any;
      const content = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return {
        id: `vertex-${Date.now()}`,
        model: request.model,
        choices: [{
          message: { role: "assistant", content },
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

  async stream(request: GatewayChatRequest, apiKey: string): Promise<ReadableStream<GatewayStreamChunk>> {
    const response = await this.chat(request, apiKey);
    return new ReadableStream({
      start(controller) {
        controller.enqueue({
          id: response.id,
          model: response.model,
          delta: { content: response.choices[0].message.content }
        });
        controller.close();
      }
    });
  }

  async testConnection(_apiKey: string): Promise<boolean> {
    return !!this.client;
  }
}
