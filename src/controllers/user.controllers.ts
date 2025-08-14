import type { FastifyTypedInstance } from "@/@types";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { UserServices } from "@/services/user.services";
import { HTTP_STATUS } from "@/utils/constraints";
import { getUserProfileResponse } from "@/validators/user.validators";

export function UserControllers(userServices: UserServices) {
  return async (app: FastifyTypedInstance) => {
    app.get(
      "/user/me",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["User"],
          security: [{ Bearer: [] }],
          summary: "Get user profile",
          response: getUserProfileResponse,
        },
      },
      async (request, reply) => {
        const userId = request.user.id;
        const { user } = await userServices.userProfile({ userId });

        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          user,
          message: "User profile found successfully",
        });
      }
    );
  };
}
