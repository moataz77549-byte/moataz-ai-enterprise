import crypto from 'crypto';
import { FileRepo } from '@core/database/repositories';
import { Qdrant } from '@core/database/qdrant';
import { Storage } from './storage.service';
import { ApplicationError } from '@shared/errors';
import { ApiKeyRepo } from '@core/database/repositories/api-key';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

class FilePipelineService {
  private collectionName = 'project_knowledge_vectors';

  /**
   * Run the full indexing pipeline: scan, parse file, chunk text, embed, index in Qdrant.
   */
  public async processFile(fileId: string): Promise<void> {
    const file = await FileRepo.findById(fileId);
    if (!file) {
      throw new ApplicationError('FILE_NOT_FOUND', `File ${fileId} not found in repository.`);
    }

    try {
      // 1. Update status to scanning
      file.status = 'scanning';
      await FileRepo.save(file);

      const scanResult = await this.scanFile(file.name);
      if (!scanResult.clean) {
        file.status = 'error';
        file.metadata = { error: `File rejected by security scan: ${scanResult.reason}` };
        await FileRepo.save(file);
        return;
      }

      // 2. Read content
      const buffer = await Storage.getFileContent(fileId);
      const text = buffer.toString('utf8'); // simple text parser placeholder for doc/pdf parsing

      // 3. Chunk text into 500-character segments with 100-character overlap
      const chunks = this.chunkText(text, 500, 100);

      // 4. Generate real embeddings and index in Qdrant vector database
      await Qdrant.initCollection(this.collectionName);

      const points = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const vector = await this.generateEmbedding(chunkText);
        const pointId = crypto.randomUUID();

        points.push({
          id: pointId,
          vector,
          payload: {
            fileId,
            projectId: file.projectId,
            chunkIndex: i,
            content: chunkText,
            fileName: file.name,
          },
        });
      }

      if (points.length > 0) {
        await Qdrant.upsertPoints(this.collectionName, points);
      }

      // 5. Mark file status as indexed
      file.status = 'indexed';
      file.metadata = { chunksCount: chunks.length, scanStatus: scanResult.reason };
      await FileRepo.save(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown pipeline error.';
      file.status = 'error';
      file.metadata = { error: message };
      await FileRepo.save(file);
      throw err;
    }
  }

  /**
   * Runs a virus/malware scan on the uploaded file if a scanning service is
   * configured. Previously this step always logged success without actually
   * scanning anything, which is worse than not having the field at all because
   * it implied a guarantee that didn't exist. Now it's explicit either way.
   */
  private async scanFile(fileName: string): Promise<{ clean: boolean; reason: string }> {
    const scannerUrl = process.env.VIRUS_SCAN_API_URL;

    if (!scannerUrl) {
      // No scanner configured: don't pretend one ran. Surface this clearly in
      // file metadata so operators know uploads are not being scanned.
      return { clean: true, reason: 'not_scanned_no_scanner_configured' };
    }

    try {
      const response = await fetch(scannerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      if (!response.ok) {
        return { clean: false, reason: `scanner_error_${response.status}` };
      }
      const result = await response.json();
      return { clean: Boolean(result.clean), reason: result.clean ? 'scanned_clean' : 'scanner_flagged_file' };
    } catch {
      // Fail closed: if the configured scanner is unreachable, don't index the file.
      return { clean: false, reason: 'scanner_unreachable' };
    }
  }

  private chunkText(text: string, size: number, overlap: number): string[] {
    const chunks = [];
    let idx = 0;
    while (idx < text.length) {
      chunks.push(text.substring(idx, idx + size));
      idx += size - overlap;
    }
    return chunks;
  }

  /**
   * Generates a real embedding via OpenAI's embeddings API using whichever OpenAI
   * key the user has configured in Settings. Previously this returned a
   * deterministic vector built from character codes, which is not a semantic
   * embedding at all - it made RAG search silently return near-random results.
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = await ApiKeyRepo.getDecryptedKey('openai');
    if (!apiKey) {
      throw new ApplicationError(
        'EMBEDDING_PROVIDER_NOT_CONFIGURED',
        'No OpenAI API key is configured. Add one in Settings to enable knowledge base indexing.'
      );
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new ApplicationError(
        'EMBEDDING_REQUEST_FAILED',
        `Embedding request failed (${response.status}): ${errBody.slice(0, 200)}`
      );
    }

    const data = await response.json();
    const vector: number[] | undefined = data?.data?.[0]?.embedding;
    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
      throw new ApplicationError('EMBEDDING_INVALID_RESPONSE', 'Embedding provider returned an unexpected format.');
    }
    return vector;
  }
}

export const FilePipeline = new FilePipelineService();
export type { FilePipelineService };
