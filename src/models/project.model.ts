export type ProjectStatus = 'active' | 'inactive' | 'suspended';

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  description: string | null;
  domain: string | null;
  icon: string | null;
  status: ProjectStatus;
  webhook_secret: string;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export interface CreateProject {
  user_id: string;
  project_name: string;
  description?: string;
  domain?: string;
  icon?: string;
  status?: ProjectStatus;
  webhook_secret: string;
  rate_limit_per_minute?: number;
  rate_limit_per_hour?: number;
  rate_limit_per_day?: number;
}

export interface UpdateProject extends Partial<CreateProject> {}

export interface ProjectResponse {
  id: string;
  project_name: string;
  description: string | null;
  domain: string | null;
  icon: string | null;
  status: ProjectStatus;
  created_at: Date;
  updated_at: Date | null;
}
