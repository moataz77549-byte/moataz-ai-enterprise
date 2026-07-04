import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabase } from '@core/database/supabase';
import { FileRepo } from '@core/database/repositories';
import { BackgroundQueue } from '@core/queue/bullmq';
import { ApplicationError } from '@shared/errors';

/**
 * SECURITY: strips path separators and traversal sequences from a user-supplied
 * filename before it's used to build a filesystem or storage path. Without this,
 * a filename like "../../../etc/passwd" or "..\\..\\config" could write/read
 * outside the intended upload directory.
 */
function sanitizeFileName(name: string): string {
  const base = path.basename(name).replace(/[\\/]/g, '');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned.length > 0 ? cleaned.slice(0, 255) : 'unnamed-file';
}

class StorageService {
  private localUploadDir: string;

  constructor() {
    this.localUploadDir = path.join(process.cwd(), 'src/shared/data/uploads');
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Uploads a file record, registers it in the repository, and triggers background processing.
   */
  public async uploadFile(params: {
    projectId: string;
    folderId?: string;
    name: string;
    size: number;
    mimeType: string;
    buffer: Buffer;
  }) {
    const fileId = crypto.randomUUID();
    const safeName = sanitizeFileName(params.name);
    const storagePath = `projects/${params.projectId}/files/${fileId}-${safeName}`;

    try {
      // 1. Upload to Supabase Storage (attempt bucket write, fallback locally)
      let uploadSuccess = false;
      try {
        const { error } = await supabase.storage
          .from('moataz-ai-knowledge')
          .upload(storagePath, params.buffer, {
            contentType: params.mimeType,
            upsert: true,
          });
        if (!error) {
          uploadSuccess = true;
        }
      } catch {
        // Fallback
      }

      // If bucket upload didn't execute, save to workspace local file
      if (!uploadSuccess) {
        const localPath = path.join(this.localUploadDir, `${fileId}-${safeName}`);
        fs.writeFileSync(localPath, params.buffer);
      }

      // 2. Save file record in repository
      const fileRecord = await FileRepo.save({
        id: fileId,
        projectId: params.projectId,
        folderId: params.folderId,
        name: params.name,
        size: params.size,
        mimeType: params.mimeType,
        storagePath,
        status: 'uploaded',
        createdAt: new Date().toISOString(),
      });

      // 3. Queue the background file processing pipeline (virus scan, chunk, embed)
      await BackgroundQueue.addJob('file-processing', {
        fileId: fileRecord.id,
        projectId: params.projectId,
        name: params.name,
        mimeType: params.mimeType,
        storagePath,
      });

      return fileRecord;
    } catch (e: any) {
      throw new ApplicationError('UPLOAD_ERROR', e.message || 'File upload execution failed.');
    }
  }

  /**
   * Reads a file content from local or Supabase storage.
   */
  public async getFileContent(id: string): Promise<Buffer> {
    const file = await FileRepo.findById(id);
    if (!file) {
      throw new ApplicationError('FILE_NOT_FOUND', 'Requested file was not found.');
    }

    try {
      // Try local filesystem first
      const localPath = path.join(this.localUploadDir, `${file.id}-${sanitizeFileName(file.name)}`);
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath);
      }

      // Try Supabase Storage
      const { data, error } = await supabase.storage
        .from('moataz-ai-knowledge')
        .download(file.storagePath);
      
      if (error || !data) {
        throw new Error('Supabase read failed');
      }

      return Buffer.from(await data.arrayBuffer());
    } catch (e: any) {
      throw new ApplicationError('FILE_READ_ERROR', `Failed to read file content: ${e.message}`);
    }
  }
}

export const Storage = new StorageService();
export type { StorageService };
