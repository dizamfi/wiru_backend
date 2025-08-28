// // import { config } from 'dotenv';
// import { z } from 'zod';

// // Load environment variables
// // config();

// import * as dotenv from 'dotenv';
// dotenv.config();

// // Environment validation schema
// const envSchema = z.object({
//   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
//   PORT: z.string().transform(Number).default(5000),
//   API_VERSION: z.string().default('v1'),
  
//   // Database
//   DATABASE_URL: z.string(),
//   REDIS_URL: z.string().optional(),
  
//   // JWT
//   JWT_SECRET: z.string(),
//   JWT_EXPIRES_IN: z.string().default('7d'),
//   REFRESH_TOKEN_SECRET: z.string(),
//   REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
//   // Bcrypt
//   BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  
//   // CORS
//   CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
//   // Rate Limiting
//   RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
//   RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  
//   // Cloudinary
//   CLOUDINARY_CLOUD_NAME: z.string().optional(),
//   CLOUDINARY_API_KEY: z.string().optional(),
//   CLOUDINARY_API_SECRET: z.string().optional(),
  
//   // Kushki
//   KUSHKI_API_URL: z.string().optional(),
//   KUSHKI_PUBLIC_KEY: z.string().optional(),
//   KUSHKI_PRIVATE_KEY: z.string().optional(),
//   KUSHKI_ENVIRONMENT: z.enum(['staging', 'production']).default('staging'),
  
//   // Servientrega
//   SERVIENTREGA_API_URL: z.string().optional(),
//   SERVIENTREGA_API_KEY: z.string().optional(),
//   SERVIENTREGA_USERNAME: z.string().optional(),
//   SERVIENTREGA_PASSWORD: z.string().optional(),

//   FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
//   BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
//   ADMIN_PANEL_URL: process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
  
//   // Email
//   SMTP_HOST: z.string().optional(),
//   SMTP_PORT: z.string().transform(Number).default(587),
//   SMTP_USER: z.string().optional(),
//   SMTP_PASS: z.string().optional(),
//   FROM_EMAIL: z.string().optional(),
//   FROM_NAME: z.string().default('Wiru'),
  
//   // File Upload
//   MAX_FILE_SIZE: z.string().transform(Number).default(5242880),
//   ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  
//   // Wallet
//   MIN_WITHDRAWAL_AMOUNT: z.string().transform(Number).default(10.00),
//   MAX_WITHDRAWAL_AMOUNT: z.string().transform(Number).default(5000.00),
//   DAILY_WITHDRAWAL_LIMIT: z.string().transform(Number).default(10000.00),
//   KUSHKI_FEE_PERCENTAGE: z.string().transform(Number).default(0.035),
  
//   // Webhooks
//   KUSHKI_WEBHOOK_SECRET: z.string().optional(),
//   SERVIENTREGA_WEBHOOK_SECRET: z.string().optional(),
  
//   // Monitoring
//   LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
//   LOG_FILE: z.string().default('logs/app.log'),
// });

// // Validate environment variables
// const parseResult = envSchema.safeParse(process.env);

// if (!parseResult.success) {
//   console.error('❌ Invalid environment variables:');
//   console.error(parseResult.error.format());
//   process.exit(1);
// }

// export const env = parseResult.data;

// // Helper to check if we're in development
// export const isDev = env.NODE_ENV === 'development';
// export const isProd = env.NODE_ENV === 'production';
// export const isTest = env.NODE_ENV === 'test';





import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Bcrypt
  BCRYPT_ROUNDS: z.string().default('12').transform((val) => parseInt(val, 10)),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
  
  // URLs
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
  ADMIN_PANEL_URL: z.string().default('http://localhost:3001'),
  
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
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().default('noreply@wiru.com'),
  FROM_NAME: z.string().default('Wiru'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880').transform((val) => parseInt(val, 10)),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  
  // Wallet
  MIN_WITHDRAWAL_AMOUNT: z.string().default('10.00').transform((val) => parseFloat(val)),
  MAX_WITHDRAWAL_AMOUNT: z.string().default('5000.00').transform((val) => parseFloat(val)),
  DAILY_WITHDRAWAL_LIMIT: z.string().default('10000.00').transform((val) => parseFloat(val)),
  KUSHKI_FEE_PERCENTAGE: z.string().default('0.035').transform((val) => parseFloat(val)),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),
  
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/auth/facebook/callback'),
  
  // Tokens
  VERIFICATION_TOKEN_EXPIRY: z.string().default('1440').transform((val) => parseInt(val, 10)), // 24 hours in minutes
  PASSWORD_RESET_TOKEN_EXPIRY: z.string().default('60').transform((val) => parseInt(val, 10)), // 1 hour in minutes
  
  // Webhooks
  KUSHKI_WEBHOOK_SECRET: z.string().optional(),
  SERVIENTREGA_WEBHOOK_SECRET: z.string().optional(),
  WEBHOOK_SECRET: z.string().default('default-webhook-secret'),
  
  // Security
  SESSION_SECRET: z.string().default('default-session-secret'),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  parseResult.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;

// Helper functions
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';