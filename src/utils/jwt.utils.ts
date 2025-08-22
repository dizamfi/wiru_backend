import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';

export interface JwtPayload {
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
  static generateAccessToken(payload: JwtPayload): string {
    const tokenData = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: payload.type,
      sessionId: payload.sessionId,
    };

    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'wiru-backend',
      audience: 'wiru-app',
    };

    return jwt.sign(tokenData, env.JWT_SECRET, options);
  }

  /**
   * Generar refresh token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, 'sessionId'>): string {
    const tokenData = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: payload.type,
    };

    const options: SignOptions = {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'wiru-backend',
      audience: 'wiru-app',
    };

    return jwt.sign(tokenData, env.REFRESH_TOKEN_SECRET, options);
  }

  /**
   * Generar par de tokens (access + refresh)
   */
  static generateTokenPair(payload: JwtPayload): TokenPair {
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
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET, {
        issuer: 'wiru-backend',
        audience: 'wiru-app',
      }) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      throw new Error('Error al verificar token');
    }
  }

  /**
   * Verificar refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
        issuer: 'wiru-backend',
        audience: 'wiru-app',
      }) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      }
      throw new Error('Error al verificar refresh token');
    }
  }

  /**
   * Decodificar token sin verificar (para obtener información)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar si el token está por expirar (próximos 5 minutos)
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      // Si expira en menos de 5 minutos (300 segundos)
      return timeUntilExpiry < 300;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extraer token del header Authorization
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      return null;
    }
    
    return token;
  }
}