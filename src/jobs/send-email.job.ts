import type { Job } from 'bullmq';
import type { JobResult, SendEmailJobData } from '@/@types/job';
import { EmailServices } from '@/services/email.services';

export class SendEmailJob {
  static async process(job: Job<SendEmailJobData>): Promise<JobResult> {
    const emailService = new EmailServices();

    const result = await emailService.sendEmail(job.data.emailData);

    if (result.success) {
      return { success: true, data: { messageId: result.messageId } };
    } else {
      return { success: false, error: result.error };
    }
  }
}
