import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { CustomProviderRepo } from '@modules/providers/infrastructure/provider.repository';
import { getAdapter } from '@modules/ai-gateway/infrastructure/adapters';
import { ensureBootstrapped } from '../../../bootstrap';
import { z } from 'zod';

// Allows testing with a freshly-typed key before it's saved, or falls back
// to the already-stored (encrypted) key for a provider that exists.
const testSchema = z.object({ apiKey: z.string().optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureBootstrapped();
    const { id } = await params;
    const parseResult = await BaseController.parseBody(request, testSchema).catch(() => ({
      success: true as const,
      data: {},
    }));
    const providedKey = (parseResult as any).data?.apiKey;

    const record = await CustomProviderRepo.findById(id);
    const providerSlug = record?.slug ?? id;
    const adapter = getAdapter(providerSlug);

    if (!adapter) {
      return BaseController.error('NOT_FOUND', 'Provider adapter not found. Save the provider first.', 404);
    }

    const apiKey = providedKey ?? (record ? await CustomProviderRepo.getDecryptedApiKey(record.id) : null);

    const start = Date.now();
    const ok = await adapter.testConnection(apiKey ?? '');
    const latencyMs = Date.now() - start;

    if (record) {
      await CustomProviderRepo.recordHealthCheck(record.id, {
        status: ok ? 'healthy' : 'down',
        latencyMs,
      });
    }

    return BaseController.success({ connected: ok, latencyMs });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
