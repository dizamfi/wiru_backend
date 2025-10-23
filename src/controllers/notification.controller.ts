// src/controllers/notification.controller.ts

import { Request, Response } from 'express';
import { catchAsync } from '@/middleware/error.middleware';
import { ResponseUtils } from '@/utils/response.utils';
import NotificationService from '@/services/notification.service';
import { NotificationType, NotificationStatus } from '@prisma/client';

/**
 * GET /api/v1/notifications
 * Obtener notificaciones del usuario
 */
export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { status, type, dateFrom, dateTo, page = '1', limit = '20' } = req.query;

  const filters: any = {};
  
  if (status) filters.status = status as NotificationStatus;
  if (type) filters.type = type as NotificationType;
  if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
  if (dateTo) filters.dateTo = new Date(dateTo as string);

  const result = await NotificationService.getUserNotifications(
    userId,
    filters,
    parseInt(page as string),
    parseInt(limit as string)
  );

  return ResponseUtils.success(
    res,
    result,
    'Notificaciones obtenidas exitosamente'
  );
});

/**
 * GET /api/v1/notifications/stats
 * Obtener estadísticas de notificaciones
 */
export const getStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const stats = await NotificationService.getStats(userId);

  return ResponseUtils.success(
    res,
    stats,
    'Estadísticas obtenidas exitosamente'
  );
});

/**
 * GET /api/v1/notifications/unread-count
 * Obtener contador de notificaciones no leídas
 */
export const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const count = await NotificationService.getUnreadCount(userId);

  return ResponseUtils.success(
    res,
    { count },
    'Contador obtenido exitosamente'
  );
});

/**
 * PUT /api/v1/notifications/:id/read
 * Marcar notificación como leída
 */
export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  const notification = await NotificationService.markAsRead(id, userId);

  return ResponseUtils.success(
    res,
    notification,
    'Notificación marcada como leída'
  );
});

/**
 * PUT /api/v1/notifications/read-all
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const result = await NotificationService.markAllAsRead(userId);

  return ResponseUtils.success(
    res,
    { count: result.count },
    `${result.count} notificaciones marcadas como leídas`
  );
});

/**
 * PUT /api/v1/notifications/:id/archive
 * Archivar notificación
 */
export const archive = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  const notification = await NotificationService.archive(id, userId);

  return ResponseUtils.success(
    res,
    notification,
    'Notificación archivada'
  );
});

/**
 * DELETE /api/v1/notifications/:id
 * Eliminar notificación
 */
export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  await NotificationService.delete(id, userId);

  return ResponseUtils.success(
    res,
    null,
    'Notificación eliminada exitosamente'
  );
});

/**
 * DELETE /api/v1/notifications/read
 * Eliminar todas las notificaciones leídas
 */
export const deleteAllRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const result = await NotificationService.deleteAllRead(userId);

  return ResponseUtils.success(
    res,
    { count: result.count },
    `${result.count} notificaciones eliminadas`
  );
});

/**
 * POST /api/v1/notifications/test
 * Crear notificación de prueba (solo desarrollo)
 */
export const createTestNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { type = 'ORDER_UPDATE' } = req.body;

  let notification;

  switch (type) {
    case 'ORDER_UPDATE':
      notification = await NotificationService.createOrderUpdateNotification(
        userId,
        'TEST-' + Date.now(),
        'CONFIRMED'
      );
      break;
    case 'PAYMENT_RECEIVED':
      notification = await NotificationService.createPaymentReceivedNotification(
        userId,
        150.50,
        'TEST-' + Date.now()
      );
      break;
    case 'WITHDRAWAL_COMPLETED':
      notification = await NotificationService.createWithdrawalCompletedNotification(
        userId,
        200.00,
        'Banco Pichincha ****1234'
      );
      break;
    default:
      return ResponseUtils.badRequest(res, 'Tipo de notificación no válido');
  }

  return ResponseUtils.success(
    res,
    notification,
    'Notificación de prueba creada'
  );
});