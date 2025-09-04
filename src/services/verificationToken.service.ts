// import { randomBytes } from 'crypto';
// import prisma from '@/config/database';
// import logger from '@/config/logger';
// import { TokenType } from '@prisma/client';

// export interface VerificationTokenData {
//   id: string;
//   token: string;
//   userId: string;
//   type: TokenType;
//   expiresAt: Date;
// }

// export class VerificationTokenService {
//   /**
//    * Generar token único seguro
//    */
//   private static generateSecureToken(): string {
//     return randomBytes(32).toString('hex');
//   }

//   /**
//    * Crear token de verificación
//    */
//   static async createVerificationToken(
//     userId: string,
//     type: TokenType,
//     expiresInHours: number = 24
//   ): Promise<VerificationTokenData> {
//     // Invalidar tokens anteriores del mismo tipo
//     await this.invalidateUserTokens(userId, type);

//     // Calcular fecha de expiración
//     const expiresAt = new Date();
//     expiresAt.setHours(expiresAt.getHours() + expiresInHours);

//     // Generar token único
//     const token = this.generateSecureToken();

//     // Crear en la base de datos
//     const verificationToken = await prisma.verificationToken.create({
//       data: {
//         userId,
//         token,
//         type,
//         expiresAt,
//       },
//     });

//     logger.info('Verification token created', {
//       userId,
//       type,
//       tokenId: verificationToken.id,
//       expiresAt,
//     });

//     return verificationToken;
//   }

//   /**
//    * Validar y obtener token de verificación
//    */
//   static async validateToken(token: string, type: TokenType): Promise<{
//     tokenData: VerificationTokenData;
//     userId: string;
//   } | null> {
//     const verificationToken = await prisma.verificationToken.findUnique({
//       where: { 
//         token,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             status: true,
//           },
//         },
//       },
//     });

//     if (!verificationToken) {
//       logger.warn('Invalid verification token attempted', {
//         token: token.substring(0, 10) + '...',
//         type,
//       });
//       return null;
//     }

//     // Verificar que sea del tipo correcto
//     if (verificationToken.type !== type) {
//       logger.warn('Token type mismatch', {
//         expectedType: type,
//         actualType: verificationToken.type,
//         tokenId: verificationToken.id,
//       });
//       return null;
//     }

//     // Verificar si ya fue usado
//     if (verificationToken.isUsed) {
//       logger.warn('Already used verification token attempted', {
//         tokenId: verificationToken.id,
//         userId: verificationToken.userId,
//         type,
//       });
//       return null;
//     }

//     // Verificar si ha expirado
//     if (verificationToken.expiresAt < new Date()) {
//       logger.warn('Expired verification token attempted', {
//         tokenId: verificationToken.id,
//         userId: verificationToken.userId,
//         expiresAt: verificationToken.expiresAt,
//         type,
//       });
//       return null;
//     }

//     return {
//       tokenData: verificationToken,
//       userId: verificationToken.user.id,
//     };
//   }

//   /**
//    * Marcar token como usado
//    */
//   static async markTokenAsUsed(tokenId: string): Promise<boolean> {
//     try {
//       await prisma.verificationToken.update({
//         where: { id: tokenId },
//         data: {
//           isUsed: true,
//           usedAt: new Date(),
//         },
//       });

//       logger.info('Verification token marked as used', { tokenId });
//       return true;
//     } catch (error) {
//       logger.error('Error marking token as used', {
//         error: error instanceof Error ? error.message : error,
//         tokenId,
//       });
//       return false;
//     }
//   }

//   /**
//    * Invalidar tokens anteriores del usuario
//    */
//   static async invalidateUserTokens(userId: string, type: TokenType): Promise<number> {
//     try {
//       const result = await prisma.verificationToken.updateMany({
//         where: {
//           userId,
//           type,
//           isUsed: false,
//         },
//         data: {
//           isUsed: true,
//           usedAt: new Date(),
//         },
//       });

//       if (result.count > 0) {
//         logger.info('Previous verification tokens invalidated', {
//           userId,
//           type,
//           tokensInvalidated: result.count,
//         });
//       }

//       return result.count;
//     } catch (error) {
//       logger.error('Error invalidating user tokens', {
//         error: error instanceof Error ? error.message : error,
//         userId,
//         type,
//       });
//       return 0;
//     }
//   }

//   /**
//    * Limpiar tokens expirados
//    */
//   static async cleanupExpiredTokens(): Promise<number> {
//     try {
//       const result = await prisma.verificationToken.deleteMany({
//         where: {
//           OR: [
//             { expiresAt: { lt: new Date() } },
//             { isUsed: true },
//           ],
//         },
//       });

//       if (result.count > 0) {
//         logger.info('Expired verification tokens cleaned up', {
//           tokensDeleted: result.count,
//         });
//       }

//       return result.count;
//     } catch (error) {
//       logger.error('Error cleaning up expired tokens', {
//         error: error instanceof Error ? error.message : error,
//       });
//       return 0;
//     }
//   }

//   /**
//    * Obtener estadísticas de tokens por usuario
//    */
//   static async getUserTokenStats(userId: string): Promise<{
//     emailVerification: { active: number; used: number };
//     passwordReset: { active: number; used: number };
//     totalActive: number;
//     totalUsed: number;
//   }> {
//     try {
//       const [emailActive, emailUsed, passwordActive, passwordUsed] = await Promise.all([
//         prisma.verificationToken.count({
//           where: {
//             userId,
//             type: 'EMAIL_VERIFICATION',
//             isUsed: false,
//             expiresAt: { gt: new Date() },
//           },
//         }),
//         prisma.verificationToken.count({
//           where: {
//             userId,
//             type: 'EMAIL_VERIFICATION',
//             isUsed: true,
//           },
//         }),
//         prisma.verificationToken.count({
//           where: {
//             userId,
//             type: 'PASSWORD_RESET',
//             isUsed: false,
//             expiresAt: { gt: new Date() },
//           },
//         }),
//         prisma.verificationToken.count({
//           where: {
//             userId,
//             type: 'PASSWORD_RESET',
//             isUsed: true,
//           },
//         }),
//       ]);

//       return {
//         emailVerification: { active: emailActive, used: emailUsed },
//         passwordReset: { active: passwordActive, used: passwordUsed },
//         totalActive: emailActive + passwordActive,
//         totalUsed: emailUsed + passwordUsed,
//       };
//     } catch (error) {
//       logger.error('Error getting user token stats', {
//         error: error instanceof Error ? error.message : error,
//         userId,
//       });

//       return {
//         emailVerification: { active: 0, used: 0 },
//         passwordReset: { active: 0, used: 0 },
//         totalActive: 0,
//         totalUsed: 0,
//       };
//     }
//   }

//   /**
//    * Verificar si el usuario puede solicitar un nuevo token
//    */
//   static async canRequestNewToken(
//     userId: string,
//     type: TokenType,
//     cooldownMinutes: number = 5
//   ): Promise<boolean> {
//     try {
//       const recentToken = await prisma.verificationToken.findFirst({
//         where: {
//           userId,
//           type,
//           createdAt: {
//             gte: new Date(Date.now() - cooldownMinutes * 60 * 1000),
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       const canRequest = !recentToken;
      
//       if (!canRequest) {
//         logger.warn('Token request blocked due to cooldown', {
//           userId,
//           type,
//           cooldownMinutes,
//           lastTokenCreated: recentToken.createdAt,
//         });
//       }

//       return canRequest;
//     } catch (error) {
//       logger.error('Error checking token cooldown', {
//         error: error instanceof Error ? error.message : error,
//         userId,
//         type,
//       });
      
//       // En caso de error, permitir la solicitud
//       return true;
//     }
//   }
// }



import { randomBytes } from 'crypto';
import prisma from '@/config/database';
import logger from '@/config/logger';
import { TokenType } from '@prisma/client';

export interface VerificationTokenData {
  id: string;
  token: string;
  userId: string;
  type: TokenType;
  expiresAt: Date;
}

export class VerificationTokenService {
  /**
   * Generar token único seguro
   */
  private static generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Crear token de verificación
   */
  static async createVerificationToken(
    userId: string,
    type: TokenType,
    expiresInHours: number = 24,
    tx?: any // Transacción opcional
  ): Promise<VerificationTokenData> {
    const prismaClient = tx || prisma;

    // Invalidar tokens anteriores del mismo tipo
    await this.invalidateUserTokens(userId, type, tx);

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Generar token único
    const token = this.generateSecureToken();

    // Crear en la base de datos
    const verificationToken = await prismaClient.verificationToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });

    logger.info('Verification token created', {
      userId,
      type,
      tokenId: verificationToken.id,
      expiresAt,
    });

    return verificationToken;
  }

  /**
   * Validar y obtener token de verificación
   */
  static async validateToken(token: string, type: TokenType): Promise<{
    tokenData: VerificationTokenData;
    userId: string;
  } | null> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { 
        token,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            status: true,
          },
        },
      },
    });

    if (!verificationToken) {
      logger.warn('Invalid verification token attempted', {
        token: token.substring(0, 10) + '...',
        type,
      });
      return null;
    }

    // Verificar que sea del tipo correcto
    if (verificationToken.type !== type) {
      logger.warn('Token type mismatch', {
        expectedType: type,
        actualType: verificationToken.type,
        tokenId: verificationToken.id,
      });
      return null;
    }

    // Verificar si ya fue usado
    if (verificationToken.isUsed) {
      logger.warn('Already used verification token attempted', {
        tokenId: verificationToken.id,
        userId: verificationToken.userId,
        type,
      });
      return null;
    }

    // Verificar si ha expirado
    if (verificationToken.expiresAt < new Date()) {
      logger.warn('Expired verification token attempted', {
        tokenId: verificationToken.id,
        userId: verificationToken.userId,
        expiresAt: verificationToken.expiresAt,
        type,
      });
      return null;
    }

    return {
      tokenData: verificationToken,
      userId: verificationToken.user.id,
    };
  }

  /**
   * Marcar token como usado
   */
  static async markTokenAsUsed(tokenId: string): Promise<boolean> {
    try {
      await prisma.verificationToken.update({
        where: { id: tokenId },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      logger.info('Verification token marked as used', { tokenId });
      return true;
    } catch (error) {
      logger.error('Error marking token as used', {
        error: error instanceof Error ? error.message : error,
        tokenId,
      });
      return false;
    }
  }

  /**
   * Invalidar tokens anteriores del usuario
   */
  static async invalidateUserTokens(userId: string, type: TokenType, tx?: any): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      
      const result = await prismaClient.verificationToken.updateMany({
        where: {
          userId,
          type,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      if (result.count > 0) {
        logger.info('Previous verification tokens invalidated', {
          userId,
          type,
          tokensInvalidated: result.count,
        });
      }

      return result.count;
    } catch (error) {
      logger.error('Error invalidating user tokens', {
        error: error instanceof Error ? error.message : error,
        userId,
        type,
      });
      return 0;
    }
  }

  /**
   * Limpiar tokens expirados
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.verificationToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isUsed: true },
          ],
        },
      });

      if (result.count > 0) {
        logger.info('Expired verification tokens cleaned up', {
          tokensDeleted: result.count,
        });
      }

      return result.count;
    } catch (error) {
      logger.error('Error cleaning up expired tokens', {
        error: error instanceof Error ? error.message : error,
      });
      return 0;
    }
  }

  /**
   * Obtener estadísticas de tokens por usuario
   */
  static async getUserTokenStats(userId: string): Promise<{
    emailVerification: { active: number; used: number };
    passwordReset: { active: number; used: number };
    totalActive: number;
    totalUsed: number;
  }> {
    try {
      const [emailActive, emailUsed, passwordActive, passwordUsed] = await Promise.all([
        prisma.verificationToken.count({
          where: {
            userId,
            type: 'EMAIL_VERIFICATION',
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
        }),
        prisma.verificationToken.count({
          where: {
            userId,
            type: 'EMAIL_VERIFICATION',
            isUsed: true,
          },
        }),
        prisma.verificationToken.count({
          where: {
            userId,
            type: 'PASSWORD_RESET',
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
        }),
        prisma.verificationToken.count({
          where: {
            userId,
            type: 'PASSWORD_RESET',
            isUsed: true,
          },
        }),
      ]);

      return {
        emailVerification: { active: emailActive, used: emailUsed },
        passwordReset: { active: passwordActive, used: passwordUsed },
        totalActive: emailActive + passwordActive,
        totalUsed: emailUsed + passwordUsed,
      };
    } catch (error) {
      logger.error('Error getting user token stats', {
        error: error instanceof Error ? error.message : error,
        userId,
      });

      return {
        emailVerification: { active: 0, used: 0 },
        passwordReset: { active: 0, used: 0 },
        totalActive: 0,
        totalUsed: 0,
      };
    }
  }

  /**
   * Verificar si el usuario puede solicitar un nuevo token
   */
  static async canRequestNewToken(
    userId: string,
    type: TokenType,
    cooldownMinutes: number = 5
  ): Promise<boolean> {
    try {
      const recentToken = await prisma.verificationToken.findFirst({
        where: {
          userId,
          type,
          createdAt: {
            gte: new Date(Date.now() - cooldownMinutes * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const canRequest = !recentToken;
      
      if (!canRequest) {
        logger.warn('Token request blocked due to cooldown', {
          userId,
          type,
          cooldownMinutes,
          lastTokenCreated: recentToken.createdAt,
        });
      }

      return canRequest;
    } catch (error) {
      logger.error('Error checking token cooldown', {
        error: error instanceof Error ? error.message : error,
        userId,
        type,
      });
      
      // En caso de error, permitir la solicitud
      return true;
    }
  }
}