/**
 * Conversations API Endpoint
 * 
 * POST /api/conversations
 * - Create a new conversation
 * 
 * GET /api/conversations
 * - List conversations for a project
 */

import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { SupabaseConversationRepository } from '@modules/chat/infrastructure/supabase-repositories';
import { Conversation } from '@modules/chat/domain/entities';
import { ensureBootstrapped } from '../bootstrap';
import { z } from 'zod';

const createConversationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  providerId: z.string().optional().default('openai'),
  modelId: z.string().optional().default('gpt-4'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().positive().optional().default(4096),
});

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const parseResult = await BaseController.parseBody(request, createConversationSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const data = (parseResult as any).data;

    const conversation = new Conversation(
      crypto.randomUUID(),
      data.projectId,
      data.title,
      data.description || '',
      data.providerId || 'openai',
      data.modelId || 'gpt-4',
      data.systemPrompt || '',
      data.temperature || 0.7,
      data.maxTokens || 4096
    );

    const repo = new SupabaseConversationRepository();
    const created = await repo.create(conversation);

    return BaseController.success(
      {
        id: created.id,
        projectId: created.projectId,
        title: created.title,
        description: created.description,
        providerId: created.providerId,
        modelId: created.modelId,
        systemPrompt: created.systemPrompt,
        temperature: created.temperature,
        maxTokens: created.maxTokens,
        isArchived: created.isArchived,
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
 * GET /api/conversations?projectId=...
 * List conversations for a project
 */
export async function GET(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return BaseController.error('BAD_REQUEST', 'projectId query parameter is required', 400);
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const repo = new SupabaseConversationRepository();
    const conversations = await repo.findByProjectId(projectId, { limit, offset });

    return BaseController.success({
      conversations: conversations.map((conv) => ({
        id: conv.id,
        projectId: conv.projectId,
        title: conv.title,
        description: conv.description,
        providerId: conv.providerId,
        modelId: conv.modelId,
        isArchived: conv.isArchived,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
    });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
