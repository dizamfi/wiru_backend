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






import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { JwtUtils } from '@/utils/jwt.utils';
import { ResponseUtils } from '@/utils/response.utils';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';
import prisma from '@/config/database';
import logger from '@/config/logger';
import { catchAsync } from '@/middleware/error.middleware';

/**
 * Registrar nuevo usuario
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  console.log('🚀 Register controller called with data:', req.body);
  
  const { email, password, firstName, lastName, phone, type, referralCode, companyName, companyDocument } = req.body;

  console.log('📧 Checking if user exists with email:', email);
  
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('❌ User already exists:', email);
    return ResponseUtils.conflict(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  console.log('🔐 Hashing password...');
  // Hashear la contraseña
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
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      console.log('👤 Creating user in database...');
      
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          type: type || 'PERSON',
          referralCode: uniqueReferralCode,
          referredBy: referralCode || null,
          companyName: type === 'COMPANY' ? companyName : null,
          companyDocument: type === 'COMPANY' ? companyDocument : null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          type: true,
          role: true,
          status: true,
          isEmailVerified: true,
          referralCode: true,
          createdAt: true,
        }
      });

      console.log('✅ User created successfully:', user.id);

      // Si es usuario tipo PERSON, crear billetera
      if (user.type === 'PERSON') {
        console.log('💰 Creating wallet for user...');
        await tx.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            currency: 'USD',
          }
        });
        console.log('✅ Wallet created successfully');
      }

      return user;
    });

    console.log('🎉 Transaction completed successfully');

    // Generar tokens
    const tokenPair = JwtUtils.generateTokenPair({
      userId: result.id,
      email: result.email,
      role: result.role,
      type: result.type,
    });

    console.log('🔑 Tokens generated successfully');

    // Log del registro exitoso
    logger.info('User registered successfully', {
      userId: result.id,
      email: result.email,
      type: result.type,
      ip: req.ip,
    });

    ResponseUtils.created(res, {
      user: result,
      tokens: tokenPair,
    }, SUCCESS_MESSAGES.USER_CREATED);

  } catch (error) {
    console.error('💥 Error in register transaction:', error);
    logger.error('Error registering user:', error);
    ResponseUtils.error(res, 'Error al crear el usuario');
  }
});

/**
 * Iniciar sesión
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

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
      type: true,
      role: true,
      status: true,
      isEmailVerified: true,
      referralCode: true,
      lastLoginAt: true,
    }
  });

  if (!user) {
    return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return ResponseUtils.unauthorized(res, ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verificar que el usuario esté activo
  if (user.status !== 'ACTIVE') {
    return ResponseUtils.forbidden(res, 'Cuenta inactiva. Contacta soporte.');
  }

  try {
    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generar tokens
    const tokenPair = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
    });

    // Preparar datos del usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = user;

    // Log del login exitoso
    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    ResponseUtils.success(res, {
      user: userWithoutPassword,
      tokens: tokenPair,
    }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

  } catch (error) {
    logger.error('Error during login:', error);
    ResponseUtils.error(res, 'Error al procesar el login');
  }
});

/**
 * Obtener información del usuario autenticado
 */
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      type: true,
      role: true,
      status: true,
      isEmailVerified: true,
      emailVerifiedAt: true,
      referralCode: true,
      companyName: true,
      companyDocument: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    }
  });

  if (!user) {
    return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  ResponseUtils.success(res, { user }, 'Información del usuario');
});

/**
 * Cerrar sesión
 */
export const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  // Log del logout
  logger.info('User logged out', {
    userId,
    ip: req.ip,
  });

  ResponseUtils.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
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
        type: true,
        status: true,
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return ResponseUtils.unauthorized(res, 'Usuario no válido');
    }

    // Generar nuevos tokens
    const tokenPair = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
    });

    ResponseUtils.success(res, { tokens: tokenPair }, 'Tokens renovados');

  } catch (error) {
    logger.error('Error refreshing token:', error);
    ResponseUtils.unauthorized(res, 'Refresh token inválido');
  }
});

/**
 * Solicitar reset de contraseña
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true }
  });

  // Por seguridad, siempre devolver éxito aunque el email no exista
  if (!user) {
    return ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
  }

  // TODO: Implementar envío de email con token de reset
  // Por ahora solo logeamos
  logger.info('Password reset requested', {
    userId: user.id,
    email: user.email,
    ip: req.ip,
  });

  ResponseUtils.success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
});

/**
 * Cambiar contraseña (usuario autenticado)
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = (req as any).user?.id;

  // Buscar usuario con contraseña actual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true }
  });

  if (!user) {
    return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Verificar contraseña actual
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return ResponseUtils.unauthorized(res, 'Contraseña actual incorrecta');
  }

  // Hashear nueva contraseña
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  logger.info('Password changed successfully', {
    userId,
    ip: req.ip,
  });

  ResponseUtils.success(res, null, SUCCESS_MESSAGES.PASSWORD_RESET);
});

/**
 * Verificar email (placeholder)
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  // TODO: Implementar verificación real con token
  ResponseUtils.success(res, null, 'Funcionalidad de verificación de email en desarrollo');
});

/**
 * Reenviar verificación de email (placeholder)
 */
export const resendVerification = catchAsync(async (req: Request, res: Response) => {
  // TODO: Implementar reenvío real
  ResponseUtils.success(res, null, 'Funcionalidad de reenvío en desarrollo');
});