import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE USER_STATUS AS ENUM('active', 'inactive', 'suspended', 'pending_verification');
    CREATE TYPE PROJECT_STATUS AS ENUM('active', 'inactive', 'suspended');
    CREATE TYPE API_KEY_STATUS AS ENUM ('active', 'inactive', 'revoked');

    CREATE TABLE users (
      id UUID NOT NULL CONSTRAINT pk_users_id PRIMARY KEY DEFAULT(gen_random_uuid()),
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL CONSTRAINT uq_users_email UNIQUE,
      password_hash TEXT NOT NULL,
      status USER_STATUS DEFAULT('pending_verification'),
      email_verified_at TIMESTAMP,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL CONSTRAINT df_users_created_at DEFAULT(now()),
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    ); 

    CREATE TABLE user_settings (
      id UUID NOT NULL CONSTRAINT pk_user_settings_id PRIMARY KEY DEFAULT(gen_random_uuid()),
      user_id UUID NOT NULL,
      language VARCHAR(5) DEFAULT('pt-BR'),
      email_notifications BOOLEAN DEFAULT(false),
      push_notifications BOOLEAN DEFAULT(true),
      webhook_notifications BOOLEAN DEFAULT(true),
      max_projects INTEGER DEFAULT(3),
      max_web_hooks_per_project INTEGER DEFAULT(10),
      max_notifications_per_month INTEGER DEFAULT(10000),
      created_at TIMESTAMP NOT NULL CONSTRAINT df_user_settings_created_at DEFAULT(now()),
      updated_at TIMESTAMP,
       
      CONSTRAINT fk_user_settings_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


    CREATE TABLE projects (
      id UUID NOT NULL CONSTRAINT pk_projects_id PRIMARY KEY DEFAULT(gen_random_uuid()),
      user_id UUID NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      description TEXT,
      domain VARCHAR(255),
      icon VARCHAR(500),
      status PROJECT_STATUS DEFAULT('active'),
      webhook_secret TEXT NOT NULL,
      rate_limit_per_minute INTEGER DEFAULT 60,
      rate_limit_per_hour INTEGER DEFAULT 1000,
      rate_limit_per_day INTEGER DEFAULT 10000,
      created_at TIMESTAMP NOT NULL CONSTRAINT df_projects_created_at DEFAULT(now()),
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP,

      CONSTRAINT fk_projects_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE api_keys (
      id UUID NOT NULL CONSTRAINT pk_api_keys_id PRIMARY KEY DEFAULT(gen_random_uuid()),
      project_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      key_hash VARCHAR(255) NOT NULL CONSTRAINT up_api_keys_key_hash UNIQUE,
      key_preview VARCHAR(20) NOT NULL,
      permissions JSONB DEFAULT '["notifications:send", "webhooks:manage"]',
      status API_KEY_STATUS DEFAULT('active'),
      expires_at TIMESTAMP,
      last_used_at TIMESTAMP,
      usage_count BIGINT DEFAULT 0,
      created_at TIMESTAMP NOT NULL CONSTRAINT df_api_keys_created_at DEFAULT(now()),
      updated_at TIMESTAMP,

      CONSTRAINT fk_api_keys_project_id 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_users_not_deleted ON users(id) WHERE deleted_at IS NULL;
    CREATE INDEX idx_projects_not_deleted ON projects(id) WHERE deleted_at IS NULL;

    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_status ON users(status);

    CREATE INDEX idx_projects_user_id ON projects(user_id);
    CREATE INDEX idx_projects_status ON projects(status);

    CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);
    CREATE INDEX idx_api_keys_status ON api_keys(status);
    CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE api_keys;
    DROP TABLE projects;
    DROP TABLE user_settings;
    DROP TABLE users;
    
    DROP TYPE IF EXISTS USER_STATUS CASCADE;
    DROP TYPE IF EXISTS PROJECT_STATUS CASCADE;
    DROP TYPE IF EXISTS API_KEY_STATUS CASCADE;
  `)
}

