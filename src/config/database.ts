import { PrismaClient } from '@prisma/client';
import { env, isDev } from './env';
import logger from './logger';

// Create Prisma client with logging
const prisma = new PrismaClient({
  log: isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Connection event handlers
prisma.$on('info' as any, (e: any) => {
  logger.info('Prisma info:', e);
});

prisma.$on('warn' as any, (e: any) => {
  logger.warn('Prisma warning:', e);
});

prisma.$on('error' as any, (e: any) => {
  logger.error('Prisma error:', e);
});

if (isDev) {
  prisma.$on('query' as any, (e: any) => {
    logger.debug('Prisma query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`
    });
  });
}

// Test connection function
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export default prisma;