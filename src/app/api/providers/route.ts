import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { CustomProviderRepo } from '@modules/providers/infrastructure/provider.repository';
import { registerCustomProvider, ADAPTERS_REGISTRY } from '@modules/ai-gateway/infrastructure/adapters';
import { ensureBootstrapped } from '../bootstrap';
import { z } from 'zod';

const createProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  providerType: z.enum(['openai_compatible', 'local', 'custom']).default('openai_compatible'),
  baseUrl: z.string().url('Base URL must be a valid URL'),
  defaultModel: z.string().optional(),
  apiKey: z.string().optional(),
  headers: z.record(z.string()).optional(),
  authHeader: z.string().optional(),
  authPrefix: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).max(5).optional(),
  capabilities: z
    .object({
      supportsStreaming: z.boolean().optional(),
      supportsVision: z.boolean().optional(),
      supportsTools: z.boolean().optional(),
      supportsReasoning: z.boolean().optional(),
    })
    .optional(),
});

// Built-in providers are static and always available; surfaced here so the
// Provider Manager UI can render one unified list (native + OpenAI-compatible
// + local + custom) without the frontend needing to know which is which.
function listBuiltInProviders() {
  return Object.values(ADAPTERS_REGISTRY).map((adapter) => ({
    id: adapter.id,
    name: adapter.name,
    builtIn: true,
    capabilities: adapter.getCapabilities(),
  }));
}

export async function GET() {
  try {
    await ensureBootstrapped();
    const custom = await CustomProviderRepo.list();
    return BaseController.success({
      builtIn: listBuiltInProviders(),
      custom,
    });
  } catch (error) {
    return BaseController.handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();
    const parseResult = await BaseController.parseBody(request, createProviderSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const data = (parseResult as any).data;
    const created = await CustomProviderRepo.create(data);

    // Immediately register it into the live gateway so it's usable without a redeploy.
    registerCustomProvider({
      id: created.slug,
      name: created.name,
      baseUrl: created.baseUrl,
      headers: created.headers,
      timeoutMs: created.timeoutMs,
      maxRetries: created.maxRetries,
      authHeader: created.authHeader,
      authPrefix: created.authPrefix,
      capabilities: created.capabilities,
    });

    return BaseController.success(created, 201);
  } catch (error) {
    return BaseController.handleError(error);
  }
}
