/**
 * Individual Conversation API Endpoint
 * 
 * GET /api/conversations/[id]
 * - Get conversation details
 * 
 * PUT /api/conversations/[id]
 * - Update conversation settings
 * 
 * DELETE /api/conversations/[id]
 * - Delete conversation
 */

import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { SupabaseConversationRepository, SupabaseMessageRepository } from '@modules/chat/infrastructure/supabase-repositories';
import { ensureBootstrapped } from '../../bootstrap';
import { z } from 'zod';

const updateConversationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
});

/**
 * GET /api/conversations/[id]
 * Get conversation details with message history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureBootstrapped();

    const { id: conversationId } = await params;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    const conversationRepo = new SupabaseConversationRepository();
    const messageRepo = new SupabaseMessageRepository();

    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) {
      return BaseController.error('NOT_FOUND', 'Conversation not found', 404);
    }

    const messages = await messageRepo.findByConversationId(conversationId, { limit });

    return BaseController.success({
      conversation: {
        id: conversation.id,
        projectId: conversation.projectId,
        title: conversation.title,
        description: conversation.description,
        providerId: conversation.providerId,
        modelId: conversation.modelId,
        systemPrompt: conversation.systemPrompt,
        temperature: conversation.temperature,
        maxTokens: conversation.maxTokens,
        isArchived: conversation.isArchived,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        contentType: msg.contentType,
        metadata: msg.metadata,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    return BaseController.handleError(error);
  }
}

/**
 * PUT /api/conversations/[id]
 * Update conversation settings
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureBootstrapped();

    const { id: conversationId } = await params;
    const parseResult = await BaseController.parseBody(request, updateConversationSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const updates = (parseResult as any).data;

    const repo = new SupabaseConversationRepository();
    const conversation = await repo.findById(conversationId);
    if (!conversation) {
      return BaseController.error('NOT_FOUND', 'Conversation not found', 404);
    }

    const updated = await repo.update(conversationId, updates);

    return BaseController.success({
      id: updated.id,
      projectId: updated.projectId,
      title: updated.title,
      description: updated.description,
      providerId: updated.providerId,
      modelId: updated.modelId,
      systemPrompt: updated.systemPrompt,
      temperature: updated.temperature,
      maxTokens: updated.maxTokens,
      isArchived: updated.isArchived,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    return BaseController.handleError(error);
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureBootstrapped();

    const { id: conversationId } = await params;

    const repo = new SupabaseConversationRepository();
    const conversation = await repo.findById(conversationId);
    if (!conversation) {
      return BaseController.error('NOT_FOUND', 'Conversation not found', 404);
    }

    await repo.delete(conversationId);

    return BaseController.success({ deleted: true });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
