export type ApiKeyStatus = 'active' | 'inactive' | 'revoked';

export interface ApiKey {
  id: string;
  project_id: string;
  name: string;
  key_hash: string;
  key_preview: string;
  permissions: string[];
  status: ApiKeyStatus;
  expires_at: Date | null;
  last_used_at: Date | null;
  usage_count: number;
  created_at: Date;
  updated_at: Date | null;
}

export interface CreateApiKey {
  project_id: string;
  name: string;
  key_hash: string;
  key_preview: string;
  permissions?: string[];
  status?: ApiKeyStatus;
  expires_at?: Date;
}

export interface UpdateApiKey extends Partial<CreateApiKey> {
  last_used_at?: Date;
  usage_count?: number;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  status: ApiKeyStatus;
  expires_at: Date | null;
  last_used_at: Date | null;
  usage_count: number;
  created_at: Date;
  updated_at: Date | null;
}
