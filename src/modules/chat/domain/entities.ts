/**
 * Chat Module - Domain Entities
 * 
 * Defines the core business entities for the chat system:
 * - Conversation: Represents a chat session
 * - Message: Individual messages in a conversation
 * - MessageAttachment: Files/images attached to messages
 */

export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL = 'tool',
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  CODE = 'code',
}

/**
 * Represents a single message in a conversation
 */
export class Message {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly contentType: ContentType = ContentType.TEXT,
    public readonly metadata: Record<string, unknown> = {},
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  /**
   * Check if this is a user message
   */
  isUserMessage(): boolean {
    return this.role === MessageRole.USER;
  }

  /**
   * Check if this is an assistant message
   */
  isAssistantMessage(): boolean {
    return this.role === MessageRole.ASSISTANT;
  }

  /**
   * Get token count estimate (rough approximation)
   * Assumes 1 token ≈ 4 characters
   */
  getEstimatedTokens(): number {
    return Math.ceil(this.content.length / 4);
  }
}

/**
 * Represents an attachment to a message (file, image, etc.)
 */
export class MessageAttachment {
  constructor(
    public readonly id: string,
    public readonly messageId: string,
    public readonly fileId?: string,
    public readonly url?: string,
    public readonly mimeType?: string,
    public readonly sizeBytes?: number,
    public readonly createdAt: Date = new Date(),
  ) {}
}

/**
 * Represents a conversation (chat session)
 */
export class Conversation {
  private messages: Message[] = [];

  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public title: string,
    public description: string = '',
    public providerId: string = 'openai',
    public modelId: string = 'gpt-4',
    public systemPrompt: string = '',
    public temperature: number = 0.7,
    public maxTokens: number = 4096,
    public isArchived: boolean = false,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  /**
   * Add a message to the conversation
   */
  addMessage(message: Message): void {
    this.messages.push(message);
    this.updatedAt = new Date();
  }

  /**
   * Get all messages in the conversation
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Get the last N messages
   */
  getLastMessages(count: number): Message[] {
    return this.messages.slice(-count);
  }

  /**
   * Get conversation history formatted for LLM API
   */
  getFormattedHistory(): Array<{ role: string; content: string }> {
    return this.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Calculate total tokens used in conversation
   */
  getTotalTokens(): number {
    return this.messages.reduce((total, msg) => total + msg.getEstimatedTokens(), 0);
  }

  /**
   * Check if conversation has exceeded token limit
   */
  hasExceededTokenLimit(): boolean {
    return this.getTotalTokens() > this.maxTokens;
  }

  /**
   * Archive the conversation
   */
  archive(): void {
    this.isArchived = true;
    this.updatedAt = new Date();
  }

  /**
   * Unarchive the conversation
   */
  unarchive(): void {
    this.isArchived = false;
    this.updatedAt = new Date();
  }

  /**
   * Update conversation settings
   */
  updateSettings(settings: Partial<{
    title: string;
    description: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    providerId: string;
    modelId: string;
  }>): void {
    if (settings.title !== undefined) this.title = settings.title;
    if (settings.description !== undefined) this.description = settings.description;
    if (settings.systemPrompt !== undefined) this.systemPrompt = settings.systemPrompt;
    if (settings.temperature !== undefined) this.temperature = settings.temperature;
    if (settings.maxTokens !== undefined) this.maxTokens = settings.maxTokens;
    if (settings.providerId !== undefined) this.providerId = settings.providerId;
    if (settings.modelId !== undefined) this.modelId = settings.modelId;
    this.updatedAt = new Date();
  }
}
