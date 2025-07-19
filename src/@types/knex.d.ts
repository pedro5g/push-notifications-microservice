import { Knex } from 'knex';
import type { ApiKey } from '@/models/api-key.model';
import type { Project } from '@/models/project.model';
import type { User } from '@/models/user.model';
import type { UserSetting } from '@/models/user-setting.model';

declare module 'knex/types/tables' {
  interface Tables {
    users: User;
    user_settings: UserSetting;
    projects: Project;
    api_keys: ApiKey;
  }
}
