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
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { JwtUtils } from '@/utils/jwt.utils';
import { EmailService } from '@/services/email.service';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';

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

/**
 * Verificar email con token
 * POST /auth/verify-email
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return ResponseUtils.badRequest(res, 'Token de verificación es requerido');
  }

  console.log('🔍 Verifying email token:', token.substring(0, 10) + '...');

  try {
    // Buscar el token de verificación en la base de datos
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { 
        token,
        type: 'EMAIL_VERIFICATION',
        isUsed: false 
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
      return ResponseUtils.badRequest(res, 'Token de verificación inválido o ya utilizado');
    }

    // Verificar si el token ha expirado
    if (verificationToken.expiresAt < new Date()) {
      console.log('❌ Token expired');
      return ResponseUtils.badRequest(res, 'El token de verificación ha expirado');
    }

    // Verificar si el email ya está verificado
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
          status: 'ACTIVE' // Activar la cuenta al verificar el email
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
          status: true
        }
      });

      return updatedUser;
    });

    // Crear billetera para el usuario verificado (si no existe)
    try {
      await prisma.wallet.upsert({
        where: { userId: result.id },
        update: {},
        create: {
          userId: result.id,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
          currency: 'USD',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Wallet created/updated for user');
    } catch (walletError) {
      console.warn('⚠️ Error creating wallet (non-critical):', walletError);
    }

    // Enviar email de bienvenida (opcional, no bloquear si falla)
    try {
      await EmailService.sendWelcomeEmail(result.email, result.firstName);
      console.log('✅ Welcome email sent');
    } catch (emailError) {
      console.warn('⚠️ Failed to send welcome email (non-critical):', emailError);
    }

    console.log('✅ Email verified successfully for user:', result.email);
    
    logger.info('Email verified successfully', {
      userId: result.id,
      email: result.email,
      ip: req.ip,
    });

    ResponseUtils.success(res, {
      user: result,
      message: '¡Email verificado exitosamente! Tu cuenta está ahora activa.'
    }, '¡Bienvenido a Wiru! Tu email ha sido verificado exitosamente.');

  } catch (error) {
    console.error('❌ Error during email verification:', error);
    logger.error('Email verification error:', error);
    ResponseUtils.error(res, 'Error al verificar el email');
  }
});

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

    ResponseUtils.success(res, null, 'Se ha enviado un nuevo email de verificación a tu dirección de correo');

  } catch (error) {
    console.error('❌ Error resending verification email:', error);
    logger.error('Resend verification error:', error);
    ResponseUtils.error(res, 'Error al reenviar el email de verificación');
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

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Siempre retornar éxito por seguridad
  if (!user) {
    return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
  }

  // Invalidar tokens anteriores
  await prisma.verificationToken.updateMany({
    where: {
      userId: user.id,
      type: 'PASSWORD_RESET',
      isUsed: false,
    },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  });

  // Crear token de reset
  const resetToken = uuidv4();
  
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
    },
  });

  // Enviar email (implementar después)
  // await EmailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

  return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
});

/**
 * Restablecer contraseña
 * POST /auth/reset-password
 */
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Buscar token
  const resetToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: 'PASSWORD_RESET',
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!resetToken) {
    return ResponseUtils.badRequest(res, 'Token de restablecimiento inválido o expirado');
  }

  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Actualizar contraseña y marcar token como usado
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
      },
    }),
    prisma.verificationToken.update({
      where: { id: resetToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    }),
    // Invalidar todos los refresh tokens del usuario
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { isActive: false },
    }),
  ]);

  logger.info('Password reset successfully', {
    userId: resetToken.userId,
    email: resetToken.user.email,
  });

  return ResponseUtils.success(res, null, 'Contraseña restablecida exitosamente');
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

// OAuth controllers (placeholders para futura implementación)
export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  return ResponseUtils.error(res, 'OAuth de Google no implementado aún', 501);
});

export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
  return ResponseUtils.error(res, 'OAuth de Facebook no implementado aún', 501);
});