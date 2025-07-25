import dns from 'node:dns';
import { Logger } from './logger';

const resolveMx = async (hostname: string): Promise<dns.MxRecord[]> => {
  return new Promise((resolve, reject) => {
    dns.resolveMx(hostname, (err, addresses) => {
      if (err) reject(err);
      resolve(addresses);
    });
  });
};

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
]);

export const validateEmail = async (email: string) => {
  const [localPart, domain] = email.toLowerCase().split('@');

  if (!localPart || localPart.length > 64) {
    return {
      isValid: false,
      reason: 'Local part too long (max 64 characters)',
    };
  }

  if (!domain || domain.length > 253) {
    return {
      isValid: false,
      reason: 'Domain too long (max 253 characters)',
    };
  }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      reason: 'Disposable email domain not allowed',
      suggestions: ['Use a permanent email address'],
    };
  }

  const mxValidation = await validateMXRecord(domain);
  if (!mxValidation.isValid) {
    return mxValidation;
  }
  return { isValid: true };
};

export const validateMXRecord = async (domain: string) => {
  const logger = new Logger('ValidateMX');
  try {
    const mxRecords = await resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        reason: 'No MX record found for domain',
        suggestions: ['Verify the domain name', 'Contact domain administrator'],
      };
    }

    return { isValid: true };
  } catch (error) {
    logger.warn('MX record validation failed', { domain, error });
    return { isValid: true };
  }
};

export const isTemporaryFailure = (error: any) => {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';

  const temporaryCodes = [
    'econnreset',
    'econnrefused',
    'etimedout',
    'enotfound',
    'network',
    'timeout',
    'dns',
  ];

  const temporaryMessages = [
    'temporarily rejected',
    'try again later',
    'rate limited',
    'temporary failure',
    'service unavailable',
    '4.',
    'greylisted',
  ];
  return (
    temporaryCodes.some((c) => code.includes(c)) ||
    temporaryMessages.some((m) => message.includes(m))
  );
};
