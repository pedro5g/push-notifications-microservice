import { Queue, type QueueOptions } from 'bullmq';
import type { JobData, JobOptions, QueueConfig } from '@/@types/job';
import { RedisConnection } from '@/config/redis';

export abstract class BaseQueue<T extends JobData = any> {
  protected queue: Queue;

  constructor(config: QueueConfig) {
    const queueOptions: QueueOptions = {
      connection: RedisConnection.getInstance(),
      defaultJobOptions: config.defaultJobOptions || {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    };

    this.queue = new Queue(config.name, queueOptions);
  }

  async add(jobName: string, data: T, options?: JobOptions) {
    return this.queue.add(jobName, data, options);
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
