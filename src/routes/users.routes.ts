import { Router } from 'express';

// Importar middleware
import { validateBody, validateParams, validateQuery, userSchemas, commonSchemas } from '@/middleware/validation.middleware';
import { authenticate, requireAdmin, requireOwnProfile } from '@/middleware/auth.middleware';
import { generalRateLimit } from '@/middleware/rateLimit.middleware';

// Importar controladores REALES
import * as userController from '@/controllers/user.controller';

const router = Router();

// Aplicar autenticación a todas las rutas de usuarios
router.use(authenticate);

// === RUTAS DE PERFIL PERSONAL ===

/**
 * GET /users/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', userController.getProfile);

/**
 * PUT /users/profile
 * Actualizar perfil del usuario autenticado
 */
router.put(
  '/profile',
  validateBody(userSchemas.updateProfile),
  userController.updateProfile
);

/**
 * PUT /users/email
 * Cambiar email del usuario autenticado
 */
router.put(
  '/email',
  validateBody(userSchemas.updateEmail),
  userController.updateEmail
);

// === RUTAS ADMINISTRATIVAS ===

/**
 * GET /users
 * Obtener lista de usuarios (solo admins)
 */
router.get(
  '/',
  requireAdmin,
  validateQuery(commonSchemas.pagination),
  userController.getUsers
);

/**
 * GET /users/:id
 * Obtener usuario específico (admin o propio perfil)
 */
router.get(
  '/:id',
  validateParams(commonSchemas.id),
  requireOwnProfile,
  userController.getUserById
);

/**
 * PUT /users/:id/status
 * Cambiar estado de usuario (solo admins)
 */
router.put(
  '/:id/status',
  requireAdmin,
  validateParams(commonSchemas.id),
  validateBody(userSchemas.updateStatus),
  userController.updateUserStatus
);

/**
 * DELETE /users/:id
 * Eliminar usuario (solo admins)
 */
router.delete(
  '/:id',
  requireAdmin,
  validateParams(commonSchemas.id),
  userController.deleteUser
);

export default router;