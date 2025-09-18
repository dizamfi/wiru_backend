// import { Router } from 'express';

// // Importar middleware
// import { 
//   categorySchemas,
//   commonSchemas,
//   validateBody, 
//   validateParams, 
//   validateQuery, 
  
// } from '@/middleware/validation.middleware';
// import { 
//   authenticate, 
//   requireAdmin,
//   optionalAuth 
// } from '@/middleware/auth.middleware';
// import { generalRateLimit } from '@/middleware/rateLimit.middleware';

// // Importar controladores REALES
// import * as categoryController from '@/controllers/category.controller';

// const router = Router();

// // === RUTAS PÚBLICAS ===

// /**
//  * GET /categories
//  * Obtener todas las categorías activas (público)
//  */
// router.get(
//   '/',
//   optionalAuth, // Autenticación opcional
//   validateQuery(commonSchemas.pagination),
//   categoryController.getCategories
// );

// /**
//  * GET /categories/:id
//  * Obtener categoría específica por ID (público)
//  */
// router.get(
//   '/:id',
//   validateParams(commonSchemas.id),
//   categoryController.getCategoryById
// );

// // === RUTAS ADMINISTRATIVAS ===

// /**
//  * GET /categories/admin/all
//  * Obtener todas las categorías incluyendo inactivas (solo admins)
//  */
// router.get(
//   '/admin/all',
//   authenticate,
//   requireAdmin,
//   validateQuery(commonSchemas.pagination),
//   categoryController.getAllCategoriesAdmin
// );

// /**
//  * GET /categories/admin/stats
//  * Obtener estadísticas de categorías (solo admins)
//  */
// router.get(
//   '/admin/stats',
//   authenticate,
//   requireAdmin,
//   categoryController.getCategoryStats
// );

// /**
//  * POST /categories
//  * Crear nueva categoría (solo admins)
//  */
// router.post(
//   '/',
//   authenticate,
//   requireAdmin,
//   validateBody(categorySchemas.createCategory),
//   categoryController.createCategory
// );

// /**
//  * PUT /categories/:id
//  * Actualizar categoría (solo admins)
//  */
// router.put(
//   '/:id',
//   authenticate,
//   requireAdmin,
//   validateParams(commonSchemas.id),
//   validateBody(categorySchemas.updateCategory),
//   categoryController.updateCategory
// );

// /**
//  * DELETE /categories/:id
//  * Eliminar categoría (solo admins) - soft delete
//  */
// router.delete(
//   '/:id',
//   authenticate,
//   requireAdmin,
//   validateParams(commonSchemas.id),
//   categoryController.deleteCategory
// );

// export default router;





// src/routes/categories.routes.ts
import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '@/middleware/validation.middleware';
import { authenticate, optionalAuth } from '@/middleware/auth.middleware';
// import { categoryRateLimit } from '@/middleware/rateLimit.middleware';
import * as categoryController from '@/controllers/category.controller';
import { z } from 'zod';

const router = Router();

// Schemas de validación
const calculatePriceSchema = z.object({
  quantity: z.number().min(1).max(100).optional().default(1),
  weight: z.number().min(0.01).max(1000).optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']).optional().default('GOOD'),
  accessories: z.array(z.string()).optional().default([])
});

const validateFieldsSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']).optional(),
  quantity: z.number().min(1).optional(),
  weight: z.number().min(0.01).optional(),
  images: z.array(z.string()).optional(),
  accessories: z.array(z.string()).optional(),
  storage: z.string().optional(),
  processor: z.string().optional(),
  ram: z.string().optional(),
  approximateAge: z.string().optional(),
  componentType: z.string().optional()
});

const searchSchema = z.object({
  q: z.string().min(1, 'Término de búsqueda requerido'),
  type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']).optional()
});

const statsSchema = z.object({
  type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']).optional()
});

// === RUTAS PÚBLICAS ===

/**
 * GET /categories/types
 * Obtener los tipos principales de categorías
 */
router.get('/types', categoryController.getCategoryTypes);

/**
 * GET /categories/by-type/:type
 * Obtener categorías por tipo (COMPLETE_DEVICES o DISMANTLED_DEVICES)
 */
router.get(
  '/by-type/:type',
  validateParams(z.object({
    type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES'])
  })),
  categoryController.getCategoriesByType
);

/**
 * GET /categories/:id/details
 * Obtener detalles completos de una categoría
 */
router.get(
  '/:id/details',
  validateParams(z.object({
    id: z.string().min(1)
  })),
  categoryController.getCategoryDetails
);

/**
 * GET /categories/search
 * Buscar categorías por término
 */
router.get(
  '/search',
  validateQuery(searchSchema),
  categoryController.searchCategories
);

/**
 * GET /categories/stats
 * Obtener estadísticas de categorías
 */
router.get(
  '/stats',
  validateQuery(statsSchema),
  categoryController.getCategoryStats
);

// === RUTAS CON AUTENTICACIÓN OPCIONAL ===

/**
 * POST /categories/:id/calculate-price
 * Calcular precio estimado para una categoría
 */
router.post(
  '/:id/calculate-price',
  optionalAuth, // Autenticación opcional para mejores cálculos
  // categoryRateLimit,
  validateParams(z.object({
    id: z.string().min(1)
  })),
  validateBody(calculatePriceSchema),
  categoryController.calculateEstimatedPrice
);

/**
 * POST /categories/:id/validate
 * Validar campos requeridos para una categoría
 */
router.post(
  '/:id/validate',
  optionalAuth,
  validateParams(z.object({
    id: z.string().min(1)
  })),
  validateBody(validateFieldsSchema),
  categoryController.validateCategoryFields
);

// === RUTA DE COMPATIBILIDAD ===

/**
 * GET /categories
 * Ruta de compatibilidad - redirige a tipos
 */
router.get('/', (req, res) => {
  res.redirect('/api/v1/categories/types');
});

/**
 * GET /categories/:id
 * Ruta de compatibilidad - redirige a detalles
 */
router.get('/:id', (req, res) => {
  res.redirect(`/api/v1/categories/${req.params.id}/details`);
});

export default router;