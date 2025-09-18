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
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';
import { CategoryType, MaterialGrade, DeviceCondition } from '@prisma/client';

/**
 * Obtener tipos principales de categorías
 * GET /categories/types
 */
export const getCategoryTypes = catchAsync(async (req: Request, res: Response) => {
  const types = [
    {
      id: 'complete-devices',
      type: CategoryType.COMPLETE_DEVICES,
      name: 'Dispositivos Completos',
      description: 'Equipos electrónicos completos y funcionales',
      icon: '📱',
      color: 'bg-blue-500'
    },
    {
      id: 'dismantled-devices', 
      type: CategoryType.DISMANTLED_DEVICES,
      name: 'Dispositivos Desarmables',
      description: 'Componentes y placas electrónicas por separado',
      icon: '🔧',
      color: 'bg-green-500'
    }
  ];

  ResponseUtils.success(res, types, 'Tipos de categorías obtenidos exitosamente');
});

/**
 * Obtener categorías por tipo
 * GET /categories/by-type/:type
 */
export const getCategoriesByType = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.params;
  
  if (!Object.values(CategoryType).includes(type as CategoryType)) {
    return ResponseUtils.badRequest(res, 'Tipo de categoría inválido');
  }

  const categories = await prisma.category.findMany({
    where: { 
      type: type as CategoryType,
      status: 'ACTIVE' 
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      icon: true,
      image: true,
      estimatedWeight: true,
      basePrice: true,
      pricePerKg: true,
      minPrice: true,
      maxPrice: true,
      materialGrade: true,
      referenceImages: true,
      examples: true,
      requiredFields: true,
      conditionMultipliers: true,
      allowsQuantity: true,
      requiresPhotos: true,
      minPhotos: true,
      maxPhotos: true,
      metadata: true,
      createdAt: true
    },
    orderBy: { name: 'asc' }
  });

  // Enriquecer datos según el tipo
  const enrichedCategories = categories.map(category => ({
    ...category,
    // Calcular rango de precio estimado basado en peso promedio
    estimatedPriceRange: category.type === CategoryType.COMPLETE_DEVICES && category.estimatedWeight
      ? {
          min: Number(category.minPrice),
          max: Number(category.maxPrice),
          perUnit: {
            min: Math.round(Number(category.estimatedWeight) * Number(category.pricePerKg) * 0.5),
            max: Math.round(Number(category.estimatedWeight) * Number(category.pricePerKg) * 1.2)
          }
        }
      : {
          min: Number(category.minPrice),
          max: Number(category.maxPrice),
          perKg: Number(category.pricePerKg)
        },
    // Información de validación
    validation: {
      requiresPhotos: category.requiresPhotos,
      minPhotos: category.minPhotos,
      maxPhotos: category.maxPhotos,
      requiredFields: category.requiredFields,
      allowsQuantity: category.allowsQuantity
    }
  }));

  ResponseUtils.success(res, enrichedCategories, `Categorías de ${type} obtenidas exitosamente`);
});

/**
 * Obtener detalles de una categoría específica
 * GET /categories/:id/details
 */
export const getCategoryDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: {
            where: {
              order: {
                status: {
                  in: ['VERIFIED', 'PAID']
                }
              }
            }
          }
        }
      }
    }
  });

  if (!category) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }

  // Calcular estadísticas de la categoría
  const stats = await prisma.orderItem.aggregate({
    where: {
      categoryId: id,
      order: {
        status: {
          in: ['VERIFIED', 'PAID']
        }
      }
    },
    _avg: {
      actualValue: true,
      actualWeight: true
    },
    _sum: {
      actualValue: true,
      actualWeight: true
    },
    _count: true
  });

  const enrichedCategory = {
    ...category,
    stats: {
      totalOrders: category._count.orderItems,
      averageValue: stats._avg.actualValue || 0,
      averageWeight: stats._avg.actualWeight || 0,
      totalValue: stats._sum.actualValue || 0,
      totalWeight: stats._sum.actualWeight || 0
    },
    // Opciones de condición con multiplicadores
    conditionOptions: Object.entries(category.conditionMultipliers as Record<string, number> || {})
      .map(([condition, multiplier]) => ({
        value: condition,
        label: getConditionLabel(condition as DeviceCondition),
        description: getConditionDescription(condition as DeviceCondition),
        multiplier: multiplier,
        estimatedPrice: category.type === CategoryType.COMPLETE_DEVICES 
          ? Math.round(Number(category.basePrice) * multiplier)
          : Math.round(Number(category.pricePerKg) * multiplier)
      }))
  };

  ResponseUtils.success(res, enrichedCategory, 'Detalles de categoría obtenidos exitosamente');
});

/**
 * Calcular precio estimado
 * POST /categories/:id/calculate-price
 */
export const calculateEstimatedPrice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    quantity = 1, 
    weight, 
    condition = DeviceCondition.GOOD,
    accessories = []
  } = req.body;

  const category = await prisma.category.findUnique({
    where: { id, status: 'ACTIVE' }
  });

  if (!category) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }

  let estimatedPrice = 0;
  let breakdown = {};

  if (category.type === CategoryType.COMPLETE_DEVICES) {
    // Cálculo para dispositivos completos
    const baseValue = Number(category.basePrice);
    const conditionMultiplier = (category.conditionMultipliers as any)?.[condition] || 0.8;
    
    // Precio base por cantidad
    const unitPrice = baseValue * conditionMultiplier;
    const totalPrice = unitPrice * quantity;
    
    // Bonificaciones por accesorios
    let accessoryBonus = 0;
    accessories.forEach((accessory: string) => {
      const bonus = getAccessoryBonus(accessory);
      accessoryBonus += totalPrice * bonus;
    });

    estimatedPrice = totalPrice + accessoryBonus;
    
    breakdown = {
      unitPrice: Math.round(unitPrice * 100) / 100,
      quantity,
      subtotal: Math.round(totalPrice * 100) / 100,
      conditionMultiplier,
      accessories: accessories.map((acc: string) => ({
        name: acc,
        bonus: getAccessoryBonus(acc),
        value: Math.round(totalPrice * getAccessoryBonus(acc) * 100) / 100
      })),
      accessoryBonus: Math.round(accessoryBonus * 100) / 100,
      total: Math.round(estimatedPrice * 100) / 100
    };
  } else {
    // Cálculo para dispositivos desarmables (por peso)
    if (!weight) {
      return ResponseUtils.badRequest(res, 'El peso es requerido para dispositivos desarmables');
    }
    
    const pricePerKg = Number(category.pricePerKg);
    const conditionMultiplier = (category.conditionMultipliers as any)?.[condition] || 0.8;
    
    estimatedPrice = weight * pricePerKg * conditionMultiplier;
    
    breakdown = {
      weight,
      pricePerKg: Math.round(pricePerKg * 100) / 100,
      conditionMultiplier,
      total: Math.round(estimatedPrice * 100) / 100
    };
  }

  const result = {
    categoryId: id,
    categoryName: category.name,
    categoryType: category.type,
    estimatedPrice: Math.round(estimatedPrice * 100) / 100,
    breakdown,
    currency: 'USD',
    calculatedAt: new Date().toISOString()
  };

  ResponseUtils.success(res, result, 'Precio estimado calculado exitosamente');
});

/**
 * Buscar categorías
 * GET /categories/search?q=term&type=COMPLETE_DEVICES
 */
export const searchCategories = catchAsync(async (req: Request, res: Response) => {
  const { q: searchTerm, type } = req.query;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return ResponseUtils.badRequest(res, 'Término de búsqueda requerido');
  }

  const whereClause: any = {
    status: 'ACTIVE',
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { examples: { hasSome: [searchTerm] } }
    ]
  };

  if (type && Object.values(CategoryType).includes(type as CategoryType)) {
    whereClause.type = type as CategoryType;
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      icon: true,
      image: true,
      estimatedWeight: true,
      basePrice: true,
      pricePerKg: true,
      minPrice: true,
      maxPrice: true,
      materialGrade: true,
      examples: true
    },
    orderBy: [
      { name: 'asc' }
    ],
    take: 20
  });

  ResponseUtils.success(res, categories, `Encontradas ${categories.length} categorías`);
});

/**
 * Validar campos de categoría
 * POST /categories/:id/validate
 */
export const validateCategoryFields = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const category = await prisma.category.findUnique({
    where: { id, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      type: true,
      requiredFields: true,
      requiresPhotos: true,
      minPhotos: true,
      allowsQuantity: true
    }
  });

  if (!category) {
    return ResponseUtils.notFound(res, 'Categoría no encontrada');
  }

  const validation = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    requiredFields: category.requiredFields
  };

  // Validar campos requeridos
  for (const field of category.requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      validation.errors.push(`El campo ${field} es requerido`);
      validation.isValid = false;
    }
  }

  // Validar fotos si son requeridas
  if (category.requiresPhotos) {
    const images = data.images || [];
    if (!Array.isArray(images) || images.length < category.minPhotos) {
      validation.errors.push(`Se requieren al menos ${category.minPhotos} fotos`);
      validation.isValid = false;
    }
  }

  // Validaciones específicas por tipo
  if (category.type === CategoryType.COMPLETE_DEVICES) {
    // Validar cantidad
    if (category.allowsQuantity && (!data.quantity || data.quantity < 1)) {
      validation.errors.push('La cantidad debe ser mayor a 0');
      validation.isValid = false;
    }
  } else {
    // Validar peso para dispositivos desarmables
    if (!data.weight || data.weight <= 0) {
      validation.errors.push('El peso debe ser mayor a 0');
      validation.isValid = false;
    }
    if (data.weight > 100) {
      validation.warnings.push('El peso parece muy alto, verifica la información');
    }
  }

  // Validar condición
  if (data.condition && !Object.values(DeviceCondition).includes(data.condition)) {
    validation.errors.push('Condición del dispositivo inválida');
    validation.isValid = false;
  }

  ResponseUtils.success(res, validation, 'Validación completada');
});

/**
 * Obtener estadísticas de categorías
 * GET /categories/stats
 */
export const getCategoryStats = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;

  const whereClause: any = {
    status: 'ACTIVE'
  };

  if (type && Object.values(CategoryType).includes(type as CategoryType)) {
    whereClause.type = type as CategoryType;
  }

  // Estadísticas generales
  const totalCategories = await prisma.category.count({ where: whereClause });
  
  // Categorías más usadas
  const popularCategories = await prisma.category.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      type: true,
      _count: {
        select: {
          orderItems: true
        }
      }
    },
    orderBy: {
      orderItems: {
        _count: 'desc'
      }
    },
    take: 10
  });

  // Estadísticas por tipo
  const statsByType = await prisma.category.groupBy({
    by: ['type'],
    where: { status: 'ACTIVE' },
    _count: {
      id: true
    }
  });

  const stats = {
    totalCategories,
    categoriesByType: statsByType.map(stat => ({
      type: stat.type,
      count: stat._count.id,
      label: stat.type === CategoryType.COMPLETE_DEVICES ? 'Dispositivos Completos' : 'Dispositivos Desarmables'
    })),
    popularCategories: popularCategories.map(cat => ({
      ...cat,
      orderCount: cat._count.orderItems
    }))
  };

  ResponseUtils.success(res, stats, 'Estadísticas de categorías obtenidas exitosamente');
});

// Funciones auxiliares
function getConditionLabel(condition: DeviceCondition): string {
  const labels = {
    [DeviceCondition.EXCELLENT]: 'Excelente',
    [DeviceCondition.GOOD]: 'Bueno',
    [DeviceCondition.FAIR]: 'Regular',
    [DeviceCondition.POOR]: 'Malo',
    [DeviceCondition.BROKEN]: 'Dañado'
  };
  return labels[condition] || 'Desconocido';
}

function getConditionDescription(condition: DeviceCondition): string {
  const descriptions = {
    [DeviceCondition.EXCELLENT]: 'Como nuevo, sin daños visibles',
    [DeviceCondition.GOOD]: 'Ligeros signos de uso, funciona perfectamente',
    [DeviceCondition.FAIR]: 'Uso moderado, algunas marcas pero funcional',
    [DeviceCondition.POOR]: 'Muy usado, funciona con limitaciones',
    [DeviceCondition.BROKEN]: 'No funciona o funciona parcialmente'
  };
  return descriptions[condition] || 'Estado no especificado';
}

function getAccessoryBonus(accessory: string): number {
  const bonuses: Record<string, number> = {
    'charger': 0.1,
    'box': 0.05,
    'documents': 0.03,
    'headphones': 0.08,
    'case': 0.05,
    'cable': 0.03,
    'manual': 0.02
  };
  return bonuses[accessory] || 0;
}