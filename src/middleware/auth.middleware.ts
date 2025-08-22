// import { Request, Response, NextFunction } from 'express';
// import { JwtUtils, JwtPayload } from '@/utils/jwt.utils';
// import { ResponseUtils } from '@/utils/response.utils';
// import { USER_ROLES, USER_STATUS, ERROR_MESSAGES } from '@/utils/constants';
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
//  * Middleware principal de autenticación
//  * Verifica el JWT y carga los datos del usuario
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

//     // Verificar el token
//     let payload: JwtPayload;
//     try {
//       payload = JwtUtils.verifyAccessToken(token);
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Token inválido';
//       ResponseUtils.unauthorized(res, message);
//       return;
//     }

//     // Buscar el usuario en la base de datos
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

//     // Verificar que el usuario esté activo
//     if (user.status !== USER_STATUS.ACTIVE) {
//       ResponseUtils.forbidden(res, 'Usuario inactivo o suspendido');
//       return;
//     }

//     // Verificar sesión si existe sessionId en el payload
//     if (payload.sessionId) {
//       const session = await prisma.userSession.findUnique({
//         where: { 
//           id: payload.sessionId,
//           userId: user.id,
//           isActive: true,
//         },
//       });

//       if (!session || session.expiresAt < new Date()) {
//         ResponseUtils.unauthorized(res, 'Sesión expirada o inválida');
//         return;
//       }
//     }

//     // Asignar usuario a la request
//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//       status: user.status,
//       isEmailVerified: user.isEmailVerified,
//       sessionId: payload.sessionId,
//     };

//     // Log de acceso exitoso
//     logger.info('User authenticated successfully', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//       userAgent: req.get('User-Agent'),
//       path: req.path,
//     });

//     next();
//   } catch (error) {
//     logger.error('Authentication error:', error);
//     ResponseUtils.error(res, 'Error de autenticación');
//   }
// };

// /**
//  * Middleware de autenticación opcional
//  * No falla si no hay token, pero lo verifica si existe
//  */
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
//  * Middleware para verificar roles específicos
//  */
// export const requireRole = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//       return;
//     }

//     if (!roles.includes(req.user.role)) {
//       ResponseUtils.forbidden(res, 'Permisos insuficientes para esta acción');
//       return;
//     }

//     next();
//   };
// };

// /**
//  * Middleware para verificar que el usuario sea admin
//  */
// export const requireAdmin = requireRole(USER_ROLES.ADMIN);

// /**
//  * Middleware para verificar que el usuario sea admin o moderador
//  */
// export const requireModerator = requireRole(USER_ROLES.ADMIN, USER_ROLES.MODERATOR);

// /**
//  * Middleware para verificar tipos de usuario específicos
//  */
// export const requireUserType = (...types: string[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//       return;
//     }

//     if (!types.includes(req.user.type)) {
//       ResponseUtils.forbidden(res, 'Tipo de usuario no autorizado para esta acción');
//       return;
//     }

//     next();
//   };
// };

// /**
//  * Middleware para verificar que el email esté verificado
//  */
// export const requireEmailVerified = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   if (!req.user) {
//     ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//     return;
//   }

//   if (!req.user.isEmailVerified) {
//     ResponseUtils.forbidden(res, 'Email no verificado. Revisa tu correo para verificar tu cuenta.');
//     return;
//   }

//   next();
// };

// /**
//  * Middleware para verificar ownership de recursos
//  * Verifica que el usuario sea dueño del recurso o sea admin
//  */
// export const requireOwnership = (userIdField: string = 'userId') => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     if (!req.user) {
//       ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//       return;
//     }

//     // Los admins pueden acceder a cualquier recurso
//     if (req.user.role === USER_ROLES.ADMIN) {
//       next();
//       return;
//     }

//     const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
//     if (!resourceUserId) {
//       ResponseUtils.forbidden(res, 'No se puede verificar la propiedad del recurso');
//       return;
//     }

//     if (req.user.id !== resourceUserId) {
//       ResponseUtils.forbidden(res, 'No tienes permisos para acceder a este recurso');
//       return;
//     }

//     next();
//   };
// };

// /**
//  * Middleware para verificar ownership dinámico
//  * Busca el recurso en la base de datos y verifica el owner
//  */
// export const requireResourceOwnership = (
//   model: string,
//   resourceIdParam: string = 'id',
//   ownerField: string = 'userId'
// ) => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     if (!req.user) {
//       ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//       return;
//     }

//     // Los admins pueden acceder a cualquier recurso
//     if (req.user.role === USER_ROLES.ADMIN) {
//       next();
//       return;
//     }

//     try {
//       const resourceId = req.params[resourceIdParam];
      
//       if (!resourceId) {
//         ResponseUtils.forbidden(res, 'ID de recurso requerido');
//         return;
//       }

//       // @ts-ignore - Prisma client dinámico
//       const resource = await prisma[model].findUnique({
//         where: { id: resourceId },
//         select: { [ownerField]: true },
//       });

//       if (!resource) {
//         ResponseUtils.notFound(res, 'Recurso no encontrado');
//         return;
//       }

//       if (resource[ownerField] !== req.user.id) {
//         ResponseUtils.forbidden(res, 'No tienes permisos para acceder a este recurso');
//         return;
//       }

//       next();
//     } catch (error) {
//       logger.error('Resource ownership verification error:', error);
//       ResponseUtils.error(res, 'Error verificando permisos');
//     }
//   };
// };

// /**
//  * Middleware para verificar que el usuario sea el propietario del perfil
//  */
// export const requireOwnProfile = (req: Request, res: Response, next: NextFunction): void => {
//   if (!req.user) {
//     ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//     return;
//   }

//   const profileUserId = req.params.userId || req.params.id;
  
//   // Los admins pueden acceder a cualquier perfil
//   if (req.user.role === USER_ROLES.ADMIN) {
//     next();
//     return;
//   }

//   if (req.user.id !== profileUserId) {
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





import { Request, Response, NextFunction } from 'express';
import { JwtUtils, JwtPayload } from '@/utils/jwt.utils';
import { ResponseUtils } from '@/utils/response.utils';
import { USER_ROLES, USER_STATUS, ERROR_MESSAGES } from '@/utils/constants';
import prisma from '@/config/database';
import logger from '@/config/logger';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  type: string;
  status: string;
  isEmailVerified: boolean;
  sessionId?: string;
}

/**
 * Middleware principal de autenticación
 * Verifica el JWT y carga los datos del usuario
 */
 const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      ResponseUtils.unauthorized(res, 'Token de acceso requerido');
      return;
    }

    // SOLO PARA TESTING - Token mock (REMOVER EN PRODUCCIÓN)
    if (token === 'mock-token-for-testing') {
      req.user = {
        id: 'test-user-123',
        email: 'test@example.com',
        role: 'USER',
        type: 'PERSON',
        status: 'ACTIVE',
        isEmailVerified: true
      };
      
      logger.info('Using mock token for testing', {
        userId: req.user.id,
        ip: req.ip,
        path: req.path,
      });
      
      next();
      return;
    }

    // Verificar el token
    let payload: JwtPayload;
    try {
      payload = JwtUtils.verifyAccessToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token inválido';
      ResponseUtils.unauthorized(res, message);
      return;
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        type: true,
        status: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.USER_NOT_FOUND);
      return;
    }

    // Verificar que el usuario esté activo
    if (user.status !== USER_STATUS.ACTIVE) {
      ResponseUtils.forbidden(res, 'Usuario inactivo o suspendido');
      return;
    }

    // Verificar sesión si existe sessionId en el payload
    if (payload.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { 
          id: payload.sessionId,
          userId: user.id,
          isActive: true,
        },
      });

      if (!session || session.expiresAt < new Date()) {
        ResponseUtils.unauthorized(res, 'Sesión expirada o inválida');
        return;
      }
    }

    // Asignar usuario a la request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      sessionId: payload.sessionId,
    };

    // Log de acceso exitoso
    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    ResponseUtils.error(res, 'Error de autenticación');
  }
};

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, pero lo verifica si existe
 */
 const optionalAuth = async (
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
 * Middleware para verificar roles específicos
 */
 const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtils.forbidden(res, 'Permisos insuficientes para esta acción');
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea admin
 */
 const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Middleware para verificar que el usuario sea admin o moderador
 */
 const requireModerator = requireRole(USER_ROLES.ADMIN, USER_ROLES.MODERATOR);

/**
 * Middleware para verificar tipos de usuario específicos
 */
 const requireUserType = (...types: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    if (!types.includes(req.user.type)) {
      ResponseUtils.forbidden(res, 'Tipo de usuario no autorizado para esta acción');
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar que el email esté verificado
 */
 const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  if (!req.user.isEmailVerified) {
    ResponseUtils.forbidden(res, 'Email no verificado. Revisa tu correo para verificar tu cuenta.');
    return;
  }

  next();
};

/**
 * Middleware para verificar ownership de recursos
 * Verifica que el usuario sea dueño del recurso o sea admin
 */
 const requireOwnership = (userIdField: string = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    // Los admins pueden acceder a cualquier recurso
    if (req.user.role === USER_ROLES.ADMIN) {
      next();
      return;
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (!resourceUserId) {
      ResponseUtils.forbidden(res, 'No se puede verificar la propiedad del recurso');
      return;
    }

    if (req.user.id !== resourceUserId) {
      ResponseUtils.forbidden(res, 'No tienes permisos para acceder a este recurso');
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar ownership dinámico
 * Busca el recurso en la base de datos y verifica el owner
 */
 const requireResourceOwnership = (
  model: string,
  resourceIdParam: string = 'id',
  ownerField: string = 'userId'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    // Los admins pueden acceder a cualquier recurso
    if (req.user.role === USER_ROLES.ADMIN) {
      next();
      return;
    }

    try {
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        ResponseUtils.forbidden(res, 'ID de recurso requerido');
        return;
      }

      // @ts-ignore - Prisma client dinámico
      const resource = await prisma[model].findUnique({
        where: { id: resourceId },
        select: { [ownerField]: true },
      });

      if (!resource) {
        ResponseUtils.notFound(res, 'Recurso no encontrado');
        return;
      }

      if (resource[ownerField] !== req.user.id) {
        ResponseUtils.forbidden(res, 'No tienes permisos para acceder a este recurso');
        return;
      }

      next();
    } catch (error) {
      logger.error('Resource ownership verification error:', error);
      ResponseUtils.error(res, 'Error verificando permisos');
    }
  };
};

/**
 * Middleware para verificar que el usuario sea el propietario del perfil
 */
 const requireOwnProfile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    return;
  }

  const profileUserId = req.params.userId || req.params.id;
  
  // Los admins pueden acceder a cualquier perfil
  if (req.user.role === USER_ROLES.ADMIN) {
    next();
    return;
  }

  if (req.user.id !== profileUserId) {
    ResponseUtils.forbidden(res, 'Solo puedes acceder a tu propio perfil');
    return;
  }

  next();
};

/**
 * Middleware combinado: autenticar + verificar email
 */
 const authenticateAndVerifyEmail = [authenticate, requireEmailVerified];

/**
 * Middleware combinado: autenticar + verificar admin
 */
const authenticateAdmin = [authenticate, requireAdmin];

/**
 * Middleware combinado: autenticar + verificar moderador
 */
const authenticateModerator = [authenticate, requireModerator];

// Exportar todas las funciones individualmente para mayor flexibilidad
export {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireModerator,
  requireUserType,
  requireEmailVerified,
  requireResourceOwnership,
  requireOwnProfile,
  authenticateAndVerifyEmail,
  requireOwnership
};