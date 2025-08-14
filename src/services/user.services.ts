import type { ContextRepository } from "@/repositories/context.repository";
import { ErrorCode } from "@/utils/constraints";
import { UnauthorizedException } from "@/utils/exceptions";
import { Logger } from "@/utils/logger";

interface UserProfileDto {
  userId: string;
}

export class UserServices {
  private readonly logger = new Logger(UserServices.name);
  constructor(private readonly ctx: ContextRepository) {}

  async userProfile({ userId }: UserProfileDto) {
    const user = await this.ctx.users.getUserContext({ id: userId });

    if (!user) {
      this.logger.warn(
        `[IMPORTANT!] attempt get user profile with invalid id`,
        { userId }
      );
      throw new UnauthorizedException(
        "User not found",
        ErrorCode.AUTH_INVALID_TOKEN
      );
    }

    const { password_hash, ...withOutPassword } = user;

    return {
      user: withOutPassword,
    };
  }
}
