import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .string()
    .trim()
    .pipe(
      z.enum(['development', 'production', 'test'], {
        error: 'NODE_ENV must be "development", "production", or "test"',
      }),
    )
    .default('development'),
  PORT: z.coerce
    .number({ error: 'PORT must be a valid number' })
    .int({ error: 'PORT must be an integer' })
    .min(1, { error: 'PORT must be at least 1' })
    .max(65535, { error: 'PORT must be at most 65535' })
    .default(8000),

  MONGODB_URI: z
    .string({
      error: 'MONGODB_URI is required',
    })
    .trim()
    .min(1, { error: 'MONGODB_URI cannot be empty' })
    .refine(
      value =>
        value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
      { error: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' },
    ),

  CLIENT_URL: z
    .string({ error: 'Client url is required' })
    .trim()
    .min(1, { error: 'Client url cannot be empty' })
    .pipe(
      z.url({
        error: 'CLIENT_URL must be a valid URL (e.g. http://localhost:5173)',
      }),
    ),

  JWT_ACCESS_SECRET: z
    .string({ error: 'JWT_ACCESS_SECRET is required' })
    .trim()
    .min(16, { error: 'JWT_ACCESS_SECRET must be at least 16 characters' }),

  JWT_REFRESH_SECRET: z
    .string({ error: 'JWT_REFRESH_SECRET is required' })
    .trim()
    .min(16, { error: 'JWT_REFRESH_SECRET must be at least 16 characters' }),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .trim()
    .transform(val => (val === '' ? undefined : val))
    .default('15m'),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .trim()
    .transform(val => (val === '' ? undefined : val))
    .default('7d'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.issues
    .map(issue => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error(`\n❌ Invalid environment variables:\n${errors}\n`);
  process.exit(1);
}

const env = Object.freeze(parsedEnv.data);

export default env;
