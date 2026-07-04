/**
 * Sandbox Execution API Endpoint
 * 
 * POST /api/sandbox/execute
 * - Execute code in a sandbox session
 */

import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { SupabaseSandboxSessionRepository, SupabaseSandboxExecutionRepository } from '@modules/sandbox/infrastructure/supabase-repositories';
import { SandboxService } from '@modules/sandbox/application/sandbox.service';
import { ensureBootstrapped } from '../../bootstrap';
import { z } from 'zod';

const executeCodeSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  code: z.string().min(1, 'Code cannot be empty'),
  timeout: z.number().int().positive().optional().default(30000),
  env: z.record(z.string()).optional(),
});

/**
 * POST /api/sandbox/execute
 * Execute code in a sandbox session
 */
export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const parseResult = await BaseController.parseBody(request, executeCodeSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { sessionId, code, timeout, env } = (parseResult as any).data;

    const sessionRepo = new SupabaseSandboxSessionRepository();
    const executionRepo = new SupabaseSandboxExecutionRepository();

    const sandboxService = new SandboxService({
      sessionRepository: sessionRepo,
      executionRepository: executionRepo,
    });

    const execution = await sandboxService.executeCode(sessionId, code, timeout, env);

    return BaseController.success(
      {
        id: execution.id,
        sessionId: execution.sessionId,
        code: execution.code,
        status: execution.status,
        output: execution.output,
        errorOutput: execution.errorOutput,
        exitCode: execution.exitCode,
        executionTimeMs: execution.executionTimeMs,
        createdAt: execution.createdAt,
        completedAt: execution.completedAt,
      },
      201
    );
  } catch (error) {
    return BaseController.handleError(error);
  }
}
