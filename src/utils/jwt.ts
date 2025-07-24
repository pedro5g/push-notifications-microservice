import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export type AccessTokenPayload = {
  id: string;
};
export type RefreshTokenPayload = {
  id: string;
  fingerprint: string;
};

export type SingOptionsWithPrivateKey = jwt.SignOptions & {
  privateKey: Buffer | string;
};
export type VerifyOptionsWithPublicKey = jwt.VerifyOptions & {
  publicKey: Buffer | string;
};

export const accessTokenConfig: {
  sign: SingOptionsWithPrivateKey;
  verify: VerifyOptionsWithPublicKey;
} = {
  sign: {
    issuer: 'Pedro5g corp',
    subject: 'email@email.com',
    audience: 'http://pedro5gcorp.in',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: 'RS256',
    privateKey: Buffer.from(env.JWT_ACCESS_PRIVATE_KEY, 'base64'),
  },
  verify: {
    algorithms: ['RS256'],
    publicKey: Buffer.from(env.JWT_ACCESS_PUBLIC_KEY, 'base64'),
  },
};

export const refreshTokenConfig: {
  sign: SingOptionsWithPrivateKey;
  verify: VerifyOptionsWithPublicKey;
} = {
  sign: {
    issuer: 'Pedro5g corp',
    subject: 'email@email.com',
    audience: 'http://pedro5gcorp.in',
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'RS256',
    privateKey: Buffer.from(env.JWT_REFRESH_PRIVATE_KEY, 'base64'),
  },
  verify: {
    algorithms: ['RS256'],
    publicKey: Buffer.from(env.JWT_REFRESH_PUBLIC_KEY, 'base64'),
  },
};

export const signToken = <P extends object = {}>(
  payload: P,
  options: SingOptionsWithPrivateKey
): string => {
  const { privateKey, ...opts } = options;
  return jwt.sign(payload, privateKey, opts);
};

export const verifyToken = <R>(
  toke: string,
  options: VerifyOptionsWithPublicKey
): R | null => {
  const { publicKey, ...opts } = options;
  try {
    const payload = jwt.verify(toke, publicKey, opts);
    return payload as R;
  } catch {
    return null;
  }
};
