import type { FastifyTypedInstance } from '@/@types';
import { authMiddleware } from '@/middlewares/auth.middleware';
import type { ProjectServices } from '@/services/project.services';
import { HTTP_STATUS } from '@/utils/constraints';
import {
  createProjectBodySchema,
  createProjectResponseSchema,
  disableProjectParamSchema,
  disableProjectResponseSchema,
  getProjectParamSchema,
  getProjectResponseSchema,
  listProjectsResponseSchema,
  updateProjectBodySchema,
  updateProjectParamSchema,
  updateProjectResponseSchema,
} from '@/validators/project.validators';

export function ProjectControllers(projectServices: ProjectServices) {
  return async (app: FastifyTypedInstance) => {
    app.post(
      '/project/create',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['Project'],
          security: [{ Bearer: [] }],
          summary: 'Create project route',
          body: createProjectBodySchema,
          response: createProjectResponseSchema,
        },
      },
      async (request, reply) => {
        const { projectName, description, domain, icon } = request.body;
        const { project } = await projectServices.createProject({
          userId: request.user.id,
          projectName,
          description,
          domain,
          icon,
        });

        return reply.status(HTTP_STATUS.CREATED).send({
          ok: true,
          message: 'Project created successfully',
          project,
        });
      }
    );
    app.put(
      '/project/:projectId/update',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['Project'],
          security: [{ Bearer: [] }],
          summary: 'Update project route',
          params: updateProjectParamSchema,
          body: updateProjectBodySchema,
          response: updateProjectResponseSchema,
        },
      },
      async (request, reply) => {
        const { projectId } = request.params;
        const { projectName, description, domain, icon } = request.body;

        await projectServices.updateProject({
          projectId,
          projectName,
          description,
          domain,
          icon,
        });

        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'Project updated successfully',
        });
      }
    );
    app.delete(
      '/project/:projectId/disable',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['Project'],
          security: [{ Bearer: [] }],
          summary: 'Disable project route',
          params: disableProjectParamSchema,
          response: disableProjectResponseSchema,
        },
      },
      async (request, reply) => {
        const { projectId } = request.params;
        await projectServices.disableProject({ projectId });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'Project disabled successfully',
        });
      }
    );
    app.get(
      '/project/:projectId/get',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['Project'],
          security: [{ Bearer: [] }],
          summary: 'Get project route',
          params: getProjectParamSchema,
          response: getProjectResponseSchema,
        },
      },
      async (request, reply) => {
        const { projectId } = request.params;
        const { project } = await projectServices.getProject({ projectId });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'Project found',
          project,
        });
      }
    );
    app.get(
      '/project/list',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['Project'],
          security: [{ Bearer: [] }],
          summary: 'List project route',
          response: listProjectsResponseSchema,
        },
      },
      async (request, reply) => {
        const userId = request.user.id;
        const { projects } = await projectServices.listProjects({ userId });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'All user projects',
          projects,
        });
      }
    );
  };
}
