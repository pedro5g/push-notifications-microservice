import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE user_token_types AS ENUM('email_verification', 'password_reset');  

    CREATE TABLE user_tokens (
      id UUID NOT NULL CONSTRAINT pk_tokens_id PRIMARY KEY DEFAULT(gen_random_uuid()),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type user_token_types NOT NULL,
      token TEXT NOT NULL CONSTRAINT up_user_tokes_token UNIQUE,
      expired_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP, 
      created_at TIMESTAMP NOT NULL CONSTRAINT df_tokens_created_at DEFAULT(now())
    );

    CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);
    CREATE INDEX idx_user_tokens_token ON user_tokens(token);
    CREATE INDEX idx_user_tokens_type ON user_tokens(type);
    `)
}



export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE user_tokens;
    DROP TYPE user_token_types;
  `)
}

