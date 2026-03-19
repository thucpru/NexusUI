/**
 * App configuration — Zod-validated environment variables.
 * Fails fast at startup if required vars are missing.
 */
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
});

export type AppEnv = z.infer<typeof EnvSchema>;

/** Parse and validate env vars — throws at startup on failure */
export function validateEnv(env: NodeJS.ProcessEnv): AppEnv {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  return result.data;
}

/** NestJS ConfigModule factory — returns validated env object */
export function appConfig() {
  return validateEnv(process.env);
}
