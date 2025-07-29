import type {
  CountProjectsArgs,
  CreateProject,
  IProjectRepository,
  ListProjectsByUserIdArgs,
  Project,
  ProjectResponse,
  UpdateProject,
} from '@/models/project.model';
import { BaseRepository } from './base.repository';

export class ProjectRepository
  extends BaseRepository
  implements IProjectRepository
{
  async create({
    project_name,
    user_id,
    webhook_secret,
    description,
    domain,
    icon,
    rate_limit_per_day,
    rate_limit_per_hour,
    rate_limit_per_minute,
    status,
  }: CreateProject): Promise<Project> {
    const [project] = await this.knex('projects')
      .insert({
        project_name,
        user_id,
        webhook_secret,
        description,
        domain,
        icon,
        rate_limit_per_day,
        rate_limit_per_hour,
        rate_limit_per_minute,
        status,
      })
      .returning('*');

    if (!project) {
      throw new Error('Error on insert project');
    }

    return project;
  }

  async update({
    id,
    description,
    domain,
    icon,
    project_name,
    rate_limit_per_day,
    rate_limit_per_hour,
    rate_limit_per_minute,
    status,
    webhook_secret,
  }: UpdateProject): Promise<void> {
    await this.knex('projects')
      .update({
        description,
        domain,
        icon,
        project_name,
        rate_limit_per_day,
        rate_limit_per_hour,
        rate_limit_per_minute,
        status,
        webhook_secret,
      })
      .where({ id });
  }

  async softDelete(projectId: string): Promise<void> {
    await this.knex('projects')
      .update({
        status: 'inactive',
        deleted_at: new Date(),
      })
      .where({ id: projectId });
  }

  async findById(projectId: string): Promise<Project | null> {
    const project = await this.knex('projects')
      .where({
        id: projectId,
      })
      .first();

    return project ?? null;
  }

  async listProjectsByUserId({
    userId,
    status,
  }: ListProjectsByUserIdArgs): Promise<ProjectResponse[]> {
    const projects = await this.knex('projects')
      .select(
        'id',
        'project_name',
        'description',
        'domain',
        'icon',
        'status',
        'created_at',
        'updated_at'
      )
      .where({ user_id: userId, status })
      .orderBy('created_at', 'desc');

    return projects;
  }

  async countProjects({ userId, status }: CountProjectsArgs): Promise<number> {
    const count = await this.knex('projects')
      .where({
        user_id: userId,
        status,
      })
      .count()
      .first();

    return Number(count?.count ?? 0);
  }
}
