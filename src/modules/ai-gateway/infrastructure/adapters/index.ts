import { IProviderAdapter } from '../../domain/adapter.interface';
import { OpenAIAdapter } from './openai-adapter';
import { GeminiAdapter } from './gemini-adapter';
import { AnthropicAdapter } from './anthropic-adapter';
import { OpenAICompatibleAdapter, createDynamicAdapter, DynamicProviderConfig } from './generic-openai-adapter';
import { BedrockAdapter } from './bedrock-adapter';
import { VertexAdapter } from './vertex-adapter';

// 1. DeepSeek Adapter
export class DeepSeekAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('deepseek', 'DeepSeek', 'https://api.deepseek.com', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: true,
    });
  }
}

// 2. OpenRouter Adapter
export class OpenRouterAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1', {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: true,
    });
  }
}

// 3. Groq Adapter
export class GroqAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('groq', 'Groq', 'https://api.groq.com/openai/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 4. Together AI Adapter
export class TogetherAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('together', 'Together AI', 'https://api.together.xyz/v1', {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 5. Fireworks AI Adapter
export class FireworksAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('fireworks', 'Fireworks AI', 'https://api.fireworks.ai/inference/v1', {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 6. Mistral AI Adapter
export class MistralAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('mistral', 'Mistral AI', 'https://api.mistral.ai/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 7. Perplexity AI Adapter
export class PerplexityAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('perplexity', 'Perplexity', 'https://api.perplexity.ai', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: false,
      supportsReasoning: false,
    });
  }
}

// 8. Cohere Adapter
export class CohereAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('cohere', 'Cohere', 'https://api.cohere.ai/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 9. HuggingFace Adapter
export class HuggingFaceAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('huggingface', 'HuggingFace', 'https://api-inference.huggingface.co/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: false,
      supportsReasoning: false,
    });
  }
}

// 10. NVIDIA NIM Adapter
export class NvidiaAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('nvidia', 'NVIDIA NIM', 'https://integrate.api.nvidia.com/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 11. Replicate Adapter
export class ReplicateAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('replicate', 'Replicate', 'https://openai-proxy.replicate.com/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: false,
      supportsReasoning: false,
    });
  }
}

// 12. Moonshot AI (Kimi) Adapter
export class MoonshotAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('moonshot', 'Moonshot AI (Kimi)', 'https://api.moonshot.cn/v1', {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 13. Cerebras Adapter
export class CerebrasAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('cerebras', 'Cerebras', 'https://api.cerebras.ai/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 14. SambaNova Adapter
export class SambaNovaAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('sambanova', 'SambaNova', 'https://api.sambanova.ai/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 15. Hyperbolic Adapter
export class HyperbolicAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('hyperbolic', 'Hyperbolic', 'https://api.hyperbolic.xyz/v1', {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: false,
      supportsReasoning: false,
    });
  }
}

// 16. Novita AI Adapter
export class NovitaAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('novita', 'Novita AI', 'https://api.novita.ai/v3/openai', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 17. Parasail Adapter
export class ParasailAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('parasail', 'Parasail', 'https://api.parasail.io/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 18. Inference.net Adapter
export class InferenceNetAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('inference-net', 'Inference.net', 'https://api.inference.net/v1', {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// 19. Azure OpenAI Adapter — uses `api-key` header (no Bearer prefix) and a
// deployment-scoped URL. The base URL / deployment / api-version come from
// the provider config the user enters in the wizard, e.g.:
// https://{resource}.openai.azure.com/openai/deployments/{deployment}?api-version=2024-06-01
export class AzureOpenAIAdapter extends OpenAICompatibleAdapter {
  constructor(baseUrl = 'https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT') {
    super(
      'azure-openai',
      'Azure OpenAI',
      baseUrl,
      { supportsStreaming: true, supportsVision: true, supportsTools: true, supportsReasoning: true },
      { authHeader: 'api-key', authPrefix: '', chatPath: '/chat/completions?api-version=2024-06-01', modelsPath: '' }
    );
  }
}

// 20. Ollama Adapter (Local development)
export class OllamaAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super('ollama', 'Ollama', 'http://localhost:11434/v1', {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// LM Studio Adapter (Local development)
export class LMStudioAdapter extends OpenAICompatibleAdapter {
  constructor(baseUrl = 'http://localhost:1234/v1') {
    super('lmstudio', 'LM Studio', baseUrl, {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// vLLM Adapter (Local / self-hosted, OpenAI-compatible server)
export class VLLMAdapter extends OpenAICompatibleAdapter {
  constructor(baseUrl = 'http://localhost:8000/v1') {
    super('vllm', 'vLLM', baseUrl, {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// LocalAI Adapter (Local / self-hosted)
export class LocalAIAdapter extends OpenAICompatibleAdapter {
  constructor(baseUrl = 'http://localhost:8080/v1') {
    super('localai', 'LocalAI', baseUrl, {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: false,
    });
  }
}

// Text Generation Inference (TGI) Adapter (Hugging Face self-hosted server)
export class TGIAdapter extends OpenAICompatibleAdapter {
  constructor(baseUrl = 'http://localhost:8081/v1') {
    super('tgi', 'Text Generation Inference', baseUrl, {
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: false,
      supportsReasoning: false,
    });
  }
}

// 14. OpenAI Compatible Generic Adapter
export class GenericOpenAIAdapter extends OpenAICompatibleAdapter {
  constructor(id = 'generic', name = 'OpenAI Compatible', baseUrl = '') {
    super(id, name, baseUrl, {
      supportsStreaming: true,
      supportsVision: true,
      supportsTools: true,
      supportsReasoning: true,
    });
  }
}

// Export Registry — statically known providers (native + built-in OpenAI-compatible + local)
export const ADAPTERS_REGISTRY: Record<string, IProviderAdapter> = {
  // Native
  openai: new OpenAIAdapter(),
  gemini: new GeminiAdapter(),
  anthropic: new AnthropicAdapter(),
  bedrock: new BedrockAdapter({ region: process.env.AWS_REGION || 'us-east-1', credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || '', secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '' } }),
  vertex: new VertexAdapter({ project: process.env.GOOGLE_PROJECT_ID || '', location: process.env.GOOGLE_LOCATION || 'us-central1', credentials: {} }),
  // OpenAI-compatible cloud providers
  deepseek: new DeepSeekAdapter(),
  openrouter: new OpenRouterAdapter(),
  groq: new GroqAdapter(),
  together: new TogetherAdapter(),
  fireworks: new FireworksAdapter(),
  mistral: new MistralAdapter(),
  perplexity: new PerplexityAdapter(),
  cohere: new CohereAdapter(),
  huggingface: new HuggingFaceAdapter(),
  nvidia: new NvidiaAdapter(),
  replicate: new ReplicateAdapter(),
  moonshot: new MoonshotAdapter(),
  cerebras: new CerebrasAdapter(),
  sambanova: new SambaNovaAdapter(),
  hyperbolic: new HyperbolicAdapter(),
  novita: new NovitaAdapter(),
  parasail: new ParasailAdapter(),
  'inference-net': new InferenceNetAdapter(),
  'azure-openai': new AzureOpenAIAdapter(),
  // Local providers
  ollama: new OllamaAdapter(),
  lmstudio: new LMStudioAdapter(),
  vllm: new VLLMAdapter(),
  localai: new LocalAIAdapter(),
  tgi: new TGIAdapter(),
};

// Custom providers registered at runtime (DB-backed, user-created via the
// OpenAI-Compatible / Custom Provider wizard). Kept separate from the static
// registry above so built-in providers can never be shadowed accidentally.
const CUSTOM_ADAPTERS_REGISTRY = new Map<string, IProviderAdapter>();

export function registerCustomProvider(config: DynamicProviderConfig): IProviderAdapter {
  const adapter = createDynamicAdapter(config);
  CUSTOM_ADAPTERS_REGISTRY.set(config.id, adapter);
  return adapter;
}

export function unregisterCustomProvider(id: string): boolean {
  return CUSTOM_ADAPTERS_REGISTRY.delete(id);
}

export function listCustomProviders(): IProviderAdapter[] {
  return Array.from(CUSTOM_ADAPTERS_REGISTRY.values());
}

import { IProviderAdapterRegistry } from '@core/ports/interfaces';

class ProviderAdapterRegistry implements IProviderAdapterRegistry {
  public getAdapter(providerId: string): IProviderAdapter | undefined {
    return ADAPTERS_REGISTRY[providerId] ?? CUSTOM_ADAPTERS_REGISTRY.get(providerId);
  }
}

export const AdapterRegistry = new ProviderAdapterRegistry();

export function getAdapter(providerId: string): IProviderAdapter | undefined {
  return ADAPTERS_REGISTRY[providerId] ?? CUSTOM_ADAPTERS_REGISTRY.get(providerId);
}

export { createDynamicAdapter };
export type { DynamicProviderConfig };
