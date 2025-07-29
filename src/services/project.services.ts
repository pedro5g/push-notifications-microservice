import type { ContextRepository } from '@/repositories/context.repository';
import { ErrorCode } from '@/utils/constraints';
import { generateSecret } from '@/utils/crypt';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@/utils/exceptions';
import { Logger } from '@/utils/logger';

interface CreateProjectDto {
  userId: string;
  projectName: string;
  description?: string;
  domain?: string;
  icon?: string;
}

interface UpdateProjectDto {
  projectId: string;
  projectName: string;
  description?: string;
  domain?: string;
  icon?: string;
}

interface DisableProjectDto {
  projectId: string;
}

interface GetProjectDto {
  projectId: string;
}

interface ListProjectsDto {
  userId: string;
}

export class ProjectServices {
  private readonly logger = new Logger(ProjectServices.name);
  constructor(private readonly ctx: ContextRepository) {}

  async createProject({
    userId,
    projectName,
    description,
    domain,
    icon,
  }: CreateProjectDto) {
    const user = await this.ctx.users.getUserContext({ id: userId });

    if (!user) {
      this.logger.warn('[IMPORTANT]! consistence error; Invalid user id', {
        userId,
      });
      throw new NotFoundException('User not found, invalid user id');
    }

    const projectQuantity = await this.ctx.projects.countProjects({
      userId: user.id,
      status: 'active',
    });

    if (projectQuantity >= user.settings.max_projects) {
      throw new BadRequestException(
        'Maximum amount of projects achieved',
        ErrorCode.MAX_LIMIT_ACHIEVED
      );
    }

    const project = await this.ctx.projects.create({
      user_id: userId,
      project_name: projectName,
      description,
      domain,
      icon,
      webhook_secret: generateSecret(),
    });

    return {
      project: {
        id: project.id,
        project_name: project.project_name,
        description: project.description,
        status: project.status,
        domain: project.domain,
        icon: project.icon,
        webhook_secret: project.webhook_secret,
        created_at: project.created_at,
      },
    };
  }

  async updateProject({
    projectId,
    projectName,
    description,
    domain,
    icon,
  }: UpdateProjectDto) {
    const project = await this.ctx.projects.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found, invalid project id');
    }

    if (project.status !== 'active') {
      throw new ConflictException(
        'It is not allowed to update a project whose status is not "active"'
      );
    }

    await this.ctx.projects.update({
      id: projectId,
      project_name: projectName,
      description,
      domain,
      icon,
    });
  }

  async disableProject({ projectId }: DisableProjectDto) {
    const project = await this.ctx.projects.findById(projectId);

    if (!project) {
      this.logger.warn('Attempt to disable a non-existent project');
      return;
    }

    if (project.status !== 'active') {
      this.logger.warn(
        'Attempt to disable a project whose status is not "active"'
      );
      return;
    }

    await this.ctx.projects.softDelete(project.id);
  }

  async getProject({ projectId }: GetProjectDto) {
    const project = await this.ctx.projects.findById(projectId);

    if (!project) {
      this.logger.warn('[IMPORTANT]! consistence error; Invalid project id', {
        projectId,
      });
      throw new NotFoundException('Project not found, invalid project id');
    }
    const { deleted_at, ...rest } = project;
    return { project: { ...rest } };
  }

  async listProjects({ userId }: ListProjectsDto) {
    const user = await this.ctx.users.findById(userId);

    if (!user) {
      this.logger.warn('[IMPORTANT]! consistence error; Invalid user id', {
        userId,
      });
      throw new NotFoundException('User not found, invalid user id');
    }

    const projects = await this.ctx.projects.listProjectsByUserId({
      userId,
      status: 'active',
    });

    return { projects };
  }
}
