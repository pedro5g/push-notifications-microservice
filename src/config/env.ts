import { ExitCode } from '@/utils/constraints';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
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
