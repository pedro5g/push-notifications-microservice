import type { AuthenticatedUser } from "@/models/user.model";
import type { EmailQueue } from "@/queue/email.queue";
import type { ContextRepository } from "@/repositories/context.repository";
import { ErrorCode, HTTP_STATUS } from "@/utils/constraints";
import { compareHashes, toHash } from "@/utils/crypt";
import { dateUtils } from "@/utils/date";
import {
  BadRequestException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from "@/utils/exceptions";
import {
  type AccessTokenPayload,
  accessTokenConfig,
  type RefreshTokenPayload,
  refreshTokenConfig,
  signToken,
  verifyToken,
} from "@/utils/jwt";
import { Logger } from "@/utils/logger";
import { randomString } from "@/utils/random-string";

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface ConfirmAccountDto {
  token: string;
}
interface RefreshDto {
  refreshToken: string;
}

interface ForgotPasswordDto {
  email: string;
}

interface ResetPasswordDto {
  token: string;
  password: string;
}

export class AuthServices {
  private logger = new Logger(AuthServices.name);
  constructor(
    private readonly ctx: ContextRepository,
    private readonly emailQueue: EmailQueue
  ) {}

  async register({ name, email, password }: RegisterUserDto) {
    const userExists = await this.ctx.users.findByEmail(email);

    if (userExists) {
      throw new BadRequestException(
        "User already registered with this email",
        ErrorCode.EMAIL_ALREADY_REGISTERED
      );
    }

    const password_hash = await toHash(password);

    const { user, token } = await this.ctx.transaction(async () => {
      const user = await this.ctx.users.create({
        name,
        email,
        password_hash,
      });

      const _token = randomString(20);
      const verificationExpires = dateUtils.addDays(1);
      await this.ctx.userTokens.create({
        token: _token,
        type: "email_verification",
        expired_at: verificationExpires,
        user_id: user.id,
      });

      return {
        user,
        token: _token,
      };
    });

    await this.emailQueue.sendVerificationEmail({
      userId: user.id,
      name,
      email,
      verificationToken: token,
    });

    return {
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
    };
  }

  async confirmAccount({ token }: ConfirmAccountDto) {
    const confirmationToken = await this.ctx.userTokens.findValidToken({
      token,
      type: "email_verification",
    });

    if (!confirmationToken) {
      throw new BadRequestException(
        "Invalid or expired verification code, please try to login",
        ErrorCode.VERIFICATION_ERROR
      );
    }

    await this.ctx.transaction(async () => {
      await this.ctx.users.update({
        id: confirmationToken.user_id,
        status: "active",
        email_verified_at: dateUtils.now(),
      });
      await this.ctx.userSettings.create({
        user_id: confirmationToken.user_id,
      });
      await this.ctx.userTokens.delete(confirmationToken.id);
    });

    return {
      success: true,
      message: "Account confirmed successfully",
    };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.ctx.users.getUserContext({ email });

    if (!user) {
      throw new BadRequestException(
        "Invalid password or email",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    await this.userAccountIsConfirmed(user);

    const isMatch = await compareHashes(user.password_hash, password);

    if (!isMatch) {
      throw new BadRequestException(
        "Invalid password or email",
        ErrorCode.AUTH_INVALID_CREDENTIALS
      );
    }

    await this.ctx.users.update({
      id: user.id,
      last_login_at: dateUtils.now(),
    });

    const accessToken = signToken<AccessTokenPayload>(
      {
        id: user.id,
      },
      accessTokenConfig.sign
    );

    const refreshToken = signToken<RefreshTokenPayload>(
      {
        id: user.id,
      },
      refreshTokenConfig.sign
    );

    const { password_hash, ...withOutPassword } = user;

    return {
      user: withOutPassword,
      accessToken,
      refreshToken,
      expiresIn: 10 * 60,
    };
  }

  async refresh({ refreshToken }: RefreshDto) {
    const payload = verifyToken<RefreshTokenPayload>(
      refreshToken,
      refreshTokenConfig.verify
    );

    if (!payload) {
      throw new UnauthorizedException(
        "Invalid refresh token",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    const user = await this.ctx.users.findById(payload.id);

    if (!user) {
      this.logger.warn(`Attempt refresh tokens with invalid token payload`, {
        payload,
      });
      throw new UnauthorizedException(
        "Invalid refresh token",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    const accessToken = signToken<AccessTokenPayload>(
      {
        id: user.id,
      },
      accessTokenConfig.sign
    );
    const newRefreshToken = signToken<RefreshTokenPayload>(
      {
        id: user.id,
      },
      refreshTokenConfig.sign
    );

    return {
      accessToken,
      newRefreshToken,
      expiresIn: 10 * 60,
    };
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.ctx.users.findByEmail(email);

    if (!user) {
      throw new NotFoundException("Account not found");
    }
    const MAX_ATTEMPTS = 3;

    const count = await this.ctx.userTokens.countTokensWithInterval({
      userId: user.id,
      type: "password_reset",
      interval: "1 hour",
    });

    if (count >= MAX_ATTEMPTS) {
      throw new HttpException(
        "Too many request, try again later",
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS
      );
    }

    const stillHasValidToken = await this.ctx.userTokens.getLastValidToken({
      type: "password_reset",
      userId: user.id,
    });

    if (stillHasValidToken) {
      await this.emailQueue.sendResetPasswordEmail({
        userId: user.id,
        email: user.email,
        name: user.name,
        expiredAt: stillHasValidToken.expired_at,
        resetToken: stillHasValidToken.token,
      });

      return { success: true, message: "Password reset email sent" };
    } else {
      const token = randomString(8);
      const expiredAt = dateUtils.addMinutes(10);

      await this.ctx.userTokens.create({
        user_id: user.id,
        token,
        type: "password_reset",
        expired_at: expiredAt,
      });

      await this.emailQueue.sendResetPasswordEmail({
        userId: user.id,
        email: user.email,
        name: user.name,
        expiredAt: expiredAt,
        resetToken: token,
      });
    }
    return { success: true, message: "Password reset email sent" };
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const resetCode = await this.ctx.userTokens.findValidToken({
      token,
      type: "password_reset",
    });

    if (!resetCode) {
      throw new NotFoundException("Invalid or expired verification code");
    }

    const passwordHash = await toHash(password);

    await this.ctx.transaction(async () => {
      await this.ctx.users.update({
        id: resetCode.user_id,
        password_hash: passwordHash,
        status: "active",
      });
      await this.ctx.userTokens.update({
        id: resetCode.id,
        used_at: dateUtils.now(),
      });
      await this.ctx.userTokens.deleteMany({
        userId: resetCode.user_id,
        type: "password_reset",
      });
    });

    return { success: true, message: "Password updated, please login" };
  }

  private async userAccountIsConfirmed(user: AuthenticatedUser) {
    if (user.status === "pending_verification" && !user.email_verified_at) {
      const verificationToken = await this.ctx.userTokens.getLastValidToken({
        userId: user.id,
        type: "email_verification",
      });

      if (verificationToken) {
        await this.emailQueue.sendVerificationEmail({
          userId: user.id,
          name: user.name,
          email: user.email,
          verificationToken: verificationToken.token,
        });

        throw new BadRequestException(
          "Email does not confirmed, please verify your email",
          ErrorCode.VERIFICATION_ERROR
        );
      } else {
        const token = randomString(20);
        const verificationExpires = dateUtils.addDays(1);
        await this.ctx.userTokens.create({
          token: token,
          type: "email_verification",
          expired_at: verificationExpires,
          user_id: user.id,
        });

        await this.emailQueue.sendVerificationEmail({
          userId: user.id,
          name: user.name,
          email: user.email,
          verificationToken: token,
        });

        throw new BadRequestException(
          "Email does not confirmed, please verify your email",
          ErrorCode.VERIFICATION_ERROR
        );
      }
    }
  }
}
