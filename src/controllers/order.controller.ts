import { Request, Response } from 'express';
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';

/**
 * Crear nueva orden
 * POST /orders
 */
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { items, deliveryMethod, pickupAddress } = req.body;

  // Validar que existan items
  if (!items || items.length === 0) {
    return ResponseUtils.badRequest(res, 'Debe incluir al menos un item');
  }

  // Obtener categorías para calcular totales
  const categoryIds = items.map((item: any) => item.categoryId);
  const categories = await prisma.category.findMany({
    where: { 
      id: { in: categoryIds },
      status: 'ACTIVE'
    },
  });

  if (categories.length !== categoryIds.length) {
    return ResponseUtils.badRequest(res, 'Una o más categorías no son válidas o están inactivas');
  }

  // Calcular totales estimados
  let estimatedTotal = 0;
  let estimatedWeight = 0;

  const orderItems = items.map((item: any) => {
    const category = categories.find(c => c.id === item.categoryId);
    if (!category) {
      throw new Error(`Categoría ${item.categoryId} no encontrada`);
    }

    const itemWeight = parseFloat(item.estimatedWeight);
    const itemValue = itemWeight * parseFloat(category.pricePerKg.toString());
    
    estimatedTotal += itemValue;
    estimatedWeight += itemWeight;

    return {
      categoryId: item.categoryId,
      estimatedWeight: itemWeight,
      pricePerKg: category.pricePerKg,
      estimatedValue: itemValue,
      images: item.images || [],
      notes: item.notes,
    };
  });

  // Generar número de orden único
  const orderNumber = `WRU-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  // Crear orden con transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        deliveryMethod,
        estimatedTotal,
        estimatedWeight,
        pickupAddress,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            category: {
              select: {
                name: true,
                pricePerKg: true,
              },
            },
          },
        },
      },
    });

    return newOrder;
  });

  logger.info('Order created', { 
    orderId: order.id,
    userId,
    orderNumber: order.orderNumber,
    estimatedTotal 
  });

  ResponseUtils.created(res, order, 'Orden creada exitosamente');
});

/**
 * Obtener órdenes del usuario
 * GET /orders
 */
export const getUserOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  const skip = (page - 1) * limit;
  const where: any = { userId };

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        deliveryMethod: true,
        estimatedTotal: true,
        finalTotal: true,
        estimatedWeight: true,
        actualWeight: true,
        pickupDate: true,
        trackingNumber: true,
        createdAt: true,
        orderItems: {
          select: {
            estimatedWeight: true,
            actualWeight: true,
            estimatedValue: true,
            actualValue: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  ResponseUtils.success(res, { orders, pagination }, 'Órdenes obtenidas exitosamente');
});

/**
 * Obtener orden por ID
 * GET /orders/:id
 */
export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  // Construir where clause según el rol
  const where: any = { id };
  if (userRole !== 'ADMIN') {
    where.userId = userId; // Los usuarios solo pueden ver sus propias órdenes
  }

  const order = await prisma.order.findUnique({
    where,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      orderItems: {
        include: {
          category: {
            select: {
              name: true,
              description: true,
              pricePerKg: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return ResponseUtils.notFound(res, 'Orden no encontrada');
  }

  return ResponseUtils.success(res, order, 'Orden obtenida exitosamente');
});

/**
 * Obtener todas las órdenes (admin)
 * GET /orders/admin/all
 */
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { 
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      }},
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        estimatedTotal: true,
        finalTotal: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
    prisma.order.count({ where }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  ResponseUtils.success(res, { orders, pagination }, 'Todas las órdenes obtenidas');
});

/**
 * Actualizar estado de orden (admin)
 * PUT /orders/:id/status
 */
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, actualWeight, trackingNumber, notes } = req.body;

  const updateData: any = { status };
  
  if (actualWeight) updateData.actualWeight = actualWeight;
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (notes) updateData.notes = notes;

  // Si se está confirmando la orden, agregar fecha de pickup
  if (status === 'CONFIRMED') {
    updateData.pickupDate = new Date();
  }

  // Si se está entregando, agregar fecha de entrega
  if (status === 'DELIVERED') {
    updateData.deliveryDate = new Date();
  }

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      orderItems: true,
    },
  });

  // Si se verifica la orden, recalcular totales si hay peso actual
  if (status === 'VERIFIED' && actualWeight) {
    await recalculateOrderTotals(id);
  }

  logger.info('Order status updated', { 
    orderId: id,
    newStatus: status,
    updatedBy: (req as any).user?.id 
  });

  ResponseUtils.success(res, order, 'Estado de orden actualizado');
});

/**
 * Función auxiliar para recalcular totales de orden
 */
async function recalculateOrderTotals(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { category: true } } },
  });

  if (!order || !order.actualWeight) return;

  // Recalcular valores basados en peso real
  let finalTotal = 0;
  
  const itemUpdates = order.orderItems.map(item => {
    // Calcular proporción del peso real para este item
    const weightRatio = parseFloat(item.estimatedWeight.toString()) / 
                       parseFloat(order.estimatedWeight.toString());
    const actualItemWeight = parseFloat(order.actualWeight!.toString()) * weightRatio;
    const actualValue = actualItemWeight * parseFloat(item.pricePerKg.toString());
    
    finalTotal += actualValue;

    return prisma.orderItem.update({
      where: { id: item.id },
      data: {
        actualWeight: actualItemWeight,
        actualValue: actualValue,
      },
    });
  });

  // Ejecutar todas las actualizaciones
  await Promise.all([
    ...itemUpdates,
    prisma.order.update({
      where: { id: orderId },
      data: { finalTotal },
    }),
  ]);
}

/**
 * Cancelar orden
 * PUT /orders/:id/cancel
 */
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  // Verificar que la orden existe y pertenece al usuario (a menos que sea admin)
  const where: any = { id };
  if (userRole !== 'ADMIN') {
    where.userId = userId;
  }

  const order = await prisma.order.findUnique({ where });

  if (!order) {
    return ResponseUtils.notFound(res, 'Orden no encontrada');
  }

  // Solo se pueden cancelar órdenes en estado PENDING o CONFIRMED
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return ResponseUtils.badRequest(res, 'Solo se pueden cancelar órdenes pendientes o confirmadas');
  }

  const cancelledOrder = await prisma.order.update({
    where: { id },
    data: { 
      status: 'CANCELLED',
      paymentStatus: 'CANCELLED',
    },
  });

  logger.info('Order cancelled', { 
    orderId: id,
    cancelledBy: userId 
  });

  ResponseUtils.success(res, cancelledOrder, 'Orden cancelada exitosamente');
});

/**
 * Obtener estadísticas de órdenes (admin)
 * GET /orders/admin/stats
 */
export const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await prisma.$transaction(async (tx) => {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue,
      ordersThisMonth,
      revenueThisMonth
    ] = await Promise.all([
      tx.order.count(),
      tx.order.count({ where: { status: 'PENDING' } }),
      tx.order.count({ where: { status: 'PAID' } }),
      tx.order.count({ where: { status: 'CANCELLED' } }),
      tx.order.aggregate({
        _sum: { finalTotal: true },
        where: { status: 'PAID' }
      }),
      tx.order.aggregate({
        _avg: { estimatedTotal: true }
      }),
      tx.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      tx.order.aggregate({
        _sum: { finalTotal: true },
        where: {
          status: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.finalTotal || 0,
      avgOrderValue: avgOrderValue._avg.estimatedTotal || 0,
      ordersThisMonth,
      revenueThisMonth: revenueThisMonth._sum.finalTotal || 0,
    };
  });

  ResponseUtils.success(res, stats, 'Estadísticas de órdenes obtenidas');
});