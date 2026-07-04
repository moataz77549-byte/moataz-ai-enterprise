/**
 * Sandbox Sessions API Endpoint
 * 
 * POST /api/sandbox/sessions
 * - Create a new sandbox session
 * 
 * GET /api/sandbox/sessions
 * - List sandbox sessions for a workspace or user
 */

import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { SupabaseSandboxSessionRepository } from '@modules/sandbox/infrastructure/supabase-repositories';
import { SandboxSession, RuntimeType } from '@modules/sandbox/domain/entities';
import { ensureBootstrapped } from '../../bootstrap';
import { z } from 'zod';

const createSessionSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  userId: z.string().uuid('Invalid user ID'),
  runtime: z.enum(['python', 'nodejs', 'bash']),
});

/**
 * POST /api/sandbox/sessions
 * Create a new sandbox session
 */
export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const parseResult = await BaseController.parseBody(request, createSessionSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { workspaceId, userId, runtime } = (parseResult as any).data;

    const session = new SandboxSession(
      crypto.randomUUID(),
      workspaceId,
      userId,
      runtime as RuntimeType
    );

    const repo = new SupabaseSandboxSessionRepository();
    const created = await repo.create(session);

    return BaseController.success(
      {
        id: created.id,
        workspaceId: created.workspaceId,
        userId: created.userId,
        runtime: created.runtime,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      201
    );
  } catch (error) {
    return BaseController.handleError(error);
  }
}

/**
 * GET /api/sandbox/sessions?workspaceId=...&userId=...
 * List sandbox sessions
 */
export async function GET(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const repo = new SupabaseSandboxSessionRepository();
    let sessions;

    if (workspaceId) {
      sessions = await repo.findByWorkspaceId(workspaceId, { limit, offset });
    } else if (userId) {
      sessions = await repo.findByUserId(userId, { limit, offset });
    } else {
      return BaseController.error(
        'BAD_REQUEST',
        'Either workspaceId or userId query parameter is required',
        400
      );
    }

    return BaseController.success({
      sessions: sessions.map((session) => ({
        id: session.id,
        workspaceId: session.workspaceId,
        userId: session.userId,
        runtime: session.runtime,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
