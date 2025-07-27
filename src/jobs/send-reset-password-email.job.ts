import type { Job } from 'bullmq';
import type { JobResult, SendResetPasswordEmailJobData } from '@/@types/job';
import { env } from '@/config/env';
import { EmailServices } from '@/services/email.services';
import { EmailTemplates } from '@/templates/email.templates';

export class SendResetPasswordEmailJob {
  static async process(
    job: Job<SendResetPasswordEmailJobData>
  ): Promise<JobResult> {
    const emailService = new EmailServices();
    const { email, name, resetToken, expiredAt } = job.data;

    const resetUrl = `${env.UI_URL}/reset-password?token=${resetToken}&expires=${new Date(expiredAt).getTime()}`;
    const template = EmailTemplates.passwordReset({
      name,
      resetUrl,
    });

    const result = await emailService.sendEmail({
      to: email,
      from: `noreply@${env.SMTP_USER || 'localhost'}`,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { type: 'reset', userId: job.data.userId },
    });

    if (result.success) {
      return { success: true, data: { messageId: result.messageId } };
    } else {
      throw new Error(result.error);
    }
  }
}
