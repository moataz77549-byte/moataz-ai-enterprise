import fs from 'fs';
import path from 'path';
import { IConversationRepository, Conversation } from '@shared/ports/repositories';

export class ConversationRepository implements IConversationRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'conversations.json');
  }

  private readAll(): Conversation[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: Conversation[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  public async findById(id: string): Promise<Conversation | null> {
    return this.readAll().find((c) => c.id === id) || null;
  }

  public async findAll(): Promise<Conversation[]> {
    return this.readAll();
  }

  public async findByProjectId(projectId: string): Promise<Conversation[]> {
    return this.readAll().filter((c) => c.projectId === projectId);
  }

  public async save(entity: Conversation): Promise<Conversation> {
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

  public async deleteById(id: string): Promise<void> {
    const records = this.readAll().filter((r) => r.id !== id);
    this.writeAll(records);
  }
}
