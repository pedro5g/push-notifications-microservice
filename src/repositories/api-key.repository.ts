import type {
  ApiKey,
  ApiKeyResponse,
  CreateApiKey,
  IApiKeyRepository,
  UpdateApiKey,
} from "@/models/api-key.model";
import { BaseRepository } from "./base.repository";

export class ApiKeyRepository
  extends BaseRepository
  implements IApiKeyRepository
{
  async create({
    name,
    project_id,
    key_hash,
    key_preview,
    status,
    permissions,
    expires_at,
  }: CreateApiKey): Promise<ApiKey> {
    const [apiKey] = await this.knex("api_keys")
      .insert({
        name,
        project_id,
        key_hash,
        key_preview,
        status,
        permissions: JSON.stringify(permissions),
        expires_at,
      })
      .returning("*");

    if (!apiKey) {
      throw new Error("Error on insert api_key");
    }

    return apiKey;
  }

  async update({
    id,
    name,
    project_id,
    key_hash,
    key_preview,
    status,
    permissions,
    expires_at,
    usage_count,
    last_used_at,
  }: UpdateApiKey): Promise<void> {
    await this.knex("api_keys")
      .update({
        name,
        project_id,
        key_hash,
        key_preview,
        status,
        permissions: JSON.stringify(permissions),
        expires_at,
        usage_count,
        last_used_at,
      })
      .where({ id });
  }
  async softDelete(id: string): Promise<void> {
    await this.knex("api_keys")
      .update({
        status: "inactive",
      })
      .where({ id });
  }

  async findById(id: string): Promise<ApiKey | null> {
    const apiKey = await this.knex("api_keys")
      .where({
        id,
      })
      .first();
    if (!apiKey) return null;

    return apiKey;
  }

  async listApiKeysByProjectId(projectId: string): Promise<ApiKeyResponse[]> {
    const apiKeys = await this.knex("api_keys")
      .select(
        "id",
        "name",
        "key_preview",
        "permissions",
        "status",
        "expires_at",
        "last_used_at",
        "usage_count",
        "created_at",
        "updated_at"
      )
      .where({ project_id: projectId })
      .orderBy("created_at", "desc");

    return apiKeys;
  }
}
