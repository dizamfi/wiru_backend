import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RATE_LIMITS } from '@/utils/constants';
import { ResponseUtils } from '@/utils/response.utils';
import logger from '@/config/logger';

/**
 * Función para crear mensajes de error personalizados
 */
const createRateLimitMessage = (windowMs: number, max: number): string => {
  const minutes = Math.ceil(windowMs / (1000 * 60));
  return `Demasiadas solicitudes. Máximo ${max} intentos cada ${minutes} minuto(s). Intenta nuevamente más tarde.`;
};

/**
 * Handler personalizado para rate limit
 */
const rateLimitHandler = (windowMs: number, max: number) => {
  return (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
    });

    return ResponseUtils.error(
      res,
      createRateLimitMessage(windowMs, max),
      429
    );
  };
};

/**
 * Función para generar clave de rate limit personalizada
 */
const generateKey = (req: Request): string => {
  // Si el usuario está autenticado, usar su ID
  if ((req as any).user?.id) {
    return `user:${(req as any).user.id}`;
  }
  
  // Para IPv6, usar solo la IP sin procesar User-Agent
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Normalizar IPv6 (remover ::ffff: prefix si existe)
  const normalizedIp = ip.replace(/^::ffff:/, '');
  
  return `ip:${normalizedIp}`;
};

/**
 * Rate limiter general para toda la aplicación
 */
export const generalRateLimit = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: createRateLimitMessage(RATE_LIMITS.GENERAL.windowMs, RATE_LIMITS.GENERAL.max),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Usar generador de clave por defecto para evitar problemas IPv6
  handler: rateLimitHandler(RATE_LIMITS.GENERAL.windowMs, RATE_LIMITS.GENERAL.max),
  skip: (req) => {
    // Skip rate limiting para rutas de health check
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Rate limiter estricto para autenticación
 */
export const authRateLimit = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: createRateLimitMessage(RATE_LIMITS.AUTH.windowMs, RATE_LIMITS.AUTH.max),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(RATE_LIMITS.AUTH.windowMs, RATE_LIMITS.AUTH.max),
  skipSuccessfulRequests: true, // No contar requests exitosos
});

/**
 * Rate limiter para uploads de archivos
 */
export const uploadRateLimit = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.max,
  message: createRateLimitMessage(RATE_LIMITS.UPLOAD.windowMs, RATE_LIMITS.UPLOAD.max),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(RATE_LIMITS.UPLOAD.windowMs, RATE_LIMITS.UPLOAD.max),
});

/**
 * Rate limiter para APIs de billetera (más restrictivo)
 */
export const walletRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // Máximo 10 operaciones de billetera cada 5 minutos
  message: createRateLimitMessage(5 * 60 * 1000, 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(5 * 60 * 1000, 10),
});

/**
 * Rate limiter para retiros (muy restrictivo)
 */
export const withdrawalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 retiros cada 15 minutos
  message: 'Demasiados intentos de retiro. Máximo 3 retiros cada 15 minutos por seguridad.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(15 * 60 * 1000, 3),
});

/**
 * Rate limiter para cambio de contraseña
 */
export const passwordChangeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 cambios de contraseña por hora
  message: 'Demasiados cambios de contraseña. Máximo 3 intentos por hora.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(60 * 60 * 1000, 3),
});

/**
 * Rate limiter para verificación de email
 */
export const emailVerificationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // Máximo 3 envíos de verificación cada 5 minutos
  message: 'Demasiadas solicitudes de verificación. Máximo 3 intentos cada 5 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(5 * 60 * 1000, 3),
});

/**
 * Rate limiter para reset de contraseña
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 solicitudes de reset cada 15 minutos
  message: 'Demasiadas solicitudes de restablecimiento. Máximo 3 intentos cada 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(15 * 60 * 1000, 3),
});

// Rate limiting específico para categories (muy permisivo temporalmente)
export const categoriesRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 min en prod
  max:  50, // 10000 en dev, 50 en prod
  message: {
    error: 'Demasiadas solicitudes a categorías',
    retryAfter: 'Intenta nuevamente más tarde'
  },
});

/**
 * Rate limiter flexible para crear órdenes
 */
export const orderCreationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // Máximo 5 órdenes cada 10 minutos
  message: 'Demasiadas órdenes creadas. Máximo 5 órdenes cada 10 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: generateKey,
  handler: rateLimitHandler(10 * 60 * 1000, 5),
});

/**
 * Rate limiter para webhooks externos
 */
export const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 webhooks por minuto
  message: 'Demasiados webhooks. Máximo 30 por minuto.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Para webhooks, usar la IP y el path específico
    return `webhook:${req.ip}:${req.path}`;
  },
  handler: rateLimitHandler(1 * 60 * 1000, 30),
});

/**
 * Función helper para crear rate limiters personalizados
 */
export const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skip?: (req: Request) => boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || createRateLimitMessage(options.windowMs, options.max),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || generateKey,
    handler: rateLimitHandler(options.windowMs, options.max),
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skip: options.skip,
  });
};