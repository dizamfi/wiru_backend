// import { Router } from 'express';

// // Importar middleware
// import { validateBody, authSchemas } from '@/middleware/validation.middleware';
// import { 
//   authRateLimit, 
//   emailVerificationRateLimit, 
//   passwordResetRateLimit,
//   passwordChangeRateLimit 
// } from '@/middleware/rateLimit.middleware';
// import { authenticate } from '@/middleware/auth.middleware';

// // Importar controladores (los crearemos después)
// // import * as authController from '@/controllers/auth.controller';

// const router = Router();

// // === RUTAS PÚBLICAS ===

// /**
//  * POST /auth/register
//  * Registrar nuevo usuario
//  */
// router.post(
//   '/register',
//   authRateLimit,
//   validateBody(authSchemas.register),
//   // authController.register
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de registro - En desarrollo',
//       data: { received: req.body }
//     });
//   }
// );

// /**
//  * POST /auth/login
//  * Iniciar sesión
//  */
// router.post(
//   '/login',
//   authRateLimit,
//   validateBody(authSchemas.login),
//   // authController.login
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de login - En desarrollo',
//       data: { email: req.body.email }
//     });
//   }
// );

// /**
//  * POST /auth/refresh
//  * Renovar access token usando refresh token
//  */
// router.post(
//   '/refresh',
//   validateBody(authSchemas.refreshToken),
//   // authController.refreshToken
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de refresh token - En desarrollo'
//     });
//   }
// );

// /**
//  * POST /auth/forgot-password
//  * Solicitar reset de contraseña
//  */
// router.post(
//   '/forgot-password',
//   passwordResetRateLimit,
//   validateBody(authSchemas.resetPassword),
//   // authController.forgotPassword
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de forgot password - En desarrollo',
//       data: { email: req.body.email }
//     });
//   }
// );

// /**
//  * POST /auth/reset-password
//  * Restablecer contraseña con token
//  */
// router.post(
//   '/reset-password',
//   validateBody(authSchemas.changePassword),
//   // authController.resetPassword
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de reset password - En desarrollo'
//     });
//   }
// );

// /**
//  * POST /auth/verify-email
//  * Verificar email con token
//  */
// router.post(
//   '/verify-email',
//   emailVerificationRateLimit,
//   // authController.verifyEmail
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de verificación de email - En desarrollo'
//     });
//   }
// );

// /**
//  * POST /auth/resend-verification
//  * Reenviar email de verificación
//  */
// router.post(
//   '/resend-verification',
//   emailVerificationRateLimit,
//   validateBody(authSchemas.resetPassword), // Usa el mismo schema (solo email)
//   // authController.resendVerification
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de reenvío de verificación - En desarrollo',
//       data: { email: req.body.email }
//     });
//   }
// );

// // === RUTAS PROTEGIDAS (requieren autenticación) ===

// /**
//  * POST /auth/logout
//  * Cerrar sesión
//  */
// router.post(
//   '/logout',
//   authenticate,
//   // authController.logout
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de logout - En desarrollo',
//       data: { userId: (req as any).user?.id }
//     });
//   }
// );

// /**
//  * POST /auth/change-password
//  * Cambiar contraseña (usuario autenticado)
//  */
// router.post(
//   '/change-password',
//   authenticate,
//   passwordChangeRateLimit,
//   validateBody(authSchemas.changePassword),
//   // authController.changePassword
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de cambio de contraseña - En desarrollo',
//       data: { userId: (req as any).user?.id }
//     });
//   }
// );

// /**
//  * GET /auth/me
//  * Obtener información del usuario autenticado
//  */
// router.get(
//   '/me',
//   authenticate,
//   // authController.getMe
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Información del usuario actual - En desarrollo',
//       data: { user: (req as any).user }
//     });
//   }
// );

// /**
//  * DELETE /auth/account
//  * Eliminar cuenta (soft delete)
//  */
// router.delete(
//   '/account',
//   authenticate,
//   passwordChangeRateLimit,
//   // authController.deleteAccount
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de eliminación de cuenta - En desarrollo',
//       data: { userId: (req as any).user?.id }
//     });
//   }
// );

// // === RUTAS DE OAUTH (futuras) ===

// /**
//  * POST /auth/google
//  * Login con Google OAuth
//  */
// router.post(
//   '/google',
//   authRateLimit,
//   // authController.googleLogin
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de Google OAuth - En desarrollo'
//     });
//   }
// );

// /**
//  * POST /auth/facebook
//  * Login con Facebook OAuth
//  */
// router.post(
//   '/facebook',
//   authRateLimit,
//   // authController.facebookLogin
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Endpoint de Facebook OAuth - En desarrollo'
//     });
//   }
// );

// export default router;








import { Router } from 'express';

// Importar middleware
import { 
  validateBody, 
  authSchemas 
} from '@/middleware/validation.middleware';
import { 
  authRateLimit, 
  emailVerificationRateLimit, 
  passwordResetRateLimit,
  passwordChangeRateLimit 
} from '@/middleware/rateLimit.middleware';
import { authenticate } from '@/middleware/auth.middleware';

// Importar controladores
import * as authController from '@/controllers/auth.controller';

const router = Router();

// === RUTAS PÚBLICAS ===

/**
 * POST /auth/register
 * Registrar nuevo usuario
 */
router.post(
  '/register',
  authRateLimit,
  validateBody(authSchemas.register),
  authController.register
);

/**
 * POST /auth/login
 * Iniciar sesión
 */
router.post(
  '/login',
  authRateLimit,
  validateBody(authSchemas.login),
  authController.login
);

/**
 * POST /auth/refresh
 * Renovar access token usando refresh token
 */
router.post(
  '/refresh',
  validateBody(authSchemas.refreshToken),
  authController.refreshToken
);

/**
 * POST /auth/forgot-password
 * Solicitar reset de contraseña
 */
router.post(
  '/forgot-password',
  passwordResetRateLimit,
  validateBody(authSchemas.resetPassword),
  authController.forgotPassword
);

/**
 * POST /auth/verify-email
 * Verificar email con token
 */
router.post(
  '/verify-email',
  emailVerificationRateLimit,
  authController.verifyEmail
);

/**
 * POST /auth/resend-verification
 * Reenviar email de verificación
 */
router.post(
  '/resend-verification',
  emailVerificationRateLimit,
  validateBody(authSchemas.resetPassword), // Usa el mismo schema (solo email)
  authController.resendVerification
);

// === RUTAS PROTEGIDAS (requieren autenticación) ===

/**
 * POST /auth/logout
 * Cerrar sesión
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * POST /auth/change-password
 * Cambiar contraseña (usuario autenticado)
 */
router.post(
  '/change-password',
  authenticate,
  passwordChangeRateLimit,
  validateBody(authSchemas.changePassword),
  authController.changePassword
);

/**
 * GET /auth/me
 * Obtener información del usuario autenticado
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

/**
 * DELETE /auth/account
 * Eliminar cuenta (soft delete)
 */
router.delete(
  '/account',
  authenticate,
  passwordChangeRateLimit,
  // authController.deleteAccount
  (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint de eliminación de cuenta - En desarrollo',
      data: { userId: (req as any).user?.id }
    });
  }
);

/**
 * POST /auth/mock-token
 * SOLO PARA TESTING - Generar token de prueba
 */
router.post(
  '/mock-token',
  (req, res) => {
    res.json({
      success: true,
      message: 'Token de prueba generado - SOLO PARA DESARROLLO',
      data: {
        accessToken: 'mock-token-for-testing',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          type: 'PERSON',
          status: 'ACTIVE',
          isEmailVerified: true
        }
      },
      warning: 'Este es un token de prueba. Remover en producción.'
    });
  }
);

// === RUTAS DE OAUTH (futuras) ===

/**
 * POST /auth/google
 * Login con Google OAuth
 */
router.post(
  '/google',
  authRateLimit,
  // authController.googleLogin
  (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint de Google OAuth - En desarrollo'
    });
  }
);

/**
 * POST /auth/facebook
 * Login con Facebook OAuth
 */
router.post(
  '/facebook',
  authRateLimit,
  // authController.facebookLogin
  (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint de Facebook OAuth - En desarrollo'
    });
  }
);

export default router;