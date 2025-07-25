import { type Job, Worker } from 'bullmq';
import type { JobData, JobResult, QueueConfig } from '@/@types/job';
import { RedisConnection } from '@/config/redis';
import { Logger } from '@/utils/logger';

export abstract class BaseWorker<T extends JobData = any> {
  protected worker: Worker;
  protected config: QueueConfig;
  private logger = new Logger(BaseWorker.name);

  constructor(config: QueueConfig) {
    this.config = config;
    this.worker = new Worker(config.name, this.processJob.bind(this), {
      connection: RedisConnection.getInstance(),
      concurrency: config.concurrency || 5,
    });
    this.setupEventListeners();
  }

  protected setupEventListeners(): void {
    this.worker.on('completed', (job, result: JobResult) => {
      this.logger.info(`Job completed in queue ${this.config.name}`, {
        jobId: job.id,
        processingTime: result.data,
        attempts: job.attemptsMade,
      });
    });
    this.worker.on('failed', (job, error: Error) => {
      this.logger.error(`Job failed in queue ${this.config.name}`, {
        jobId: job?.id,
        error: error.message,
        attempts: job?.attemptsMade,
        data: job?.data,
      });
    });
    this.worker.on('error', (error: Error) => {
      this.logger.error(`Worker error in queue ${this.config.name}`, {
        error: error.message,
      });
    });
  }

  abstract processJob(job: Job<T>): Promise<JobResult>;

  async close() {
    await this.worker.close();
  }
}
