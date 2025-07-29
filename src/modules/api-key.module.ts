import type { FastifyTypedInstance } from '@/@types';
import { ApiKeyControllers } from '@/controllers/api-key.controllers';
import { ContextRepository } from '@/repositories/context.repository';
import { ApiKeyServices } from '@/services/api-key.services';

export class ApiKeyModule {
  static bind(app: FastifyTypedInstance) {
    const context = ContextRepository.getInstance();
    const apiKeyServices = new ApiKeyServices(context);
    return ApiKeyControllers(apiKeyServices)(app);
  }
}
