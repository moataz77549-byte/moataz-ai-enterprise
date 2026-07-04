import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { Storage } from '@modules/storage/application/storage.service';
import { ensureBootstrapped } from '../../bootstrap';

// Hard limits so a single request can't exhaust disk/memory or upload arbitrary
// executables into the knowledge base pipeline.
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/pdf',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return BaseController.error('MISSING_FILE', 'No file was uploaded.', 400);
    }
    if (!projectId) {
      return BaseController.error('MISSING_PROJECT_ID', 'Missing target project ID.', 400);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return BaseController.error(
        'FILE_TOO_LARGE',
        `File exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB upload limit.`,
        413
      );
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return BaseController.error(
        'UNSUPPORTED_FILE_TYPE',
        `File type "${file.type || 'unknown'}" is not allowed.`,
        415
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const record = await Storage.uploadFile({
      projectId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      buffer,
    });

    return BaseController.success(record, 201);
  } catch (error) {
    return BaseController.handleError(error);
  }
}
export const dynamic = 'force-dynamic';
