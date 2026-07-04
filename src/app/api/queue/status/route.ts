import { BaseController } from '@core/backend/base-controller';
import { BackgroundQueue } from '@core/queue/bullmq';
import { ensureBootstrapped } from '../../bootstrap';

export async function GET() {
  try {
    await ensureBootstrapped();

    const memQueueLength = BackgroundQueue.getMemoryQueueLength();
    return BaseController.success({
      status: 'active',
      queueName: 'moataz-ai-background-jobs',
      pendingMemoryJobs: memQueueLength,
      provider: process.env.REDIS_URL ? 'BullMQ (Redis)' : 'Local Memory Fallback Queue',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return BaseController.handleError(error);
  }
}
export const dynamic = 'force-dynamic';
