/**
 * Chat Module - Application Service
 * 
 * Implements the business logic for chat operations:
 * - Creating conversations
 * - Sending messages
 * - Streaming responses
 * - Managing conversation history
 */

import { Conversation, Message, MessageRole, ContentType } from '../domain/entities';
import { IConversationRepository, IMessageRepository } from '../domain/repositories';
import { IProviderAdapter, GatewayChatRequest } from '@modules/ai-gateway/domain/adapter.interface';
import { ApplicationError } from '@shared/errors';

export interface ChatServiceOptions {
  conversationRepository: IConversationRepository;
  messageRepository: IMessageRepository;
  providerAdapter: IProviderAdapter;
}

export class ChatService {
  private conversationRepo: IConversationRepository;
  private messageRepo: IMessageRepository;
  private providerAdapter: IProviderAdapter;

  constructor(options: ChatServiceOptions) {
    this.conversationRepo = options.conversationRepository;
    this.messageRepo = options.messageRepository;
    this.providerAdapter = options.providerAdapter;
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    projectId: string,
    title: string,
    options?: {
      description?: string;
      systemPrompt?: string;
      providerId?: string;
      modelId?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<Conversation> {
    const conversation = new Conversation(
      crypto.randomUUID(),
      projectId,
      title,
      options?.description || '',
      options?.providerId || 'openai',
      options?.modelId || 'gpt-4',
      options?.systemPrompt || '',
      options?.temperature || 0.7,
      options?.maxTokens || 4096,
    );

    return this.conversationRepo.create(conversation);
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new ApplicationError('NOT_FOUND', `Conversation ${conversationId} not found`);
    }
    return conversation;
  }

  /**
   * Get all conversations in a project
   */
  async getConversationsByProject(
    projectId: string,
    options?: { limit?: number; offset?: number; archived?: boolean }
  ): Promise<Conversation[]> {
    return this.conversationRepo.findByProjectId(projectId, options);
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    contentType: ContentType = ContentType.TEXT,
    metadata: Record<string, unknown> = {}
  ): Promise<Message> {
    // Verify conversation exists
    await this.getConversation(conversationId);

    const message = new Message(
      crypto.randomUUID(),
      conversationId,
      role,
      content,
      contentType,
      metadata,
    );

    return this.messageRepo.create(message);
  }

  /**
   * Send a message and get AI response (non-streaming)
   */
  async sendMessage(
    conversationId: string,
    userMessage: string,
    apiKey: string
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const conversation = await this.getConversation(conversationId);

    // Add user message
    const userMsg = await this.addMessage(
      conversationId,
      MessageRole.USER,
      userMessage,
      ContentType.TEXT
    );

    // Get conversation history
    const messages = await this.messageRepo.findByConversationId(conversationId);
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Prepare request for AI provider
    const request: GatewayChatRequest = {
      model: conversation.modelId,
      messages: [
        ...(conversation.systemPrompt
          ? [{ role: 'system' as const, content: conversation.systemPrompt }]
          : []),
        ...formattedMessages,
      ],
      temperature: conversation.temperature,
      maxTokens: conversation.maxTokens,
      stream: false,
    };

    // Call AI provider
    const response = await this.providerAdapter.chat(request, apiKey);

    // Extract assistant response
    const assistantContent = response.choices[0]?.message?.content || '';
    const assistantMsg = await this.addMessage(
      conversationId,
      MessageRole.ASSISTANT,
      assistantContent,
      ContentType.TEXT,
      {
        tokens: response.usage,
        model: response.model,
      }
    );

    return { userMessage: userMsg, assistantMessage: assistantMsg };
  }

  /**
   * Send a message and stream AI response
   */
  async *streamMessage(
    conversationId: string,
    userMessage: string,
    apiKey: string
  ): AsyncGenerator<string> {
    const conversation = await this.getConversation(conversationId);

    // Add user message
    await this.addMessage(
      conversationId,
      MessageRole.USER,
      userMessage,
      ContentType.TEXT
    );

    // Get conversation history
    const messages = await this.messageRepo.findByConversationId(conversationId);
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Prepare request for AI provider
    const request: GatewayChatRequest = {
      model: conversation.modelId,
      messages: [
        ...(conversation.systemPrompt
          ? [{ role: 'system' as const, content: conversation.systemPrompt }]
          : []),
        ...formattedMessages,
      ],
      temperature: conversation.temperature,
      maxTokens: conversation.maxTokens,
      stream: true,
    };

    // Get streaming response
    const stream = await this.providerAdapter.stream(request, apiKey);
    const reader = stream.getReader();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Extract content from stream chunk
        if (value.delta?.content) {
          fullContent += value.delta.content;
          yield value.delta.content;
        }
      }

      // Save complete assistant message
      await this.addMessage(
        conversationId,
        MessageRole.ASSISTANT,
        fullContent,
        ContentType.TEXT,
        { streamed: true }
      );
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    conversationId: string,
    limit: number = 50
  ): Promise<Message[]> {
    const messages = await this.messageRepo.findByConversationId(conversationId, {
      limit,
      offset: 0,
    });
    return messages;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await this.conversationRepo.delete(conversationId);
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await this.conversationRepo.archive(conversationId);
  }

  /**
   * Update conversation settings
   */
  async updateConversationSettings(
    conversationId: string,
    settings: Partial<{
      title: string;
      description: string;
      systemPrompt: string;
      temperature: number;
      maxTokens: number;
      providerId: string;
      modelId: string;
    }>
  ): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    conversation.updateSettings(settings);
    return this.conversationRepo.update(conversationId, conversation);
  }

  /**
   * Clear conversation history (delete all messages)
   */
  async clearConversationHistory(conversationId: string): Promise<void> {
    await this.messageRepo.deleteByConversationId(conversationId);
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(conversationId: string): Promise<{
    messageCount: number;
    totalTokens: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const conversation = await this.getConversation(conversationId);
    const messages = await this.messageRepo.findByConversationId(conversationId);
    const totalTokens = messages.reduce((sum, msg) => sum + msg.getEstimatedTokens(), 0);

    return {
      messageCount: messages.length,
      totalTokens,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
