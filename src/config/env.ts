import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(5000),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Kushki
  KUSHKI_API_URL: z.string().optional(),
  KUSHKI_PUBLIC_KEY: z.string().optional(),
  KUSHKI_PRIVATE_KEY: z.string().optional(),
  KUSHKI_ENVIRONMENT: z.enum(['staging', 'production']).default('staging'),
  
  // Servientrega
  SERVIENTREGA_API_URL: z.string().optional(),
  SERVIENTREGA_API_KEY: z.string().optional(),
  SERVIENTREGA_USERNAME: z.string().optional(),
  SERVIENTREGA_PASSWORD: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  FROM_NAME: z.string().default('Wiru'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default(5242880),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  
  // Wallet
  MIN_WITHDRAWAL_AMOUNT: z.string().transform(Number).default(10.00),
  MAX_WITHDRAWAL_AMOUNT: z.string().transform(Number).default(5000.00),
  DAILY_WITHDRAWAL_LIMIT: z.string().transform(Number).default(10000.00),
  KUSHKI_FEE_PERCENTAGE: z.string().transform(Number).default(0.035),
  
  // Webhooks
  KUSHKI_WEBHOOK_SECRET: z.string().optional(),
  SERVIENTREGA_WEBHOOK_SECRET: z.string().optional(),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// Helper to check if we're in development
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';