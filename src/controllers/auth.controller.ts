// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import { JwtUtils } from '@/utils/jwt.utils';
// import { ResponseUtils } from '@/utils/response.utils';
// import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';
// import prisma from '@/config/database';
// import logger from '@/config/logger';
// import { catchAsync } from '@/middleware/error.middleware';

// /**
//  * Registrar nuevo usuario
//  */
// export const register = catchAsync(async (req: Request, res: Response) => {
//   const { email, password, firstName, lastName, phone, type, referralCode, companyName, companyDocument } = req.body;

//   // Verificar si el usuario ya existe
//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   });

//   if (existingUser) {
//     return ResponseUtils.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
//   }

//   // Hashear la contraseña
//   const hashedPassword = await bcrypt.hash(password, 12);

//   // Generar código de referido único
//   const generateReferralCode = (): string => {
//     return Math.random().toString(36).substr(2, 8).toUpperCase();
//   };

//   let uniqueReferralCode = generateReferralCode();
  
//   // Asegurar que el código de referido sea único
//   while (await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } })) {
//     uniqueReferralCode = generateReferralCode();
//   }

//   try {
//     // Crear usuario en una transacción
//     const result = await prisma.$transaction(async (tx: { user: { create: (arg0: { data: { email: any; password: string; firstName: any; lastName: any; phone: any; type: any; referralCode: string; referredBy: any; companyName: any; companyDocument: any; }; select: { id: boolean; email: boolean; firstName: boolean; lastName: boolean; phone: boolean; type: boolean; role: boolean; status: boolean; isEmailVerified: boolean; referralCode: boolean; createdAt: boolean; }; }) => any; }; wallet: { create: (arg0: { data: { userId: any; balance: number; availableBalance: number; pendingBalance: number; currency: string; }; }) => any; }; }) => {
//       // Crear el usuario
//       const user = await tx.user.create({
//         data: {
//           email,
//           password: hashedPassword,
//           firstName,
//           lastName,
//           phone,
//           type: type || 'PERSON',
//           referralCode: uniqueReferralCode,
//           referredBy: referralCode || null,
//           companyName: type === 'COMPANY' ? companyName : null,
//           companyDocument: type === 'COMPANY' ? companyDocument : null,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           phone: true,
//           type: true,
//           role: true,
//           status: true,
//           isEmailVerified: true,
//           referralCode: true,
//           createdAt: true,
//         }
//       });

//       // Si es usuario tipo PERSON, crear billetera
//       if (user.type === 'PERSON') {
//         await tx.wallet.create({
//           data: {
//             userId: user.id,
//             balance: 0,
//             availableBalance: 0,
//             pendingBalance: 0,
//             currency: 'USD',
//           }
//         });
//       }

//       return user;
//     });

//     // Generar tokens
//     const tokenPair = JwtUtils.generateTokenPair({
//       userId: result.id,
//       email: result.email,
//       role: result.role,
//       type: result.type,
//     });

//     // Log del registro exitoso
//     logger.info('User registered successfully', {
//       userId: result.id,
//       email: result.email,
//       type: result.type,
//       ip: req.ip,
//     });

//     ResponseUtils.created(res, {
//       user: result,
//       tokens: tokenPair,
//     }, SUCCESS_MESSAGES.USER_CREATED);

//   } catch (error) {
//     logger.error('Error registering user:', error);
//     ResponseUtils.error(res, 'Error al crear el usuario');
//   }
// });

// /**
//  * Iniciar sesión
//  */
// export const login = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

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
//       type: true,
//       role: true,
//       status: true,
//       isEmailVerified: true,
//       referralCode: true,
//       lastLoginAt: true,
//     }
//   });

//   if (!user) {
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
//   }

//   // Verificar contraseña
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
//   }

//   // Verificar que el usuario esté activo
//   if (user.status !== 'ACTIVE') {
//     return ResponseUtils.forbidden(res, 'Cuenta inactiva. Contacta soporte.');
//   }

//   try {
//     // Actualizar último login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLoginAt: new Date() }
//     });

//     // Generar tokens
//     const tokenPair = JwtUtils.generateTokenPair({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     // Preparar datos del usuario (sin contraseña)
//     const { password: _, ...userWithoutPassword } = user;

//     // Log del login exitoso
//     logger.info('User logged in successfully', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//       userAgent: req.get('User-Agent'),
//     });

//     ResponseUtils.success(res, {
//       user: userWithoutPassword,
//       tokens: tokenPair,
//     }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

//   } catch (error) {
//     logger.error('Error during login:', error);
//     ResponseUtils.error(res, 'Error al procesar el login');
//   }
// });

// /**
//  * Obtener información del usuario autenticado
//  */
// export const getMe = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       phone: true,
//       avatar: true,
//       type: true,
//       role: true,
//       status: true,
//       isEmailVerified: true,
//       emailVerifiedAt: true,
//       referralCode: true,
//       companyName: true,
//       companyDocument: true,
//       createdAt: true,
//       updatedAt: true,
//       lastLoginAt: true,
//     }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
//   }

//   ResponseUtils.success(res, { user }, 'Información del usuario');
// });

// /**
//  * Cerrar sesión
//  */
// export const logout = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   // Log del logout
//   logger.info('User logged out', {
//     userId,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
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
//         type: true,
//         status: true,
//       }
//     });

//     if (!user || user.status !== 'ACTIVE') {
//       return ResponseUtils.unauthorized(res, 'Usuario no válido');
//     }

//     // Generar nuevos tokens
//     const tokenPair = JwtUtils.generateTokenPair({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     ResponseUtils.success(res, { tokens: tokenPair }, 'Tokens renovados');

//   } catch (error) {
//     logger.error('Error refreshing token:', error);
//     ResponseUtils.unauthorized(res, 'Refresh token inválido');
//   }
// });

// /**
//  * Solicitar reset de contraseña
//  */
// export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: { id: true, email: true, firstName: true }
//   });

//   // Por seguridad, siempre devolver éxito aunque el email no exista
//   if (!user) {
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }

//   // TODO: Implementar envío de email con token de reset
//   // Por ahora solo logeamos
//   logger.info('Password reset requested', {
//     userId: user.id,
//     email: user.email,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
// });

// /**
//  * Cambiar contraseña (usuario autenticado)
//  */
// export const changePassword = catchAsync(async (req: Request, res: Response) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = (req as any).user?.id;

//   // Buscar usuario con contraseña actual
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, password: true }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
//   }

//   // Verificar contraseña actual
//   const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
//   if (!isCurrentPasswordValid) {
//     return ResponseUtils.unauthorized(res, 'Contraseña actual incorrecta');
//   }

//   // Hashear nueva contraseña
//   const hashedNewPassword = await bcrypt.hash(newPassword, 12);

//   // Actualizar contraseña
//   await prisma.user.update({
//     where: { id: userId },
//     data: { password: hashedNewPassword }
//   });

//   logger.info('Password changed successfully', {
//     userId,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, SUCCESS_MESSAGES.PASSWORD_RESET);
// });

// /**
//  * Verificar email (placeholder)
//  */
// export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
//   // TODO: Implementar verificación real con token
//   ResponseUtils.success(res, null, 'Funcionalidad de verificación de email en desarrollo');
// });

// /**
//  * Reenviar verificación de email (placeholder)
//  */
// export const resendVerification = catchAsync(async (req: Request, res: Response) => {
//   // TODO: Implementar reenvío real
//   ResponseUtils.success(res, null, 'Funcionalidad de reenvío en desarrollo');
// });






// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import { z } from 'zod';
// import { JwtUtils } from '@/utils/jwt.utils';
// import { ResponseUtils } from '@/utils/response.utils';
// import { SUCCESS_MESSAGES, ERROR_MESSAGES, USER_STATUS } from '@/utils/constants';
// import prisma from '@/config/database';
// import logger from '@/config/logger';
// import { AppError } from '@/utils/appError';
// import { catchAsync } from '@/middleware/error.middleware';
// import { tokenService, TokenType } from '@/services/token.service';
// import { emailService } from '@/services/email.service';
// import { oauthService } from '@/services/oauth.service';
// import { RefreshTokenService } from '@/services/refreshToken.service';
// import { env } from '@/config/env';



// /**
//  * Registrar nuevo usuario
//  */
// export const register = catchAsync(async (req: Request, res: Response) => {
//   console.log('🚀 Register controller called with data:', req.body);
  
//   const { email, password, firstName, lastName, phone, type, referralCode, companyName, companyDocument } = req.body;

//   console.log('📧 Checking if user exists with email:', email);
  
//   // Verificar si el usuario ya existe
//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   });

//   if (existingUser) {
//     console.log('❌ User already exists:', email);
//     return ResponseUtils.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
//   }

//   console.log('🔐 Hashing password...');
//   // Hashear la contraseña
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
//           type: type || 'PERSON',
//           referralCode: uniqueReferralCode,
//           referredBy: referralCode || null,
//           companyName: type === 'COMPANY' ? companyName : null,
//           companyDocument: type === 'COMPANY' ? companyDocument : null,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           phone: true,
//           type: true,
//           role: true,
//           status: true,
//           isEmailVerified: true,
//           referralCode: true,
//           createdAt: true,
//         }
//       });

//       console.log('✅ User created successfully:', user.id);

//       // Si es usuario tipo PERSON, crear billetera
//       if (user.type === 'PERSON') {
//         console.log('💰 Creating wallet for user...');
//         await tx.wallet.create({
//           data: {
//             userId: user.id,
//             balance: 0,
//             availableBalance: 0,
//             pendingBalance: 0,
//             currency: 'USD',
//           }
//         });
//         console.log('✅ Wallet created successfully');
//       }

//       return user;
//     });

//     console.log('🎉 Transaction completed successfully');

//     // Generar tokens
//     const tokenPair = JwtUtils.generateTokenPair({ 
//       userId: result.id,
//       email: result.email,
//       role: result.role,
//       type: result.type,
//     });

//     console.log('🔑 Tokens generated successfully');

//     // Log del registro exitoso
//     logger.info('User registered successfully', {
//       userId: result.id,
//       email: result.email,
//       type: result.type,
//       ip: req.ip,
//     });

//     ResponseUtils.created(res, {
//       user: result,
//       tokens: tokenPair,
//     }, SUCCESS_MESSAGES.USER_CREATED);

//   } catch (error) {
//     console.error('💥 Error in register transaction:', error);
//     logger.error('Error registering user:', error);
//     ResponseUtils.error(res, 'Error al crear el usuario');
//   }
// });

// /**
//  * Iniciar sesión
//  */
// // export const login = catchAsync(async (req: Request, res: Response) => {
// //   const { email, password } = req.body;

// //   // Buscar usuario por email
// //   const user = await prisma.user.findUnique({
// //     where: { email },
// //     select: {
// //       id: true,
// //       email: true,
// //       password: true,
// //       firstName: true,
// //       lastName: true,
// //       phone: true,
// //       type: true,
// //       role: true,
// //       status: true,
// //       isEmailVerified: true,
// //       referralCode: true,
// //       lastLoginAt: true,
// //     }
// //   });

// //   if (!user) {
// //     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
// //   }

// //   // Verificar contraseña
// //   const isPasswordValid = await bcrypt.compare(password, user.password);
// //   if (!isPasswordValid) {
// //     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
// //   }

// //   // Verificar que el usuario esté activo
// //   if (user.status !== 'ACTIVE') {
// //     return ResponseUtils.forbidden(res, 'Cuenta inactiva. Contacta soporte.');
// //   }

// //   try {
// //     // Actualizar último login
// //     await prisma.user.update({
// //       where: { id: user.id },
// //       data: { lastLoginAt: new Date() }
// //     });

// //     // Generar tokens
// //     const tokenPair = JwtUtils.generateTokenPair({
// //       userId: user.id,
// //       email: user.email,
// //       role: user.role,
// //       type: user.type,
// //     });

// //     // Preparar datos del usuario (sin contraseña)
// //     const { password: _, ...userWithoutPassword } = user;

// //     // Log del login exitoso
// //     logger.info('User logged in successfully', {
// //       userId: user.id,
// //       email: user.email,
// //       ip: req.ip,
// //       userAgent: req.get('User-Agent'),
// //     });

// //     return ResponseUtils.success(res, {
// //       user: userWithoutPassword,
// //       tokens: tokenPair,
// //     }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

// //   } catch (error) {
// //     logger.error('Error during login:', error);
// //     return ResponseUtils.error(res, 'Error al procesar el login');
// //   }
// // });

// /**
//  * Obtener información del usuario autenticado
//  */
// export const getMe = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       phone: true,
//       avatar: true,
//       type: true,
//       role: true,
//       status: true,
//       isEmailVerified: true,
//       emailVerifiedAt: true,
//       referralCode: true,
//       companyName: true,
//       companyDocument: true,
//       createdAt: true,
//       updatedAt: true,
//       lastLoginAt: true,
//     }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
//   }

//   return ResponseUtils.success(res, { user }, 'Información del usuario');
// });

// /**
//  * Cerrar sesión
//  */
// // export const logout = catchAsync(async (req: Request, res: Response) => {
// //   const userId = (req as any).user?.id;

// //   // Log del logout
// //   logger.info('User logged out', {
// //     userId,
// //     ip: req.ip,
// //   });

// //   ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
// // });

// /**
//  * Refresh token
//  */
// // export const refreshToken = catchAsync(async (req: Request, res: Response) => {
// //   const { refreshToken } = req.body;

// //   try {
// //     // Verificar refresh token
// //     const payload = JwtUtils.verifyRefreshToken(refreshToken);

// //     // Buscar usuario
// //     const user = await prisma.user.findUnique({
// //       where: { id: payload.userId },
// //       select: {
// //         id: true,
// //         email: true,
// //         role: true,
// //         type: true,
// //         status: true,
// //       }
// //     });

// //     if (!user || user.status !== 'ACTIVE') {
// //       return ResponseUtils.unauthorized(res, 'Usuario no válido');
// //     }

// //     // Generar nuevos tokens
// //     const tokenPair = JwtUtils.generateTokenPair({
// //       userId: user.id,
// //       email: user.email,
// //       role: user.role,
// //       type: user.type,
// //     });

// //     return ResponseUtils.success(res, { tokens: tokenPair }, 'Tokens renovados');

// //   } catch (error) {
// //     logger.error('Error refreshing token:', error);
// //     return ResponseUtils.unauthorized(res, 'Refresh token inválido');
// //   }
// // });

// /**
//  * Solicitar reset de contraseña
//  */
// export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: { id: true, email: true, firstName: true }
//   });

//   // Por seguridad, siempre devolver éxito aunque el email no exista
//   if (!user) {
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }

//   // TODO: Implementar envío de email con token de reset
//   // Por ahora solo logeamos
//   logger.info('Password reset requested', {
//     userId: user.id,
//     email: user.email,
//     ip: req.ip,
//   });

//   return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
// });

// /**
//  * Cambiar contraseña (usuario autenticado)
//  */
// export const changePassword = catchAsync(async (req: Request, res: Response) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = (req as any).user?.id;

//   // Buscar usuario con contraseña actual
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, password: true }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
//   }

//   // Verificar contraseña actual
//   const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
//   if (!isCurrentPasswordValid) {
//     return ResponseUtils.unauthorized(res, 'Contraseña actual incorrecta');
//   }

//   // Hashear nueva contraseña
//   const hashedNewPassword = await bcrypt.hash(newPassword, 12);

//   // Actualizar contraseña
//   await prisma.user.update({
//     where: { id: userId },
//     data: { password: hashedNewPassword }
//   });

//   logger.info('Password changed successfully', {
//     userId,
//     ip: req.ip,
//   });

//   return ResponseUtils.success(res, null, SUCCESS_MESSAGES.PASSWORD_RESET);
// });

// /**
//  * Verificar email (placeholder)
//  */
// export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
//   // TODO: Implementar verificación real con token
//   ResponseUtils.success(res, null, 'Funcionalidad de verificación de email en desarrollo');
// });

// /**
//  * Reenviar verificación de email (placeholder)
//  */
// export const resendVerification = catchAsync(async (req: Request, res: Response) => {
//   // TODO: Implementar reenvío real
//   ResponseUtils.success(res, null, 'Funcionalidad de reenvío en desarrollo');
// });




// /**
//  * Verificar email con token
//  * POST /auth/verify-email
//  */
// export const verifyEmailWithToken = catchAsync(async (req: Request, res: Response) => {
//   const { token } = req.body;

//   const verificationResult = await tokenService.verifyEmailToken(token);

//   if (!verificationResult.isValid) {
//     return ResponseUtils.badRequest(res, verificationResult.error || 'Token de verificación inválido');
//   }

//   // Actualizar usuario como verificado
//   const user = await prisma.user.update({
//     where: { id: verificationResult.userId },
//     data: {
//       isEmailVerified: true,
//       emailVerifiedAt: new Date(),
//       status: 'ACTIVE',
//     },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       isEmailVerified: true,
//     },
//   });

//   // Enviar email de bienvenida
//   await emailService.sendWelcomeEmail(user.email, user.firstName);

//   logger.info('Email verified successfully', {
//     userId: user.id,
//     email: user.email,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, user, 'Email verificado exitosamente');
// });

// /**
//  * Reenviar email de verificación
//  * POST /auth/resend-verification
//  */
// export const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       isEmailVerified: true,
//     },
//   });

//   if (!user) {
//     // No revelar si el usuario existe o no
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás un nuevo enlace de verificación');
//   }

//   if (user.isEmailVerified) {
//     return ResponseUtils.badRequest(res, 'Este email ya está verificado');
//   }

//   // Crear nuevo token de verificación
//   const verificationToken = await tokenService.createEmailVerificationToken(user.id);

//   // Enviar email de verificación
//   await emailService.sendVerificationEmail({
//     email: user.email,
//     firstName: user.firstName,
//     verificationToken,
//   });

//   logger.info('Verification email resent', {
//     userId: user.id,
//     email: user.email,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, 'Si el email existe, recibirás un nuevo enlace de verificación');
// });

// /**
//  * Solicitar reset de contraseña con token
//  * POST /auth/forgot-password
//  */
// export const forgotPasswordAdvanced = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//     },
//   });

//   if (!user) {
//     // No revelar si el usuario existe o no
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }

//   // Crear token de reset de contraseña
//   const resetToken = await tokenService.createPasswordResetToken(user.id, user.email);

//   // Enviar email de reset
//   await emailService.sendPasswordResetEmail({
//     email: user.email,
//     firstName: user.firstName,
//     resetToken,
//   });

//   logger.info('Password reset requested', {
//     userId: user.id,
//     email: user.email,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
// });

// /**
//  * Restablecer contraseña con token
//  * POST /auth/reset-password
//  */
// export const resetPasswordWithToken = catchAsync(async (req: Request, res: Response) => {
//   const { token, newPassword } = req.body;

//   const verificationResult = await tokenService.verifyPasswordResetToken(token);

//   if (!verificationResult.isValid) {
//     return ResponseUtils.badRequest(res, verificationResult.error || 'Token de reset inválido o expirado');
//   }

//   // Hashear nueva contraseña
//   const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

//   // Actualizar contraseña y marcar token como usado
//   await prisma.$transaction(async (tx) => {
//     await tx.user.update({
//       where: { id: verificationResult.userId },
//       data: { password: hashedPassword },
//     });

//     await tokenService.markTokenAsUsed(token);

//     // Invalidar todas las sesiones activas
//     await tx.userSession.updateMany({
//       where: { userId: verificationResult.userId },
//       data: { isActive: false },
//     });
//   });

//   logger.info('Password reset completed', {
//     userId: verificationResult.userId,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, null, 'Contraseña restablecida exitosamente');
// });

// /**
//  * Login con Google
//  * POST /auth/google
//  */
// export const googleLogin = catchAsync(async (req: Request, res: Response) => {
//   const { accessToken, idToken } = req.body;

//   let token = accessToken;

//   // Si se proporciona idToken, validarlo
//   if (idToken && !accessToken) {
//     const googleUser = await oauthService.validateGoogleToken(idToken);
//     if (!googleUser) {
//       return ResponseUtils.unauthorized(res, 'Token de Google inválido');
//     }
//     token = idToken;
//   }

//   if (!token) {
//     return ResponseUtils.badRequest(res, 'Se requiere accessToken o idToken de Google');
//   }

//   try {
//     const result = await oauthService.loginWithGoogle(token);

//     logger.info('Google login successful', {
//       userId: result.user.id,
//       email: result.user.email,
//       isNewUser: result.isNewUser,
//       ip: req.ip,
//     });

//     const responseData = {
//       user: result.user,
//       accessToken: result.accessToken,
//       refreshToken: result.refreshToken,
//       isNewUser: result.isNewUser,
//     };

//     ResponseUtils.success(res, responseData, result.isNewUser ? 'Registro exitoso con Google' : 'Login exitoso con Google');
//   } catch (error: any) {
//     logger.error('Google login failed:', {
//       error: error.message,
//       ip: req.ip,
//     });

//     ResponseUtils.badRequest(res, error.message || 'Error en el login con Google');
//   }
// });

// /**
//  * Login con Facebook
//  * POST /auth/facebook
//  */
// export const facebookLogin = catchAsync(async (req: Request, res: Response) => {
//   const { accessToken } = req.body;

//   if (!accessToken) {
//     return ResponseUtils.badRequest(res, 'Se requiere accessToken de Facebook');
//   }

//   try {
//     const result = await oauthService.loginWithFacebook(accessToken);

//     logger.info('Facebook login successful', {
//       userId: result.user.id,
//       email: result.user.email,
//       isNewUser: result.isNewUser,
//       ip: req.ip,
//     });

//     const responseData = {
//       user: result.user,
//       accessToken: result.accessToken,
//       refreshToken: result.refreshToken,
//       isNewUser: result.isNewUser,
//     };

//     ResponseUtils.success(res, responseData, result.isNewUser ? 'Registro exitoso con Facebook' : 'Login exitoso con Facebook');
//   } catch (error: any) {
//     logger.error('Facebook login failed:', {
//       error: error.message,
//       ip: req.ip,
//     });

//     ResponseUtils.badRequest(res, error.message || 'Error en el login con Facebook');
//   }
// });

// /**
//  * Callback de Google OAuth
//  * GET /auth/google/callback
//  */
// export const googleCallback = catchAsync(async (req: Request, res: Response) => {
//   const { code, error } = req.query;

//   if (error) {
//     return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Error de autenticación con Google')}`);
//   }

//   if (!code) {
//     return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Código de autorización no encontrado')}`);
//   }

//   try {
//     const accessToken = await oauthService.exchangeGoogleCode(code as string);
//     const result = await oauthService.loginWithGoogle(accessToken);

//     // Redirigir al frontend con tokens
//     const redirectUrl = `${env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}&new=${result.isNewUser}`;
//     res.redirect(redirectUrl);
//   } catch (error: any) {
//     logger.error('Google OAuth callback error:', error);
//     res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Error en el callback de Google')}`);
//   }
// });

// /**
//  * Callback de Facebook OAuth
//  * GET /auth/facebook/callback
//  */
// export const facebookCallback = catchAsync(async (req: Request, res: Response) => {
//   const { code, error } = req.query;

//   if (error) {
//     return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Error de autenticación con Facebook')}`);
//   }

//   if (!code) {
//     return res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Código de autorización no encontrado')}`);
//   }

//   try {
//     const accessToken = await oauthService.exchangeFacebookCode(code as string);
//     const result = await oauthService.loginWithFacebook(accessToken);

//     // Redirigir al frontend con tokens
//     const redirectUrl = `${env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}&new=${result.isNewUser}`;
//     res.redirect(redirectUrl);
//   } catch (error: any) {
//     logger.error('Facebook OAuth callback error:', error);
//     res.redirect(`${env.FRONTEND_URL}/auth/error?message=${encodeURIComponent('Error en el callback de Facebook')}`);
//   }
// });

// /**
//  * Obtener cuentas OAuth vinculadas
//  * GET /auth/oauth-accounts
//  */
// export const getOAuthAccounts = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   const accounts = await oauthService.getUserOAuthAccounts(userId);

//   ResponseUtils.success(res, accounts, 'Cuentas OAuth obtenidas exitosamente');
// });

// /**
//  * Desvincular cuenta OAuth
//  * DELETE /auth/oauth/:provider
//  */
// export const unlinkOAuthAccount = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;
//   const { provider } = req.params;

//   if (!['GOOGLE', 'FACEBOOK'].includes(provider.toUpperCase())) {
//     return ResponseUtils.badRequest(res, 'Proveedor OAuth no válido');
//   }

//   const success = await oauthService.unlinkOAuthAccount(userId, provider.toUpperCase() as 'GOOGLE' | 'FACEBOOK');

//   if (!success) {
//     return ResponseUtils.notFound(res, 'Cuenta OAuth no encontrada');
//   }

//   logger.info('OAuth account unlinked', {
//     userId,
//     provider: provider.toUpperCase(),
//   });

//   ResponseUtils.success(res, null, `Cuenta de ${provider} desvinculada exitosamente`);
// });




// // Schemas de validación
// const loginSchema = z.object({
//   email: z.string().email('Email inválido').toLowerCase().trim(),
//   password: z.string().min(1, 'Contraseña es requerida'),
// });

// const refreshTokenSchema = z.object({
//   refreshToken: z.string().min(1, 'Refresh token es requerido'),
// });

// /**
//  * Login actualizado con refresh token
//  */
// export const login = catchAsync(async (req: Request, res: Response) => {
//   console.log('🚀 Login controller called with data:', { email: req.body.email });
  
//   const { email, password } = req.body;

//   // Verificar si el usuario existe
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
//       type: true,
//       role: true,
//       status: true,
//       isEmailVerified: true,
//       emailVerifiedAt: true,
//     }
//   });

//   if (!user) {
//     console.log('❌ User not found:', email);
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
//   }

//   // Verificar la contraseña
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     console.log('❌ Invalid password for user:', email);
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
//   }

//   // Verificar el estado del usuario
//   if (user.status !== USER_STATUS.ACTIVE) {
//     console.log('❌ User inactive:', email, 'Status:', user.status);
//     return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva. Contacta soporte.');
//   }

//   try {
//     // Actualizar último login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLoginAt: new Date() }
//     });

//     // Generar access token
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     // Crear refresh token en la base de datos
//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     // Preparar datos del usuario (sin contraseña)
//     const { password: _, ...userWithoutPassword } = user;

//     // Log del login exitoso
//     logger.info('User logged in successfully', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//       userAgent: req.get('User-Agent'),
//     });

//     ResponseUtils.success(res, {
//       user: userWithoutPassword,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

//   } catch (error) {
//     logger.error('Error during login:', error);
//     ResponseUtils.error(res, 'Error al procesar el login');
//   }
// });

// /**
//  * Refresh token con rotación
//  */
// export const refreshToken = catchAsync(async (req: Request, res: Response) => {
//   const { refreshToken: token } = req.body;

//   if (!token) {
//     return ResponseUtils.badRequest(res, 'Refresh token es requerido');
//   }

//   // Rotar el refresh token
//   const result = await RefreshTokenService.rotateRefreshToken(token);

//   if (!result) {
//     return ResponseUtils.unauthorized(res, 'Refresh token inválido o expirado');
//   }

//   logger.info('Token refreshed successfully', {
//     userId: result.refreshTokenData.userId,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, {
//     tokens: {
//       accessToken: result.accessToken,
//       refreshToken: result.newRefreshToken,
//     },
//   }, 'Tokens renovados correctamente');
// });

// /**
//  * Logout actualizado con revocación de refresh token
//  */
// export const logout = catchAsync(async (req: Request, res: Response) => {
//   const { refreshToken } = req.body;
//   const userId = (req as any).user?.id;

//   try {
//     if (refreshToken) {
//       // Revocar el refresh token específico
//       await RefreshTokenService.revokeRefreshToken(refreshToken);
//     } else if (userId) {
//       // Si no hay refresh token, revocar todos los tokens del usuario
//       await RefreshTokenService.revokeAllUserTokens(userId);
//     }

//     logger.info('User logged out', {
//       userId,
//       ip: req.ip,
//       refreshTokenProvided: !!refreshToken,
//     });

//     ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);

//   } catch (error) {
//     logger.error('Error during logout', {
//       error: error instanceof Error ? error.message : error,
//       userId,
//     });

//     // Aún en caso de error, consideramos el logout exitoso
//     ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
//   }
// });

// /**
//  * Logout de todos los dispositivos
//  */
// export const logoutAll = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   if (!userId) {
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//   }

//   try {
//     const revokedCount = await RefreshTokenService.revokeAllUserTokens(userId);

//     logger.info('User logged out from all devices', {
//       userId,
//       tokensRevoked: revokedCount,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       tokensRevoked: revokedCount,
//     }, 'Sesión cerrada en todos los dispositivos');

//   } catch (error) {
//     logger.error('Error during logout all', {
//       error: error instanceof Error ? error.message : error,
//       userId,
//     });

//     ResponseUtils.error(res, 'Error al cerrar sesiones');
//   }
// });

// /**
//  * Obtener información de tokens activos del usuario
//  */
// export const getTokenInfo = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   if (!userId) {
//     throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
//   }

//   try {
//     const tokenStats = await RefreshTokenService.getUserTokenStats(userId);

//     ResponseUtils.success(res, {
//       tokenStats,
//     }, 'Información de tokens obtenida');

//   } catch (error) {
//     logger.error('Error getting token info', {
//       error: error instanceof Error ? error.message : error,
//       userId,
//     });

//     throw new AppError('Error al obtener información de tokens', 500);
//   }
// });



// // Configuración OAuth
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Schemas para OAuth
// const googleAuthSchema = z.object({
//   credential: z.string().min(1, 'Google credential es requerido'),
// });

// const facebookAuthSchema = z.object({
//   accessToken: z.string().min(1, 'Facebook access token es requerido'),
// });

// const appleAuthSchema = z.object({
//   identityToken: z.string().min(1, 'Apple identity token es requerido'),
//   authorizationCode: z.string().optional(),
// });

// /**
//  * Autenticación con Google OAuth
//  */
// export const googleAuth = catchAsync(async (req: Request, res: Response) => {
//   const { credential } = googleAuthSchema.parse(req.body);

//   try {
//     // Verificar el credential de Google
//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload) {
//       throw new AppError('Token de Google inválido', 400);
//     }

//     const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

//     if (!email) {
//       throw new AppError('Email no proporcionado por Google', 400);
//     }

//     // Buscar usuario existente
//     let user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email },
//           { googleId },
//         ],
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         type: true,
//         status: true,
//         isEmailVerified: true,
//         googleId: true,
//       },
//     });

//     // Si el usuario existe pero no tiene googleId, actualizarlo
//     if (user && !user.googleId) {
//       user = await prisma.user.update({
//         where: { id: user.id },
//         data: { googleId },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           googleId: true,
//         },
//       });
//     }

//     // Si el usuario no existe, crearlo
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email,
//           firstName: firstName || 'Usuario',
//           lastName: lastName || 'Google',
//           googleId,
//           isEmailVerified: true, // Google ya verificó el email
//           status: USER_STATUS.ACTIVE,
//           role: 'USER',
//           type: 'PERSON',
//           password: '', // OAuth users don't need password
//           profileImage: picture || null,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           googleId: true,
//         },
//       });

//       logger.info('New user registered via Google OAuth', {
//         userId: user.id,
//         email: user.email,
//       });
//     }

//     // Verificar estado del usuario
//     if (user.status !== USER_STATUS.ACTIVE) {
//       throw new AppError('Tu cuenta está inactiva. Contacta al administrador.', 403);
//     }

//     // Generar tokens
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     logger.info('User authenticated via Google OAuth', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       user,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, 'Autenticación con Google exitosa');

//   } catch (error) {
//     logger.error('Google OAuth error', {
//       error: error instanceof Error ? error.message : error,
//       ip: req.ip,
//     });

//     if (error instanceof AppError) {
//       throw error;
//     }

//     throw new AppError('Error en la autenticación con Google', 500);
//   }
// });

// /**
//  * Autenticación con Facebook OAuth
//  */
// export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
//   const { accessToken } = facebookAuthSchema.parse(req.body);

//   try {
//     // Verificar el access token con Facebook
//     const response = await axios.get(`https://graph.facebook.com/me`, {
//       params: {
//         access_token: accessToken,
//         fields: 'id,email,first_name,last_name,picture',
//       },
//     });

//     const { id: facebookId, email, first_name: firstName, last_name: lastName, picture } = response.data;

//     if (!email) {
//       throw new AppError('Email no proporcionado por Facebook', 400);
//     }

//     // Buscar usuario existente
//     let user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email },
//           { facebookId },
//         ],
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         type: true,
//         status: true,
//         isEmailVerified: true,
//         facebookId: true,
//       },
//     });

//     // Si el usuario existe pero no tiene facebookId, actualizarlo
//     if (user && !user.facebookId) {
//       user = await prisma.user.update({
//         where: { id: user.id },
//         data: { facebookId },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           facebookId: true,
//         },
//       });
//     }

//     // Si el usuario no existe, crearlo
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email,
//           firstName: firstName || 'Usuario',
//           lastName: lastName || 'Facebook',
//           facebookId,
//           isEmailVerified: true, // Facebook ya verificó el email
//           status: USER_STATUS.ACTIVE,
//           role: 'USER',
//           type: 'PERSON',
//           password: '', // OAuth users don't need password
//           profileImage: picture?.data?.url || null,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           facebookId: true,
//         },
//       });

//       logger.info('New user registered via Facebook OAuth', {
//         userId: user.id,
//         email: user.email,
//       });
//     }

//     // Verificar estado del usuario
//     if (user.status !== USER_STATUS.ACTIVE) {
//       throw new AppError('Tu cuenta está inactiva. Contacta al administrador.', 403);
//     }

//     // Generar tokens
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     logger.info('User authenticated via Facebook OAuth', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       user,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, 'Autenticación con Facebook exitosa');

//   } catch (error) {
//     logger.error('Facebook OAuth error', {
//       error: error instanceof Error ? error.message : error,
//       ip: req.ip,
//     });

//     if (error instanceof AppError) {
//       throw error;
//     }

//     throw new AppError('Error en la autenticación con Facebook', 500);
//   }
// });

// /**
//  * Autenticación con Apple OAuth
//  */
// export const appleAuth = catchAsync(async (req: Request, res: Response) => {
//   const { identityToken, authorizationCode } = appleAuthSchema.parse(req.body);

//   try {
//     // Decodificar el identity token de Apple (sin verificar por simplicidad)
//     // En producción deberías verificar la firma con las claves públicas de Apple
//     const decoded = JSON.parse(Buffer.from(identityToken.split('.')[1], 'base64').toString());
    
//     const { sub: appleId, email } = decoded;

//     if (!email) {
//       throw new AppError('Email no proporcionado por Apple', 400);
//     }

//     // Buscar usuario existente
//     let user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email }
//         ],
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         type: true,
//         status: true,
//         isEmailVerified: true,
//       },
//     });

   

//     // Si el usuario no existe, crearlo
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email,
//           firstName: 'Usuario',
//           lastName: 'Apple',
//           isEmailVerified: true, // Apple ya verificó el email
//           status: USER_STATUS.ACTIVE,
//           role: 'USER',
//           type: 'PERSON',
//           password: '', // OAuth users don't need password
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//         },
//       });

//       logger.info('New user registered via Apple OAuth', {
//         userId: user.id,
//         email: user.email,
//       });
//     }

//     // Verificar estado del usuario
//     if (user.status !== USER_STATUS.ACTIVE) {
//       throw new AppError('Tu cuenta está inactiva. Contacta al administrador.', 403);
//     }

//     // Generar tokens
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     logger.info('User authenticated via Apple OAuth', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       user,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, 'Autenticación con Apple exitosa');

//   } catch (error) {
//     logger.error('Apple OAuth error', {
//       error: error instanceof Error ? error.message : error,
//       ip: req.ip,
//     });

//     if (error instanceof AppError) {
//       throw error;
//     }

//     throw new AppError('Error en la autenticación con Apple', 500);
//   }
// });







// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import { OAuth2Client } from 'google-auth-library';
// import axios from 'axios';

// import { VerificationTokenService } from '@/services/verificationToken.service';
// import { EmailService } from '@/services/email.service';

// import { JwtUtils } from '@/utils/jwt.utils';
// import { ResponseUtils } from '@/utils/response.utils';
// import { catchAsync } from '@/middleware/error.middleware';
// import { SUCCESS_MESSAGES, ERROR_MESSAGES, USER_STATUS } from '@/utils/constants';
// import { RefreshTokenService } from '@/services/refreshToken.service';
// import { TokenBlacklistService } from '@/services/tokenBlacklist.service';
// import prisma from '@/config/database';
// import logger from '@/config/logger';

// // Configuración OAuth
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// /**
//  * Registrar nuevo usuario con envío de email de verificación
//  */
// export const register = catchAsync(async (req: Request, res: Response) => {
//   console.log('🚀 Register controller called with data:', req.body);

//   console.log(req.body)
  
//   const { email, password, firstName, lastName, phone, type, referralCode, companyName, companyDocument } = req.body;

//   console.log('📧 Checking if user exists with email:', email);
  
//   // Verificar si el usuario ya existe
//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   });

//   if (existingUser) {
//     console.log('❌ User already exists:', email);
//     return ResponseUtils.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
//   }

//   console.log('🔐 Hashing password...');
//   const hashedPassword = await bcrypt.hash(password, 12);

//   // Generar código de referido único
//   const generateReferralCode = (): string => {
//     return Math.random().toString(36).substr(2, 8).toUpperCase();
//   };

//   let uniqueReferralCode = generateReferralCode();
//   console.log('🎫 Generated referral code:', uniqueReferralCode);
  
//   while (await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } })) {
//     uniqueReferralCode = generateReferralCode();
//     console.log('🔄 Referral code collision, trying new one:', uniqueReferralCode);
//   }

//   try {
//     console.log('💾 Starting database transaction...');
    
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
//           type: type || 'PERSON',
//           referralCode: uniqueReferralCode,
//           referredBy: referralCode || null,
//           companyName: type === 'COMPANY' ? companyName : null,
//           companyDocument: type === 'COMPANY' ? companyDocument : null,
//           status: USER_STATUS.PENDING_VERIFICATION,
//           role: 'USER',
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           phone: true,
//           type: true,
//           role: true,
//           status: true,
//           isEmailVerified: true,
//           referralCode: true,
//           companyName: true,
//           companyDocument: true,
//           createdAt: true,
//         }
//       });

//       console.log('✅ User created successfully:', user.id);

//       // Crear token de verificación de email DENTRO de la transacción
//       console.log('📧 Creating email verification token...');
//       const verificationToken = await VerificationTokenService.createVerificationToken(
//         user.id,
//         'EMAIL_VERIFICATION',
//         24, // Expira en 24 horas
//         tx  // Pasar la transacción
//       );

//       return { user, verificationToken };
//     });

//     console.log('📧 Email config check:');
// console.log('SMTP_HOST:', process.env.SMTP_HOST);
// console.log('SMTP_USER:', process.env.SMTP_USER);
// console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
// console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

//     // Enviar email DESPUÉS de la transacción (para evitar problemas)
//     console.log('📤 Sending verification email...');
//     console.log('Aqiiii')
//     const emailSent = await EmailService.sendVerificationEmail(
//       result.user.email,
//       result.user.firstName,
//       result.verificationToken.token
//     );

//     if (!emailSent) {
//       console.warn('⚠️ Email verification could not be sent, but user was created');
//     } else {
//       console.log('✅ Verification email sent successfully');
//     }

//     // Log del registro exitoso
//     logger.info('User registered successfully', {
//       userId: result.user.id,
//       email: result.user.email,
//       type: result.user.type,
//       emailSent,
//       ip: req.ip,
//     });

//     ResponseUtils.created(res, {
//       user: result.user,
//       emailSent,
//     }, 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.');

//   } catch (error) {
//     console.error('❌ Error during registration:', error);
//     logger.error('Registration error:', error);
//     ResponseUtils.error(res, 'Error al registrar usuario');
//   }
// });

// /**
//  * Login de usuario con refresh token
//  */
// export const login = catchAsync(async (req: Request, res: Response) => {
//   console.log('🚀 Login controller called with data:', { email: req.body.email });
  
//   const { email, password } = req.body;

//   // Verificar si el usuario existe
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
//       type: true,
//       role: true,
//       status: true,
//       isEmailVerified: true,
//       emailVerifiedAt: true,
//     }
//   });

//   if (!user) {
//     console.log('❌ User not found:', email);
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
//   }

//   // Verificar la contraseña
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     console.log('❌ Invalid password for user:', email);
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
//   }

//   // Verificar el estado del usuario
//   if (user.status !== USER_STATUS.ACTIVE) {
//     console.log('❌ User inactive:', email, 'Status:', user.status);
//     return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva. Contacta soporte.');
//   }

//   try {
//     // Actualizar último login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLoginAt: new Date() }
//     });

//     // Generar access token
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     // Crear refresh token en la base de datos
//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     // Preparar datos del usuario (sin contraseña)
//     const { password: _, ...userWithoutPassword } = user;

//     // Log del login exitoso
//     logger.info('User logged in successfully', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//       userAgent: req.get('User-Agent'),
//     });

//     return ResponseUtils.success(res, {
//       user: userWithoutPassword,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

//   } catch (error) {
//     logger.error('Error during login:', error);
//     return ResponseUtils.error(res, 'Error al procesar el login');
//   }
// });

// /**
//  * Refresh token con rotación automática
//  */
// export const refreshToken = catchAsync(async (req: Request, res: Response) => {
//   const { refreshToken: token } = req.body;

//   if (!token) {
//     return ResponseUtils.badRequest(res, 'Refresh token es requerido');
//   }

//   // Rotar el refresh token
//   const result = await RefreshTokenService.rotateRefreshToken(token);

//   if (!result) {
//     return ResponseUtils.unauthorized(res, 'Refresh token inválido o expirado');
//   }

//   logger.info('Token refreshed successfully', {
//     userId: result.refreshTokenData.userId,
//     ip: req.ip,
//   });

//   ResponseUtils.success(res, {
//     tokens: {
//       accessToken: result.accessToken,
//       refreshToken: result.newRefreshToken,
//     },
//   }, 'Tokens renovados correctamente');
// });

// /**
//  * Obtener información del usuario autenticado
//  */
// export const getMe = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       phone: true,
//       avatar: true,
//       type: true,
//       role: true,
//       status: true,
//       isEmailVerified: true,
//       emailVerifiedAt: true,
//       referralCode: true,
//       companyName: true,
//       companyDocument: true,
//       createdAt: true,
//       updatedAt: true,
//       lastLoginAt: true,
//     }
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
//   }

//   return ResponseUtils.success(res, { user }, 'Información del usuario');
// });

// /**
//  * Logout con revocación de refresh token
//  */
// export const logout = catchAsync(async (req: Request, res: Response) => {
//   const { refreshToken } = req.body;
//   const userId = (req as any).user?.id;

//   try {
//     if (refreshToken) {
//       // Revocar el refresh token específico
//       await RefreshTokenService.revokeRefreshToken(refreshToken);
//     } else if (userId) {
//       // Si no hay refresh token, revocar todos los tokens del usuario
//       await RefreshTokenService.revokeAllUserTokens(userId);
//     }

//     logger.info('User logged out', {
//       userId,
//       ip: req.ip,
//       refreshTokenProvided: !!refreshToken,
//     });

//     ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);

//   } catch (error) {
//     logger.error('Error during logout', {
//       error: error instanceof Error ? error.message : error,
//       userId,
//     });

//     // Aún en caso de error, consideramos el logout exitoso
//     ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
//   }
// });

// /**
//  * Logout de todos los dispositivos
//  */
// export const logoutAll = catchAsync(async (req: Request, res: Response) => {
//   const userId = (req as any).user?.id;

//   if (!userId) {
//     return ResponseUtils.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
//   }

//   try {
//     const revokedCount = await RefreshTokenService.revokeAllUserTokens(userId);

//     logger.info('User logged out from all devices', {
//       userId,
//       tokensRevoked: revokedCount,
//       ip: req.ip,
//     });

//     return ResponseUtils.success(res, {
//       tokensRevoked: revokedCount,
//     }, 'Sesión cerrada en todos los dispositivos');

//   } catch (error) {
//     logger.error('Error during logout all', {
//       error: error instanceof Error ? error.message : error,
//       userId,
//     });

//     return ResponseUtils.error(res, 'Error al cerrar sesiones');
//   }
// });

// /**
//  * Autenticación con Google OAuth
//  */
// export const googleAuth = catchAsync(async (req: Request, res: Response) => {
//   const { credential } = req.body;

//   try {
//     console.log('🔍 Verifying Google credential...');
    
//     // Verificar el credential de Google
//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload) {
//       return ResponseUtils.badRequest(res, 'Token de Google inválido');
//     }

//     const { 
//       sub: googleId, 
//       email, 
//       given_name: firstName, 
//       family_name: lastName, 
//       picture 
//     } = payload;

//     if (!email) {
//       return ResponseUtils.badRequest(res, 'Email no proporcionado por Google');
//     }

//     console.log('✅ Google credential verified for:', email);

//     // Buscar usuario existente
//     let user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email },
//           { googleId },
//         ],
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         type: true,
//         status: true,
//         isEmailVerified: true,
//         googleId: true,
//         avatar: true,
//       },
//     });

//     // Si el usuario existe pero no tiene googleId, actualizarlo
//     if (user && !user.googleId) {
//       console.log('🔄 Linking existing account with Google ID');
//       user = await prisma.user.update({
//         where: { id: user.id },
//         data: { googleId },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           googleId: true,
//           avatar: true,
//         },
//       });
//     }

//     // Si el usuario no existe, crearlo
//     if (!user) {
//       console.log('👤 Creating new user from Google OAuth');
      
//       // Generar código de referido único
//       const generateReferralCode = (): string => {
//         return Math.random().toString(36).substr(2, 8).toUpperCase();
//       };

//       let uniqueReferralCode = generateReferralCode();
//       while (await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } })) {
//         uniqueReferralCode = generateReferralCode();
//       }

//       user = await prisma.user.create({
//         data: {
//           email,
//           firstName: firstName || 'Usuario',
//           lastName: lastName || 'Google',
//           googleId,
//           isEmailVerified: true, // Google ya verificó el email
//           emailVerifiedAt: new Date(),
//           status: USER_STATUS.ACTIVE,
//           role: 'USER',
//           type: 'PERSON',
//           password: '', // OAuth users don't need password
//           avatar: picture || null,
//           referralCode: uniqueReferralCode,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           googleId: true,
//           avatar: true,
//         },
//       });

//       logger.info('New user registered via Google OAuth', {
//         userId: user.id,
//         email: user.email,
//       });
//     }

//     // Verificar estado del usuario
//     if (user.status !== USER_STATUS.ACTIVE) {
//       return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva. Contacta al administrador.');
//     }

//     // Actualizar último login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLoginAt: new Date() }
//     });

//     // Generar tokens
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     logger.info('User authenticated via Google OAuth', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       user,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, 'Autenticación con Google exitosa');

//   } catch (error) {
//     logger.error('Google OAuth error', {
//       error: error instanceof Error ? error.message : error,
//       ip: req.ip,
//     });

//     if (error instanceof Error && error.message.includes('Token used too early')) {
//       return ResponseUtils.badRequest(res, 'Token de Google inválido o usado antes de tiempo');
//     }

//     ResponseUtils.error(res, 'Error en la autenticación con Google');
//   }
// });

// /**
//  * Autenticación con Facebook OAuth
//  */
// export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
//   const { accessToken: fbAccessToken } = req.body;

//   try {
//     console.log('🔍 Verifying Facebook access token...');
    
//     // Verificar el access token con Facebook
//     const response = await axios.get(`https://graph.facebook.com/me`, {
//       params: {
//         access_token: fbAccessToken,
//         fields: 'id,email,first_name,last_name,picture',
//       },
//     });

//     const { 
//       id: facebookId, 
//       email, 
//       first_name: firstName, 
//       last_name: lastName, 
//       picture 
//     } = response.data;

//     if (!email) {
//       return ResponseUtils.badRequest(res, 'Email no proporcionado por Facebook');
//     }

//     console.log('✅ Facebook access token verified for:', email);

//     // Buscar usuario existente
//     let user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           { email },
//           { facebookId },
//         ],
//       },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         type: true,
//         status: true,
//         isEmailVerified: true,
//         facebookId: true,
//         avatar: true,
//       },
//     });

//     // Si el usuario existe pero no tiene facebookId, actualizarlo
//     if (user && !user.facebookId) {
//       console.log('🔄 Linking existing account with Facebook ID');
//       user = await prisma.user.update({
//         where: { id: user.id },
//         data: { facebookId },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           facebookId: true,
//           avatar: true,
//         },
//       });
//     }

//     // Si el usuario no existe, crearlo
//     if (!user) {
//       console.log('👤 Creating new user from Facebook OAuth');
      
//       // Generar código de referido único
//       const generateReferralCode = (): string => {
//         return Math.random().toString(36).substr(2, 8).toUpperCase();
//       };

//       let uniqueReferralCode = generateReferralCode();
//       while (await prisma.user.findUnique({ where: { referralCode: uniqueReferralCode } })) {
//         uniqueReferralCode = generateReferralCode();
//       }

//       user = await prisma.user.create({
//         data: {
//           email,
//           firstName: firstName || 'Usuario',
//           lastName: lastName || 'Facebook',
//           facebookId,
//           isEmailVerified: true, // Facebook ya verificó el email
//           emailVerifiedAt: new Date(),
//           status: USER_STATUS.ACTIVE,
//           role: 'USER',
//           type: 'PERSON',
//           password: '', // OAuth users don't need password
//           avatar: picture?.data?.url || null,
//           referralCode: uniqueReferralCode,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           facebookId: true,
//           avatar: true,
//         },
//       });

//       logger.info('New user registered via Facebook OAuth', {
//         userId: user.id,
//         email: user.email,
//       });
//     }

//     // Verificar estado del usuario
//     if (user.status !== USER_STATUS.ACTIVE) {
//       return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva. Contacta al administrador.');
//     }

//     // Actualizar último login
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { lastLoginAt: new Date() }
//     });

//     // Generar tokens
//     const accessToken = JwtUtils.generateAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       type: user.type,
//     });

//     const refreshTokenData = await RefreshTokenService.createRefreshToken(user.id);

//     logger.info('User authenticated via Facebook OAuth', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, {
//       user,
//       tokens: {
//         accessToken,
//         refreshToken: refreshTokenData.token,
//       },
//     }, 'Autenticación con Facebook exitosa');

//   } catch (error) {
//     logger.error('Facebook OAuth error', {
//       error: error instanceof Error ? error.message : error,
//       ip: req.ip,
//     });

//     if (axios.isAxiosError(error)) {
//       return ResponseUtils.badRequest(res, 'Token de Facebook inválido');
//     }

//     ResponseUtils.error(res, 'Error en la autenticación con Facebook');
//   }
// });

// /**
//  * Solicitar reset de contraseña con email
//  */
// export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   console.log('🔑 Password reset requested for:', email);

//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: { 
//       id: true, 
//       email: true, 
//       firstName: true,
//       status: true,
//       isEmailVerified: true,
//     }
//   });

//   // Por seguridad, siempre devolver éxito aunque el email no exista
//   if (!user) {
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }

//   // Verificar que el usuario esté activo
//   if (user.status !== USER_STATUS.ACTIVE) {
//     return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }

//   // Verificar cooldown para reset de contraseña
//   const canRequest = await VerificationTokenService.canRequestNewToken(
//     user.id,
//     'PASSWORD_RESET',
//     15 // 15 minutos de cooldown para reset de contraseña
//   );

//   if (!canRequest) {
//     return ResponseUtils.badRequest(res, 'Debes esperar 15 minutos antes de solicitar otro reset de contraseña');
//   }

//   try {
//     // Crear token de reset de contraseña
//     console.log('🔄 Creating password reset token...');
//     const resetToken = await VerificationTokenService.createVerificationToken(
//       user.id,
//       'PASSWORD_RESET',
//       1 // Expira en 1 hora
//     );

//     // Enviar email de reset
//     console.log('📤 Sending password reset email...');
//     const emailSent = await EmailService.sendPasswordResetEmail(
//       user.email,
//       user.firstName,
//       resetToken.token
//     );

//     logger.info('Password reset email sent', {
//       userId: user.id,
//       email: user.email,
//       emailSent,
//       ip: req.ip,
//     });

//     ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');

//   } catch (error) {
//     console.error('❌ Error sending password reset email:', error);
//     logger.error('Password reset error:', error);
    
//     // Por seguridad, devolver éxito incluso si hay error
//     ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
//   }
// });

// /**
//  * Verificar email con token
//  */
// export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
//   const { token } = req.body;

//   if (!token) {
//     return ResponseUtils.badRequest(res, 'Token de verificación es requerido');
//   }

//   console.log('🔍 Verifying email token...');

//   // Validar token de verificación
//   const tokenValidation = await VerificationTokenService.validateToken(token, 'EMAIL_VERIFICATION');

//   if (!tokenValidation) {
//     return ResponseUtils.badRequest(res, 'Token de verificación inválido o expirado');
//   }

//   const { tokenData, userId } = tokenValidation;

//   try {
//     // Actualizar usuario como verificado en una transacción
//     const result = await prisma.$transaction(async (tx) => {
//       // Marcar email como verificado
//       const updatedUser = await tx.user.update({
//         where: { id: userId },
//         data: {
//           isEmailVerified: true,
//           emailVerifiedAt: new Date(),
//           status: USER_STATUS.ACTIVE, // Activar usuario al verificar email
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           role: true,
//           type: true,
//           status: true,
//           isEmailVerified: true,
//           emailVerifiedAt: true,
//         },
//       });

//       // Marcar token como usado
//       await VerificationTokenService.markTokenAsUsed(tokenData.id);

//       return updatedUser;
//     });

//     // Enviar email de bienvenida
//     const welcomeEmailSent = await EmailService.sendWelcomeEmail(
//       result.email,
//       result.firstName
//     );

//     logger.info('Email verified successfully', {
//       userId: result.id,
//       email: result.email,
//       welcomeEmailSent,
//       ip: req.ip,
//     });

//     console.log('✅ Email verified successfully for user:', result.email);

//     ResponseUtils.success(res, {
//       user: result,
//       welcomeEmailSent,
//     }, 'Email verificado exitosamente. ¡Bienvenido a Wiru!');

//   } catch (error) {
//     console.error('❌ Error during email verification:', error);
//     logger.error('Email verification error:', error);
//     ResponseUtils.error(res, 'Error al verificar el email');
//   }
// });


// /**
//  * Reenviar email de verificación
//  */
// export const resendVerification = catchAsync(async (req: Request, res: Response) => {
//   const { email } = req.body;

//   if (!email) {
//     return ResponseUtils.badRequest(res, 'Email es requerido');
//   }

//   console.log('📧 Resend verification requested for:', email);

//   // Buscar usuario
//   const user = await prisma.user.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       email: true,
//       firstName: true,
//       isEmailVerified: true,
//       status: true,
//     },
//   });

//   if (!user) {
//     // Por seguridad, no revelar si el email existe o no
//     return ResponseUtils.success(res, null, 'Si el email existe y no está verificado, se enviará un nuevo email de verificación');
//   }

//   // Si ya está verificado, no hacer nada
//   if (user.isEmailVerified) {
//     return ResponseUtils.badRequest(res, 'Este email ya está verificado');
//   }

//   // Verificar cooldown (evitar spam)
//   const canRequest = await VerificationTokenService.canRequestNewToken(
//     user.id,
//     'EMAIL_VERIFICATION',
//     5 // 5 minutos de cooldown
//   );

//   if (!canRequest) {
//     return ResponseUtils.badRequest(res, 'Debes esperar 5 minutos antes de solicitar otro email de verificación');
//   }

//   try {
//     // Crear nuevo token de verificación
//     console.log('🔄 Creating new verification token...');
//     const verificationToken = await VerificationTokenService.createVerificationToken(
//       user.id,
//       'EMAIL_VERIFICATION',
//       24
//     );

//     console.log('📧 Email config check:');
// console.log('SMTP_HOST:', process.env.SMTP_HOST);
// console.log('SMTP_USER:', process.env.SMTP_USER);
// console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);
// console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

//     // Enviar email de verificación
//     console.log('📤 Sending new verification email...');
//     const emailSent = await EmailService.sendVerificationEmail(
//       user.email,
//       user.firstName,
//       verificationToken.token
//     );

//     if (!emailSent) {
//       console.error('❌ Failed to send verification email');
//       return ResponseUtils.error(res, 'Error al enviar email de verificación');
//     }

//     logger.info('Verification email resent', {
//       userId: user.id,
//       email: user.email,
//       ip: req.ip,
//     });

//     console.log('✅ Verification email resent successfully');

//     ResponseUtils.success(res, {
//       emailSent: true,
//     }, 'Email de verificación reenviado exitosamente');

//   } catch (error) {
//     console.error('❌ Error resending verification email:', error);
//     logger.error('Resend verification error:', error);
//     ResponseUtils.error(res, 'Error al reenviar email de verificación');
//   }
// });


// /**
//  * Restablecer contraseña con token
//  */
// export const resetPassword = catchAsync(async (req: Request, res: Response) => {
//   const { token, newPassword } = req.body;

//   if (!token || !newPassword) {
//     return ResponseUtils.badRequest(res, 'Token y nueva contraseña son requeridos');
//   }

//   console.log('🔑 Password reset attempt with token');

//   // Validar token de reset
//   const tokenValidation = await VerificationTokenService.validateToken(token, 'PASSWORD_RESET');

//   if (!tokenValidation) {
//     return ResponseUtils.badRequest(res, 'Token de reset inválido o expirado');
//   }

//   const { tokenData, userId } = tokenValidation;

//   try {
//     // Hashear nueva contraseña
//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     // Actualizar contraseña en una transacción
//     const result = await prisma.$transaction(async (tx) => {
//       // Actualizar contraseña
//       const updatedUser = await tx.user.update({
//         where: { id: userId },
//         data: {
//           password: hashedPassword,
//         },
//         select: {
//           id: true,
//           email: true,
//           firstName: true,
//         },
//       });

//       // Marcar token como usado
//       await VerificationTokenService.markTokenAsUsed(tokenData.id);

//       // Revocar todos los refresh tokens del usuario (forzar re-login)
//       await RefreshTokenService.revokeAllUserTokens(userId);

//       return updatedUser;
//     });

//     logger.info('Password reset successfully', {
//       userId: result.id,
//       email: result.email,
//       ip: req.ip,
//     });

//     console.log('✅ Password reset successfully for user:', result.email);

//     ResponseUtils.success(res, null, 'Contraseña restablecida exitosamente. Por favor inicia sesión con tu nueva contraseña.');

//   } catch (error) {
//     console.error('❌ Error during password reset:', error);
//     logger.error('Password reset error:', error);
//     ResponseUtils.error(res, 'Error al restablecer la contraseña');
//   }
// });


// /**
//  * Cambiar contraseña (usuario autenticado)
//  */
// export const changePassword = catchAsync(async (req: Request, res: Response) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = (req as any).user?.id;

//   if (!currentPassword || !newPassword) {
//     return ResponseUtils.badRequest(res, 'Contraseña actual y nueva contraseña son requeridas');
//   }

//   console.log('🔑 Password change requested for user:', userId);

//   // Obtener usuario con contraseña actual
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       email: true,
//       password: true,
//       firstName: true,
//     },
//   });

//   if (!user) {
//     return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
//   }

//   // Verificar contraseña actual
//   const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
//   if (!isCurrentPasswordValid) {
//     return ResponseUtils.badRequest(res, 'La contraseña actual es incorrecta');
//   }

//   // Verificar que la nueva contraseña sea diferente
//   const isSamePassword = await bcrypt.compare(newPassword, user.password);
//   if (isSamePassword) {
//     return ResponseUtils.badRequest(res, 'La nueva contraseña debe ser diferente a la actual');
//   }

//   try {
//     // Hashear nueva contraseña
//     const hashedPassword = await bcrypt.hash(newPassword, 12);

//     // Actualizar contraseña
//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         password: hashedPassword,
//       },
//     });

//     // Revocar todos los refresh tokens excepto el actual (opcional)
//     await RefreshTokenService.revokeAllUserTokens(userId);

//     logger.info('Password changed successfully', {
//       userId,
//       email: user.email,
//       ip: req.ip,
//     });

//     console.log('✅ Password changed successfully for user:', user.email);

//     ResponseUtils.success(res, null, 'Contraseña cambiada exitosamente');

//   } catch (error) {
//     console.error('❌ Error changing password:', error);
//     logger.error('Change password error:', error);
//     ResponseUtils.error(res, 'Error al cambiar la contraseña');
//   }
// });








// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { JwtUtils } from '@/utils/jwt.utils';
import { EmailService } from '@/services/email.service';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';
import { ERROR_MESSAGES } from '@/utils/constants';

/**
 * Registrar nuevo usuario
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
    return ResponseUtils.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS || 'El email ya está registrado');
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

  // Preparar metadata adicional
  const metadata = {
    personal: identificationNumber ? {
      identificationNumber,
      identificationType,
      dateOfBirth,
    } : null,
    company: finalUserType === 'COMPANY' ? {
      industry,
      companySize,
      legalRep: legalRepFirstName ? {
        firstName: legalRepFirstName,
        lastName: legalRepLastName,
        position: legalRepPosition,
        phone: legalRepPhone,
        email: legalRepEmail,
        id: legalRepId,
      } : null,
      businessAddress: businessStreet ? {
        street: businessStreet,
        city: businessCity,
        state: businessState,
        zipCode: businessZipCode,
        country: businessCountry || 'Ecuador',
      } : null,
    } : null,
    registrationSource: 'web',
    registrationTimestamp: new Date().toISOString(),
  };

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
          // Si tu modelo tiene campo metadata, descomenta la siguiente línea:
          // metadata: metadata,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          type: true,
          referralCode: true,
          companyName: true,
          companyDocument: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
        }
      });

      console.log('💰 Creating user wallet...');
      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          pendingBalance: 0,
        }
      });

      return { user, wallet };
    });

    console.log('✅ User created successfully:', result.user.email);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('🎫 Generated verification token');
    
    // Guardar token en base de datos
    await prisma.verificationToken.create({
      data: {
        userId: result.user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      }
    });

    // Enviar email de verificación
    try {
      console.log('📧 Sending verification email...');
      await EmailService.sendVerificationEmail(
        email,
        firstName,
        verificationToken
      );
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
      // No fallar el registro por error de email
    }

    // Log de registro exitoso
    logger.info('User registered successfully', {
      userId: result.user.id,
      email: result.user.email,
      type: result.user.type,
      ip: req.ip,
    });

    // Respuesta exitosa con el formato que espera el frontend
    ResponseUtils.created(res, {
      user: result.user,
    }, 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.');

  } catch (error: any) {
    console.error('❌ Error creating user:', error);
    
    // Log del error
    logger.error('User registration failed', {
      email,
      error: error.message,
      ip: req.ip,
    });
    
    if (error.code === 'P2002') {
      return ResponseUtils.conflict(res, 'El email ya está registrado');
    }
    
    ResponseUtils.internalServerError(res, 'Error interno del servidor');
  }
});

/**
 * Iniciar sesión
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log('🚀 Login attempt for email:', email);

  // Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      type: true,
      status: true,
      isEmailVerified: true,
      companyName: true,
      referralCode: true,
      lastLoginAt: true,
    }
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
    return ResponseUtils.forbidden(res, 'Tu cuenta ha sido suspendida');
  }

  if (user.status === 'INACTIVE') {
    return ResponseUtils.forbidden(res, 'Tu cuenta está inactiva');
  }

  console.log('✅ User authenticated successfully:', email);

  // Generar tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const tokens = JwtUtils.generateTokenPair(tokenPayload);

  // Actualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Preparar datos del usuario (sin password)
  const { password: _, ...userWithoutPassword } = user;

  // Log de login exitoso
  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    ip: req.ip,
  });

  // Respuesta con formato que espera el frontend
  return ResponseUtils.success(res, {
    user: userWithoutPassword,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }, 'Login exitoso');
});

/**
 * Verificar email
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body;

  console.log('🔍 Verifying email with token:', token.substring(0, 10) + '...');

  // Buscar el token de verificación
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: 'EMAIL_VERIFICATION',
      isUsed: false,
      expiresAt: { gt: new Date() }
    },
    include: {
      user: true
    }
  });

  if (!verificationToken) {
    console.log('❌ Invalid or expired verification token');
    return ResponseUtils.badRequest(res, 'Token de verificación inválido o expirado');
  }

  try {
    // Actualizar usuario y marcar token como usado en transacción
    await prisma.$transaction(async (tx) => {
      // Marcar email como verificado
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE', // Activar usuario después de verificar email
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
    });

    console.log('✅ Email verified successfully for user:', verificationToken.user.email);

    // Enviar email de bienvenida
    try {
      await EmailService.sendWelcomeEmail(
        verificationToken.user.email,
        verificationToken.user.firstName
      );
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
      // No fallar la verificación por error de email
    }

    // Log de verificación exitosa
    logger.info('Email verified successfully', {
      userId: verificationToken.userId,
      email: verificationToken.user.email,
      ip: req.ip,
    });

    ResponseUtils.success(res, {
      isVerified: true
    }, 'Email verificado exitosamente');

  } catch (error) {
    console.error('❌ Error verifying email:', error);
    ResponseUtils.internalServerError(res, 'Error al verificar email');
  }
});

/**
 * Reenviar email de verificación
 */
export const resendVerification = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  console.log('🔄 Resending verification email to:', email);

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      isEmailVerified: true,
    }
  });

  if (!user) {
    return ResponseUtils.notFound(res, 'Usuario no encontrado');
  }

  if (user.isEmailVerified) {
    return ResponseUtils.badRequest(res, 'El email ya está verificado');
  }

  // Invalidar tokens anteriores
  await prisma.verificationToken.updateMany({
    where: {
      userId: user.id,
      type: 'EMAIL_VERIFICATION',
      isUsed: false,
    },
    data: { isUsed: true }
  });

  // Generar nuevo token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Guardar nuevo token
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: verificationToken,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    }
  });

  // Enviar email
  try {
    await EmailService.sendVerificationEmail(
      email,
      user.firstName,
      verificationToken
    );

    console.log('✅ Verification email resent successfully');
    ResponseUtils.success(res, null, 'Email de verificación enviado');

  } catch (emailError) {
    console.error('❌ Error sending verification email:', emailError);
    ResponseUtils.internalServerError(res, 'Error al enviar email de verificación');
  }
});

/**
 * Solicitar reset de contraseña
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
    return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
  }

  // Invalidar tokens anteriores
  await prisma.verificationToken.updateMany({
    where: {
      userId: user.id,
      type: 'PASSWORD_RESET',
      isUsed: false,
    },
    data: { isUsed: true }
  });

  // Generar nuevo token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Guardar token
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    }
  });

  // Enviar email
  try {
    await EmailService.sendPasswordResetEmail(
      email,
      user.firstName,
      resetToken
    );

    console.log('✅ Password reset email sent successfully');
  } catch (emailError) {
    console.error('❌ Error sending password reset email:', emailError);
  }

  return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
});

/**
 * Restablecer contraseña
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
      expiresAt: { gt: new Date() }
    },
    include: {
      user: true
    }
  });

  if (!verificationToken) {
    return ResponseUtils.badRequest(res, 'Token de restablecimiento inválido o expirado');
  }

  // Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Actualizar contraseña y marcar token como usado
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { password: hashedPassword }
      });

      await tx.verificationToken.update({
        where: { id: verificationToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        }
      });
    });

    console.log('✅ Password reset successfully for user:', verificationToken.user.email);

    // Log de reset exitoso
    logger.info('Password reset successfully', {
      userId: verificationToken.userId,
      email: verificationToken.user.email,
      ip: req.ip,
    });

    ResponseUtils.success(res, null, 'Contraseña restablecida exitosamente');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    ResponseUtils.internalServerError(res, 'Error al restablecer contraseña');
  }
});

/**
 * Refresh token
 */
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    // Verificar refresh token
    const payload = JwtUtils.verifyRefreshToken(refreshToken);
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return ResponseUtils.unauthorized(res, 'Refresh token inválido');
    }

    // Generar nuevos tokens
    const newTokens = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return ResponseUtils.success(res, {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    }, 'Tokens renovados exitosamente');

  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return ResponseUtils.unauthorized(res, 'Refresh token inválido');
  }
});

/**
 * Logout
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const userId = (req as any).user?.id;

  console.log('🚪 Logout attempt for user:', userId);

  try {
    // Invalidar refresh token si se proporciona
    if (refreshToken) {
      // Aquí podrías agregar el refresh token a una blacklist
      // Por ahora solo loggeamos
      console.log('🗑️ Invalidating refresh token');
    }

    // Log de logout
    logger.info('User logged out', {
      userId,
      ip: req.ip,
    });

    ResponseUtils.success(res, null, 'Logout exitoso');

  } catch (error) {
    console.error('❌ Error during logout:', error);
    ResponseUtils.success(res, null, 'Logout exitoso'); // Siempre success en logout
  }
});

/**
 * Cambiar contraseña (usuario autenticado)
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user?.id;

  console.log('🔐 Password change attempt for user:', userId);

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      password: true,
    }
  });

  if (!user) {
    return ResponseUtils.notFound(res, 'Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return ResponseUtils.badRequest(res, 'La contraseña actual es incorrecta');
  }

  // Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  console.log('✅ Password changed successfully for user:', user.email);

  // Log de cambio de contraseña
  logger.info('Password changed successfully', {
    userId,
    email: user.email,
    ip: req.ip,
  });

  ResponseUtils.success(res, null, 'Contraseña cambiada exitosamente');
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
 * OAuth Google (placeholder - implementar según necesidades)
 */
export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const { credential } = req.body;

  console.log('🔄 Google OAuth attempt');

  // TODO: Implementar OAuth con Google
  // 1. Verificar credential con Google
  // 2. Extraer información del usuario
  // 3. Buscar o crear usuario
  // 4. Generar tokens
  
  ResponseUtils.success(res, {
    message: 'Google OAuth no implementado aún'
  }, 'Google OAuth endpoint');
});

/**
 * OAuth Facebook (placeholder - implementar según necesidades)
 */
export const facebookAuth = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  console.log('🔄 Facebook OAuth attempt');

  // TODO: Implementar OAuth con Facebook
  // 1. Verificar accessToken con Facebook
  // 2. Extraer información del usuario
  // 3. Buscar o crear usuario
  // 4. Generar tokens
  
  ResponseUtils.success(res, {
    message: 'Facebook OAuth no implementado aún'
  }, 'Facebook OAuth endpoint');
});