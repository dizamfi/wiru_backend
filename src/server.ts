import 'module-alias/register';
import App from './app';
import { env, isDev, isProd } from '@/config/env';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import logger from '@/config/logger';

// Función para manejar errores no capturados
const handleUncaughtErrors = (): void => {
  // Manejar excepciones no capturadas
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Manejar promesas rechazadas no capturadas
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Manejar señales de terminación graceful
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Starting graceful shutdown...');
    await gracefulShutdown();
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received. Starting graceful shutdown...');
    await gracefulShutdown();
  });
};

// Función para shutdown graceful
const gracefulShutdown = async (): Promise<void> => {
  try {
    logger.info('Closing server connections...');
    
    // Cerrar conexión a la base de datos
    await disconnectDatabase();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Función principal para iniciar el servidor
const startServer = async (): Promise<void> => {
  try {
    // Configurar manejo de errores
    handleUncaughtErrors();

    // Log de inicio
    logger.info('Starting Wiru Backend Server...');
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Port: ${env.PORT}`);
    
    // Conectar a la base de datos
    logger.info('Connecting to database...');
    await connectDatabase();

    // Crear y configurar la aplicación
    const app = new App();
    
    // Iniciar el servidor
    app.listen(env.PORT);

    // Log adicionales para desarrollo
    if (isDev) {
      logger.info('Development mode enabled');
      logger.info('Available endpoints:');
      logger.info(`  - Health: http://localhost:${env.PORT}/health`);
      logger.info(`  - API Docs: http://localhost:${env.PORT}/api/docs`);
      logger.info(`  - API Base: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    }

    if (isProd) {
      logger.info('Production mode - Enhanced security and performance features enabled');
    }

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();