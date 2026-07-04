import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { CustomProviderRepo } from '@modules/providers/infrastructure/provider.repository';
import { registerCustomProvider, unregisterCustomProvider } from '@modules/ai-gateway/infrastructure/adapters';
import { ensureBootstrapped } from '../../bootstrap';
import { z } from 'zod';

const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  providerType: z.enum(['openai_compatible', 'local', 'custom']).optional(),
  baseUrl: z.string().url().optional(),
  defaultModel: z.string().optional(),
  apiKey: z.string().optional(),
  headers: z.record(z.string()).optional(),
  authHeader: z.string().optional(),
  authPrefix: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).max(5).optional(),
  enabled: z.boolean().optional(),
  capabilities: z
    .object({
      supportsStreaming: z.boolean().optional(),
      supportsVision: z.boolean().optional(),
      supportsTools: z.boolean().optional(),
      supportsReasoning: z.boolean().optional(),
    })
    .optional(),
});

function resync(provider: {
  slug: string;
  name: string;
  baseUrl: string;
  headers: Record<string, string>;
  timeoutMs: number;
  maxRetries: number;
  authHeader: string;
  authPrefix: string;
  capabilities: any;
  status: string;
}) {
  unregisterCustomProvider(provider.slug);
  if (provider.status === 'enabled') {
    registerCustomProvider({
      id: provider.slug,
      name: provider.name,
      baseUrl: provider.baseUrl,
      headers: provider.headers,
      timeoutMs: provider.timeoutMs,
      maxRetries: provider.maxRetries,
      authHeader: provider.authHeader,
      authPrefix: provider.authPrefix,
      capabilities: provider.capabilities,
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureBootstrapped();
    const { id } = await params;
    const parseResult = await BaseController.parseBody(request, updateProviderSchema);
    if (!parseResult.success) return parseResult.response;

    const { enabled, ...updateData } = parseResult.data;
    await CustomProviderRepo.update(id, updateData);
    if (enabled !== undefined) {
      await CustomProviderRepo.setEnabled(id, enabled);
    }
    const finalRecord = (await CustomProviderRepo.findById(id))!;
    resync(finalRecord);

    return BaseController.success(finalRecord);
  } catch (error) {
    return BaseController.handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureBootstrapped();
    const { id } = await params;
    const existing = await CustomProviderRepo.findById(id);
    if (existing) {
      unregisterCustomProvider(existing.slug);
    }
    await CustomProviderRepo.delete(id);
    return BaseController.success({ message: 'Provider deleted successfully.' });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
