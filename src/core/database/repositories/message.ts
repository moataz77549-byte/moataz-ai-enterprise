import fs from 'fs';
import path from 'path';
import { IMessageRepository, Message } from '@shared/ports/repositories';

export class MessageRepository implements IMessageRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'messages.json');
  }

  private readAll(): Message[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: Message[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  public async findById(id: string): Promise<Message | null> {
    return this.readAll().find((m) => m.id === id) || null;
  }

  public async findAll(): Promise<Message[]> {
    return this.readAll();
  }

  public async findByConversationId(conversationId: string): Promise<Message[]> {
    return this.readAll().filter((m) => m.conversationId === conversationId);
  }

  public async save(entity: Message): Promise<Message> {
    const records = this.readAll();
    const existingIdx = records.findIndex((r) => r.id === entity.id);

    if (existingIdx !== -1) {
      records[existingIdx] = entity;
    } else {
      records.push(entity);
    }
    this.writeAll(records);
    return entity;
  }

  public async saveBulk(messages: Message[]): Promise<Message[]> {
    const records = this.readAll();
    for (const m of messages) {
      const idx = records.findIndex((r) => r.id === m.id);
      if (idx !== -1) {
        records[idx] = m;
      } else {
        records.push(m);
      }
    }
    this.writeAll(records);
    return messages;
  }

  public async deleteById(id: string): Promise<void> {
    const records = this.readAll().filter((r) => r.id !== id);
    this.writeAll(records);
  }
}
