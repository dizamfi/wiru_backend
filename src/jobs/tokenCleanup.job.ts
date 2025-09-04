// import cron from 'node-cron';
// import { TokenBlacklistService } from '@/services/tokenBlacklist.service';
// import { RefreshTokenService } from '@/services/refreshToken.service';
// import logger from '@/config/logger';

// /**
//  * Job de limpieza automática de tokens expirados
//  */
// export class TokenCleanupJob {
//   private static isRunning = false;

//   /**
//    * Ejecutar limpieza de tokens
//    */
//   static async runCleanup(): Promise<void> {
//     if (this.isRunning) {
//       logger.warn('Token cleanup already running, skipping...');
//       return;
//     }

//     this.isRunning = true;
//     const startTime = Date.now();

//     try {
//       logger.info('Starting token cleanup job');

//       // Limpiar blacklist expirada
//       const blacklistCleaned = await TokenBlacklistService.cleanupExpiredEntries();

//       // Limpiar refresh tokens expirados
//       const refreshTokensCleaned = await RefreshTokenService.cleanupExpiredTokens();

//       const endTime = Date.now();
//       const duration = endTime - startTime;

//       logger.info('Token cleanup job completed', {
//         blacklistEntriesCleaned: blacklistCleaned,
//         refreshTokensCleaned,
//         durationMs: duration,
//       });

//       // Obtener estadísticas post-limpieza
//       const blacklistStats = await TokenBlacklistService.getBlacklistStats();

//       logger.info('Post-cleanup statistics', {
//         blacklist: blacklistStats,
//       });

//     } catch (error) {
//       logger.error('Token cleanup job failed', {
//         error: error instanceof Error ? error.message : error,
//         duration: Date.now() - startTime,
//       });
//     } finally {
//       this.isRunning = false;
//     }
//   }

//   /**
//    * Inicializar jobs programados
//    */
//   static init(): void {
//     // Ejecutar limpieza cada día a las 2:00 AM
//     cron.schedule('0 2 * * *', async () => {
//       await this.runCleanup();
//     }, {
//       timezone: 'America/Guayaquil',
//     });

//     // Ejecutar limpieza cada 6 horas como backup
//     cron.schedule('0 */6 * * *', async () => {
//       await this.runCleanup();
//     });

//     logger.info('Token cleanup jobs scheduled', {
//       dailyCleanup: '2:00 AM',
//       backupCleanup: 'Every 6 hours',
//     });
//   }

//   /**
//    * Ejecutar limpieza manual
//    */
//   static async runManualCleanup(): Promise<{
//     success: boolean;
//     blacklistCleaned: number;
//     refreshTokensCleaned: number;
//     duration: number;
//   }> {
//     const startTime = Date.now();

//     try {
//       const [blacklistCleaned, refreshTokensCleaned] = await Promise.all([
//         TokenBlacklistService.cleanupExpiredEntries(),
//         RefreshTokenService.cleanupExpiredTokens(),
//       ]);

//       const duration = Date.now() - startTime;

//       logger.info('Manual token cleanup completed', {
//         blacklistCleaned,
//         refreshTokensCleaned,
//         duration,
//       });

//       return {
//         success: true,
//         blacklistCleaned,
//         refreshTokensCleaned,
//         duration,
//       };

//     } catch (error) {
//       const duration = Date.now() - startTime;

//       logger.error('Manual token cleanup failed', {
//         error: error instanceof Error ? error.message : error,
//         duration,
//       });

//       return {
//         success: false,
//         blacklistCleaned: 0,
//         refreshTokensCleaned: 0,
//         duration,
//       };
//     }
//   }
// }





import cron from 'node-cron';
import { TokenBlacklistService } from '@/services/tokenBlacklist.service';
import { RefreshTokenService } from '@/services/refreshToken.service';
import { VerificationTokenService } from '@/services/verificationToken.service';
import logger from '@/config/logger';

/**
 * Job de limpieza automática de tokens expirados
 */
export class TokenCleanupJob {
  private static isRunning = false;

  /**
   * Ejecutar limpieza de tokens
   */
  static async runCleanup(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Token cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting token cleanup job');

      // Limpiar blacklist expirada
      const blacklistCleaned = await TokenBlacklistService.cleanupExpiredEntries();

      // Limpiar refresh tokens expirados
      const refreshTokensCleaned = await RefreshTokenService.cleanupExpiredTokens();

      // Limpiar tokens de verificación expirados
      const verificationTokensCleaned = await VerificationTokenService.cleanupExpiredTokens();

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.info('Token cleanup job completed', {
        blacklistEntriesCleaned: blacklistCleaned,
        refreshTokensCleaned,
        verificationTokensCleaned,
        durationMs: duration,
      });

      // Obtener estadísticas post-limpieza
      const blacklistStats = await TokenBlacklistService.getBlacklistStats();

      logger.info('Post-cleanup statistics', {
        blacklist: blacklistStats,
      });

    } catch (error) {
      logger.error('Token cleanup job failed', {
        error: error instanceof Error ? error.message : error,
        duration: Date.now() - startTime,
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Inicializar jobs programados
   */
  static init(): void {
    // Ejecutar limpieza cada día a las 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      await this.runCleanup();
    }, {
      timezone: 'America/Guayaquil',
    });

    // Ejecutar limpieza cada 6 horas como backup
    cron.schedule('0 */6 * * *', async () => {
      await this.runCleanup();
    });

    logger.info('Token cleanup jobs scheduled', {
      dailyCleanup: '2:00 AM',
      backupCleanup: 'Every 6 hours',
    });
  }

  /**
   * Ejecutar limpieza manual
   */
  static async runManualCleanup(): Promise<{
    success: boolean;
    blacklistCleaned: number;
    refreshTokensCleaned: number;
    verificationTokensCleaned: number;
    duration: number;
  }> {
    const startTime = Date.now();

    try {
      const [blacklistCleaned, refreshTokensCleaned, verificationTokensCleaned] = await Promise.all([
        TokenBlacklistService.cleanupExpiredEntries(),
        RefreshTokenService.cleanupExpiredTokens(),
        VerificationTokenService.cleanupExpiredTokens(),
      ]);

      const duration = Date.now() - startTime;

      logger.info('Manual token cleanup completed', {
        blacklistCleaned,
        refreshTokensCleaned,
        verificationTokensCleaned,
        duration,
      });

      return {
        success: true,
        blacklistCleaned,
        refreshTokensCleaned,
        verificationTokensCleaned,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('Manual token cleanup failed', {
        error: error instanceof Error ? error.message : error,
        duration,
      });

      return {
        success: false,
        blacklistCleaned: 0,
        refreshTokensCleaned: 0,
        verificationTokensCleaned: 0,
        duration,
      };
    }
  }
}