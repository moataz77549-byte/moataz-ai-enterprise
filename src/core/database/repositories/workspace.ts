import fs from 'fs';
import path from 'path';
import { IWorkspaceRepository, Workspace } from '@shared/ports/repositories';

export class WorkspaceRepository implements IWorkspaceRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'workspaces.json');
    
    // Seed default workspace
    if (this.readAll().length === 0) {
      this.writeAll([
        {
          id: 'personal',
          name: 'Personal Workspace',
          slug: 'personal',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }

  private readAll(): Workspace[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: Workspace[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  public async findById(id: string): Promise<Workspace | null> {
    return this.readAll().find((w) => w.id === id) || null;
  }

  public async findAll(): Promise<Workspace[]> {
    return this.readAll();
  }

  public async findBySlug(slug: string): Promise<Workspace | null> {
    return this.readAll().find((w) => w.slug === slug) || null;
  }

  public async save(entity: Workspace): Promise<Workspace> {
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
