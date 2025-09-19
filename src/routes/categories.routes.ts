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
import { authenticate, requireAdmin, optionalAuth } from '@/middleware/auth.middleware';
import { categoriesRateLimit } from '@/middleware/rateLimit.middleware';
import * as categoryController from '@/controllers/category.controller';
import { z } from 'zod';

const router = Router();

// Schemas de validación
const getCategoriesQuerySchema = z.object({
  type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']).optional(),
  includeChildren: z.enum(['true', 'false']).optional(),
  includeBreadcrumb: z.enum(['true', 'false']).optional()
});

const searchCategoriesSchema = z.object({
  q: z.string().min(2).max(100),
  type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']).optional(),
  leafOnly: z.enum(['true', 'false']).optional()
});

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']),
  parentId: z.string().cuid().optional(),
  isLeaf: z.boolean().optional(),
  pricePerKg: z.number().positive().optional(),
  minWeight: z.number().positive().optional(),
  maxWeight: z.number().positive().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  images: z.array(z.string().url()).optional(),
  thumbnailImage: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  sortOrder: z.number().int().optional()
});

const updateCategorySchema = createCategorySchema.partial();

const reorderCategoriesSchema = z.object({
  newOrder: z.array(z.string().cuid())
});

const commonSchemas = {
  id: z.object({
    categoryId: z.string().cuid()
  })
};

// === RUTAS PÚBLICAS ===

/**
 * GET /categories/tree
 * Obtener árbol completo de categorías
 */
router.get(
  '/tree',
  categoriesRateLimit,
  validateQuery(getCategoriesQuerySchema),
  categoryController.getCategoryTree
);

/**
 * GET /categories/root
 * Obtener categorías raíz
 */
router.get(
  '/root',
  categoriesRateLimit,
  validateQuery(getCategoriesQuerySchema),
  categoryController.getRootCategories
);

/**
 * GET /categories/leaf
 * Obtener solo categorías finales (seleccionables)
 */
router.get(
  '/leaf',
  categoriesRateLimit,
  validateQuery(getCategoriesQuerySchema),
  categoryController.getLeafCategories
);

/**
 * GET /categories/search
 * Buscar categorías
 */
router.get(
  '/search',
  categoriesRateLimit,
  validateQuery(searchCategoriesSchema),
  categoryController.searchCategories
);

/**
 * GET /categories/:categoryId
 * Obtener detalles de una categoría
 */
router.get(
  '/:categoryId',
  categoriesRateLimit,
  validateParams(commonSchemas.id),
  validateQuery(getCategoriesQuerySchema),
  categoryController.getCategoryById
);

/**
 * GET /categories/:categoryId/children
 * Obtener hijos directos de una categoría
 */
router.get(
  '/:categoryId/children',
  categoriesRateLimit,
  validateParams(commonSchemas.id),
  categoryController.getCategoryChildren
);

/**
 * GET /categories/:categoryId/breadcrumb
 * Obtener breadcrumb de una categoría
 */
router.get(
  '/:categoryId/breadcrumb',
  categoriesRateLimit,
  validateParams(commonSchemas.id),
  categoryController.getCategoryBreadcrumb
);

// === RUTAS ADMIN ===

/**
 * POST /categories
 * Crear nueva categoría (solo admins)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createCategorySchema),
  categoryController.createCategory
);

/**
 * PUT /categories/:categoryId
 * Actualizar categoría (solo admins)
 */
router.put(
  '/:categoryId',
  authenticate,
  requireAdmin,
  validateParams(commonSchemas.id),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * DELETE /categories/:categoryId
 * Eliminar categoría (solo admins)
 */
router.delete(
  '/:categoryId',
  authenticate,
  requireAdmin,
  validateParams(commonSchemas.id),
  categoryController.deleteCategory
);

/**
 * POST /categories/:categoryId/reorder
 * Reordenar categorías hermanas (solo admins)
 */
router.post(
  '/:categoryId/reorder',
  authenticate,
  requireAdmin,
  validateParams(commonSchemas.id),
  validateBody(reorderCategoriesSchema),
  categoryController.reorderCategories
);

/**
 * GET /categories/:categoryId/stats
 * Obtener estadísticas de uso (solo admins)
 */
router.get(
  '/:categoryId/stats',
  authenticate,
  requireAdmin,
  validateParams(commonSchemas.id),
  categoryController.getCategoryStats
);

export default router;