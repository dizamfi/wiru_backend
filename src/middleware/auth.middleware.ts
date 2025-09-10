// import { Request, Response, NextFunction } from 'express';
// import { JwtUtils, JwtPayload } from '@/utils/jwt.utils';
// import { ResponseUtils } from '@/utils/response.utils';
// import { USER_ROLES, USER_STATUS, ERROR_MESSAGES } from '@/utils/constants';
// import { TokenBlacklistService } from '@/services/tokenBlacklist.service';
// import prisma from '@/config/database';
// import logger from '@/config/logger';

// export interface AuthUser {
//   id: string;
//   email: string;
//   role: string;
//   type: string;
//   status: string;
//   isEmailVerified: boolean;
//   sessionId?: string;
// }

// /**
//  * Middleware principal de autenticación con validación de blacklist
//  */
// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     // Extraer token del header Authorization
//     const authHeader = req.headers.authorization;
//     const token = JwtUtils.extractTokenFromHeader(authHeader);

//     if (!token) {
//       ResponseUtils.unauthorized(res, 'Token de acceso requerido');
//       return;
//     }

//     // SOLO PARA TESTING - Token mock (REMOVER EN PRODUCCIÓN)
//     if (token === 'mock-token-for-testing') {
//       req.user = {
//         id: 'test-user-123',
//         email: 'test@example.com',
//         role: 'USER',
//         type: 'PERSON',
//         status: 'ACTIVE',
//         isEmailVerified: true
//       };
      
//       logger.info('Using mock token for testing', {
//         userId: req.user.id,
//         ip: req.ip,
//         path: req.path,
//       });
      
//       next();
//       return;
//     }

//     // 1. Verificar si el token está en la blacklist
//     const isBlacklisted = await TokenBlacklistService.isTokenBlacklisted(token);
//     if (isBlacklisted) {
//       ResponseUtils.unauthorized(res, 'Token revocado');
//       return;
//     }

//     // 2. Verificar el token JWT
//     let payload: JwtPayload;
//     try {
//       payload = JwtUtils.verifyAccessToken(token);
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Token inválido';
//       ResponseUtils.unauthorized(res, message);
//       return;
//     }

//     // 3. Buscar el usuario en la base de datos
//     const user = await prisma.user.findUnique({
//       where: { id: payload.userId },
//       select: {
//         id: true,
//         email: true,
//         role: true,
//         type: true,
//         status: true,
//         isEmailVerified: true,
//       },
//     });

//     if (!user) {
//       ResponseUtils.unauthorized(res, ERROR_MESSAGES.USER_NOT_FOUND);
//       return;
//     }

//     // 4. Verificar que el usuario esté activo
//     if (user.status !== USER_STATUS.ACTIVE) {
//       // Si el usuario está inactivo, agregar el token a la blacklist
//       await TokenBlacklistService.addToBlacklist(
//         token, 
//         user.id, 
//         `Usuario inactivo: ${user.status}`
//       );
      
//       ResponseUtils.forbidden(res, 'Usuario inactivo o suspendido');
//       return;
//     }

//     // 5. Asignar usuario a la request
//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//       status: user.status,
//       isEmailVerified: user.isEmailVerified,
//       sessionId: payload.sessionId,
//     };

//     // Log de autenticación exitosa (solo en desarrollo)
//     if (process.env.NODE_ENV === 'development') {
//       logger.debug('User authenticated successfully', {
//         userId: user.id,
//         email: user.email,
//         role: user.role,
//         ip: req.ip,
//         userAgent: req.get('User-Agent'),
//         path: req.path,
//       });
//     }

//     next();

//   } catch (error) {
//     logger.error('Authentication error', {
//       error: error instanceof Error ? error.message : error,
//       ip: req.ip,
//       userAgent: req.get('User-Agent'),
//       path: req.path,
//     });

//     ResponseUtils.unauthorized(res, 'Error de autenticación');
//   }
// };

// /**
//  * Middleware para verificar que el email esté verificado
//  */
// export const requireEmailVerified = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const user = req.user as AuthUser;

//   if (!user) {
//     ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//     return;
//   }

//   if (!user.isEmailVerified) {
//     ResponseUtils.forbidden(res, 'Email no verificado. Por favor verifica tu email antes de continuar.');
//     return;
//   }

//   next();
// };

// /**
//  * Middleware para verificar rol de administrador
//  */
// export const requireAdmin = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const user = req.user as AuthUser;

//   if (!user) {
//     ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//     return;
//   }

//   if (user.role !== USER_ROLES.ADMIN) {
//     ResponseUtils.forbidden(res, 'Acceso denegado. Se requieren permisos de administrador.');
//     return;
//   }

//   next();
// };

// /**
//  * Middleware para verificar rol de moderador o superior
//  */
// export const requireModerator = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const user = req.user as AuthUser;

//   if (!user) {
//     ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//     return;
//   }

//   if (![USER_ROLES.ADMIN, USER_ROLES.MODERATOR, USER_ROLES.USER].includes(user.role as typeof USER_ROLES[keyof typeof USER_ROLES])) {
//     ResponseUtils.forbidden(res, 'Acceso denegado. Se requieren permisos de moderador o superior.');
//     return;
//   }

//   next();
// };

// export const optionalAuth = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = JwtUtils.extractTokenFromHeader(authHeader);

//     // Si no hay token, continuar sin autenticación
//     if (!token) {
//       next();
//       return;
//     }

//     // Si hay token, intentar autenticar
//     await authenticate(req, res, next);
//   } catch (error) {
//     // En caso de error, continuar sin autenticación
//     logger.warn('Optional authentication failed:', error);
//     next();
//   }
// };

// /**
//  * Middleware para verificar acceso a perfil propio
//  */
// export const requireOwnProfile = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const user = req.user as AuthUser;

//   if (!user) {
//     ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//     return;
//   }

//   const profileUserId = req.params.userId || req.params.id;
  
//   // Los admins pueden acceder a cualquier perfil
//   if (user.role === USER_ROLES.ADMIN) {
//     next();
//     return;
//   }

//   if (user.id !== profileUserId) {
//     ResponseUtils.forbidden(res, 'Solo puedes acceder a tu propio perfil');
//     return;
//   }

//   next();
// };

// /**
//  * Middleware combinado: autenticar + verificar email
//  */
// export const authenticateAndVerifyEmail = [authenticate, requireEmailVerified];

// /**
//  * Middleware combinado: autenticar + verificar admin
//  */
// export const authenticateAdmin = [authenticate, requireAdmin];

// /**
//  * Middleware combinado: autenticar + verificar moderador
//  */
// export const authenticateModerator = [authenticate, requireModerator];













// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '@/utils/jwt.utils';
import { ResponseUtils } from '@/utils/response.utils';
import prisma from '@/config/database';
import logger from '@/config/logger';

// Constantes
const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado. Acceso denegado.',
  TOKEN_MISSING: 'Token de acceso requerido',
  TOKEN_INVALID: 'Token de acceso inválido',
  TOKEN_EXPIRED: 'Token de acceso expirado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_INACTIVE: 'Usuario inactivo',
  USER_SUSPENDED: 'Usuario suspendido',
  EMAIL_NOT_VERIFIED: 'Email no verificado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
};

// Tipos extendidos
interface AuthUser {
  id: string;
  email: string;
  role: string;
  type: string;
  status: string;
  isEmailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware principal de autenticación
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 Authenticating request...');
    
    // Extraer token del header
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      console.log('❌ No token provided');
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.TOKEN_MISSING);
      return;
    }

    // Verificar formato del token
    if (!JwtUtils.isValidJwtFormat(token)) {
      console.log('❌ Invalid token format');
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.TOKEN_INVALID);
      return;
    }

    // Verificar si el token está en blacklist
    const isBlacklisted = await JwtUtils.isTokenBlacklisted(token);
    if (isBlacklisted) {
      console.log('❌ Token is blacklisted');
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.TOKEN_INVALID);
      return;
    }

    let decoded;
    try {
      // Verificar y decodificar el token
      decoded = JwtUtils.verifyAccessToken(token);
      console.log('✅ Token verified successfully');
    } catch (error: any) {
      console.log('❌ Token verification failed:', error.message);
      
      if (error.message === 'Token expirado') {
        ResponseUtils.unauthorized(res, ERROR_MESSAGES.TOKEN_EXPIRED);
      } else {
        ResponseUtils.unauthorized(res, ERROR_MESSAGES.TOKEN_INVALID);
      }
      return;
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        type: true,
        status: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      console.log('❌ User not found:', decoded.userId);
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.USER_NOT_FOUND);
      return;
    }

    // Verificar estado del usuario
    if (user.status === 'INACTIVE') {
      console.log('❌ User is inactive:', user.email);
      ResponseUtils.forbidden(res, ERROR_MESSAGES.USER_INACTIVE);
      return;
    }

    if (user.status === 'SUSPENDED') {
      console.log('❌ User is suspended:', user.email);
      ResponseUtils.forbidden(res, ERROR_MESSAGES.USER_SUSPENDED);
      return;
    }

    // Agregar usuario a la request
    req.user = user as AuthUser;
    
    console.log('✅ User authenticated:', user.email);
    
    // Log de actividad
    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    logger.error('Authentication middleware error:', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      path: req.path,
    });

    ResponseUtils.error(res, 'Error interno de autenticación', 500);
  }
};

/**
 * Middleware para verificar que el email esté verificado
 */
export const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as AuthUser;

  if (!user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  if (!user.isEmailVerified) {
    ResponseUtils.forbidden(res, ERROR_MESSAGES.EMAIL_NOT_VERIFIED + 
      ' Por favor verifica tu email antes de continuar.');
    return;
  }

  next();
};

/**
 * Middleware para verificar rol de administrador
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as AuthUser;

  if (!user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  if (user.role !== USER_ROLES.ADMIN) {
    ResponseUtils.forbidden(res, 'Acceso denegado. Se requieren permisos de administrador.');
    return;
  }

  next();
};

/**
 * Middleware para verificar rol de moderador o superior
 */
export const requireModerator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as AuthUser;

  if (!user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.MODERATOR];
  if (!allowedRoles.includes(user.role as any)) {
    ResponseUtils.forbidden(res, 'Acceso denegado. Se requieren permisos de moderador o superior.');
    return;
  }

  next();
};

/**
 * Middleware para verificar múltiples roles
 */
export const requireRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as AuthUser;

    if (!user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    if (!roles.includes(user.role)) {
      ResponseUtils.forbidden(res, ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar tipos de usuario específicos
 */
export const requireUserType = (...types: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as AuthUser;

    if (!user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    if (!types.includes(user.type)) {
      ResponseUtils.forbidden(res, 'Tipo de usuario no autorizado para esta acción');
      return;
    }

    next();
  };
};

/**
 * Middleware de autenticación opcional (no falla si no hay token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    // Si no hay token, continuar sin autenticación
    if (!token) {
      next();
      return;
    }

    // Si hay token, intentar autenticar
    await authenticate(req, res, next);
  } catch (error) {
    // En caso de error, continuar sin autenticación
    logger.warn('Optional authentication failed:', error);
    next();
  }
};

/**
 * Middleware para verificar acceso a perfil propio
 */
export const requireOwnProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as AuthUser;

  if (!user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  const profileUserId = req.params.userId || req.params.id;
  
  // Los admins pueden acceder a cualquier perfil
  if (user.role === USER_ROLES.ADMIN) {
    next();
    return;
  }

  if (user.id !== profileUserId) {
    ResponseUtils.forbidden(res, 'Solo puedes acceder a tu propio perfil');
    return;
  }

  next();
};

/**
 * Middleware para verificar que el usuario está activo
 */
export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user as AuthUser;

  if (!user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  if (user.status !== 'ACTIVE') {
    let message = 'Tu cuenta no está activa.';
    
    switch (user.status) {
      case 'PENDING_VERIFICATION':
        message = 'Tu cuenta está pendiente de verificación. Revisa tu email.';
        break;
      case 'SUSPENDED':
        message = 'Tu cuenta ha sido suspendida. Contacta al soporte.';
        break;
      case 'INACTIVE':
        message = 'Tu cuenta está inactiva. Contacta al soporte.';
        break;
    }

    ResponseUtils.forbidden(res, message);
    return;
  }

  next();
};

// Middlewares combinados para uso común
export const authenticateAndVerifyEmail = [authenticate, requireEmailVerified];
export const authenticateAdmin = [authenticate, requireAdmin];
export const authenticateModerator = [authenticate, requireModerator];
export const authenticateActiveUser = [authenticate, requireActiveUser];
export const authenticateOwner = [authenticate, requireOwnProfile];