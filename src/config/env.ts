import 'dotenv/config';
import { z } from 'zod';
import { ExitCode } from '@/utils/constraints';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  LOG_RULES: z.string().optional(),
  LOG_WRITE_TO_FILE: z.string().default('false'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  FINGERPRINT_SALT: z.string().default('finger_print_salt'),
  ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/, {
    message: 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
  }),
  PG_DATABASE_HOST: z.string().default('localhost'),
  PG_DATABASE_PORT: z.coerce.number(),
  PG_DATABASE_USERNAME: z.string(),
  PG_DATABASE_PASSWORD: z.string(),
  PG_DATABASE_NAME: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_PORT: z.coerce.number(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.log('================================================ \n');
  console.log('Impossible initialize app');
  console.error('Invalid environments variables 🧨🧨🧨 \n', _env.error.issues);
  console.log('================================================ \n');
  process.exit(ExitCode.FAILURE);
}

const env = _env.data;
type Env = z.infer<typeof envSchema>;

export { env, type Env };
