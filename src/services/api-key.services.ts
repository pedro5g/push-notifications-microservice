import type { ApiKeyStatus } from "@/models/api-key.model";
import type { ContextRepository } from "@/repositories/context.repository";
import { genApiKey, toHash } from "@/utils/crypt";
import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { Logger } from "@/utils/logger";

interface CreateApiKeyDto {
  projectId: string;
  name: string;
  permissions?: string[];
  expiresAt?: Date;
}

interface UpdateApiKeyDto {
  apiKeyId: string;
  name: string;
  permissions?: string[];
  expiresAt?: Date;
  status: ApiKeyStatus;
}

interface ListAllDto {
  projectId: string;
}

interface GetApiKeyDto {
  apiKeyId: string;
}

export class ApiKeyServices {
  private readonly logger = new Logger(ApiKeyServices.name);
  constructor(private readonly ctx: ContextRepository) {}

  async createApiKey({
    projectId,
    name,
    permissions,
    expiresAt,
  }: CreateApiKeyDto) {
    const project = await this.ctx.projects.findById(projectId);

    if (!project) {
      this.logger.warn("Project not found, invalid project id", { projectId });
      throw new NotFoundException("Project not found, invalid project id");
    }

    if (project.status !== "active") {
      this.logger.warn(
        `[NotAllowedAction] Attempt to create an api key in an ${project.status} project`
      );
      throw new ConflictException(
        `It is not allowed to register new api key in an ${project.status} project`
      );
    }

    const key = genApiKey();
    const apiKeyPreview = `••••••••••••••${key.slice(-4)}`;
    const keyHash = await toHash(key);

    const apiKey = await this.ctx.apiKeys.create({
      name,
      permissions,
      key_preview: apiKeyPreview,
      key_hash: keyHash,
      project_id: projectId,
      expires_at: expiresAt?.toISOString(),
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: key,
        key_preview: apiKey.key_preview,
        permissions: apiKey.permissions,
        status: apiKey.status,
        expires_at: apiKey.expires_at,
        created_at: apiKey.created_at,
      },
    };
  }

  async updateApiKey({
    apiKeyId,
    name,
    status,
    expiresAt,
    permissions,
  }: UpdateApiKeyDto) {
    const apiKey = await this.ctx.apiKeys.findById(apiKeyId);

    if (!apiKey) {
      this.logger.warn("ApiKey not found, invalid api key id", { apiKey });
      throw new NotFoundException("Api key not found, invalid api key id");
    }

    await this.ctx.apiKeys.update({
      id: apiKeyId,
      name,
      status,
      expires_at: expiresAt?.toISOString(),
      permissions,
    });
  }

  async listAll({ projectId }: ListAllDto) {
    const apiKeys = await this.ctx.apiKeys.listApiKeysByProjectId(projectId);
    return { apiKeys };
  }

  async getApiKey({ apiKeyId }: GetApiKeyDto) {
    const apiKey = await this.ctx.apiKeys.findById(apiKeyId);

    if (!apiKey) {
      this.logger.warn("ApiKey not found, invalid api key id", { apiKey });
      throw new NotFoundException("Api key not found, invalid api key id");
    }

    return { apiKey };
  }
}
