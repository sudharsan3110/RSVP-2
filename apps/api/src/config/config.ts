import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  DATABASE_URL: z.string().url(),
  EMAIL_FROM: z.string().email(),
  EMAIL_PASSWORD: z.string(),
  JWT_SECRET_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  PORT: z.coerce.number().default(8000),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error("Config validation error", envVars.error.format());
  throw new Error("Invalid environment variables");
}

const config = {
  env: envVars.data.NODE_ENV,
  DB_URL: envVars.data.DATABASE_URL,
  EMAIL: {
    from: envVars.data.EMAIL_FROM,
    password: envVars.data.EMAIL_PASSWORD,
  },
  JWT_SECRET_KEY: envVars.data.JWT_SECRET_KEY,
  CLIENT_URL: envVars.data.NEXT_PUBLIC_APP_URL,
  PORT: envVars.data.PORT,
};

console.log(config.env);

export default config;
