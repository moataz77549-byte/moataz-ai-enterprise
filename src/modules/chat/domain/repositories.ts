/**
 * Chat Module - Repository Interfaces
 * 
 * Defines the contracts for data persistence in the chat system.
 * Implementations will handle Supabase interactions.
 */

import { Conversation, Message, MessageAttachment } from './entities';

export interface IConversationRepository {
  /**
   * Create a new conversation
   */
  create(conversation: Conversation): Promise<Conversation>;

  /**
   * Get a conversation by ID
   */
  findById(id: string): Promise<Conversation | null>;

  /**
   * Get all conversations in a project
   */
  findByProjectId(projectId: string, options?: {
    limit?: number;
    offset?: number;
    archived?: boolean;
  }): Promise<Conversation[]>;

  /**
   * Update a conversation
   */
  update(id: string, updates: Partial<Conversation>): Promise<Conversation>;

  /**
   * Delete a conversation
   */
  delete(id: string): Promise<void>;

  /**
   * Archive a conversation
   */
  archive(id: string): Promise<void>;

  /**
   * Get conversation count for a project
   */
  countByProjectId(projectId: string): Promise<number>;
}

export interface IMessageRepository {
  /**
   * Create a new message
   */
  create(message: Message): Promise<Message>;

  /**
   * Get a message by ID
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Get all messages in a conversation
   */
  findByConversationId(conversationId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;

  /**
   * Get messages by role in a conversation
   */
  findByConversationIdAndRole(conversationId: string, role: string): Promise<Message[]>;

  /**
   * Update a message
   */
  update(id: string, updates: Partial<Message>): Promise<Message>;

  /**
   * Delete a message
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all messages in a conversation
   */
  deleteByConversationId(conversationId: string): Promise<void>;

  /**
   * Get message count for a conversation
   */
  countByConversationId(conversationId: string): Promise<number>;

  /**
   * Get the last message in a conversation
   */
  getLastMessage(conversationId: string): Promise<Message | null>;
}

export interface IMessageAttachmentRepository {
  /**
   * Create a new attachment
   */
  create(attachment: MessageAttachment): Promise<MessageAttachment>;

  /**
   * Get an attachment by ID
   */
  findById(id: string): Promise<MessageAttachment | null>;

  /**
   * Get all attachments for a message
   */
  findByMessageId(messageId: string): Promise<MessageAttachment[]>;

  /**
   * Delete an attachment
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all attachments for a message
   */
  deleteByMessageId(messageId: string): Promise<void>;
}
