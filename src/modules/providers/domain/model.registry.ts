export interface ModelMetadata {
  id: string;
  providerId: string;
  name: string;
  contextWindow: number;
  streaming: boolean;
  vision: boolean;
  tools: boolean;
  reasoning: boolean;
  jsonMode: boolean;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  description: string;
}

export const REGISTERED_MODELS: Record<string, ModelMetadata> = {
  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    providerId: 'openai',
    name: 'GPT-4o',
    contextWindow: 128000,
    streaming: true,
    vision: true,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    description: 'Versatile flagship high-intelligence model for text and vision tasks.',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    providerId: 'openai',
    name: 'GPT-4o Mini',
    contextWindow: 128000,
    streaming: true,
    vision: true,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    description: 'Fast, lightweight and highly cost-efficient intelligence for everyday tasks.',
  },
  'o1-preview': {
    id: 'o1-preview',
    providerId: 'openai',
    name: 'o1 Preview',
    contextWindow: 128000,
    streaming: true,
    vision: false,
    tools: false,
    reasoning: true,
    jsonMode: false,
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    description: 'Advanced reasoning model with chain-of-thought processing.',
  },

  // Anthropic Models
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    providerId: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    streaming: true,
    vision: true,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    description: 'Anthropic state-of-the-art model offering superior reasoning and speed.',
  },
  'claude-3-5-haiku': {
    id: 'claude-3-5-haiku',
    providerId: 'anthropic',
    name: 'Claude 3.5 Haiku',
    contextWindow: 200000,
    streaming: true,
    vision: false,
    tools: true,
    reasoning: false,
    jsonMode: false,
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    description: 'Fastest Anthropic model with exceptional coding and analysis features.',
  },

  // Google Gemini Models
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    providerId: 'gemini',
    name: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
    streaming: true,
    vision: true,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    description: 'Flagship Gemini model with 2M context window and advanced multimodality.',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    providerId: 'gemini',
    name: 'Gemini 1.5 Flash',
    contextWindow: 1000000,
    streaming: true,
    vision: true,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    description: 'High-speed multimodal model optimized for latency and efficiency.',
  },

  // DeepSeek Models
  'deepseek-chat': {
    id: 'deepseek-chat',
    providerId: 'deepseek',
    name: 'DeepSeek Chat (V3)',
    contextWindow: 64000,
    streaming: true,
    vision: false,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.28,
    description: 'Highly competitive and affordable chat model with high coding capability.',
  },
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    providerId: 'deepseek',
    name: 'DeepSeek Reasoner (R1)',
    contextWindow: 64000,
    streaming: true,
    vision: false,
    tools: false,
    reasoning: true,
    jsonMode: false,
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    description: 'Advanced reasoning model utilizing DeepSeek-R1 reinforcement learning.',
  },

  // Perplexity Models
  'llama-3.1-sonar-large-online': {
    id: 'llama-3.1-sonar-large-online',
    providerId: 'perplexity',
    name: 'Sonar Large Online',
    contextWindow: 128000,
    streaming: true,
    vision: false,
    tools: false,
    reasoning: false,
    jsonMode: false,
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 1.00,
    description: 'Perplexity search-grounded online model for real-time web answers.',
  },

  // Cohere Models
  'command-r-plus': {
    id: 'command-r-plus',
    providerId: 'cohere',
    name: 'Command R+',
    contextWindow: 128000,
    streaming: true,
    vision: false,
    tools: true,
    reasoning: false,
    jsonMode: true,
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    description: 'Enterprise-grade RAG-optimized model with multilingual support.',
  },
};

/**
 * Helper to retrieve model metadata by ID
 */
export function getModelMetadata(modelId: string): ModelMetadata | undefined {
  return REGISTERED_MODELS[modelId];
}

/**
 * Returns list of all registered models
 */
export function getAllModels(): ModelMetadata[] {
  return Object.values(REGISTERED_MODELS);
}
