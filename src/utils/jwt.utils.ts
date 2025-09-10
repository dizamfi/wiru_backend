// import jwt, { SignOptions } from 'jsonwebtoken';
// import { env } from '@/config/env';

// export interface JwtPayload {
//   userId: string;
//   email: string;
//   role: string;
//   type?: string;
//   sessionId?: string;
// }

// export interface TokenPair {
//   accessToken: string;
//   refreshToken: string;
// }

// export class JwtUtils {
//   /**
//    * Generar access token
//    */
//   static generateAccessToken(payload: JwtPayload): string {
//     const tokenData = {
//       userId: payload.userId,
//       email: payload.email,
//       role: payload.role,
//       type: payload.type,
//       sessionId: payload.sessionId,
//     };

//     const options: SignOptions = {
//       expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
//       issuer: 'wiru-backend',
//       audience: 'wiru-app',
//     };

//     return jwt.sign(tokenData, env.JWT_SECRET, options);
//   }

//   /**
//    * Generar refresh token
//    */
//   static generateRefreshToken(payload: Omit<JwtPayload, 'sessionId'>): string {
//     const tokenData = {
//       userId: payload.userId,
//       email: payload.email,
//       role: payload.role,
//       type: payload.type,
//     };

//     const options: SignOptions = {
//       expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
//       issuer: 'wiru-backend',
//       audience: 'wiru-app',
//     };

//     return jwt.sign(tokenData, env.REFRESH_TOKEN_SECRET, options);
//   }

//   /**
//    * Generar par de tokens (access + refresh)
//    */
//   static generateTokenPair(payload: JwtPayload): TokenPair {
//     const accessToken = this.generateAccessToken(payload);
//     const refreshToken = this.generateRefreshToken(payload);

//     return {
//       accessToken,
//       refreshToken,
//     };
//   }

//   /**
//    * Verificar access token
//    */
//   static verifyAccessToken(token: string): JwtPayload {
//     try {
//       return jwt.verify(token, env.JWT_SECRET, {
//         issuer: 'wiru-backend',
//         audience: 'wiru-app',
//       }) as JwtPayload;
//     } catch (error) {
//       if (error instanceof jwt.TokenExpiredError) {
//         throw new Error('Token expirado');
//       }
//       if (error instanceof jwt.JsonWebTokenError) {
//         throw new Error('Token inválido');
//       }
//       throw new Error('Error al verificar token');
//     }
//   }

//   /**
//    * Verificar refresh token
//    */
//   static verifyRefreshToken(token: string): JwtPayload {
//     try {
//       return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
//         issuer: 'wiru-backend',
//         audience: 'wiru-app',
//       }) as JwtPayload;
//     } catch (error) {
//       if (error instanceof jwt.TokenExpiredError) {
//         throw new Error('Refresh token expirado');
//       }
//       if (error instanceof jwt.JsonWebTokenError) {
//         throw new Error('Refresh token inválido');
//       }
//       throw new Error('Error al verificar refresh token');
//     }
//   }

//   /**
//    * Decodificar token sin verificar (para obtener información)
//    */
//   static decodeToken(token: string): JwtPayload | null {
//     try {
//       return jwt.decode(token) as JwtPayload;
//     } catch (error) {
//       return null;
//     }
//   }

//   /**
//    * Verificar si el token está por expirar (próximos 5 minutos)
//    */
//   static isTokenExpiringSoon(token: string): boolean {
//     try {
//       const decoded = jwt.decode(token) as any;
//       if (!decoded || !decoded.exp) return true;

//       const now = Math.floor(Date.now() / 1000);
//       const timeUntilExpiry = decoded.exp - now;
      
//       // Si expira en menos de 5 minutos (300 segundos)
//       return timeUntilExpiry < 300;
//     } catch (error) {
//       return true;
//     }
//   }

//   /**
//    * Extraer token del header Authorization
//    */
//   static extractTokenFromHeader(authHeader?: string): string | null {
//     if (!authHeader) return null;
    
//     const [bearer, token] = authHeader.split(' ');
    
//     if (bearer !== 'Bearer' || !token) {
//       return null;
//     }
    
//     return token;
//   }
// }




// src/utils/jwt.utils.ts
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '@/config/env';

export interface WiruJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  type?: string;
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtUtils {
  /**
   * Generar access token
   */
  static generateAccessToken(payload: WiruJwtPayload): string {
    const tokenData = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: payload.type || 'access',
      sessionId: payload.sessionId,
    };

    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'wiru-backend',
      audience: 'wiru-app',
      subject: payload.userId,
    };

    return jwt.sign(tokenData, env.JWT_SECRET, options);
  }

  /**
   * Generar refresh token
   */
  static generateRefreshToken(payload: Omit<WiruJwtPayload, 'sessionId'>): string {
    const tokenData = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'wiru-backend',
      audience: 'wiru-app',
      subject: payload.userId,
    };

    return jwt.sign(tokenData, env.REFRESH_TOKEN_SECRET, options);
  }

  /**
   * Generar par de tokens (access + refresh)
   */
  static generateTokenPair(payload: WiruJwtPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verificar access token
   */
  static verifyAccessToken(token: string): WiruJwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'wiru-backend',
        audience: 'wiru-app',
      }) as WiruJwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new Error('Token no válido aún');
      }
      throw new Error('Error al verificar token');
    }
  }

  /**
   * Verificar refresh token
   */
  static verifyRefreshToken(token: string): WiruJwtPayload {
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
        issuer: 'wiru-backend',
        audience: 'wiru-app',
      }) as WiruJwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new Error('Refresh token no válido aún');
      }
      throw new Error('Error al verificar refresh token');
    }
  }

  /**
   * Extraer token del header Authorization
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Decodificar token sin verificar (para obtener información del payload)
   */
  static decodeToken(token: string): WiruJwtPayload | null {
    try {
      return jwt.decode(token) as WiruJwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar si un token está expirado sin verificar la firma
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtener tiempo restante de un token (en segundos)
   */
  static getTokenTimeToLive(token: string): number {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.exp) return 0;
      
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - now);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Crear hash SHA256 del token (para blacklist)
   */
  static hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verificar si el token está en la blacklist
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { default: prisma } = await import('@/config/database');
      
      const tokenHash = this.hashToken(token);
      
      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { tokenHash },
      });
      
      return !!blacklistedToken;
    } catch (error) {
      // En caso de error, asumir que no está en blacklist
      return false;
    }
  }

  /**
   * Agregar token a la blacklist
   */
  static async blacklistToken(token: string, userId: string, reason: string): Promise<void> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { default: prisma } = await import('@/config/database');
      
      const tokenHash = this.hashToken(token);
      const decoded = this.decodeToken(token);
      
      if (!decoded?.exp) {
        throw new Error('No se puede obtener la fecha de expiración del token');
      }
      
      await prisma.tokenBlacklist.create({
        data: {
          tokenHash,
          userId,
          expiresAt: new Date(decoded.exp * 1000),
          reason,
        },
      });
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
      throw error;
    }
  }

  /**
   * Generar token para verificación de email o reset de password
   */
  static generateVerificationToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validar formato básico de JWT sin verificar
   */
  static isValidJwtFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }
}