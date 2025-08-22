// import express, { Application, Request, Response } from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import compression from 'compression';
// import cookieParser from 'cookie-parser';

// // Importar configuraciones
// import { env, isDev } from '@/config/env';
// import logger from '@/config/logger';

// // Importar middleware
// import { generalRateLimit } from '@/middleware/rateLimit.middleware';
// import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';

// // Importar rutas
// import apiRoutes from '@/routes';

// class App {
//   public app: Application;

//   constructor() {
//     this.app = express();
//     this.initializeMiddleware();
//     this.initializeRoutes();
//     this.initializeErrorHandling();
//   }

//   private initializeMiddleware(): void {
//     // Seguridad con Helmet
//     this.app.use(helmet({
//       contentSecurityPolicy: isDev ? false : undefined,
//       crossOriginEmbedderPolicy: false,
//     }));

//     // CORS
//     this.app.use(cors({
//       origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
//       credentials: true,
//       methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//       allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//     }));

//     // Rate limiting general
//     this.app.use(generalRateLimit);

//     // Logging de requests
//     this.app.use(morgan(isDev ? 'dev' : 'combined', {
//       stream: {
//         write: (message: string) => {
//           logger.info(message.trim());
//         },
//       },
//     }));

//     // Compresión de respuestas
//     this.app.use(compression());

//     // Parseo de JSON y URL encoded
//     this.app.use(express.json({ 
//       limit: '10mb',
//       strict: true,
//     }));
    
//     this.app.use(express.urlencoded({ 
//       extended: true,
//       limit: '10mb',
//     }));

//     // Cookie parser
//     this.app.use(cookieParser());

//     // Trust proxy (importante para rate limiting e IPs reales)
//     this.app.set('trust proxy', 1);
//   }

//   private initializeRoutes(): void {
//     // Health check endpoint
//     this.app.get('/health', (req: Request, res: Response) => {
//       res.status(200).json({
//         status: 'OK',
//         message: 'Servidor funcionando correctamente',
//         timestamp: new Date().toISOString(),
//         environment: env.NODE_ENV,
//         version: env.API_VERSION,
//       });
//     });

//     // API base endpoint
//     this.app.get('/', (req: Request, res: Response) => {
//       res.status(200).json({
//         message: 'Wiru Backend API',
//         version: env.API_VERSION,
//         environment: env.NODE_ENV,
//         timestamp: new Date().toISOString(),
//         documentation: '/api/docs',
//       });
//     });

//     // API routes
//     this.app.use(`/api/${env.API_VERSION}`, apiRoutes);

//     // Documentación completa
//     this.app.get('/api/docs', (req: Request, res: Response) => {
//       res.status(200).json({
//         message: 'API Documentation',
//         version: env.API_VERSION,
//         base_url: `/api/${env.API_VERSION}`,
//         endpoints: {
//           health: 'GET /health',
//           status: `GET /api/${env.API_VERSION}/status`,
//           auth: {
//             register: `POST /api/${env.API_VERSION}/auth/register`,
//             login: `POST /api/${env.API_VERSION}/auth/login`,
//             refresh: `POST /api/${env.API_VERSION}/auth/refresh`,
//             logout: `POST /api/${env.API_VERSION}/auth/logout`,
//             me: `GET /api/${env.API_VERSION}/auth/me`,
//             forgotPassword: `POST /api/${env.API_VERSION}/auth/forgot-password`,
//             resetPassword: `POST /api/${env.API_VERSION}/auth/reset-password`,
//             verifyEmail: `POST /api/${env.API_VERSION}/auth/verify-email`,
//           },
//           users: {
//             profile: `GET /api/${env.API_VERSION}/users/profile`,
//             updateProfile: `PUT /api/${env.API_VERSION}/users/profile`,
//             stats: `GET /api/${env.API_VERSION}/users/stats`,
//             referrals: `GET /api/${env.API_VERSION}/users/referrals`,
//             notifications: `GET /api/${env.API_VERSION}/users/notifications`,
//           },
//           wallet: {
//             balance: `GET /api/${env.API_VERSION}/wallet/balance`,
//             transactions: `GET /api/${env.API_VERSION}/wallet/transactions`,
//             bankAccounts: `GET /api/${env.API_VERSION}/wallet/bank-accounts`,
//             addBankAccount: `POST /api/${env.API_VERSION}/wallet/bank-accounts`,
//             withdraw: `POST /api/${env.API_VERSION}/wallet/withdraw`,
//             withdrawals: `GET /api/${env.API_VERSION}/wallet/withdrawals`,
//             limits: `GET /api/${env.API_VERSION}/wallet/limits`,
//           },
//           orders: {
//             create: `POST /api/${env.API_VERSION}/orders`,
//             list: `GET /api/${env.API_VERSION}/orders`,
//             details: `GET /api/${env.API_VERSION}/orders/:id`,
//             cancel: `PUT /api/${env.API_VERSION}/orders/:id/cancel`,
//             tracking: `GET /api/${env.API_VERSION}/orders/:id/tracking`,
//             dispute: `POST /api/${env.API_VERSION}/orders/:id/dispute`,
//             stats: `GET /api/${env.API_VERSION}/orders/stats/summary`,
//           },
//           categories: {
//             list: `GET /api/${env.API_VERSION}/categories`,
//             details: `GET /api/${env.API_VERSION}/categories/:id`,
//             search: `GET /api/${env.API_VERSION}/categories/search`,
//             priceEstimate: `GET /api/${env.API_VERSION}/categories/price-estimate`,
//           },
//           upload: {
//             images: `POST /api/${env.API_VERSION}/upload/images`,
//             avatar: `POST /api/${env.API_VERSION}/upload/avatar`,
//             bulk: `POST /api/${env.API_VERSION}/upload/bulk`,
//             limits: `GET /api/${env.API_VERSION}/upload/limits`,
//             stats: `GET /api/${env.API_VERSION}/upload/stats`,
//           },
//           webhooks: {
//             kushki: `POST /api/${env.API_VERSION}/webhooks/kushki`,
//             servientrega: `POST /api/${env.API_VERSION}/webhooks/servientrega`,
//             health: `GET /api/${env.API_VERSION}/webhooks/health`,
//             simulate: `POST /api/${env.API_VERSION}/webhooks/simulate/kushki`,
//           },
//         },
//         notes: {
//           authentication: "Endpoints protegidos requieren header: Authorization: Bearer <token>",
//           rateLimit: "Rate limiting aplicado según el tipo de endpoint",
//           testing: "Usar POST /api/v1/auth/mock-token para obtener token de prueba"
//         }
//       });
//     });
//   }

//   private initializeErrorHandling(): void {
//     // Middleware para rutas no encontradas
//     this.app.use(notFoundHandler);

//     // Middleware global de manejo de errores
//     this.app.use(errorHandler);
//   }

//   public getApp(): Application {
//     return this.app;
//   }

//   public listen(port: number): void {
//     this.app.listen(port, () => {
//       logger.info(`Servidor iniciado en puerto ${port}`);
//       logger.info(`Entorno: ${env.NODE_ENV}`);
//       logger.info(`CORS habilitado para: ${env.CORS_ORIGIN}`);
      
//       if (isDev) {
//         logger.info(`Health check: http://localhost:${port}/health`);
//         logger.info(`Documentación: http://localhost:${port}/api/docs`);
//         logger.info(`API Status: http://localhost:${port}/api/${env.API_VERSION}/status`);
//       }
//     });
//   }
// }

// export default App;




import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Importar configuraciones
import { env, isDev } from '@/config/env';
import logger from '@/config/logger';

// Importar middleware
import { generalRateLimit } from '@/middleware/rateLimit.middleware';
import { errorHandler } from '@/middleware/error.middleware';

// Importar rutas
import apiRoutes from '@/routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Seguridad con Helmet
    this.app.use(helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      crossOriginEmbedderPolicy: false,
    }));

    // CORS
    this.app.use(cors({
      origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting general
    this.app.use(generalRateLimit);

    // Logging de requests
    this.app.use(morgan(isDev ? 'dev' : 'combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    }));

    // Compresión de respuestas
    this.app.use(compression());

    // Parseo de JSON y URL encoded
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true,
    }));
    
    this.app.use(express.urlencoded({ 
      extended: true,
      limit: '10mb',
    }));

    // Cookie parser
    this.app.use(cookieParser());

    // Trust proxy (importante para rate limiting e IPs reales)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: env.API_VERSION,
      });
    });

    // API base endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Wiru Backend API',
        version: env.API_VERSION,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        documentation: '/api/docs',
      });
    });

    // API routes
    this.app.use(`/api/${env.API_VERSION}`, apiRoutes);

    // Documentación completa
    this.app.get('/api/docs', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'API Documentation',
        version: env.API_VERSION,
        base_url: `/api/${env.API_VERSION}`,
        endpoints: {
          health: 'GET /health',
          status: `GET /api/${env.API_VERSION}/status`,
          auth: {
            register: `POST /api/${env.API_VERSION}/auth/register`,
            login: `POST /api/${env.API_VERSION}/auth/login`,
            refresh: `POST /api/${env.API_VERSION}/auth/refresh`,
            logout: `POST /api/${env.API_VERSION}/auth/logout`,
            me: `GET /api/${env.API_VERSION}/auth/me`,
            forgotPassword: `POST /api/${env.API_VERSION}/auth/forgot-password`,
            resetPassword: `POST /api/${env.API_VERSION}/auth/reset-password`,
            verifyEmail: `POST /api/${env.API_VERSION}/auth/verify-email`,
          },
          users: {
            profile: `GET /api/${env.API_VERSION}/users/profile`,
            updateProfile: `PUT /api/${env.API_VERSION}/users/profile`,
            stats: `GET /api/${env.API_VERSION}/users/stats`,
            referrals: `GET /api/${env.API_VERSION}/users/referrals`,
            notifications: `GET /api/${env.API_VERSION}/users/notifications`,
          },
          wallet: {
            balance: `GET /api/${env.API_VERSION}/wallet/balance`,
            transactions: `GET /api/${env.API_VERSION}/wallet/transactions`,
            bankAccounts: `GET /api/${env.API_VERSION}/wallet/bank-accounts`,
            addBankAccount: `POST /api/${env.API_VERSION}/wallet/bank-accounts`,
            withdraw: `POST /api/${env.API_VERSION}/wallet/withdraw`,
            withdrawals: `GET /api/${env.API_VERSION}/wallet/withdrawals`,
            limits: `GET /api/${env.API_VERSION}/wallet/limits`,
          },
          orders: {
            create: `POST /api/${env.API_VERSION}/orders`,
            list: `GET /api/${env.API_VERSION}/orders`,
            details: `GET /api/${env.API_VERSION}/orders/:id`,
            cancel: `PUT /api/${env.API_VERSION}/orders/:id/cancel`,
            tracking: `GET /api/${env.API_VERSION}/orders/:id/tracking`,
            dispute: `POST /api/${env.API_VERSION}/orders/:id/dispute`,
            stats: `GET /api/${env.API_VERSION}/orders/stats/summary`,
          },
          categories: {
            list: `GET /api/${env.API_VERSION}/categories`,
            details: `GET /api/${env.API_VERSION}/categories/:id`,
            search: `GET /api/${env.API_VERSION}/categories/search`,
            priceEstimate: `GET /api/${env.API_VERSION}/categories/price-estimate`,
          },
          upload: {
            images: `POST /api/${env.API_VERSION}/upload/images`,
            avatar: `POST /api/${env.API_VERSION}/upload/avatar`,
            bulk: `POST /api/${env.API_VERSION}/upload/bulk`,
            limits: `GET /api/${env.API_VERSION}/upload/limits`,
            stats: `GET /api/${env.API_VERSION}/upload/stats`,
          },
          webhooks: {
            kushki: `POST /api/${env.API_VERSION}/webhooks/kushki`,
            servientrega: `POST /api/${env.API_VERSION}/webhooks/servientrega`,
            health: `GET /api/${env.API_VERSION}/webhooks/health`,
            simulate: `POST /api/${env.API_VERSION}/webhooks/simulate/kushki`,
          },
        },
        notes: {
          authentication: "Endpoints protegidos requieren header: Authorization: Bearer <token>",
          rateLimit: "Rate limiting aplicado según el tipo de endpoint",
          testing: "Usar POST /api/v1/auth/mock-token para obtener token de prueba"
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // IMPORTANTE: El middleware de error 404 debe ir DESPUÉS de todas las rutas
    // No aplicar notFoundHandler aquí si hay rutas dinámicas
    
    // Middleware global de manejo de errores solamente
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Servidor iniciado en puerto ${port}`);
      logger.info(`Entorno: ${env.NODE_ENV}`);
      logger.info(`CORS habilitado para: ${env.CORS_ORIGIN}`);
      
      if (isDev) {
        logger.info(`Health check: http://localhost:${port}/health`);
        logger.info(`Documentación: http://localhost:${port}/api/docs`);
        logger.info(`API Status: http://localhost:${port}/api/${env.API_VERSION}/status`);
      }
    });
  }
}

export default App;