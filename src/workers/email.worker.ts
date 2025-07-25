import type { Job } from 'bullmq';
import type {
  JobResult,
  SendEmailJobData,
  SendVerificationEmailJobData,
} from '@/@types/job';
import { SendEmailJob } from '@/jobs/send-email.job';
import { SendVerificationEmailJob } from '@/jobs/send-verification-email.job';
import { BaseWorker } from './base.worker';

export class EmailWorker extends BaseWorker<
  SendEmailJobData | SendVerificationEmailJobData
> {
  constructor() {
    super({
      name: 'email',
      concurrency: 5,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential' as const,
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }

  async processJob(job: Job<any>): Promise<JobResult> {
    switch (job.name) {
      case 'send-email':
        return SendEmailJob.process(job);
      case 'send-verification-email':
        return SendVerificationEmailJob.process(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }
}
