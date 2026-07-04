/**
 * Chat Module - Supabase Repository Implementations
 * 
 * Concrete implementations of the chat repositories using Supabase.
 */

import { supabase } from '@core/database/supabase';
import { Conversation, Message, MessageAttachment, MessageRole, ContentType } from '../domain/entities';
import {
  IConversationRepository,
  IMessageRepository,
  IMessageAttachmentRepository,
} from '../domain/repositories';
import { ApplicationError } from '@shared/errors';

export class SupabaseConversationRepository implements IConversationRepository {
  async create(conversation: Conversation): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        id: conversation.id,
        project_id: conversation.projectId,
        title: conversation.title,
        description: conversation.description,
        provider_id: conversation.providerId,
        model_id: conversation.modelId,
        system_prompt: conversation.systemPrompt,
        temperature: conversation.temperature,
        max_tokens: conversation.maxTokens,
        is_archived: conversation.isArchived,
        created_at: conversation.createdAt.toISOString(),
        updated_at: conversation.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to create conversation: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch conversation: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findByProjectId(
    projectId: string,
    options?: { limit?: number; offset?: number; archived?: boolean }
  ): Promise<Conversation[]> {
    let query = supabase
      .from('conversations')
      .select()
      .eq('project_id', projectId);

    if (options?.archived !== undefined) {
      query = query.eq('is_archived', options.archived);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch conversations: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async update(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.systemPrompt !== undefined) updateData.system_prompt = updates.systemPrompt;
    if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
    if (updates.maxTokens !== undefined) updateData.max_tokens = updates.maxTokens;
    if (updates.providerId !== undefined) updateData.provider_id = updates.providerId;
    if (updates.modelId !== undefined) updateData.model_id = updates.modelId;
    if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to update conversation: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('conversations').delete().eq('id', id);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete conversation: ${error.message}`);
    }
  }

  async archive(id: string): Promise<void> {
    await this.update(id, { isArchived: true });
  }

  async countByProjectId(projectId: string): Promise<number> {
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to count conversations: ${error.message}`);
    }

    return count || 0;
  }

  private mapToEntity(data: any): Conversation {
    return new Conversation(
      data.id,
      data.project_id,
      data.title,
      data.description || '',
      data.provider_id || 'openai',
      data.model_id || 'gpt-4',
      data.system_prompt || '',
      data.temperature || 0.7,
      data.max_tokens || 4096,
      data.is_archived || false,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}

export class SupabaseMessageRepository implements IMessageRepository {
  async create(message: Message): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: message.id,
        conversation_id: message.conversationId,
        role: message.role,
        content: message.content,
        content_type: message.contentType,
        metadata: message.metadata,
        created_at: message.createdAt.toISOString(),
        updated_at: message.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to create message: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch message: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findByConversationId(
    conversationId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch messages: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async findByConversationIdAndRole(conversationId: string, role: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .eq('conversation_id', conversationId)
      .eq('role', role)
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch messages: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async update(id: string, updates: Partial<Message>): Promise<Message> {
    const updateData: any = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to update message: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', id);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete message: ${error.message}`);
    }
  }

  async deleteByConversationId(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete messages: ${error.message}`);
    }
  }

  async countByConversationId(conversationId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to count messages: ${error.message}`);
    }

    return count || 0;
  }

  async getLastMessage(conversationId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch last message: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  private mapToEntity(data: any): Message {
    return new Message(
      data.id,
      data.conversation_id,
      data.role as MessageRole,
      data.content,
      (data.content_type as ContentType) || ContentType.TEXT,
      data.metadata || {},
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}

export class SupabaseMessageAttachmentRepository implements IMessageAttachmentRepository {
  async create(attachment: MessageAttachment): Promise<MessageAttachment> {
    const { data, error } = await supabase
      .from('message_attachments')
      .insert({
        id: attachment.id,
        message_id: attachment.messageId,
        file_id: attachment.fileId,
        url: attachment.url,
        mime_type: attachment.mimeType,
        size_bytes: attachment.sizeBytes,
        created_at: attachment.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to create attachment: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<MessageAttachment | null> {
    const { data, error } = await supabase
      .from('message_attachments')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch attachment: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findByMessageId(messageId: string): Promise<MessageAttachment[]> {
    const { data, error } = await supabase
      .from('message_attachments')
      .select()
      .eq('message_id', messageId);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch attachments: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('message_attachments').delete().eq('id', id);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete attachment: ${error.message}`);
    }
  }

  async deleteByMessageId(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('message_attachments')
      .delete()
      .eq('message_id', messageId);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete attachments: ${error.message}`);
    }
  }

  private mapToEntity(data: any): MessageAttachment {
    return new MessageAttachment(
      data.id,
      data.message_id,
      data.file_id,
      data.url,
      data.mime_type,
      data.size_bytes,
      new Date(data.created_at)
    );
  }
}
