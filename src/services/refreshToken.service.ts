import { randomBytes } from 'crypto';
import prisma from '@/config/database';
import { JwtUtils } from '@/utils/jwt.utils';
import { env } from '@/config/env';
import logger from '@/config/logger';

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

export class RefreshTokenService {
  /**
   * Generar un refresh token único
   */
  private static generateUniqueToken(): string {
    return randomBytes(40).toString('hex');
  }

  /**
   * Crear nuevo refresh token en la base de datos
   */
  static async createRefreshToken(userId: string): Promise<RefreshTokenData> {
    // Limpiar tokens expirados del usuario
    await this.cleanupExpiredTokens(userId);

    // Calcular fecha de expiración
    const expiresAt = new Date();
    const expirationDays = parseInt(env.REFRESH_TOKEN_EXPIRES_IN.replace('d', '')) || 30;
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Generar token único
    const token = this.generateUniqueToken();

    // Crear en la base de datos
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    logger.info('Refresh token created', {
      userId,
      tokenId: refreshToken.id,
      expiresAt,
    });

    return refreshToken;
  }

  /**
   * Validar refresh token
   */
  static async validateRefreshToken(token: string): Promise<RefreshTokenData | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { 
        token,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            type: true,
            status: true,
          },
        },
      },
    });

    if (!refreshToken) {
      logger.warn('Invalid refresh token attempted', { 
        token: token.substring(0, 10) + '...' 
      });
      return null;
    }

    // Verificar si ha expirado
    if (refreshToken.expiresAt < new Date()) {
      logger.warn('Expired refresh token attempted', {
        userId: refreshToken.userId,
        tokenId: refreshToken.id,
      });
      
      // Marcar como inactivo
      await this.revokeRefreshToken(token);
      return null;
    }

    // Verificar que el usuario esté activo
    if (refreshToken.user.status !== 'ACTIVE') {
      logger.warn('Refresh token used by inactive user', {
        userId: refreshToken.userId,
        userStatus: refreshToken.user.status,
      });
      return null;
    }

    return refreshToken;
  }

  /**
   * Rotar refresh token (invalidar el actual y crear uno nuevo)
   */
  static async rotateRefreshToken(oldToken: string): Promise<{
    refreshTokenData: RefreshTokenData;
    accessToken: string;
    newRefreshToken: string;
  } | null> {
    const refreshTokenData = await this.validateRefreshToken(oldToken);
    
    if (!refreshTokenData) {
      return null;
    }

    try {
      // Usar transacción para asegurar consistencia
      const result = await prisma.$transaction(async (tx) => {
        // 1. Revocar token actual
        await tx.refreshToken.update({
          where: { token: oldToken },
          data: { isActive: false },
        });

        // 2. Crear nuevo refresh token
        const newRefreshTokenData = await tx.refreshToken.create({
          data: {
            token: this.generateUniqueToken(),
            userId: refreshTokenData.userId,
            expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días
          },
        });

        // 3. Obtener datos del usuario para el access token
        const user = await tx.user.findUnique({
          where: { id: refreshTokenData.userId },
          select: {
            id: true,
            email: true,
            role: true,
            type: true,
          },
        });

        if (!user) {
          throw new Error('Usuario no encontrado durante rotación');
        }

        // 4. Generar nuevo access token
        const accessToken = JwtUtils.generateAccessToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          type: user.type,
        });

        return {
          refreshTokenData: newRefreshTokenData,
          accessToken,
          newRefreshToken: newRefreshTokenData.token,
        };
      });

      logger.info('Refresh token rotated successfully', {
        userId: refreshTokenData.userId,
        oldTokenId: refreshTokenData.id,
        newTokenId: result.refreshTokenData.id,
      });

      return result;

    } catch (error) {
      logger.error('Error rotating refresh token', {
        error: error instanceof Error ? error.message : error,
        userId: refreshTokenData.userId,
      });
      
      return null;
    }
  }

  /**
   * Revocar refresh token específico
   */
  static async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      const result = await prisma.refreshToken.updateMany({
        where: { 
          token,
          isActive: true,
        },
        data: { 
          isActive: false,
        },
      });

      if (result.count > 0) {
        logger.info('Refresh token revoked', { 
          token: token.substring(0, 10) + '...' 
        });
      }

      return result.count > 0;
    } catch (error) {
      logger.error('Error revoking refresh token', {
        error: error instanceof Error ? error.message : error,
        token: token.substring(0, 10) + '...',
      });
      
      return false;
    }
  }

  /**
   * Revocar todos los refresh tokens de un usuario
   */
  static async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const result = await prisma.refreshToken.updateMany({
        where: { 
          userId,
          isActive: true,
        },
        data: { 
          isActive: false,
        },
      });

      logger.info('All user refresh tokens revoked', {
        userId,
        tokensRevoked: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('Error revoking all user tokens', {
        error: error instanceof Error ? error.message : error,
        userId,
      });
      
      return 0;
    }
  }

  /**
   * Limpiar tokens expirados
   */
  static async cleanupExpiredTokens(userId?: string): Promise<number> {
    try {
      const where = {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
        ...(userId && { userId }),
      };

      const result = await prisma.refreshToken.deleteMany({ where });

      if (result.count > 0) {
        logger.info('Expired refresh tokens cleaned up', {
          userId: userId || 'all',
          tokensDeleted: result.count,
        });
      }

      return result.count;
    } catch (error) {
      logger.error('Error cleaning up expired tokens', {
        error: error instanceof Error ? error.message : error,
        userId: userId || 'all',
      });
      
      return 0;
    }
  }
}