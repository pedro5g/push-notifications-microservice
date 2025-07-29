import type { FastifyTypedInstance } from '@/@types';
import { AuthControllers } from '@/controllers/auth.controllers';
import type { EmailQueue } from '@/queue/email.queue';
import { ManagerQueue } from '@/queue/manager.queue';
import { ContextRepository } from '@/repositories/context.repository';
import { AuthServices } from '@/services/auth.services';

export class AuthModule {
  static bind(app: FastifyTypedInstance) {
    const context = ContextRepository.getInstance();
    const managerQueue = ManagerQueue.getInstance();
    const emailQueue = managerQueue.getQueue('email') as EmailQueue;
    const authService = new AuthServices(context, emailQueue);
    return AuthControllers(authService)(app);
  }
}
