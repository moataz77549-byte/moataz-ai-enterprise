import fs from 'fs';
import path from 'path';
import { IProjectRepository, Project } from '@shared/ports/repositories';

export class ProjectRepository implements IProjectRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'projects.json');
  }

  private readAll(): Project[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: Project[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  public async findById(id: string): Promise<Project | null> {
    return this.readAll().find((p) => p.id === id) || null;
  }

  public async findAll(): Promise<Project[]> {
    return this.readAll();
  }

  public async findByWorkspaceId(workspaceId: string): Promise<Project[]> {
    return this.readAll().filter((p) => p.workspaceId === workspaceId);
  }

  public async save(entity: Project): Promise<Project> {
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
