import type { Job } from "bullmq";
import type { JobResult, SendVerificationEmailJobData } from "@/@types/job";
import { env } from "@/config/env";
import { EmailServices } from "@/services/email.services";
import { EmailTemplates } from "@/templates/email.templates";

export class SendVerificationEmailJob {
  static async process(
    job: Job<SendVerificationEmailJobData>
  ): Promise<JobResult> {
    const emailService = new EmailServices();
    const { email, name, verificationToken } = job.data;

    const verificationUrl = `${env.API_URL}/${
      env.API_PREFIX
    }/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
    const template = EmailTemplates.verification({
      name,
      verificationUrl,
    });

    const result = await emailService.sendEmail({
      to: email,
      from: `noreply@${env.SMTP_USER || "localhost"}`,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { type: "verification", userId: job.data.userId },
    });

    if (result.success) {
      return { success: true, data: { messageId: result.messageId } };
    } else {
      throw new Error(result.error);
    }
  }
}
