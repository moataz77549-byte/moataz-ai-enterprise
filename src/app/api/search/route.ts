import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { Search } from '@modules/search/application/search.service';
import { ensureBootstrapped } from '../bootstrap';

export async function GET(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const projectId = searchParams.get('projectId') || undefined;

    if (!query) {
      return BaseController.error('MISSING_QUERY', 'Search query parameter (q) is required.', 400);
    }

    const results = await Search.search(query, projectId);
    return BaseController.success(results);
  } catch (error) {
    return BaseController.handleError(error);
  }
}
export const dynamic = 'force-dynamic';
