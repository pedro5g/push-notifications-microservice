import type { ContextRepository } from '@/repositories/context.repository';
import { ErrorCode } from '@/utils/constraints';
import { compareHashes, genFingerprint, toHash } from '@/utils/crypt';
import { BadRequestException } from '@/utils/exceptions';
import {
  type AccessTokenPayload,
  accessTokenConfig,
  type RefreshTokenPayload,
  refreshTokenConfig,
  signToken,
} from '@/utils/jwt';

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
  ip: string;
  userAgent: string;
}

export class AuthServices {
  constructor(private readonly ctxRepository: ContextRepository) {}

  async register({ name, email, password }: RegisterUserDto): Promise<void> {
    const userExists = await this.ctxRepository.users.findByEmail(email);

    if (userExists) {
      throw new BadRequestException(
        'User already registered with this email',
        ErrorCode.EMAIL_ALREADY_REGISTERED
      );
    }

    const password_hash = await toHash(password);

    await this.ctxRepository.users.create({
      name,
      email,
      password_hash,
    });
  }

  async login({ email, password, ip, userAgent }: LoginDto) {
    const user = await this.ctxRepository.users.getUserContext({ email });

    if (!user) {
      throw new BadRequestException('Invalid password or email');
    }

    const isMatch = await compareHashes(user.password_hash, password);

    if (!isMatch) {
      throw new BadRequestException('Invalid password or email');
    }

    const accessToken = signToken<AccessTokenPayload>(
      {
        id: user.id,
      },
      accessTokenConfig.sign
    );

    const fingerprint = await genFingerprint(`${ip}-${userAgent}`);

    const refreshToken = signToken<RefreshTokenPayload>(
      {
        id: user.id,
        fingerprint,
      },
      refreshTokenConfig.sign
    );

    const { password_hash, ...rest } = user;

    return {
      user: rest,
      accessToken,
      refreshToken,
    };
  }
}
