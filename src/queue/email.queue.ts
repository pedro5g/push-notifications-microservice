import type {
  EmailData,
  JobOptions,
  SendEmailJobData,
  SendVerificationEmailJobData,
} from '@/@types/job';
import { BaseQueue } from './base.queue';

export class EmailQueue extends BaseQueue<
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

  async sendEmail(emailData: EmailData, options?: JobOptions) {
    return this.add('send-email', { emailData }, options);
  }
  async sendVerificationEmail(
    data: SendVerificationEmailJobData,
    options?: JobOptions
  ) {
    return this.add('send-verification-email', data, {
      priority: 10,
      ...options,
    });
  }

  async sendBulkEmails(emails: EmailData[], batchSize: number = 10) {
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const promises = batch.map((email) => this.sendEmail(email));
      await Promise.all(promises);
    }
  }
}
