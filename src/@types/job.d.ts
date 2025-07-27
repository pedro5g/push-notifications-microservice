export interface JobData {
  id?: string;
  [key: string]: any;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

export interface JobResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultJobOptions?: {
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete?: number;
    removeOnFail?: number;
  };
}

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  trackOpening?: boolean;
  metadata?: Record<string, any>;
}

export interface SendEmailJobData extends JobData {
  emailData: EmailData;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  trackingId?: string;
  error?: string;
  deliveredAt?: Date;
}

export interface SendVerificationEmailJobData extends JobData {
  userId: string;
  email: string;
  name: string;
  verificationToken: string;
}

export interface SendResetPasswordEmailJobData extends JobData {
  userId: string;
  email: string;
  name: string;
  resetToken: string;
  expiredAt: Date;
}

export interface SendWelcomeEmailJobData extends JobData {
  userId: string;
  email: string;
  name: string;
}
