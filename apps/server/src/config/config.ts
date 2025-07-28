import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Schema for validating environment variables using Zod.
 * Ensures that all required environment variables are present and correctly formatted.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  DATABASE_URL: z.string().url(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  CLIENT_URL: z.string().url(),
  PORT: z.coerce.number().default(8000),
  EMAIL_TOKEN: z.string(),
  EMAIL_API_URL: z.string().url(),
  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
});

const envVars = envSchema.safeParse(process.env);

/**
 * Parses and validates the environment variables using the defined schema.
 * Throws an error if validation fails.
 */
if (!envVars.success) {
  console.error('Config validation error', envVars.error.format());
  throw new Error('Invalid environment variables');
}

/**
 * Configuration object containing validated environment variables.
 * This object is used throughout the application to access configuration values.
 */
const config = {
  NODE_ENV: envVars.data.NODE_ENV.toLowerCase(),
  DATABASE_URL: envVars.data.DATABASE_URL,
  ACCESS_TOKEN_SECRET: envVars.data.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: envVars.data.REFRESH_TOKEN_SECRET,
  CLIENT_URL: envVars.data.CLIENT_URL,
  PORT: envVars.data.PORT,
  EMAIL_TOKEN: envVars.data.EMAIL_TOKEN,
  EMAIL_API_URL: envVars.data.EMAIL_API_URL,
  AWS_ACCESS_KEY: envVars.data.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: envVars.data.AWS_SECRET_KEY,
  AWS_REGION: envVars.data.AWS_REGION,
  AWS_BUCKET_NAME: envVars.data.AWS_BUCKET_NAME,
  GOOGLE_CLIENT_ID: envVars.data.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envVars.data.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: envVars.data.GOOGLE_REDIRECT_URI,
};

export default config;
