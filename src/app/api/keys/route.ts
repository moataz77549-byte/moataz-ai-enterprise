import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { ApiKeyRepo } from '@modules/api-keys/infrastructure/api-key.repository';
import { getAdapter } from '@modules/ai-gateway/infrastructure/adapters';
import { z } from 'zod';

const addKeySchema = z.object({
  providerId: z.string(),
  name: z.string(),
  value: z.string(),
});

import { ensureBootstrapped } from '../bootstrap';

export async function GET() {
  try {
    await ensureBootstrapped();
    const keys = await ApiKeyRepo.listKeys();
    return BaseController.success(keys);
  } catch (error) {
    return BaseController.handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();
    const parseResult = await BaseController.parseBody(request, addKeySchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { providerId, name, value } = parseResult.data;

    // Test connectivity first
    const adapter = getAdapter(providerId);
    if (adapter) {
      const works = await adapter.testConnection(value);
      if (!works) {
        return BaseController.error('INVALID_API_KEY', 'Connection test failed for the provided API key.', 400);
      }
    }

    const newKey = await ApiKeyRepo.addKey(providerId, name, value);
    return BaseController.success(newKey, 201);
  } catch (error) {
    return BaseController.handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureBootstrapped();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return BaseController.error('MISSING_PARAMETER', 'Missing key ID parameter.', 400);
    }

    await ApiKeyRepo.deleteKey(id);
    return BaseController.success({ message: 'API key deleted successfully.' });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
