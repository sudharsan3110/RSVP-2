import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  DATABASE_URL: z.string().url(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  PORT: z.coerce.number().default(8000),
  EMAIL_TOKEN: z.string(),
  EMAIL_API_URL: z.string().url(),
  NEWRELIC_APP_NAME: z.string(),
  NEWRELIC_LICENSE_KEY: z.string()
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('Config validation error', envVars.error.format());
  throw new Error('Invalid environment variables');
}

const config = {
  env: envVars.data.NODE_ENV,
  DB_URL: envVars.data.DATABASE_URL,
  ACCESS_TOKEN_SECRET: envVars.data.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: envVars.data.REFRESH_TOKEN_SECRET,
  CLIENT_URL: envVars.data.NEXT_PUBLIC_APP_URL,
  PORT: envVars.data.PORT,
  EMAIL_TOKEN: envVars.data.EMAIL_TOKEN,
  EMAIL_API_URL: envVars.data.EMAIL_API_URL,
  NEWRELIC_APP_NAME: envVars.data.NEWRELIC_APP_NAME,
  NEWRELIC_LICENSE_KEY: envVars.data.NEWRELIC_LICENSE_KEY
};

export default config;
