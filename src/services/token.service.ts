// import crypto from 'crypto';
// import prisma from '@/config/database';
// import logger from '@/config/logger';

// export enum TokenType {
//   EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
//   PASSWORD_RESET = 'PASSWORD_RESET',
//   CHANGE_EMAIL = 'CHANGE_EMAIL',
// }

// export interface CreateTokenData {
//   userId: string;
//   type: TokenType;
//   expiresInMinutes?: number;
//   metadata?: any;
// }

// export interface VerifyTokenResult {
//   isValid: boolean;
//   userId?: string;
//   metadata?: any;
//   error?: string;
// }

// class TokenService {
//   /**
//    * Generar token seguro
//    */
//   private generateSecureToken(): string {
//     return crypto.randomBytes(32).toString('hex');
//   }

//   /**
//    * Crear token de verificación
//    */
//   async createToken(data: CreateTokenData): Promise<string> {
//     const token = this.generateSecureToken();
//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresInMinutes || 60));

//     // Invalidar tokens anteriores del mismo tipo para el mismo usuario
//     await prisma.verificationToken.updateMany({
//       where: {
//         userId: data.userId,
//         type: data.type,
//         isUsed: false,
//       },
//       data: {
//         isUsed: true,
//       },
//     });

//     // Crear nuevo token
//     await prisma.verificationToken.create({
//       data: {
//         userId: data.userId,
//         token,
//         type: data.type,
//         expiresAt,
//         metadata: data.metadata,
//       },
//     });

//     logger.info('Verification token created', {
//       userId: data.userId,
//       type: data.type,
//       expiresAt,
//     });

//     return token;
//   }

//   /**
//    * Verificar token
//    */
//   async verifyToken(token: string, type: TokenType): Promise<VerifyTokenResult> {
//     try {
//       const tokenRecord = await prisma.verificationToken.findFirst({
//         where: {
//           token,
//           type,
//           isUsed: false,
//           expiresAt: {
//             gt: new Date(),
//           },
//         },
//       });

//       if (!tokenRecord) {
//         return {
//           isValid: false,
//           error: 'Token inválido o expirado',
//         };
//       }

//       return {
//         isValid: true,
//         userId: tokenRecord.userId,
//         metadata: tokenRecord.metadata,
//       };
//     } catch (error) {
//       logger.error('Error verifying token:', error);
//       return {
//         isValid: false,
//         error: 'Error al verificar token',
//       };
//     }
//   }

//   /**
//    * Marcar token como usado
//    */
//   async markTokenAsUsed(token: string): Promise<boolean> {
//     try {
//       await prisma.verificationToken.updateMany({
//         where: { token },
//         data: {
//           isUsed: true,
//           usedAt: new Date(),
//         },
//       });

//       return true;
//     } catch (error) {
//       logger.error('Error marking token as used:', error);
//       return false;
//     }
//   }

//   /**
//    * Limpiar tokens expirados
//    */
//   async cleanExpiredTokens(): Promise<void> {
//     try {
//       const result = await prisma.verificationToken.deleteMany({
//         where: {
//           OR: [
//             { expiresAt: { lt: new Date() } },
//             { isUsed: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
//           ],
//         },
//       });

//       logger.info('Expired tokens cleaned', { deletedCount: result.count });
//     } catch (error) {
//       logger.error('Error cleaning expired tokens:', error);
//     }
//   }

//   /**
//    * Crear token de verificación de email
//    */
//   async createEmailVerificationToken(userId: string): Promise<string> {
//     return this.createToken({
//       userId,
//       type: TokenType.EMAIL_VERIFICATION,
//       expiresInMinutes: 24 * 60, // 24 horas
//     });
//   }

//   /**
//    * Crear token de reset de contraseña
//    */
//   async createPasswordResetToken(userId: string, email: string): Promise<string> {
//     return this.createToken({
//       userId,
//       type: TokenType.PASSWORD_RESET,
//       expiresInMinutes: 60, // 1 hora
//       metadata: { email },
//     });
//   }

//   /**
//    * Crear token para cambio de email
//    */
//   async createChangeEmailToken(userId: string, newEmail: string): Promise<string> {
//     return this.createToken({
//       userId,
//       type: TokenType.CHANGE_EMAIL,
//       expiresInMinutes: 60, // 1 hora
//       metadata: { newEmail },
//     });
//   }

//   /**
//    * Verificar token de email
//    */
//   async verifyEmailToken(token: string): Promise<VerifyTokenResult> {
//     const result = await this.verifyToken(token, TokenType.EMAIL_VERIFICATION);
    
//     if (result.isValid) {
//       await this.markTokenAsUsed(token);
//     }
    
//     return result;
//   }

//   /**
//    * Verificar token de reset de contraseña
//    */
//   async verifyPasswordResetToken(token: string): Promise<VerifyTokenResult> {
//     return this.verifyToken(token, TokenType.PASSWORD_RESET);
//   }

//   /**
//    * Verificar token de cambio de email
//    */
//   async verifyChangeEmailToken(token: string): Promise<VerifyTokenResult> {
//     const result = await this.verifyToken(token, TokenType.CHANGE_EMAIL);
    
//     if (result.isValid) {
//       await this.markTokenAsUsed(token);
//     }
    
//     return result;
//   }
// }

// export const tokenService = new TokenService();