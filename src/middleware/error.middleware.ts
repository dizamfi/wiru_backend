import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ResponseUtils } from '@/utils/response.utils';
import { ERROR_MESSAGES } from '@/utils/constants';
import { isDev } from '@/config/env';
import logger from '@/config/logger';

// Tipos de errores personalizados
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_ERROR, errors?: Record<string, string[]>) {
    super(message, 400, true, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual del recurso') {
    super(message, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes') {
    super(message, 429);
  }
}

/**
 * Maneja errores de Prisma específicos
 */
const handlePrismaError = (error: PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Violación de restricción única
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field?.[0] || 'campo';
      return new ConflictError(`El ${fieldName} ya está en uso`);

    case 'P2014':
      // Violación de relación requerida
      return new ValidationError('Relación requerida faltante');

    case 'P2003':
      // Violación de clave foránea
      return new ValidationError('Referencia a recurso inválida');

    case 'P2025':
      // Registro no encontrado
      return new NotFoundError('Recurso no encontrado');

    case 'P2016':
      // Error de interpretación de query
      return new ValidationError('Consulta inválida');

    case 'P2021':
      // Tabla no existe
      return new AppError('Error de configuración de base de datos', 500);

    default:
      return new AppError('Error de base de datos', 500);
  }
};

/**
 * Maneja errores de validación de Joi/Zod
 */
const handleValidationError = (error: any): AppError => {
  const errors: Record<string, string[]> = {};
  
  if (error.details) {
    // Error de Joi
    error.details.forEach((detail: any) => {
      const path = detail.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(detail.message);
    });
  } else if (error.errors) {
    // Error de Zod
    error.errors.forEach((err: any) => {
      const path = err.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });
  }

  return new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, errors);
};

/**
 * Maneja errores de JWT
 */
const handleJWTError = (error: Error): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError(ERROR_MESSAGES.INVALID_TOKEN);
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError(ERROR_MESSAGES.TOKEN_EXPIRED);
  }
  return new AuthenticationError('Error de autenticación');
};

/**
 * Maneja errores de multer (upload de archivos)
 */
const handleMulterError = (error: any): AppError => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new ValidationError('El archivo es demasiado grande');
    case 'LIMIT_FILE_COUNT':
      return new ValidationError('Demasiados archivos');
    case 'LIMIT_UNEXPECTED_FILE':
      return new ValidationError('Campo de archivo inesperado');
    default:
      return new ValidationError('Error al procesar archivo');
  }
};

/**
 * Middleware para capturar errores 404 (rutas no encontradas)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Log del error original
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Convertir diferentes tipos de errores a AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof PrismaClientValidationError) {
    appError = new ValidationError('Datos de entrada inválidos');
  } else if (error.name === 'ValidationError' || error.name === 'ZodError') {
    appError = handleValidationError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    appError = handleJWTError(error);
  } else if (error.name === 'MulterError') {
    appError = handleMulterError(error);
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    appError = new ValidationError('JSON inválido en el cuerpo de la petición');
  } else {
    // Error genérico no manejado
    appError = new AppError(
      isDev ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      500,
      false
    );
  }

  // Enviar respuesta de error
  const response: any = {
    success: false,
    message: appError.message,
    timestamp: new Date().toISOString(),
  };

  // Agregar errores de validación si existen
  if (appError.errors) {
    response.errors = appError.errors;
  }

  // Agregar stack trace en desarrollo
  if (isDev && !appError.isOperational) {
    response.stack = error.stack;
  }

  // Log adicional para errores críticos
  if (!appError.isOperational) {
    logger.error('Critical error (non-operational):', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  res.status(appError.statusCode).json(response);
};

/**
 * Middleware para manejar promesas rechazadas no capturadas
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Función helper para crear errores específicos
 */
export const createError = {
  validation: (message?: string, errors?: Record<string, string[]>) => 
    new ValidationError(message, errors),
  
  authentication: (message?: string) => 
    new AuthenticationError(message),
  
  authorization: (message?: string) => 
    new AuthorizationError(message),
  
  notFound: (message?: string) => 
    new NotFoundError(message),
  
  conflict: (message?: string) => 
    new ConflictError(message),
  
  tooManyRequests: (message?: string) => 
    new TooManyRequestsError(message),
  
  internal: (message?: string) => 
    new AppError(message || ERROR_MESSAGES.INTERNAL_ERROR, 500),
};

/**
 * Función para manejar errores async/await sin try/catch
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};