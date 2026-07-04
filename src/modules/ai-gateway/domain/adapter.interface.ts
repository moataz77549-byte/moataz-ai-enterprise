export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface GatewayChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  tools?: ToolDefinition[];
  stream?: boolean;
}

export interface GatewayChatResponse {
  id: string;
  model: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GatewayStreamChunk {
  id: string;
  model: string;
  delta: {
    content?: string;
    role?: string;
  };
  finish_reason?: string | null;
}

export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsReasoning: boolean;
}

export interface IProviderAdapter {
  id: string;
  name: string;
  chat(request: GatewayChatRequest, apiKey: string): Promise<GatewayChatResponse>;
  stream(request: GatewayChatRequest, apiKey: string): Promise<ReadableStream<GatewayStreamChunk>>;
  testConnection(apiKey: string): Promise<boolean>;
  getCapabilities(): ProviderCapabilities;
}
