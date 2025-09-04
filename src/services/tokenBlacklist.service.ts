import prisma from '@/config/database';
import { JwtUtils } from '@/utils/jwt.utils';
import logger from '@/config/logger';
import { createHash } from 'crypto';

export interface BlacklistEntry {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  reason: string;
  createdAt: Date;
}

export class TokenBlacklistService {
  /**
   * Crear hash del token para almacenamiento seguro
   */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Agregar token a la blacklist
   */
  static async addToBlacklist(
    token: string, 
    userId: string, 
    reason: string = 'Manual revocation'
  ): Promise<BlacklistEntry | null> {
    try {
      // Decodificar token para obtener la fecha de expiración
      const decoded = JwtUtils.decodeToken(token) as { exp?: number } | null;
      
      if (!decoded || !decoded.exp) {
        logger.warn('Cannot blacklist token without expiration', { userId });
        return null;
      }

      // Convertir timestamp a Date
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Si el token ya expiró, no es necesario agregarlo a la blacklist
      if (expiresAt < new Date()) {
        logger.info('Token already expired, not adding to blacklist', { userId });
        return null;
      }

      const tokenHash = this.hashToken(token);

      // Verificar si ya existe en la blacklist
      const existingEntry = await prisma.tokenBlacklist.findUnique({
        where: { tokenHash },
      });

      if (existingEntry) {
        logger.info('Token already in blacklist', { tokenHash: tokenHash.substring(0, 10) });
        return existingEntry;
      }

      // Agregar a la blacklist
      const blacklistEntry = await prisma.tokenBlacklist.create({
        data: {
          tokenHash,
          userId,
          expiresAt,
          reason,
        },
      });

      logger.info('Token added to blacklist', {
        userId,
        reason,
        expiresAt,
        tokenHash: tokenHash.substring(0, 10),
      });

      return blacklistEntry;

    } catch (error) {
      logger.error('Error adding token to blacklist', {
        error: error instanceof Error ? error.message : error,
        userId,
        reason,
      });

      return null;
    }
  }

  /**
   * Verificar si un token está en la blacklist
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(token);

      const blacklistEntry = await prisma.tokenBlacklist.findUnique({
        where: { 
          tokenHash,
          expiresAt: { gt: new Date() }, // Solo tokens que no han expirado
        },
      });

      const isBlacklisted = !!blacklistEntry;

      if (isBlacklisted) {
        logger.warn('Blacklisted token attempted', {
          tokenHash: tokenHash.substring(0, 10),
          reason: blacklistEntry.reason,
        });
      }

      return isBlacklisted;

    } catch (error) {
      logger.error('Error checking token blacklist', {
        error: error instanceof Error ? error.message : error,
      });

      // En caso de error, asumir que no está en blacklist para no bloquear usuarios válidos
      return false;
    }
  }

  /**
   * Revocar todos los tokens de un usuario
   */
  static async revokeAllUserTokens(userId: string, reason: string = 'Revoke all tokens'): Promise<number> {
    try {
      let revokedCount = 0;

      // También revocar refresh tokens (ya implementado en RefreshTokenService)
      const refreshTokensRevoked = await prisma.refreshToken.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      revokedCount += refreshTokensRevoked.count;

      logger.info('All user tokens revoked', {
        userId,
        tokensRevoked: revokedCount,
        reason,
      });

      return revokedCount;

    } catch (error) {
      logger.error('Error revoking all user tokens', {
        error: error instanceof Error ? error.message : error,
        userId,
        reason,
      });

      return 0;
    }
  }

  /**
   * Limpiar entradas expiradas de la blacklist
   */
  static async cleanupExpiredEntries(): Promise<number> {
    try {
      const result = await prisma.tokenBlacklist.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      if (result.count > 0) {
        logger.info('Expired blacklist entries cleaned up', {
          entriesDeleted: result.count,
        });
      }

      return result.count;

    } catch (error) {
      logger.error('Error cleaning up expired blacklist entries', {
        error: error instanceof Error ? error.message : error,
      });

      return 0;
    }
  }

  /**
   * Obtener estadísticas de la blacklist
   */
  static async getBlacklistStats(): Promise<{
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
  }> {
    try {
      const now = new Date();

      const [totalEntries, activeEntries] = await Promise.all([
        prisma.tokenBlacklist.count(),
        prisma.tokenBlacklist.count({
          where: { expiresAt: { gt: now } },
        }),
      ]);

      const expiredEntries = totalEntries - activeEntries;

      return {
        totalEntries,
        activeEntries,
        expiredEntries,
      };

    } catch (error) {
      logger.error('Error getting blacklist stats', {
        error: error instanceof Error ? error.message : error,
      });

      return {
        totalEntries: 0,
        activeEntries: 0,
        expiredEntries: 0,
      };
    }
  }
}