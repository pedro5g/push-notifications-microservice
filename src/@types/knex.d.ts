import { Knex } from "knex";
import type { ApiKey, ApiKeyInsert } from "@/models/api-key.model";
import type { Project, ProjectInsert } from "@/models/project.model";
import type { User, UserInsert } from "@/models/user.model";
import type {
  UserSetting,
  UserSettingInsert,
} from "@/models/user-setting.model";
import type { UserToken, UserTokenInset } from "@/models/user-tokens.model";

declare module "knex/types/tables" {
  interface Tables {
    users: Knex.CompositeTableType<User, UserInsert>;
    user_settings: Knex.CompositeTableType<UserSetting, UserSettingInset>;
    user_tokens: Knex.CompositeTableType<UserToken, UserTokenInset>;
    projects: Knex.CompositeTableType<Project, ProjectInsert>;
    api_keys: Knex.CompositeTableType<ApiKey, ApiKeyInsert>;
  }
}
