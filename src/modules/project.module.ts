import type { FastifyTypedInstance } from '@/@types';
import { ProjectControllers } from '@/controllers/project.controllers';
import { ContextRepository } from '@/repositories/context.repository';
import { ProjectServices } from '@/services/project.services';

export class ProjectModule {
  static bind(app: FastifyTypedInstance) {
    const context = ContextRepository.getInstance();
    const projectServices = new ProjectServices(context);
    return ProjectControllers(projectServices)(app);
  }
}
