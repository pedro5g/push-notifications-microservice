import { randomUUID } from 'node:crypto';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';
import type { EmailData, EmailResult } from '@/@types/job';
import { env } from '@/config/env';
import { isTemporaryFailure, validateEmail } from '@/utils/email-validator';
import { Logger } from '@/utils/logger';

export class EmailServices {
  private transporter: Transporter;
  private logger = new Logger(EmailServices.name);
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: env.SMTP_SERVICE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10,
    });

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.info('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    const startTime = Date.now();
    let trackingId: string | undefined;

    try {
      const validation = await validateEmail(emailData.to);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid email: ${validation.reason}`,
        };
      }

      let htmlContent = emailData.html;
      if (emailData.trackOpening) {
        trackingId = randomUUID();
        htmlContent = this.addTrackingPixel(emailData.html, trackingId);
      }

      const mailOptions: SendMailOptions = {
        from: emailData.from,
        to: emailData.to,
        html: htmlContent,
        text: emailData.text,
        headers: {
          ...(trackingId && { 'X-Tracking-ID': trackingId }),
          'X-Mailer': 'CustomEmailService/1.0',
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      const processingTime = Date.now() - startTime;

      this.logger.info('Email sent successfully', {
        to: emailData.to,
        messageId: result.messageId,
        trackingId,
        processingTime,
      });

      return {
        success: true,
        messageId: result.messageId,
        trackingId,
        deliveredAt: new Date(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Email sending failed', {
        to: emailData.to,
        error: errorMessage,
        trackingId,
        processingTime,
        isTemporary: isTemporaryFailure(error),
      });

      return {
        success: false,
        error: errorMessage,
        trackingId,
      };
    }
  }

  private addTrackingPixel(html: string, trackingId: string): string {
    const pixelUrl = `${env.API_URL}${env.PIXEL_PATH}/${trackingId}`;
    const trackingPixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none !important;" alt="" />`;

    if (html.includes('</body>')) {
      return html.replace('</body>', `${trackingPixel}</body>`);
    }

    return html + trackingPixel;
  }

  async close(): Promise<void> {
    this.transporter.close();
    this.logger.info('Email service connection closed');
  }
}
