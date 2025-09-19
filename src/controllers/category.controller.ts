// import { Request, Response } from 'express';
// import prisma from '@/config/database';
// import { ResponseUtils } from '@/utils/response.utils';
// import { catchAsync } from '@/middleware/error.middleware';
// import logger from '@/config/logger';

// /**
//  * Obtener todas las categorías activas
//  * GET /categories
//  */
// export const getCategories = catchAsync(async (req: Request, res: Response) => {
//   const categories = await prisma.category.findMany({
//     where: { status: 'ACTIVE' },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       pricePerKg: true,
//       image: true,
//       estimatedWeight: true,
//       createdAt: true,
//     },
//     orderBy: { name: 'asc' },
//   });

//   ResponseUtils.success(res, categories, 'Categorías obtenidas exitosamente');
// });

// /**
//  * Obtener categoría por ID
//  * GET /categories/:id
//  */
// export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const category = await prisma.category.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       pricePerKg: true,
//       image: true,
//       estimatedWeight: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

//   if (!category) {
//     return ResponseUtils.notFound(res, 'Categoría no encontrada');
//   }

//   return ResponseUtils.success(res, category, 'Categoría obtenida exitosamente');
// });

// /**
//  * Crear nueva categoría (admin)
//  * POST /categories
//  */
// export const createCategory = catchAsync(async (req: Request, res: Response) => {
//   const { name, description, pricePerKg, image, estimatedWeight } = req.body;

//   // Verificar que no exista una categoría con el mismo nombre
//   const existingCategory = await prisma.category.findFirst({
//     where: { 
//       name: { equals: name, mode: 'insensitive' }
//     },
//   });

//   if (existingCategory) {
//     return ResponseUtils.conflict(res, 'Ya existe una categoría con este nombre');
//   }

//   const category = await prisma.category.create({
//     data: {
//       name,
//       description,
//       pricePerKg,
//       image,
//       estimatedWeight,
//     },
//   });

//   logger.info('Category created', { 
//     categoryId: category.id,
//     name: category.name,
//     createdBy: (req as any).user?.id 
//   });

//   return ResponseUtils.created(res, category, 'Categoría creada exitosamente');
// });

// /**
//  * Actualizar categoría (admin)
//  * PUT /categories/:id
//  */
// export const updateCategory = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { name, description, pricePerKg, image, estimatedWeight, status } = req.body;

//   // Verificar que la categoría existe
//   const existingCategory = await prisma.category.findUnique({
//     where: { id },
//   });

//   if (!existingCategory) {
//     return ResponseUtils.notFound(res, 'Categoría no encontrada');
//   }

//   // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
//   if (name && name !== existingCategory.name) {
//     const duplicateCategory = await prisma.category.findFirst({
//       where: { 
//         name: { equals: name, mode: 'insensitive' },
//         NOT: { id }
//       },
//     });

//     if (duplicateCategory) {
//       return ResponseUtils.conflict(res, 'Ya existe una categoría con este nombre');
//     }
//   }

//   const updatedCategory = await prisma.category.update({
//     where: { id },
//     data: {
//       name,
//       description,
//       pricePerKg,
//       image,
//       estimatedWeight,
//       status,
//     },
//   });

//   logger.info('Category updated', { 
//     categoryId: id,
//     updatedBy: (req as any).user?.id,
//     changes: Object.keys(req.body)
//   });

//   return ResponseUtils.success(res, updatedCategory, 'Categoría actualizada exitosamente');
// });

// /**
//  * Eliminar categoría (cambiar estado a INACTIVE)
//  * DELETE /categories/:id
//  */
// export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;

//   // Verificar que la categoría existe
//   const existingCategory = await prisma.category.findUnique({
//     where: { id },
//     include: {
//       _count: {
//         select: {
//           orderItems: true,
//         },
//       },
//     },
//   });

//   if (!existingCategory) {
//     return ResponseUtils.notFound(res, 'Categoría no encontrada');
//   }

//   // Verificar si hay órdenes asociadas
//   if (existingCategory._count.orderItems > 0) {
//     return ResponseUtils.conflict(
//       res, 
//       'No se puede eliminar la categoría porque tiene órdenes asociadas. Puede desactivarla en su lugar.'
//     );
//   }

//   // Cambiar estado a INACTIVE en lugar de eliminar físicamente
//   const deletedCategory = await prisma.category.update({
//     where: { id },
//     data: { status: 'INACTIVE' },
//     select: {
//       id: true,
//       name: true,
//       status: true,
//     },
//   });

//   logger.info('Category deleted (soft)', { 
//     categoryId: id,
//     deletedBy: (req as any).user?.id 
//   });

//   return ResponseUtils.success(res, deletedCategory, 'Categoría eliminada exitosamente');
// });

// /**
//  * Obtener todas las categorías incluyendo inactivas (admin)
//  * GET /categories/admin/all
//  */
// export const getAllCategoriesAdmin = catchAsync(async (req: Request, res: Response) => {
//   const page = parseInt(req.query.page as string) || 1;
//   const limit = parseInt(req.query.limit as string) || 10;
//   const skip = (page - 1) * limit;

//   const [categories, total] = await Promise.all([
//     prisma.category.findMany({
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         pricePerKg: true,
//         status: true,
//         createdAt: true,
//         updatedAt: true,
//         _count: {
//           select: {
//             orderItems: true,
//           },
//         },
//       },
//       skip,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//     }),
//     prisma.category.count(),
//   ]);

//   const pagination = {
//     page,
//     limit,
//     total,
//     totalPages: Math.ceil(total / limit),
//   };

//   ResponseUtils.success(res, { categories, pagination }, 'Todas las categorías obtenidas');
// });

// /**
//  * Obtener estadísticas de categorías (admin)
//  * GET /categories/admin/stats
//  */
// export const getCategoryStats = catchAsync(async (req: Request, res: Response) => {
//   const stats = await prisma.$transaction(async (tx) => {
//     const [
//       totalCategories,
//       activeCategories,
//       inactiveCategories,
//       categoriesWithOrders,
//       totalOrderItems,
//       avgPricePerKg
//     ] = await Promise.all([
//       tx.category.count(),
//       tx.category.count({ where: { status: 'ACTIVE' } }),
//       tx.category.count({ where: { status: 'INACTIVE' } }),
//       tx.category.count({
//         where: {
//           orderItems: {
//             some: {}
//           }
//         }
//       }),
//       tx.orderItem.count(),
//       tx.category.aggregate({
//         _avg: {
//           pricePerKg: true
//         },
//         where: {
//           status: 'ACTIVE'
//         }
//       })
//     ]);

//     return {
//       totalCategories,
//       activeCategories,
//       inactiveCategories,
//       categoriesWithOrders,
//       totalOrderItems,
//       avgPricePerKg: avgPricePerKg._avg.pricePerKg || 0,
//     };
//   });

//   ResponseUtils.success(res, stats, 'Estadísticas de categorías obtenidas');
// });



// src/controllers/category.controller.ts

import { Request, Response } from 'express';
import { catchAsync } from '@/middleware/error.middleware';
import { ResponseUtils } from '@/utils/response.utils';
import { CategoryService } from '@/services/category.service';
import logger from '@/config/logger';

/**
 * GET /categories/tree
 * Obtener árbol completo de categorías
 */
export const getCategoryTree = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  
  const tree = await CategoryService.getCategoryTree(type as string);
  
  ResponseUtils.success(res, tree, 'Árbol de categorías obtenido exitosamente');
});

/**
 * GET /categories/:categoryId/children
 * Obtener hijos directos de una categoría
 */
export const getCategoryChildren = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  
  const children = await CategoryService.getCategoryChildren(categoryId);
  
  ResponseUtils.success(res, children, 'Subcategorías obtenidas exitosamente');
});

/**
 * GET /categories/:categoryId/breadcrumb
 * Obtener breadcrumb/path de una categoría
 */
export const getCategoryBreadcrumb = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  
  const breadcrumb = await CategoryService.getCategoryBreadcrumb(categoryId);
  
  ResponseUtils.success(res, breadcrumb, 'Breadcrumb obtenido exitosamente');
});

/**
 * GET /categories/root
 * Obtener categorías raíz
 */
export const getRootCategories = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  
  const rootCategories = await CategoryService.getRootCategories(type as string);
  
  ResponseUtils.success(res, rootCategories, 'Categorías raíz obtenidas exitosamente');
});

/**
 * GET /categories/leaf
 * Obtener solo categorías finales (seleccionables)
 */
export const getLeafCategories = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  
  const leafCategories = await CategoryService.getLeafCategories(type as string);
  
  ResponseUtils.success(res, leafCategories, 'Categorías finales obtenidas exitosamente');
});

/**
 * GET /categories/:categoryId
 * Obtener detalles de una categoría específica
 */
export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { includeChildren, includeBreadcrumb } = req.query;
  
  const category = await CategoryService.getCategoryById(
    categoryId,
    {
      includeChildren: includeChildren === 'true',
      includeBreadcrumb: includeBreadcrumb === 'true'
    }
  );
  
  if (!category) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }
  
  return ResponseUtils.success(res, category, 'Categoría obtenida exitosamente');
});

/**
 * GET /categories/search
 * Buscar categorías por nombre
 */
export const searchCategories = catchAsync(async (req: Request, res: Response) => {
  const { q: query, type, leafOnly } = req.query;
  
  if (!query || typeof query !== 'string') {
    return ResponseUtils.badRequest(res, 'Query de búsqueda requerido');
  }
  
  const results = await CategoryService.searchCategories(query, {
    type: type as string,
    leafOnly: leafOnly === 'true'
  });
  
  return ResponseUtils.success(res, results, 'Búsqueda completada exitosamente');
});

/**
 * POST /categories (Admin only)
 * Crear nueva categoría
 */
export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryData = req.body;
  const createdBy = (req as any).user?.id;
  
  const newCategory = await CategoryService.createCategory({
    ...categoryData,
    createdBy
  });
  
  logger.info('Category created', { 
    categoryId: newCategory.id,
    name: newCategory.name,
    createdBy 
  });
  
  ResponseUtils.created(res, newCategory, 'Categoría creada exitosamente');
});

/**
 * PUT /categories/:categoryId (Admin only)
 * Actualizar categoría
 */
export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const updateData = req.body;
  
  const updatedCategory = await CategoryService.updateCategory(categoryId, updateData);
  
  if (!updatedCategory) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }
  
  logger.info('Category updated', { 
    categoryId,
    updatedBy: (req as any).user?.id 
  });
  
  return ResponseUtils.success(res, updatedCategory, 'Categoría actualizada exitosamente');
});

/**
 * DELETE /categories/:categoryId (Admin only)
 * Eliminar categoría (soft delete)
 */
export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  
  const deletedCategory = await CategoryService.deleteCategory(categoryId);
  
  if (!deletedCategory) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }
  
  logger.info('Category deleted', { 
    categoryId,
    deletedBy: (req as any).user?.id 
  });
  
  return ResponseUtils.success(res, deletedCategory, 'Categoría eliminada exitosamente');
});

/**
 * POST /categories/:categoryId/reorder (Admin only)
 * Reordenar categorías
 */
export const reorderCategories = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { newOrder } = req.body;
  
  await CategoryService.reorderCategories(categoryId, newOrder);
  
  ResponseUtils.success(res, null, 'Categorías reordenadas exitosamente');
});

/**
 * GET /categories/:categoryId/stats (Admin only)
 * Obtener estadísticas de uso de una categoría
 */
export const getCategoryStats = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  
  const stats = await CategoryService.getCategoryStats(categoryId);
  
  ResponseUtils.success(res, stats, 'Estadísticas obtenidas exitosamente');
});