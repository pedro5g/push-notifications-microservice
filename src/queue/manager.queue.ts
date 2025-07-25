import type { JobData } from '@/@types/job';
import { Logger } from '@/utils/logger';
import type { BaseWorker } from '@/workers/base.worker';
import type { BaseQueue } from './base.queue';

export class ManagerQueue {
  private static instance: ManagerQueue;
  private logger = new Logger(ManagerQueue.name);
  private queues: Map<string, BaseQueue> = new Map();
  private workers: Map<string, BaseWorker> = new Map();

  static getInstance(): ManagerQueue {
    if (!ManagerQueue.instance) {
      ManagerQueue.instance = new ManagerQueue();
    }
    return ManagerQueue.instance;
  }

  registerQueue<T extends JobData>(name: string, queue: BaseQueue<T>) {
    this.queues.set(name, queue);
  }
  registerWorker<T extends JobData>(name: string, worker: BaseWorker<T>) {
    this.workers.set(name, worker);
  }

  getQueue<T extends JobData>(name: string): BaseQueue<T> | null {
    return this.queues.get(name) || null;
  }
  async getQueueStatus(name: string) {
    const queue = this.queues.get(name);
    return queue ? await queue.getQueueStatus() : null;
  }

  async getAllQueuesStatus() {
    const status: Record<
      string,
      {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
      }
    > = {};

    for (const [name, queue] of this.queues) {
      status[name] = await queue.getQueueStatus();
    }

    return status;
  }

  async shutdown() {
    this.logger.info('Shutting down queues and workers...');
    const closePromises = [
      ...Array.from(this.workers.values()).map((worker) => worker.close()),
      ...Array.from(this.queues.values()).map((queue) => queue.close()),
    ];

    await Promise.all(closePromises);
    this.logger.info('All queues and workers closed');
  }
}
