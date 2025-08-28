import { Request, Response } from 'express';
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';

/**
 * Obtener todas las categorías activas
 * GET /categories
 */
export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      description: true,
      pricePerKg: true,
      image: true,
      estimatedWeight: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  ResponseUtils.success(res, categories, 'Categorías obtenidas exitosamente');
});

/**
 * Obtener categoría por ID
 * GET /categories/:id
 */
export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      pricePerKg: true,
      image: true,
      estimatedWeight: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!category) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }

  return ResponseUtils.success(res, category, 'Categoría obtenida exitosamente');
});

/**
 * Crear nueva categoría (admin)
 * POST /categories
 */
export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, description, pricePerKg, image, estimatedWeight } = req.body;

  // Verificar que no exista una categoría con el mismo nombre
  const existingCategory = await prisma.category.findFirst({
    where: { 
      name: { equals: name, mode: 'insensitive' }
    },
  });

  if (existingCategory) {
    return ResponseUtils.conflict(res, 'Ya existe una categoría con este nombre');
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      pricePerKg,
      image,
      estimatedWeight,
    },
  });

  logger.info('Category created', { 
    categoryId: category.id,
    name: category.name,
    createdBy: (req as any).user?.id 
  });

  ResponseUtils.created(res, category, 'Categoría creada exitosamente');
});

/**
 * Actualizar categoría (admin)
 * PUT /categories/:id
 */
export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, pricePerKg, image, estimatedWeight, status } = req.body;

  // Verificar que la categoría existe
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }

  // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
  if (name && name !== existingCategory.name) {
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' },
        NOT: { id }
      },
    });

    if (duplicateCategory) {
      return ResponseUtils.conflict(res, 'Ya existe una categoría con este nombre');
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      description,
      pricePerKg,
      image,
      estimatedWeight,
      status,
    },
  });

  logger.info('Category updated', { 
    categoryId: id,
    updatedBy: (req as any).user?.id,
    changes: Object.keys(req.body)
  });

  ResponseUtils.success(res, updatedCategory, 'Categoría actualizada exitosamente');
});

/**
 * Eliminar categoría (cambiar estado a INACTIVE)
 * DELETE /categories/:id
 */
export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar que la categoría existe
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  if (!existingCategory) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }

  // Verificar si hay órdenes asociadas
  if (existingCategory._count.orderItems > 0) {
    return ResponseUtils.conflict(
      res, 
      'No se puede eliminar la categoría porque tiene órdenes asociadas. Puede desactivarla en su lugar.'
    );
  }

  // Cambiar estado a INACTIVE en lugar de eliminar físicamente
  const deletedCategory = await prisma.category.update({
    where: { id },
    data: { status: 'INACTIVE' },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  logger.info('Category deleted (soft)', { 
    categoryId: id,
    deletedBy: (req as any).user?.id 
  });

  ResponseUtils.success(res, deletedCategory, 'Categoría eliminada exitosamente');
});

/**
 * Obtener todas las categorías incluyendo inactivas (admin)
 * GET /categories/admin/all
 */
export const getAllCategoriesAdmin = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        pricePerKg: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.count(),
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  ResponseUtils.success(res, { categories, pagination }, 'Todas las categorías obtenidas');
});

/**
 * Obtener estadísticas de categorías (admin)
 * GET /categories/admin/stats
 */
export const getCategoryStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await prisma.$transaction(async (tx) => {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoriesWithOrders,
      totalOrderItems,
      avgPricePerKg
    ] = await Promise.all([
      tx.category.count(),
      tx.category.count({ where: { status: 'ACTIVE' } }),
      tx.category.count({ where: { status: 'INACTIVE' } }),
      tx.category.count({
        where: {
          orderItems: {
            some: {}
          }
        }
      }),
      tx.orderItem.count(),
      tx.category.aggregate({
        _avg: {
          pricePerKg: true
        },
        where: {
          status: 'ACTIVE'
        }
      })
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoriesWithOrders,
      totalOrderItems,
      avgPricePerKg: avgPricePerKg._avg.pricePerKg || 0,
    };
  });

  ResponseUtils.success(res, stats, 'Estadísticas de categorías obtenidas');
});