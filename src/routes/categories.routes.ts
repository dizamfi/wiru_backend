// import { Router } from 'express';

// // Importar middleware
// import { 
//   validateBody, 
//   validateParams, 
//   validateQuery, 
//   commonSchemas 
// } from '@/middleware/validation.middleware';
// import { 
//   authenticate, 
//   requireAdmin,
//   optionalAuth 
// } from '@/middleware/auth.middleware';
// import { generalRateLimit } from '@/middleware/rateLimit.middleware';

// // Importar controladores (los crearemos después)
// // import * as categoryController from '@/controllers/category.controller';

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
//   // categoryController.getCategories
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Categorías disponibles - En desarrollo',
//       data: {
//         categories: [
//           {
//             id: 'cat_phones',
//             name: 'Teléfonos Móviles',
//             description: 'Smartphones, teléfonos básicos y accesorios',
//             pricePerKg: 8.50,
//             estimatedWeight: 0.2,
//             image: 'https://example.com/phones.jpg',
//             status: 'ACTIVE',
//             subcategories: [
//               'Smartphones',
//               'Teléfonos básicos',
//               'Accesorios móviles'
//             ]
//           },
//           {
//             id: 'cat_laptops',
//             name: 'Laptops y Computadoras',
//             description: 'Portátiles, computadoras de escritorio y componentes',
//             pricePerKg: 12.75,
//             estimatedWeight: 2.5,
//             image: 'https://example.com/laptops.jpg',
//             status: 'ACTIVE',
//             subcategories: [
//               'Laptops',
//               'Computadoras de escritorio',
//               'Monitores',
//               'Componentes'
//             ]
//           },
//           {
//             id: 'cat_tablets',
//             name: 'Tablets',
//             description: 'Tablets, e-readers y dispositivos similares',
//             pricePerKg: 6.25,
//             estimatedWeight: 0.6,
//             image: 'https://example.com/tablets.jpg',
//             status: 'ACTIVE',
//             subcategories: [
//               'Tablets Android',
//               'iPads',
//               'E-readers',
//               'Accesorios para tablets'
//             ]
//           },
//           {
//             id: 'cat_audio',
//             name: 'Audio y Video',
//             description: 'Equipos de audio, video y entretenimiento',
//             pricePerKg: 4.50,
//             estimatedWeight: 1.2,
//             image: 'https://example.com/audio.jpg',
//             status: 'ACTIVE',
//             subcategories: [
//               'Auriculares',
//               'Altavoces',
//               'Sistemas de sonido',
//               'Reproductores'
//             ]
//           },
//           {
//             id: 'cat_appliances',
//             name: 'Electrodomésticos Pequeños',
//             description: 'Electrodomésticos de cocina y hogar',
//             pricePerKg: 3.25,
//             estimatedWeight: 3.0,
//             image: 'https://example.com/appliances.jpg',
//             status: 'ACTIVE',
//             subcategories: [
//               'Electrodomésticos de cocina',
//               'Aspiradoras',
//               'Ventiladores',
//               'Calefactores'
//             ]
//           },
//           {
//             id: 'cat_components',
//             name: 'Componentes y Placas',
//             description: 'Placas madre, tarjetas, componentes sueltos',
//             pricePerKg: 15.50,
//             estimatedWeight: 0.3,
//             image: 'https://example.com/components.jpg',
//             status: 'ACTIVE',
//             subcategories: [
//               'Placas madre',
//               'Tarjetas gráficas',
//               'Memorias RAM',
//               'Procesadores',
//               'Discos duros'
//             ]
//           }
//         ],
//         pagination: {
//           page: req.query.page || 1,
//           limit: req.query.limit || 10,
//           total: 6,
//           totalPages: 1
//         }
//       }
//     });
//   }
// );

// /**
//  * GET /categories/:id
//  * Obtener detalles de una categoría específica
//  */
// router.get(
//   '/:id',
//   validateParams(commonSchemas.id),
//   optionalAuth,
//   // categoryController.getCategoryById
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Detalles de categoría - En desarrollo',
//       data: {
//         category: {
//           id: req.params.id,
//           name: 'Teléfonos Móviles',
//           description: 'Smartphones, teléfonos básicos y accesorios móviles',
//           pricePerKg: 8.50,
//           estimatedWeight: 0.2,
//           image: 'https://example.com/phones.jpg',
//           status: 'ACTIVE',
//           subcategories: [
//             {
//               id: 'subcat_smartphones',
//               name: 'Smartphones',
//               description: 'Teléfonos inteligentes de todas las marcas',
//               estimatedWeight: 0.18,
//               examples: ['iPhone', 'Samsung Galaxy', 'Huawei', 'Xiaomi']
//             },
//             {
//               id: 'subcat_basic_phones',
//               name: 'Teléfonos Básicos',
//               description: 'Teléfonos básicos y de botones',
//               estimatedWeight: 0.12,
//               examples: ['Nokia básicos', 'Teléfonos de botones']
//             }
//           ],
//           acceptedConditions: [
//             'Funcionando',
//             'Con daños menores',
//             'No funciona',
//             'Solo para partes'
//           ],
//           tips: [
//             'Incluye el cargador si lo tienes',
//             'Retira la funda y protector de pantalla',
//             'Asegúrate de hacer reset de fábrica',
//             'Quita la tarjeta SIM y memoria'
//           ],
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         }
//       }
//     });
//   }
// );

// /**
//  * GET /categories/search
//  * Buscar categorías por nombre o descripción
//  */
// router.get(
//   '/search',
//   validateQuery(commonSchemas.pagination),
//   // categoryController.searchCategories
//   (req, res) => {
//     const searchTerm = req.query.q || '';
//     res.json({
//       success: true,
//       message: 'Resultados de búsqueda - En desarrollo',
//       data: {
//         searchTerm,
//         categories: [
//           {
//             id: 'cat_phones',
//             name: 'Teléfonos Móviles',
//             description: 'Smartphones, teléfonos básicos y accesorios',
//             pricePerKg: 8.50,
//             image: 'https://example.com/phones.jpg'
//           }
//         ],
//         pagination: {
//           page: req.query.page || 1,
//           limit: req.query.limit || 10,
//           total: 1,
//           totalPages: 1
//         }
//       }
//     });
//   }
// );

// /**
//  * GET /categories/price-estimate
//  * Obtener estimación de precio por peso y categoría
//  */
// router.get(
//   '/price-estimate',
//   // categoryController.getPriceEstimate
//   (req, res) => {
//     const { categoryId, weight } = req.query;
//     const weightNum = parseFloat(weight as string) || 0;
//     const pricePerKg = 8.50; // Precio ejemplo
    
//     res.json({
//       success: true,
//       message: 'Estimación de precio - En desarrollo',
//       data: {
//         categoryId,
//         weight: weightNum,
//         pricePerKg,
//         estimatedValue: weightNum * pricePerKg,
//         currency: 'USD',
//         note: 'Esta es una estimación. El precio final puede variar después de la verificación.'
//       }
//     });
//   }
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
//   // categoryController.getAllCategoriesAdmin
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Todas las categorías - En desarrollo (Admin)',
//       data: {
//         categories: [
//           {
//             id: 'cat_phones',
//             name: 'Teléfonos Móviles',
//             pricePerKg: 8.50,
//             status: 'ACTIVE',
//             ordersCount: 156,
//             totalRevenue: 1325.60,
//             createdAt: new Date().toISOString()
//           },
//           {
//             id: 'cat_deprecated',
//             name: 'Categoría Descontinuada',
//             pricePerKg: 0.00,
//             status: 'INACTIVE',
//             ordersCount: 0,
//             totalRevenue: 0,
//             createdAt: new Date().toISOString()
//           }
//         ],
//         pagination: {
//           page: req.query.page || 1,
//           limit: req.query.limit || 10,
//           total: 2,
//           totalPages: 1
//         }
//       }
//     });
//   }
// );

// /**
//  * POST /categories
//  * Crear nueva categoría (solo admins)
//  */
// router.post(
//   '/',
//   authenticate,
//   requireAdmin,
//   // validateBody(categorySchemas.createCategory),
//   // categoryController.createCategory
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Categoría creada - En desarrollo (Admin)',
//       data: {
//         category: {
//           id: 'cat_' + Date.now(),
//           name: req.body.name,
//           description: req.body.description,
//           pricePerKg: req.body.pricePerKg,
//           estimatedWeight: req.body.estimatedWeight,
//           status: 'ACTIVE',
//           createdBy: (req as any).user?.id,
//           createdAt: new Date().toISOString()
//         }
//       }
//     });
//   }
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
//   // validateBody(categorySchemas.updateCategory),
//   // categoryController.updateCategory
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Categoría actualizada - En desarrollo (Admin)',
//       data: {
//         categoryId: req.params.id,
//         updates: req.body,
//         updatedBy: (req as any).user?.id,
//         updatedAt: new Date().toISOString()
//       }
//     });
//   }
// );

// /**
//  * PUT /categories/:id/status
//  * Cambiar estado de categoría (solo admins)
//  */
// router.put(
//   '/:id/status',
//   authenticate,
//   requireAdmin,
//   validateParams(commonSchemas.id),
//   // categoryController.updateCategoryStatus
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Estado de categoría actualizado - En desarrollo (Admin)',
//       data: {
//         categoryId: req.params.id,
//         previousStatus: 'ACTIVE',
//         newStatus: req.body.status,
//         updatedBy: (req as any).user?.id,
//         updatedAt: new Date().toISOString()
//       }
//     });
//   }
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
//   // categoryController.deleteCategory
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Categoría eliminada - En desarrollo (Admin)',
//       data: {
//         categoryId: req.params.id,
//         deletedBy: (req as any).user?.id,
//         deletedAt: new Date().toISOString()
//       }
//     });
//   }
// );

// /**
//  * GET /categories/:id/stats
//  * Obtener estadísticas de una categoría específica (solo admins)
//  */
// router.get(
//   '/:id/stats',
//   authenticate,
//   requireAdmin,
//   validateParams(commonSchemas.id),
//   // categoryController.getCategoryStats
//   (req, res) => {
//     res.json({
//       success: true,
//       message: 'Estadísticas de categoría - En desarrollo (Admin)',
//       data: {
//         categoryId: req.params.id,
//         totalOrders: 156,
//         totalWeight: 234.5,
//         totalRevenue: 1325.60,
//         averageOrderValue: 8.49,
//         monthlyStats: [
//           { month: '2024-01', orders: 23, revenue: 195.45 },
//           { month: '2023-12', orders: 31, revenue: 263.85 }
//         ],
//         topUsers: [
//           { userId: 'user_123', orders: 8, revenue: 68.25 },
//           { userId: 'user_456', orders: 6, revenue: 51.30 }
//         ]
//       }
//     });
//   }
// );

// export default router;







import { Router } from 'express';

// Importar middleware
import { 
  validateBody, 
  validateParams, 
  validateQuery, 
  commonSchemas, 
  categorySchemas
} from '@/middleware/validation.middleware';
import { 
  authenticate, 
  requireAdmin,
  optionalAuth 
} from '@/middleware/auth.middleware';
import { generalRateLimit } from '@/middleware/rateLimit.middleware';

// Importar controladores REALES
import * as categoryController from '@/controllers/category.controller';

const router = Router();

// === RUTAS PÚBLICAS ===

/**
 * GET /categories
 * Obtener todas las categorías activas (público)
 */
router.get(
  '/',
  optionalAuth, // Autenticación opcional
  validateQuery(commonSchemas.pagination),
  categoryController.getCategories
);

/**
 * GET /categories/:id
 * Obtener categoría específica por ID (público)
 */
router.get(
  '/:id',
  validateParams(commonSchemas.id),
  categoryController.getCategoryById
);

// === RUTAS ADMINISTRATIVAS ===

/**
 * GET /categories/admin/all
 * Obtener todas las categorías incluyendo inactivas (solo admins)
 */
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  validateQuery(commonSchemas.pagination),
  categoryController.getAllCategoriesAdmin
);

/**
 * GET /categories/admin/stats
 * Obtener estadísticas de categorías (solo admins)
 */
router.get(
  '/admin/stats',
  authenticate,
  requireAdmin,
  categoryController.getCategoryStats
);

/**
 * POST /categories
 * Crear nueva categoría (solo admins)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(categorySchemas.createCategory),
  categoryController.createCategory
);

/**
 * PUT /categories/:id
 * Actualizar categoría (solo admins)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(commonSchemas.id),
  validateBody(categorySchemas.updateCategory),
  categoryController.updateCategory
);

/**
 * DELETE /categories/:id
 * Eliminar categoría (solo admins) - soft delete
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(commonSchemas.id),
  categoryController.deleteCategory
);

export default router;