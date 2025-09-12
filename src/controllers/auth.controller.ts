// // src/controllers/auth.controller.ts
// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';
// import prisma from '@/config/database';
// import { ResponseUtils } from '@/utils/response.utils';
// import { JwtUtils } from '@/utils/jwt.utils';
// import { EmailService } from '@/services/email.service';
// import { catchAsync } from '@/middleware/error.middleware';
// import logger from '@/config/logger';
// import { ERROR_MESSAGES } from '@/utils/constants';

// /**
//  * Registrar nuevo usuario
//  */
// export const register = catchAsync(async (req: Request, res: Response) => {
//   console.log('🚀 Register controller called with data:', req.body);
  
//   const { 
//     email, 
//     password, 
//     firstName, 
//     lastName, 
//     phone, 
//     userType,           // Frontend envía userType
//     type,               // Backend puede recibir type también
//     referralCode,
    
//     // Campos de empresa del frontend
//     companyName,
//     legalName,
//     taxId,
//     companyDocument,
    
//     // Campos adicionales para metadata
//     identificationNumber,
//     identificationType,
//     dateOfBirth,
//     industry,
//     companySize,
//     legalRepFirstName,
//     legalRepLastName,
//     legalRepPosition,
//     legalRepPhone,
//     legalRepEmail,
//     legalRepId,
//     businessStreet,
//     businessCity,
//     businessState,
//     businessZipCode,
//     businessCountry,
//   } = req.body;

//   // Transformar userType del frontend a type del backend
//   const finalUserType = userType === 'person' ? 'PERSON' : 
//                        userType === 'company' ? 'COMPANY' : 
//                        type === 'PERSON' ? 'PERSON' :
//                        type === 'COMPANY' ? 'COMPANY' :
//                        'PERSON'; // default

//   console.log('🔄 User type transformation:', { userType, type, finalUserType });

//   // Determinar el nombre de la empresa y documento
//   const finalCompanyName = companyName || legalName;
//   const finalCompanyDocument = taxId || companyDocument;

//   console.log('📧 Checking if user exists with email:', email);
  
//   // Verificar si el usuario ya existe
//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   });

//   if (existingUser) {
//     console.log('❌ User already exists:', email);
//     return ResponseUtils.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS || 'El email ya está registrado');
//   }

//   console.log('🔐 Hashing password...');
//   const hashedPassword = await bcrypt.hash(password, 12);

//   // Generar código de referido único
//   const generateReferralCode = (): string => {
//     return Math.random().toString(36).substr(2, 8).toUpperCase();
//   };

//   let uniqueReferralCode = generateReferralCode();
//   console.log('🎫 Generated referral code:', uniqueReferralCode);
  
//   // Asegurar que el código de referido sea único
//   while (await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } })) {
//     uniqueReferralCode = generateReferralCode();
//     console.log('🔄 Referral code collision, trying new one:', uniqueReferralCode);
//   }

//   // Preparar metadata adicional
//   const metadata = {
//     personal: identificationNumber ? {
//       identificationNumber,
//       identificationType,
//       dateOfBirth,
//     } : null,
//     company: finalUserType === 'COMPANY' ? {
//       industry,
//       companySize,
//       legalRep: legalRepFirstName ? {
//         firstName: legalRepFirstName,
//         lastName: legalRepLastName,
//         position: legalRepPosition,
//         phone: legalRepPhone,
//         email: legalRepEmail,
//         id: legalRepId,
//       } : null,
//       businessAddress: businessStreet ? {
//         street: businessStreet,
//         city: businessCity,
//         state: businessState,
//         zipCode: businessZipCode,
//         country: businessCountry || 'Ecuador',
//       } : null,
//     } : null,
//     registrationSource: 'web',
//     registrationTimestamp: new Date().toISOString(),
//   };

//   try {
//     console.log('💾 Starting database transaction...');
    
//     // Crear usuario en una transacción
//     const result = await prisma.$transaction(async (tx) => {
//       console.log('👤 Creating user in database...');
      
//       // Crear el usuario
//       const user = await tx.user.create({
//         data: {
//           email,
//           password: hashedPassword,
//           firstName,
//           lastName,
//           phone,
//           type: finalUserType,
//           referralCode: uniqueReferralCode,
//           referredBy: referralCode || null,
//           companyName: finalUserType === 'COMPANY' ? finalCompanyName : null,
//           companyDocument: finalUserType === 'COMPANY' ? finalCompanyDocument : null,
//           // Si tu modelo tiene campo metadata, descomenta la siguiente línea:
//           // metadata: metadata,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           phone: true,
//           type: true,
//           referralCode: true,
//           companyName: true,
//           companyDocument: true,
//           status: true,
//           isEmailVerified: true,
//           createdAt: true,
//         }
//       });

//       console.log('💰 Creating user wallet...');
//       const wallet = await tx.wallet.create({
//         data: {
//           userId: user.id,
//           balance: 0,
//           pendingBalance: 0,
//         }
//       });

//       return { user, wallet };
//     });

//     console.log('✅ User created successfully:', result.user.email);

//     // Generar token de verificación
//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     console.log('🎫 Generated verification token');
    
//     // Guardar token en base de datos
//     await prisma.verificationToken.create({
//       data: {
//         userId: result.user.id,
//         token: verificationToken,
//         type: 'EMAIL_VERIFICATION',
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
//       }
//     });

//     // Enviar email de verificación
//     try {
//       console.log('📧 Sending verification email...');
//       await EmailService.sendVerificationEmail(
//         email,
//         firstName,
//         verificationToken
//       );
//       console.log('✅ Verification email sent successfully');
//     } catch (emailError) {
//       console.error('❌ Error sending verification email:', emailError);
//       // No fallar el registro por error de email
//     }

//     // Log de registro exitoso
//     logger.info('User registered successfully', {
//       userId: result.user.id,
//       email: result.user.email,
//       type: result.user.type,
//       ip: req.ip,
//     });

//     // Respuesta exitosa con el formato que espera el frontend
//     ResponseUtils.created(res, {
//       user: result.user,
//     }, 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.');

//   } catch (error: any) {
//     console.error('❌ Error creating user:', error);
    
//     // Log del error
//     logger.error('User registration failed', {
//       email,
//       error: error.message,
//       ip: req.ip,
//     });
    
//     if (error.code === 'P2002') {
//       return ResponseUtils.conflict(res, 'El email ya está registrado');
//     }
    
//     ResponseUtils.internalServerError(res, 'Error interno del servidor');
//   }
// });

// /**
//  * Iniciar sesión
//  */
// export const login = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   console.log('🚀 Login attempt for email:', email);

//   // Buscar usuario por email
//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       password: true,
//       firstName: true,
//       lastName: true,
//       phone: true,
//       avatar: true,
//       role: true,
//       type: true,
//       status: true,
//       isEmailVerified: true,
//       companyName: true,
//       referralCode: true,
//       lastLoginAt: true,
//     }
//   });

//   if (!user) {
//     console.log('❌ User not found:', email);
//     return ResponseUtils.unauthorized(res, 'Credenciales inválidas');
//   }

//   // Verificar contraseña
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     console.log('❌ Invalid password for user:', email);
//     return ResponseUtils.unauthorized(res, 'Credenciales inválidas');
//   }

//   // Verificar estado del usuario
//   if (user.status === 'SUSPENDED') {
//     return ResponseUtils.forbidden(res, 'Tu cuenta ha sido suspendida');
//   }

//   if (user.status === 'INACTIVE') {
//     return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva');
//   }

//   console.log('✅ User authenticated successfully:', email);

//   // Generar tokens
//   const tokenPayload = {
//     userId: user.id,
//     email: user.email,
//     role: user.role,
//   };

//   const tokens = JwtUtils.generateTokenPair(tokenPayload);

//   // Actualizar último login
//   await prisma.user.update({
//     where: { id: user.id },
//     data: { lastLoginAt: new Date() }
//   });

//   // Preparar datos del usuario (sin password)
//   const { password: _, ...userWithoutPassword } = user;

//   // Log de login exitoso
//   logger.info('User logged in successfully', {
//     userId: user.id,
//     email: user.email,
//     ip: req.ip,
//   });

//   // Respuesta con formato que espera el frontend
//   return ResponseUtils.success(res, {
//     user: userWithoutPassword,
//     tokens: {
//       accessToken: tokens.accessToken,
//       refreshToken: tokens.refreshToken,
//     }
//   }, 'Login exitoso');
// });

// /**
//  * Verificar email
//  */
// export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
//   const { token } = req.body;

//   console.log('🔍 Verifying email with token:', token.substring(0, 10) + '...');

//   // Buscar el token de verificación
//   const verificationToken = await prisma.verificationToken.findFirst({
//     where: {
//       token,
//       type: 'EMAIL_VERIFICATION',
//       isUsed: false,
//       expiresAt: { gt: new Date() }
//     },
//     include: {
//       user: true
//     }
//   });

//   if (!verificationToken) {
//     console.log('❌ Invalid or expired verification token');
//     return ResponseUtils.badRequest(res, 'Token de verificación inválido o expirado');
//   }

//   try {
//     // Actualizar usuario y marcar token como usado en transacción
//     await prisma.$transaction(async (tx) => {
//       // Marcar email como verificado
//       await tx.user.update({
//         where: { id: verificationToken.userId },
//         data: {
//           isEmailVerified: true,
//           emailVerifiedAt: new Date(),
//           status: 'ACTIVE', // Activar usuario después de verificar email
//         }
//       });

//       // Marcar token como usado
//       await tx.verificationToken.update({
//         where: { id: verificationToken.id },
//         data: {
//           isUsed: true,
//           usedAt: new Date(),
//         }
//       });
//     });

//     console.log('✅ Email verified successfully for user:', verificationToken.user.email);

//     // Enviar email de bienvenida
//     try {
//       await EmailService.sendWelcomeEmail(
//         verificationToken.user.email,
//         verificationToken.user.firstName
//       );
//     } catch (emailError) {
//       console.error('❌ Error sending welcome email:', emailError);
//       // No fallar la verificación por error de email
//     }

//     // Log de verificación exitosa
//     logger.info('Email verified successfully', {
//       userId: verificationToken.userId,
//       email: verificationToken.user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       isVerified: true
//     }, 'Email verificado exitosamente');

//   } catch (error) {
//     console.error('❌ Error verifying email:', error);
//     ResponseUtils.internalServerError(res, 'Error al verificar email');
//   }
// });

// /**
//  * Reenviar email de verificación
//  */
// export const resendVerification = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   console.log('🔄 Resending verification email to:', email);

//   // Buscar usuario
//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       isEmailVerified: true,
//     }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, 'Usuario no encontrado');
//   }

//   if (user.isEmailVerified) {
//     return ResponseUtils.badRequest(res, 'El email ya está verificado');
//   }

//   // Invalidar tokens anteriores
//   await prisma.verificationToken.updateMany({
//     where: {
//       userId: user.id,
//       type: 'EMAIL_VERIFICATION',
//       isUsed: false,
//     },
//     data: { isUsed: true }
//   });

//   // Generar nuevo token
//   const verificationToken = crypto.randomBytes(32).toString('hex');

//   // Guardar nuevo token
//   await prisma.verificationToken.create({
//     data: {
//       userId: user.id,
//       token: verificationToken,
//       type: 'EMAIL_VERIFICATION',
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
//     }
//   });

//   // Enviar email
//   try {
//     await EmailService.sendVerificationEmail(
//       email,
//       user.firstName,
//       verificationToken
//     );

//     console.log('✅ Verification email resent successfully');
//     ResponseUtils.success(res, null, 'Email de verificación enviado');

//   } catch (emailError) {
//     console.error('❌ Error sending verification email:', emailError);
//     ResponseUtils.internalServerError(res, 'Error al enviar email de verificación');
//   }
// });

// /**
//  * Solicitar reset de contraseña
//  */
// export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   console.log('🔄 Password reset requested for:', email);

//   // Buscar usuario
//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//     }
//   });

//   // Siempre devolver éxito para evitar enumeración de usuarios
//   if (!user) {
//     console.log('❌ User not found for password reset:', email);
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }

//   // Invalidar tokens anteriores
//   await prisma.verificationToken.updateMany({
//     where: {
//       userId: user.id,
//       type: 'PASSWORD_RESET',
//       isUsed: false,
//     },
//     data: { isUsed: true }
//   });

//   // Generar nuevo token
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   // Guardar token
//   await prisma.verificationToken.create({
//     data: {
//       userId: user.id,
//       token: resetToken,
//       type: 'PASSWORD_RESET',
//       expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
//     }
//   });

//   // Enviar email
//   try {
//     await EmailService.sendPasswordResetEmail(
//       email,
//       user.firstName,
//       resetToken
//     );

//     console.log('✅ Password reset email sent successfully');
//   } catch (emailError) {
//     console.error('❌ Error sending password reset email:', emailError);
//   }

//   return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
// });

// /**
//  * Restablecer contraseña
//  */
// export const resetPassword = catchAsync(async (req: Request, res: Response) => {
//   const { token, password } = req.body;

//   console.log('🔄 Password reset attempt with token:', token.substring(0, 10) + '...');

//   // Buscar token válido
//   const verificationToken = await prisma.verificationToken.findFirst({
//     where: {
//       token,
//       type: 'PASSWORD_RESET',
//       isUsed: false,
//       expiresAt: { gt: new Date() }
//     },
//     include: {
//       user: true
//     }
//   });

//   if (!verificationToken) {
//     return ResponseUtils.badRequest(res, 'Token de restablecimiento inválido o expirado');
//   }

//   // Hash de la nueva contraseña
//   const hashedPassword = await bcrypt.hash(password, 12);

//   try {
//     // Actualizar contraseña y marcar token como usado
//     await prisma.$transaction(async (tx) => {
//       await tx.user.update({
//         where: { id: verificationToken.userId },
//         data: { password: hashedPassword }
//       });

//       await tx.verificationToken.update({
//         where: { id: verificationToken.id },
//         data: {
//           isUsed: true,
//           usedAt: new Date(),
//         }
//       });
//     });

//     console.log('✅ Password reset successfully for user:', verificationToken.user.email);

//     // Log de reset exitoso
//     logger.info('Password reset successfully', {
//       userId: verificationToken.userId,
//       email: verificationToken.user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, null, 'Contraseña restablecida exitosamente');

//   } catch (error) {
//     console.error('❌ Error resetting password:', error);
//     ResponseUtils.internalServerError(res, 'Error al restablecer contraseña');
//   }
// });

// /**
//  * Refresh token
//  */
// export const refreshToken = catchAsync(async (req: Request, res: Response) => {
//   const { refreshToken } = req.body;

//   try {
//     // Verificar refresh token
//     const payload = JwtUtils.verifyRefreshToken(refreshToken);
    
//     // Buscar usuario
//     const user = await prisma.user.findUnique({
//       where: { id: payload.userId },
//       select: {
//         id: true,
//         email: true,
//         role: true,
//         status: true,
//       }
//     });

//     if (!user || user.status !== 'ACTIVE') {
//       return ResponseUtils.unauthorized(res, 'Refresh token inválido');
//     }

//     // Generar nuevos tokens
//     const newTokens = JwtUtils.generateTokenPair({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//     });

//     return ResponseUtils.success(res, {
//       accessToken: newTokens.accessToken,
//       refreshToken: newTokens.refreshToken,
//     }, 'Tokens renovados exitosamente');

//   } catch (error) {
//     console.error('❌ Error refreshing token:', error);
//     return ResponseUtils.unauthorized(res, 'Refresh token inválido');
//   }
// });

// /**
//  * Logout
//  */
// export const logout = catchAsync(async (req: Request, res: Response) => {
//   const { refreshToken } = req.body;
//   const userId = (req as any).user?.id;

//   console.log('🚪 Logout attempt for user:', userId);

//   try {
//     // Invalidar refresh token si se proporciona
//     if (refreshToken) {
//       // Aquí podrías agregar el refresh token a una blacklist
//       // Por ahora solo loggeamos
//       console.log('🗑️ Invalidating refresh token');
//     }

//     // Log de logout
//     logger.info('User logged out', {
//       userId,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, null, 'Logout exitoso');

//   } catch (error) {
//     console.error('❌ Error during logout:', error);
//     ResponseUtils.success(res, null, 'Logout exitoso'); // Siempre success en logout
//   }
// });

// /**
//  * Cambiar contraseña (usuario autenticado)
//  */
// export const changePassword = catchAsync(async (req: Request, res: Response) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = (req as any).user?.id;

//   console.log('🔐 Password change attempt for user:', userId);

//   // Buscar usuario
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//       password: true,
//     }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, 'Usuario no encontrado');
//   }

//   // Verificar contraseña actual
//   const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
//   if (!isCurrentPasswordValid) {
//     return ResponseUtils.badRequest(res, 'La contraseña actual es incorrecta');
//   }

//   // Hash de la nueva contraseña
//   const hashedPassword = await bcrypt.hash(newPassword, 12);

//   // Actualizar contraseña
//   await prisma.user.update({
//     where: { id: userId },
//     data: { password: hashedPassword }
//   });

//   console.log('✅ Password changed successfully for user:', user.email);

//   // Log de cambio de contraseña
//   logger.info('Password changed successfully', {
//     userId,
//     email: user.email,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, 'Contraseña cambiada exitosamente');
// });

// /**
//  * Obtener información del usuario autenticado
//  */
// export const getMe = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   // Buscar usuario con información completa
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       phone: true,
//       avatar: true,
//       role: true,
//       type: true,
//       status: true,
//       isEmailVerified: true,
//       emailVerifiedAt: true,
//       lastLoginAt: true,
//       referralCode: true,
//       companyName: true,
//       companyDocument: true,
//       createdAt: true,
//       updatedAt: true,
//       // Incluir relaciones si es necesario
//       wallet: {
//         select: {
//           balance: true,
//           pendingBalance: true,
//         }
//       }
//     }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, 'Usuario no encontrado');
//   }

//   return ResponseUtils.success(res, { user }, 'Información del usuario obtenida exitosamente');
// });

// /**
//  * Eliminar cuenta (soft delete)
//  */
// export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   console.log('🗑️ Account deletion request for user:', userId);

//   // Soft delete - cambiar status a INACTIVE
//   await prisma.user.update({
//     where: { id: userId },
//     data: { 
//       status: 'INACTIVE',
//       // Opcionalmente, también podrías limpiar datos sensibles
//       // email: `deleted_${Date.now()}@deleted.com`,
//     }
//   });

//   console.log('✅ Account soft deleted for user:', userId);

//   // Log de eliminación de cuenta
//   logger.info('Account deleted', {
//     userId,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, 'Cuenta eliminada exitosamente');
// });

// /**
//  * OAuth Google (placeholder - implementar según necesidades)
//  */
// export const googleAuth = catchAsync(async (req: Request, res: Response) => {
//   const { credential } = req.body;

//   console.log('🔄 Google OAuth attempt');

//   // TODO: Implementar OAuth con Google
//   // 1. Verificar credential con Google
//   // 2. Extraer información del usuario
//   // 3. Buscar o crear usuario
//   // 4. Generar tokens
  
//   ResponseUtils.success(res, {
//     message: 'Google OAuth no implementado aún'
//   }, 'Google OAuth endpoint');
// });

// /**
//  * OAuth Facebook (placeholder - implementar según necesidades)
//  */
// export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
//   const { accessToken } = req.body;

//   console.log('🔄 Facebook OAuth attempt');

//   // TODO: Implementar OAuth con Facebook
//   // 1. Verificar accessToken con Facebook
//   // 2. Extraer información del usuario
//   // 3. Buscar o crear usuario
//   // 4. Generar tokens
  
//   ResponseUtils.success(res, {
//     message: 'Facebook OAuth no implementado aún'
//   }, 'Facebook OAuth endpoint');
// });










// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { JwtUtils } from '@/utils/jwt.utils';
import { EmailService } from '@/services/email.service';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';
import { OAuth2Client } from 'google-auth-library';
import { env } from '@/config/env';


interface GoogleUser {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  verified_email?: boolean;
}

interface FacebookUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  picture?: { data?: { url?: string } };
  name?: string;
}

/**
 * Registrar nuevo usuario
 * POST /auth/register
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  console.log('🚀 Register controller called with data:', req.body);
  
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    userType,           // Frontend envía userType
    type,               // Backend puede recibir type también
    referralCode,
    
    // Campos de empresa del frontend
    companyName,
    legalName,
    taxId,
    companyDocument,
    
    // Campos adicionales para metadata
    identificationNumber,
    identificationType,
    dateOfBirth,
    industry,
    companySize,
    legalRepFirstName,
    legalRepLastName,
    legalRepPosition,
    legalRepPhone,
    legalRepEmail,
    legalRepId,
    businessStreet,
    businessCity,
    businessState,
    businessZipCode,
    businessCountry,
  } = req.body;

  // Transformar userType del frontend a type del backend
  const finalUserType = userType === 'person' ? 'PERSON' : 
                       userType === 'company' ? 'COMPANY' : 
                       type === 'PERSON' ? 'PERSON' :
                       type === 'COMPANY' ? 'COMPANY' :
                       'PERSON'; // default

  console.log('🔄 User type transformation:', { userType, type, finalUserType });

  // Determinar el nombre de la empresa y documento
  const finalCompanyName = companyName || legalName;
  const finalCompanyDocument = taxId || companyDocument;

  console.log('📧 Checking if user exists with email:', email);
  
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('❌ User already exists:', email);
    return ResponseUtils.conflict(res, 'El email ya está registrado');
  }

  // Validar campos requeridos para empresas
  if (finalUserType === 'COMPANY') {
    if (!finalCompanyName || !finalCompanyDocument) {
      return ResponseUtils.validationError(res, {
        companyName: ['El nombre de la empresa es requerido'],
        companyDocument: ['El documento de la empresa es requerido']
      });
    }
  }

  console.log('🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generar código de referido único
  const generateReferralCode = (): string => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  let uniqueReferralCode = generateReferralCode();
  console.log('🎫 Generated referral code:', uniqueReferralCode);
  
  // Asegurar que el código de referido sea único
  while (await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } })) {
    uniqueReferralCode = generateReferralCode();
    console.log('🔄 Referral code collision, trying new one:', uniqueReferralCode);
  }

  try {
    console.log('💾 Starting database transaction...');
    
    // Crear usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      console.log('👤 Creating user in database...');
      
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          type: finalUserType,
          referralCode: uniqueReferralCode,
          referredBy: referralCode || null,
          companyName: finalUserType === 'COMPANY' ? finalCompanyName : null,
          companyDocument: finalUserType === 'COMPANY' ? finalCompanyDocument : null,
          status: 'PENDING_VERIFICATION',
          isEmailVerified: false,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          type: true,
          status: true,
          isEmailVerified: true,
          referralCode: true,
          companyName: true,
          createdAt: true,
        },
      });

      console.log('💰 Creating wallet for user...');
      
      // Crear wallet para el usuario
      await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
          currency: 'USD',
          status: 'ACTIVE',
        },
      });

      console.log('🎫 Creating verification token...');
      
      // Generar token de verificación de email
      const verificationToken = uuidv4();
      
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        },
      });

      return { user, verificationToken };
    });

    console.log('📧 Sending verification email...');
    
    // Enviar email de verificación
    try {
      await EmailService.sendVerificationEmail(
        result.user.email,
        result.user.firstName,
        result.verificationToken
      );
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // No fallar el registro si el email falla
    }

    // Log del evento
    logger.info('User registered successfully', {
      userId: result.user.id,
      email: result.user.email,
      type: finalUserType,
    });

    console.log('✅ Registration completed successfully');

    // Retornar usuario sin tokens (deben verificar email primero)
    return ResponseUtils.created(res, {
      user: result.user
    }, '¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta.');

  } catch (error) {
    console.error('❌ Registration failed:', error);
    logger.error('Registration failed', { 
      email, 
      error: error instanceof Error ? error.message : String(error) 
    });

    return ResponseUtils.error(res, 'Error interno del servidor', 500);
  }
});



/**
 * Eliminar cuenta (soft delete)
 */
export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  console.log('🗑️ Account deletion request for user:', userId);

  // Soft delete - cambiar status a INACTIVE
  await prisma.user.update({
    where: { id: userId },
    data: { 
      status: 'INACTIVE',
      // Opcionalmente, también podrías limpiar datos sensibles
      // email: `deleted_${Date.now()}@deleted.com`,
    }
  });

  console.log('✅ Account soft deleted for user:', userId);

  // Log de eliminación de cuenta
  logger.info('Account deleted', {
    userId,
    ip: req.ip,
  });

  ResponseUtils.success(res, null, 'Cuenta eliminada exitosamente');
});

/**
 * Iniciar sesión
 * POST /auth/login
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  console.log('🚀 Login controller called with email:', req.body.email);
  
  const { email, password } = req.body;

  // Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      wallet: {
        select: {
          balance: true,
          availableBalance: true,
          pendingBalance: true,
          currency: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    console.log('❌ User not found:', email);
    return ResponseUtils.unauthorized(res, 'Credenciales inválidas');
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.log('❌ Invalid password for user:', email);
    return ResponseUtils.unauthorized(res, 'Credenciales inválidas');
  }

  // Verificar estado del usuario
  if (user.status === 'SUSPENDED') {
    return ResponseUtils.forbidden(res, 'Tu cuenta ha sido suspendida. Contacta al soporte.');
  }

  if (user.status === 'INACTIVE') {
    return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva. Contacta al soporte.');
  }

  console.log('🎫 Generating tokens...');
  
  // Generar tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  const tokenPair = JwtUtils.generateTokenPair(tokenPayload);

  // Crear refresh token en BD
  await prisma.refreshToken.create({
    data: {
      token: tokenPair.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    },
  });

  // Actualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Preparar datos del usuario (sin password)
  const { password: _, ...userWithoutPassword } = user;

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
  });

  console.log('✅ Login successful');

  // Respuesta exitosa
  return ResponseUtils.success(res, {
    user: userWithoutPassword,
    tokens: tokenPair,
  }, 'Inicio de sesión exitoso');
});

// /**
//  * Verificar email con token
//  * POST /auth/verify-email
//  */
// export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
//   const { token } = req.body;

//   if (!token) {
//     return ResponseUtils.badRequest(res, 'Token de verificación es requerido');
//   }

//   console.log('🔍 Verifying email token:', token.substring(0, 10) + '...');

//   try {
//     // Buscar el token de verificación en la base de datos
//     const verificationToken = await prisma.verificationToken.findUnique({
//       where: { 
//         token,
//         type: 'EMAIL_VERIFICATION',
//         isUsed: false 
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             isEmailVerified: true,
//             status: true
//           }
//         }
//       }
//     });

//     if (!verificationToken) {
//       console.log('❌ Invalid or not found token');
//       return ResponseUtils.badRequest(res, 'Token de verificación inválido o ya utilizado');
//     }

//     // Verificar si el token ha expirado
//     if (verificationToken.expiresAt < new Date()) {
//       console.log('❌ Token expired');
//       return ResponseUtils.badRequest(res, 'El token de verificación ha expirado');
//     }

//     // Verificar si el email ya está verificado
//     if (verificationToken.user.isEmailVerified) {
//       console.log('⚠️ Email already verified');
//       return ResponseUtils.badRequest(res, 'Este email ya está verificado');
//     }

//     // Actualizar usuario y marcar token como usado en una transacción
//     const result = await prisma.$transaction(async (tx) => {
//       // Marcar token como usado
//       await tx.verificationToken.update({
//         where: { id: verificationToken.id },
//         data: { 
//           isUsed: true,
//           usedAt: new Date()
//         }
//       });

//       // Actualizar usuario como verificado
//       const updatedUser = await tx.user.update({
//         where: { id: verificationToken.userId },
//         data: {
//           isEmailVerified: true,
//           emailVerifiedAt: new Date(),
//           status: 'ACTIVE' // Activar la cuenta al verificar el email
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           isEmailVerified: true,
//           status: true
//         }
//       });

//       return updatedUser;
//     });

//     // Crear billetera para el usuario verificado (si no existe)
//     try {
//       await prisma.wallet.upsert({
//         where: { userId: result.id },
//         update: {},
//         create: {
//           userId: result.id,
//           balance: 0,
//           availableBalance: 0,
//           pendingBalance: 0,
//           currency: 'USD',
//           status: 'ACTIVE'
//         }
//       });
//       console.log('✅ Wallet created/updated for user');
//     } catch (walletError) {
//       console.warn('⚠️ Error creating wallet (non-critical):', walletError);
//     }

//     // Enviar email de bienvenida (opcional, no bloquear si falla)
//     try {
//       await EmailService.sendWelcomeEmail(result.email, result.firstName);
//       console.log('✅ Welcome email sent');
//     } catch (emailError) {
//       console.warn('⚠️ Failed to send welcome email (non-critical):', emailError);
//     }

//     console.log('✅ Email verified successfully for user:', result.email);
    
//     logger.info('Email verified successfully', {
//       userId: result.id,
//       email: result.email,
//       ip: req.ip,
//     });

//     return ResponseUtils.success(res, {
//       user: result,
//       message: '¡Email verificado exitosamente! Tu cuenta está ahora activa.'
//     }, '¡Bienvenido a Wiru! Tu email ha sido verificado exitosamente.');

//   } catch (error) {
//     console.error('❌ Error during email verification:', error);
//     logger.error('Email verification error:', error);
//     return ResponseUtils.error(res, 'Error al verificar el email');
//   }
// });




/**
 * Verificar email con token (mejorado para manejar tokens ya utilizados)
 * POST /auth/verify-email
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body;

  console.log('🔍 Verifying email token:', token.substring(0, 10) + '...');

  // Buscar el token de verificación (incluso si ya fue usado)
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { 
      token,
      type: 'EMAIL_VERIFICATION'
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
          status: true
        }
      }
    }
  });

  if (!verificationToken) {
    console.log('❌ Invalid or not found token');
    return ResponseUtils.badRequest(res, 'Token de verificación inválido');
  }

  // Verificar si el token ha expirado
  if (verificationToken.expiresAt < new Date()) {
    console.log('❌ Token expired');
    return ResponseUtils.badRequest(res, 'El token de verificación ha expirado');
  }

  // ✅ NUEVO: Si el token ya fue usado pero el email YA está verificado, retornar éxito
  if (verificationToken.isUsed && verificationToken.user.isEmailVerified) {
    console.log('⚠️ Token already used but email already verified - returning success');
    
    // Enviar email de bienvenida si no se ha enviado (verificar con algún flag o timestamp)
    try {
      await EmailService.sendWelcomeEmail(
        verificationToken.user.email,
        verificationToken.user.firstName
      );
      console.log('✅ Welcome email sent');
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // No fallar la verificación por el email de bienvenida
    }

    // Asegurar que la wallet existe
    try {
      await ensureWalletExists(verificationToken.userId);
      console.log('✅ Wallet created/updated for user');
    } catch (walletError) {
      console.error('❌ Error creating wallet:', walletError);
      // No fallar la verificación por la wallet
    }

    return ResponseUtils.success(res, {
      user: verificationToken.user,
      message: 'Email ya verificado anteriormente'
    }, 'Email verificado exitosamente');
  }

  // Si el token ya fue usado pero el email NO está verificado, es un error
  if (verificationToken.isUsed && !verificationToken.user.isEmailVerified) {
    console.log('❌ Token already used but email not verified');
    return ResponseUtils.badRequest(res, 'Este token ya ha sido utilizado');
  }

  // Verificar si el email ya está verificado (sin usar token)
  if (verificationToken.user.isEmailVerified) {
    console.log('⚠️ Email already verified');
    return ResponseUtils.badRequest(res, 'Este email ya está verificado');
  }

  // Actualizar usuario y marcar token como usado en una transacción
  const result = await prisma.$transaction(async (tx) => {
    // Marcar token como usado
    await tx.verificationToken.update({
      where: { id: verificationToken.id },
      data: { 
        isUsed: true,
        usedAt: new Date()
      }
    });

    // Actualizar usuario como verificado
    const updatedUser = await tx.user.update({
      where: { id: verificationToken.userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE', // Activar usuario después de verificar email
      }
    });

    return updatedUser;
  });

  console.log('✅ Email verified successfully for user:', verificationToken.user.email);

  // Enviar email de bienvenida
  try {
    await EmailService.sendWelcomeEmail(
      verificationToken.user.email,
      verificationToken.user.firstName
    );
    console.log('✅ Welcome email sent');
  } catch (emailError) {
    console.error('❌ Error sending welcome email:', emailError);
    // No fallar la verificación por el email de bienvenida
  }

  // Asegurar que la wallet existe
  try {
    await ensureWalletExists(verificationToken.userId);
    console.log('✅ Wallet created/updated for user');
  } catch (walletError) {
    console.error('❌ Error creating wallet:', walletError);
    // No fallar la verificación por la wallet
  }

  // Log del evento
  logger.info('Email verified successfully', {
    userId: verificationToken.userId,
    email: verificationToken.user.email,
  });

  return ResponseUtils.success(res, {
    user: result,
    message: 'Email verificado exitosamente'
  }, 'Email verificado exitosamente');
});


/**
 * Función helper para asegurar que existe la wallet
 */
async function ensureWalletExists(userId: string): Promise<void> {
  try {
    // Verificar si ya existe la wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!existingWallet) {
      // Crear nueva wallet
      await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
          currency: 'USD',
          status: 'ACTIVE'
        }
      });
      console.log('✅ New wallet created for user:', userId);
    } else {
      console.log('✅ Wallet already exists for user:', userId);
    }
  } catch (error) {
    console.error('❌ Error in ensureWalletExists:', error);
    throw error;
  }
}



/**
 * Reenviar email de verificación
 * POST /auth/resend-verification
 */
export const resendVerification = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return ResponseUtils.badRequest(res, 'Email es requerido');
  }

  console.log('📧 Resend verification requested for:', email);

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      isEmailVerified: true,
      status: true,
    },
  });

  if (!user) {
    // Por seguridad, no revelar si el email existe o no
    return ResponseUtils.success(res, null, 'Si el email existe y no está verificado, se enviará un nuevo email de verificación');
  }

  // Si ya está verificado, no hacer nada
  if (user.isEmailVerified) {
    return ResponseUtils.badRequest(res, 'Este email ya está verificado');
  }

  try {
    // Invalidar tokens anteriores (marcar como usados)
    await prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        isUsed: false
      },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });

    // Crear nuevo token de verificación
    const newToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expira en 24 horas

    await prisma.verificationToken.create({
      data: {
        token: newToken,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
        expiresAt,
        isUsed: false
      }
    });

    console.log('🔄 New verification token created');

    // Enviar email de verificación
    const emailSent = await EmailService.sendVerificationEmail(
      user.email,
      user.firstName,
      newToken
    );

    if (!emailSent) {
      console.error('❌ Failed to send verification email');
      return ResponseUtils.error(res, 'Error al enviar el email de verificación');
    }

    console.log('✅ Verification email resent successfully');

    logger.info('Verification email resent', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    return ResponseUtils.success(res, null, 'Se ha enviado un nuevo email de verificación a tu dirección de correo');

  } catch (error) {
    console.error('❌ Error resending verification email:', error);
    logger.error('Resend verification error:', error);
    return ResponseUtils.error(res, 'Error al reenviar el email de verificación');
  }
});

/**
 * Renovar access token
 * POST /auth/refresh
 */
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  // Verificar refresh token
  const refreshTokenRecord = await prisma.refreshToken.findFirst({
    where: {
      token,
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!refreshTokenRecord) {
    return ResponseUtils.unauthorized(res, 'Refresh token inválido');
  }

  // Generar nuevo access token
  const newTokenPair = JwtUtils.generateTokenPair({
    userId: refreshTokenRecord.user.id,
    email: refreshTokenRecord.user.email,
    role: refreshTokenRecord.user.role,
    type: 'access',
  });

  // Actualizar refresh token en BD
  await prisma.refreshToken.update({
    where: { id: refreshTokenRecord.id },
    data: {
      token: newTokenPair.refreshToken,
      updatedAt: new Date(),
    },
  });

  return ResponseUtils.success(res, {
    tokens: newTokenPair,
  }, 'Tokens renovados exitosamente');
});

/**
 * Cerrar sesión
 * POST /auth/logout
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { refreshToken: token } = req.body;

  if (token) {
    // Desactivar refresh token específico
    await prisma.refreshToken.updateMany({
      where: {
        token,
        userId,
      },
      data: {
        isActive: false,
      },
    });
  }

  logger.info('User logged out', { userId });

  return ResponseUtils.success(res, null, 'Sesión cerrada exitosamente');
});

/**
 * Solicitar restablecimiento de contraseña
 * POST /auth/forgot-password
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  console.log('🔄 Password reset requested for:', email);

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
    }
  });

  // Siempre devolver éxito para evitar enumeración de usuarios
  if (!user) {
    console.log('❌ User not found for password reset:', email);
    return ResponseUtils.success(
      res, 
      null, 
      'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    );
  }

  // Invalidar tokens anteriores de reset de contraseña
  await prisma.verificationToken.updateMany({
    where: {
      userId: user.id,
      type: 'PASSWORD_RESET',
      isUsed: false,
    },
    data: { 
      isUsed: true,
      usedAt: new Date()
    }
  });

  // Generar nuevo token
  const resetToken = uuidv4();

  // Guardar token en base de datos
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
    }
  });

  console.log('✅ Password reset token created for user:', user.email);

  // Enviar email de reset
  try {
    await EmailService.sendPasswordResetEmail(
      email,
      user.firstName,
      resetToken
    );

    console.log('✅ Password reset email sent successfully');
    
    logger.info('Password reset requested', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });
    
  } catch (emailError) {
    console.error('❌ Error sending password reset email:', emailError);
    logger.error('Error sending password reset email', {
      userId: user.id,
      email: user.email,
      error: emailError,
    });
  }

  return ResponseUtils.success(
    res, 
    null, 
    'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
  );
});

/**
 * Restablecer contraseña con token
 * POST /auth/reset-password
 */
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  console.log('🔄 Password reset attempt with token:', token.substring(0, 10) + '...');

  // Buscar token válido
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: { gt: new Date() } // Token no expirado
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
        }
      }
    }
  });

  if (!verificationToken) {
    console.log('❌ Invalid or expired password reset token');
    return ResponseUtils.badRequest(
      res, 
      'Token de restablecimiento inválido o expirado. Solicita un nuevo enlace.'
    );
  }

  console.log('✅ Valid password reset token found for user:', verificationToken.user.email);

  // Actualizar contraseña y marcar token como usado en transacción
  await prisma.$transaction(async (tx) => {
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Actualizar contraseña del usuario
    await tx.user.update({
      where: { id: verificationToken.userId },
      data: {
        password: hashedPassword,
      }
    });

    // Marcar token como usado
    await tx.verificationToken.update({
      where: { id: verificationToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      }
    });

    // Invalidar todas las sesiones activas del usuario por seguridad
    await tx.userSession.updateMany({
      where: { userId: verificationToken.userId },
      data: { isActive: false }
    });

    // Invalidar todos los refresh tokens
    await tx.refreshToken.updateMany({
      where: { userId: verificationToken.userId },
      data: { isActive: false }
    });
  });

  console.log('✅ Password reset successful for user:', verificationToken.user.email);

  // Log del evento
  logger.info('Password reset successful', {
    userId: verificationToken.userId,
    email: verificationToken.user.email,
    ip: req.ip,
  });

  // Opcional: Enviar email de confirmación
  try {
    await EmailService.sendPasswordChangedNotification(
      verificationToken.user.email,
      verificationToken.user.firstName
    );
    console.log('✅ Password change notification sent');
  } catch (emailError) {
    console.error('❌ Error sending password change notification:', emailError);
    // No fallar el reset por el email de notificación
  }

  return ResponseUtils.success(
    res,
    null,
    'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
  );
});


/**
 * Obtener información del usuario autenticado
 */
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  // Buscar usuario con información completa
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      type: true,
      status: true,
      isEmailVerified: true,
      emailVerifiedAt: true,
      lastLoginAt: true,
      referralCode: true,
      companyName: true,
      companyDocument: true,
      createdAt: true,
      updatedAt: true,
      // Incluir relaciones si es necesario
      wallet: {
        select: {
          balance: true,
          pendingBalance: true,
        }
      }
    }
  });

  if (!user) {
    return ResponseUtils.notFound(res, 'Usuario no encontrado');
  }

  return ResponseUtils.success(res, { user }, 'Información del usuario obtenida exitosamente');
});

/**
 * Cambiar contraseña (usuario autenticado)
 * POST /auth/change-password
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return ResponseUtils.notFound(res, 'Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return ResponseUtils.badRequest(res, 'Contraseña actual incorrecta');
  }

  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  logger.info('Password changed successfully', {
    userId,
    email: user.email,
  });

  return ResponseUtils.success(res, null, 'Contraseña cambiada exitosamente');
});

/**
 * Autenticación con Google OAuth
 * POST /auth/google
 */
export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const { credential, access_token } = req.body;
  
  console.log('🔍 Google OAuth attempt');
  
  try {
    let userInfo: any;
    
    // Método 1: Usar credential (ID Token de Google Sign-In)
    if (credential) {
      const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        return ResponseUtils.badRequest(res, 'Token de Google inválido');
      }
      
      userInfo = {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        avatar: payload.picture,
        emailVerified: payload.email_verified,
      };
    }
    // Método 2: Usar access_token (OAuth2)
    else if (access_token) {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
      const googleUser = await response.json();
      
      if (!response.ok) {
        return ResponseUtils.badRequest(res, 'Token de acceso de Google inválido');
      }

      const googleUserTyped = googleUser as GoogleUser;
      
      userInfo = {
        googleId: googleUserTyped.id,
        email: googleUserTyped.email,
        firstName: googleUserTyped.given_name || '',
        lastName: googleUserTyped.family_name || '',
        avatar: googleUserTyped.picture,
        emailVerified: googleUserTyped.verified_email,
      };
    } else {
      return ResponseUtils.badRequest(res, 'Se requiere credential o access_token');
    }
    
    if (!userInfo.emailVerified) {
      return ResponseUtils.badRequest(res, 'El email de Google no está verificado');
    }
    
    // Buscar usuario existente por email o googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email },
          { googleId: userInfo.googleId }
        ]
      },
      include: {
        wallet: true
      }
    });
    
    let isNewUser = false;
    
    if (!user) {
      // Crear nuevo usuario
      isNewUser = true;
      
      // Generar código de referido único
      const referralCode = await generateUniqueReferralCode();
      
      // Crear usuario en transacción
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: userInfo.email,
            googleId: userInfo.googleId,
            password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Password random
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            avatar: userInfo.avatar,
            role: 'USER',
            type: 'PERSON',
            status: 'ACTIVE', // Google users are auto-verified
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            referralCode,
          },
          include: {
            wallet: true
          }
        });
        
        // Crear wallet
        await tx.wallet.create({
          data: {
            userId: newUser.id,
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            currency: 'USD',
            status: 'ACTIVE'
          }
        });
        
        return newUser;
      });
      
      console.log('✅ New Google user created:', user.email);
      
      // Enviar email de bienvenida
      try {
        await EmailService.sendWelcomeEmail(user.email, user.firstName);
        console.log('✅ Welcome email sent to Google user');
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
      }
      
    } else {
      // Usuario existente - actualizar googleId si no lo tiene
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: userInfo.googleId,
            avatar: userInfo.avatar || user.avatar,
            isEmailVerified: true,
            emailVerifiedAt: user.emailVerifiedAt || new Date(),
            status: 'ACTIVE'
          },
          include: {
            wallet: true
          }
        });
        
        console.log('✅ Existing user linked with Google:', user.email);
      }
      
      // Asegurar que tiene wallet
      if (!user.wallet) {
        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            currency: 'USD',
            status: 'ACTIVE'
          }
        });
      }
    }
    
    // Generar tokens JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
      sessionId: uuidv4()
    };
    
    const tokens = JwtUtils.generateTokenPair(tokenPayload);
    
    // Crear sesión de usuario
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        accessToken: tokens.accessToken,
        userAgent: req.get('User-Agent') || 'Unknown',
        ipAddress: req.ip || 'Unknown',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      }
    });
    
    // Preparar respuesta del usuario (sin password)
    const { password, ...userResponse } = user;
    
    // Log del evento
    logger.info('Google OAuth login successful', {
      userId: user.id,
      email: user.email,
      isNewUser,
      ip: req.ip,
    });
    
    return ResponseUtils.success(res, {
      user: userResponse,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      isNewUser,
      message: isNewUser ? 'Cuenta creada exitosamente con Google' : 'Login exitoso con Google'
    }, isNewUser ? 'Registro exitoso' : 'Login exitoso');
    
  } catch (error: any) {
    console.error('❌ Google OAuth error:', error);
    logger.error('Google OAuth error', {
      error: error.message,
      ip: req.ip,
    });
    
    if (error.message.includes('Token')) {
      return ResponseUtils.badRequest(res, 'Token de Google inválido o expirado');
    }
    
    return ResponseUtils.internalServerError(res, 'Error en la autenticación con Google');
  }
});


/**
 * Generar código de referido único
 */
async function generateUniqueReferralCode(): Promise<string> {
  let referralCode: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    // Generar código aleatorio de 8 caracteres
    referralCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    attempts++;
    
    // Verificar si el código ya existe
    const existingUser = await prisma.user.findUnique({
      where: { referralCode }
    });
    
    if (!existingUser) {
      break;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('No se pudo generar un código de referido único');
    }
  } while (true);
  
  return referralCode;
}

/**
 * Autenticación con Facebook OAuth
 * POST /auth/facebook
 */
export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, userID } = req.body;
  
  console.log('🔍 Facebook OAuth attempt');
  
  try {
    if (!accessToken) {
      return ResponseUtils.badRequest(res, 'Se requiere accessToken de Facebook');
    }
    
    // Verificar el access token con Facebook Graph API
    const facebookResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,first_name,last_name,name,picture.type(large)`
    );
    
    if (!facebookResponse.ok) {
      console.error('❌ Facebook API error:', await facebookResponse.text());
      return ResponseUtils.badRequest(res, 'Token de Facebook inválido o expirado');
    }

const facebookUser = await facebookResponse.json() as FacebookUser;
    
    // Verificar que el userID coincida (si se proporciona)
    if (userID && facebookUser.id !== userID) {
      return ResponseUtils.badRequest(res, 'User ID de Facebook no coincide');
    }
    
    if (!facebookUser.email) {
      return ResponseUtils.badRequest(res, 'Facebook no proporcionó un email válido');
    }
    
    const userInfo = {
      facebookId: facebookUser.id,
      email: facebookUser.email,
      firstName: facebookUser.first_name || '',
      lastName: facebookUser.last_name || '',
      avatar: facebookUser.picture?.data?.url,
      name: facebookUser.name,
    };
    
    console.log('✅ Facebook user info obtained:', {
      id: userInfo.facebookId,
      email: userInfo.email,
      name: userInfo.firstName + ' ' + userInfo.lastName
    });
    
    // Buscar usuario existente por email o facebookId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email },
          { facebookId: userInfo.facebookId }
        ]
      },
      include: {
        wallet: true
      }
    });
    
    let isNewUser = false;
    
    if (!user) {
      // Crear nuevo usuario
      isNewUser = true;
      
      // Generar código de referido único
      const referralCode = await generateUniqueReferralCode();
      
      // Crear usuario en transacción
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: userInfo.email,
            facebookId: userInfo.facebookId,
            password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Password random
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            avatar: userInfo.avatar,
            role: 'USER',
            type: 'PERSON',
            status: 'ACTIVE', // Facebook users are auto-verified
            isEmailVerified: true, // Asumimos que Facebook ya verificó el email
            emailVerifiedAt: new Date(),
            referralCode,
          },
          include: {
            wallet: true
          }
        });
        
        // Crear wallet
        await tx.wallet.create({
          data: {
            userId: newUser.id,
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            currency: 'USD',
            status: 'ACTIVE'
          }
        });
        
        return newUser;
      });
      
      console.log('✅ New Facebook user created:', user.email);
      
      // Enviar email de bienvenida
      try {
        await EmailService.sendWelcomeEmail(user.email, user.firstName);
        console.log('✅ Welcome email sent to Facebook user');
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
      }
      
    } else {
      // Usuario existente - actualizar facebookId si no lo tiene
      if (!user.facebookId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            facebookId: userInfo.facebookId,
            avatar: userInfo.avatar || user.avatar,
            isEmailVerified: true,
            emailVerifiedAt: user.emailVerifiedAt || new Date(),
            status: 'ACTIVE'
          },
          include: {
            wallet: true
          }
        });
        
        console.log('✅ Existing user linked with Facebook:', user.email);
      }
      
      // Asegurar que tiene wallet
      if (!user.wallet) {
        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            currency: 'USD',
            status: 'ACTIVE'
          }
        });
      }
    }
    
    // Generar tokens JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
      sessionId: uuidv4()
    };
    
    const tokens = JwtUtils.generateTokenPair(tokenPayload);
    
    // Crear sesión de usuario
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        accessToken: tokens.accessToken,
        userAgent: req.get('User-Agent') || 'Unknown',
        ipAddress: req.ip || 'Unknown',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      }
    });
    
    // Preparar respuesta del usuario (sin password)
    const { password, ...userResponse } = user;
    
    // Log del evento
    logger.info('Facebook OAuth login successful', {
      userId: user.id,
      email: user.email,
      isNewUser,
      ip: req.ip,
    });
    
    return ResponseUtils.success(res, {
      user: userResponse,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      isNewUser,
      message: isNewUser ? 'Cuenta creada exitosamente con Facebook' : 'Login exitoso con Facebook'
    }, isNewUser ? 'Registro exitoso' : 'Login exitoso');
    
  } catch (error: any) {
    console.error('❌ Facebook OAuth error:', error);
    logger.error('Facebook OAuth error', {
      error: error.message,
      ip: req.ip,
    });
    
    if (error.message.includes('Token') || error.message.includes('token')) {
      return ResponseUtils.badRequest(res, 'Token de Facebook inválido o expirado');
    }
    
    return ResponseUtils.internalServerError(res, 'Error en la autenticación con Facebook');
  }
});


