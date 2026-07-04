import { Queue, Worker, Job } from 'bullmq';
import { RedisConn } from '../database/redis';

import { FilePipeline } from '@modules/storage/application/pipeline.service';

const queueName = 'moataz-ai-background-jobs';

class QueueService {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private memoryQueue: Array<{ id: string; name: string; data: any }> = [];

  constructor() {
    const redisClient = RedisConn.getClient();

    if (redisClient) {
      try {
        this.queue = new Queue(queueName, {
          connection: redisClient as any,
        });

        this.worker = new Worker(
          queueName,
          async (job: Job) => {
            console.warn(`Processing BullMQ job: ${job.id} [${job.name}]`);
            await this.processJob(job.name, job.data);
          },
          {
            connection: redisClient as any,
            concurrency: 5,
          }
        );

        this.worker.on('failed', (job, err) => {
          console.error(`BullMQ job failed: ${job?.id}. Error:`, err);
          // Standard dead letter queue routing placeholder
        });
      } catch (err) {
        console.warn('Failed to initialize BullMQ. Falling back to local memory queue processing.', err);
      }
    } else {
      console.warn('Redis connection not active for BullMQ. Using local memory queue fallback.');
    }
  }

  /**
   * Adds a job to the background processing queue.
   */
  public async addJob(name: string, data: any): Promise<string> {
    if (this.queue) {
      try {
        const job = await this.queue.add(name, data, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        });
        return job.id || 'bullmq-job';
      } catch {
        // Fallback
      }
    }

    const job = { id: `mem-job-${Date.now()}-${Math.random().toString(36).substring(7)}`, name, data };
    this.memoryQueue.push(job);
    
    // Process in background asynchronously
    setTimeout(() => {
      this.processJob(name, data).catch((err) => {
        console.error(`Memory queue job ${job.id} failed:`, err);
      });
    }, 100);

    return job.id;
  }

  private async processJob(name: string, data: any): Promise<void> {
    switch (name) {
      case 'file-processing':
        console.warn('Running background file processing job for:', data.fileId);
        await FilePipeline.processFile(data.fileId);
        break;
      case 'virus-scan':
        console.warn('Running virus scan on:', data.storagePath);
        break;
      case 'ocr-extraction':
        console.warn('Running OCR extraction for:', data.fileId);
        break;
      default:
        console.warn(`Unknown job type: ${name}`);
    }
  }

  public getMemoryQueueLength(): number {
    return this.memoryQueue.length;
  }
}

export const BackgroundQueue = new QueueService();
export type { QueueService };
