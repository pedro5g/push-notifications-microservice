export interface UserSetting {
  id: string;
  user_id: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  webhook_notifications: boolean;
  max_projects: number;
  max_web_hooks_per_project: number;
  max_notifications_per_month: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface CreateUserSetting {
  user_id: string;
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  webhook_notifications?: boolean;
  max_projects?: number;
  max_web_hooks_per_project?: number;
  max_notifications_per_month?: number;
}

export interface UpdateUserSetting extends Partial<CreateUserSetting> {}

export interface UserSettingResponse extends UserSetting {}
