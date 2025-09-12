import { Request, Response } from 'express';
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';

/**
 * Obtener perfil del usuario autenticado
 * GET /users/profile
 */
export const getProfile = catchAsync(async (req: Request, res: Response) => {
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
      role: true,
      type: true,
      status: true,
      isEmailVerified: true,
      referralCode: true,
      companyName: true,
      createdAt: true,
      // Incluir wallet
      wallet: {
        select: {
          balance: true,
          availableBalance: true,
          pendingBalance: true,
          currency: true,
          status: true,
        },
      },
      // Contar relaciones
      _count: {
        select: {
          referrals: true,
          orders: true,
        },
      },
    },
  });

  if (!user) {
    return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  logger.info('User profile retrieved', { userId });
  return ResponseUtils.success(res, user, 'Perfil obtenido exitosamente');
});

/**
 * Obtener lista de usuarios (solo admins)
 * GET /users
 */
export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const role = req.query.role as string;

  const skip = (page - 1) * limit;

  // Construir filtros dinámicos
  const where: any = {};

  console.log("SIIIIIIIII")
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (status) where.status = status;
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        type: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true,
            referrals: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };

  ResponseUtils.success(res, { users, pagination }, 'Lista de usuarios obtenida');
});

/**
 * Actualizar perfil del usuario
 * PUT /users/profile
 */
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { firstName, lastName, phone, companyName } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone,
      companyName,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      companyName: true,
      updatedAt: true,
    },
  });

  logger.info('User profile updated', { userId, updatedFields: Object.keys(req.body) });
  ResponseUtils.success(res, updatedUser, 'Perfil actualizado exitosamente');
});

/**
 * Actualizar email del usuario
 * PUT /users/email
 */
export const updateEmail = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { email } = req.body;

  // Verificar que el email no esté en uso
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== userId) {
    return ResponseUtils.conflict(res, 'Este email ya está registrado');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      isEmailVerified: false, // Requiere nueva verificación
    },
    select: {
      id: true,
      email: true,
      isEmailVerified: true,
    },
  });

  logger.info('User email updated', { userId, newEmail: email });
  return ResponseUtils.success(res, updatedUser, 'Email actualizado. Se requiere nueva verificación.');
});

/**
 * Obtener usuario por ID
 * GET /users/:id
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      type: true,
      status: true,
      isEmailVerified: true,
      referralCode: true,
      companyName: true,
      createdAt: true,
      lastLoginAt: true,
      wallet: {
        select: {
          balance: true,
          availableBalance: true,
          pendingBalance: true,
          currency: true,
          status: true,
        },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          estimatedTotal: true,
          finalTotal: true,
          createdAt: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          referrals: true,
          orders: true,
        },
      },
    },
  });

  if (!user) {
    return ResponseUtils.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return ResponseUtils.success(res, user, 'Usuario obtenido exitosamente');
});

/**
 * Actualizar estado de usuario (admin)
 * PUT /users/:id/status
 */
export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
    },
  });

  logger.info('User status updated', { 
    userId: id, 
    newStatus: status,
    updatedBy: (req as any).user?.id 
  });

  ResponseUtils.success(res, user, 'Estado de usuario actualizado');
});

/**
 * Eliminar usuario (soft delete)
 * DELETE /users/:id
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { 
      status: 'INACTIVE',
      // Opcional: marcar email como eliminado para permitir re-registro
      email: `deleted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@deleted.wiru.com`
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
    },
  });

  logger.info('User deleted (soft)', { 
    userId: id,
    deletedBy: (req as any).user?.id 
  });

  ResponseUtils.success(res, user, 'Usuario eliminado exitosamente');
});