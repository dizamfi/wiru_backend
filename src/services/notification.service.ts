// src/services/notification.service.ts

import prisma from '@/config/database';
import logger from '@/config/logger';
import { NotificationType, NotificationStatus } from '@prisma/client';
import { EmailService } from './email.service';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<NotificationType, number>;
}

export class NotificationService {
  /**
   * Crear una notificación
   */
  static async create(data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        status: 'UNREAD',
        metadata: data.metadata || {},
      },
    });

    logger.info('Notification created', {
      notificationId: notification.id,
      userId: data.userId,
      type: data.type,
    });

    // Enviar email si es necesario según tipo y configuración del usuario
    await this.sendEmailIfNeeded(notification.userId, notification.type, {
      title: notification.title,
      message: notification.message,
    });

    return notification;
  }

  /**
   * Crear notificación de actualización de orden
   */
  static async createOrderUpdateNotification(
    userId: string,
    orderNumber: string,
    status: string,
    metadata?: any
  ) {
    return await this.create({
      userId,
      type: 'ORDER_UPDATE',
      title: `Actualización de orden #${orderNumber}`,
      message: `Tu orden #${orderNumber} cambió a estado: ${this.getOrderStatusLabel(status)}`,
      metadata: {
        orderNumber,
        orderStatus: status,
        ...metadata,
      },
    });
  }

  /**
   * Crear notificación de pago recibido
   */
  static async createPaymentReceivedNotification(
    userId: string,
    amount: number,
    orderNumber: string,
    metadata?: any
  ) {
    return await this.create({
      userId,
      type: 'PAYMENT_RECEIVED',
      title: '💰 Pago recibido',
      message: `Has recibido $${amount.toFixed(2)} por la orden #${orderNumber}`,
      metadata: {
        amount,
        orderNumber,
        ...metadata,
      },
    });
  }

  /**
   * Crear notificación de retiro completado
   */
  static async createWithdrawalCompletedNotification(
    userId: string,
    amount: number,
    bankAccount: string,
    metadata?: any
  ) {
    return await this.create({
      userId,
      type: 'WITHDRAWAL_COMPLETED',
      title: '✅ Retiro completado',
      message: `Tu retiro de $${amount.toFixed(2)} a ${bankAccount} ha sido procesado exitosamente`,
      metadata: {
        amount,
        bankAccount,
        ...metadata,
      },
    });
  }

  /**
   * Crear notificación de verificación requerida
   */
  static async createVerificationRequiredNotification(
    userId: string,
    verificationType: string,
    metadata?: any
  ) {
    return await this.create({
      userId,
      type: 'VERIFICATION_REQUIRED',
      title: '⚠️ Verificación requerida',
      message: `Se requiere verificación: ${verificationType}`,
      metadata: {
        verificationType,
        ...metadata,
      },
    });
  }

  /**
   * Crear notificación de mantenimiento del sistema
   */
  static async createSystemMaintenanceNotification(
    userId: string,
    maintenanceDate: Date,
    duration: string,
    metadata?: any
  ) {
    return await this.create({
      userId,
      type: 'SYSTEM_MAINTENANCE',
      title: '🔧 Mantenimiento programado',
      message: `El sistema estará en mantenimiento el ${maintenanceDate.toLocaleDateString()} durante ${duration}`,
      metadata: {
        maintenanceDate: maintenanceDate.toISOString(),
        duration,
        ...metadata,
      },
    });
  }

  /**
   * Obtener notificaciones del usuario
   */
  static async getUserNotifications(
    userId: string,
    filters?: NotificationFilters,
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    if (notification.status === 'READ') {
      return notification; // Ya está leída
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    logger.info('Notification marked as read', { notificationId, userId });
    return updated;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    logger.info('All notifications marked as read', { userId, count: result.count });
    return result;
  }

  /**
   * Archivar notificación
   */
  static async archive(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'ARCHIVED' },
    });

    logger.info('Notification archived', { notificationId, userId });
    return updated;
  }

  /**
   * Eliminar notificación
   */
  static async delete(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info('Notification deleted', { notificationId, userId });
    return { success: true };
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  static async deleteAllRead(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        status: 'READ',
      },
    });

    logger.info('All read notifications deleted', { userId, count: result.count });
    return result;
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  static async getStats(userId: string): Promise<NotificationStats> {
    const [total, unread, read, archived, byType] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, status: 'UNREAD' } }),
      prisma.notification.count({ where: { userId, status: 'READ' } }),
      prisma.notification.count({ where: { userId, status: 'ARCHIVED' } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
    ]);

    const byTypeMap: Record<NotificationType, number> = {} as any;
    byType.forEach((item) => {
      byTypeMap[item.type] = item._count.type;
    });

    return {
      total,
      unread,
      read,
      archived,
      byType: byTypeMap,
    };
  }

  /**
   * Obtener contador de no leídas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD',
      },
    });
  }

  /**
   * Enviar email si está configurado por el usuario
   */
  private static async sendEmailIfNeeded(
    userId: string,
    type: NotificationType,
    content: { title: string; message: string }
  ) {
    try {
      // Obtener configuración de notificaciones del usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
        //   notificationSettings: true,
        },
      });

      if (!user) return;

      // Verificar si el usuario tiene habilitadas las notificaciones por email
    //   const settings = (user.notificationSettings as any) || {};
    //   const emailSettings = settings.email || {};

      let shouldSendEmail = false;

      switch (type) {
        case 'ORDER_UPDATE':
          shouldSendEmail = true;
          break;
        case 'PAYMENT_RECEIVED':
          shouldSendEmail = true;
          break;
        case 'WITHDRAWAL_COMPLETED':
          shouldSendEmail = true;
          break;
        case 'VERIFICATION_REQUIRED':
          shouldSendEmail = true;
          break;
        case 'SYSTEM_MAINTENANCE':
          shouldSendEmail = true;
          break;
      }

      if (shouldSendEmail) {
        await EmailService.sendEmail({
          to: user.email,
          subject: content.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${content.title}</h2>
              <p style="color: #666; line-height: 1.6;">${content.message}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                Este es un correo automático de Wiru. 
                Puedes cambiar tus preferencias de notificaciones en tu perfil.
              </p>
            </div>
          `,
        });
      }
    } catch (error) {
      // No lanzar error si falla el envío de email
      logger.error('Error sending notification email', { error, userId, type });
    }
  }

  /**
   * Helper: Obtener etiqueta legible del estado de orden
   */
  private static getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_TRANSIT: 'En tránsito',
      DELIVERED: 'Entregada',
      VERIFIED: 'Verificada',
      PAID: 'Pagada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }
}

export default NotificationService;