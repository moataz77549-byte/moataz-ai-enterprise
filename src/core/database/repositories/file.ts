import fs from 'fs';
import path from 'path';
import { IFileRepository, FileRecord } from '@shared/ports/repositories';

export class FileRepository implements IFileRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'files.json');
  }

  private readAll(): FileRecord[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: FileRecord[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  public async findById(id: string): Promise<FileRecord | null> {
    return this.readAll().find((f) => f.id === id) || null;
  }

  public async findAll(): Promise<FileRecord[]> {
    return this.readAll();
  }

  public async findByProjectId(projectId: string): Promise<FileRecord[]> {
    return this.readAll().filter((f) => f.projectId === projectId);
  }

  public async save(entity: FileRecord): Promise<FileRecord> {
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
export const FileRepo = new FileRepository();
