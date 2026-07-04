/**
 * Chat API Endpoint
 * 
 * POST /api/chat
 * - Send a message to a conversation
 * - Supports both streaming and non-streaming responses
 * 
 * GET /api/chat
 * - List conversations for a project
 */

import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { SupabaseConversationRepository, SupabaseMessageRepository } from '@modules/chat/infrastructure/supabase-repositories';
import { ChatService } from '@modules/chat/application/chat.service';
import { ADAPTERS_REGISTRY } from '@modules/ai-gateway/infrastructure/adapters';
import { CustomProviderRepo } from '@modules/providers/infrastructure/provider.repository';
import { ensureBootstrapped } from '../bootstrap';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  message: z.string().min(1, 'Message cannot be empty'),
  stream: z.boolean().optional().default(false),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
});

const createConversationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

/**
 * POST /api/chat
 * Send a message to a conversation
 */
export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const parseResult = await BaseController.parseBody(request, sendMessageSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { conversationId, message, stream, providerId, modelId } = (parseResult as any).data;

    // Initialize repositories
    const conversationRepo = new SupabaseConversationRepository();
    const messageRepo = new SupabaseMessageRepository();

    // Get conversation
    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) {
      return BaseController.error('NOT_FOUND', 'Conversation not found', 404);
    }

    // Get provider adapter
    const effectiveProviderId = providerId || conversation.providerId;
    const effectiveModelId = modelId || conversation.modelId;

    let adapter = ADAPTERS_REGISTRY[effectiveProviderId];
    if (!adapter) {
      // Try to find custom provider
      const customProvider = await CustomProviderRepo.findById(effectiveProviderId);
      if (!customProvider) {
        return BaseController.error('NOT_FOUND', `Provider ${effectiveProviderId} not found`, 404);
      }
      // For custom providers, use the generic OpenAI adapter
      adapter = ADAPTERS_REGISTRY['openai_compatible'];
    }

    // Get API key for provider
    // In production, this would fetch from the encrypted vault
    const apiKey = request.headers.get('x-api-key') || '';
    if (!apiKey) {
      return BaseController.error('UNAUTHORIZED', 'API key required', 401);
    }

    // Initialize chat service
    const chatService = new ChatService({
      conversationRepository: conversationRepo,
      messageRepository: messageRepo,
      providerAdapter: adapter,
    });

    if (stream) {
      // Streaming response
      return new NextResponse(
        new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of chatService.streamMessage(conversationId, message, apiKey)) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
              }
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            } catch (error: any) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ error: error.message })}\n\n`
                )
              );
            } finally {
              controller.close();
            }
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    } else {
      // Non-streaming response
      const { userMessage, assistantMessage } = await chatService.sendMessage(
        conversationId,
        message,
        apiKey
      );

      return BaseController.success({
        userMessage: {
          id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt,
        },
      });
    }
  } catch (error) {
    return BaseController.handleError(error);
  }
}

/**
 * GET /api/chat?projectId=...
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
    const archived = request.nextUrl.searchParams.get('archived');

    const conversationRepo = new SupabaseConversationRepository();
    const conversations = await conversationRepo.findByProjectId(projectId, {
      limit,
      offset,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
    });

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
