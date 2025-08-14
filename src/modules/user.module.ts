import type { FastifyTypedInstance } from "@/@types";
import { UserControllers } from "@/controllers/user.controllers";
import { ContextRepository } from "@/repositories/context.repository";
import { UserServices } from "@/services/user.services";

export class UserModule {
  static bind(app: FastifyTypedInstance) {
    const context = ContextRepository.getInstance();
    const userServices = new UserServices(context);
    return UserControllers(userServices)(app);
  }
}
