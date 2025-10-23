// src/listeners/notification.listener.ts

import eventEmitter, { AppEvents } from '@/services/eventEmitter.service';
import NotificationService from '@/services/notification.service';
import logger from '@/config/logger';
import type {
  OrderEventPayload,
  PaymentEventPayload,
  WithdrawalEventPayload,
  UserEventPayload,
  VerificationEventPayload,
  SystemEventPayload,
} from '@/services/eventEmitter.service';

/**
 * Listener que escucha eventos del sistema y crea notificaciones automáticamente
 * Este listener se inicializa una sola vez cuando arranca el servidor
 */

export class NotificationListener {
  /**
   * Inicializar todos los listeners
   */
  static initialize() {
    logger.info('🔔 Initializing notification listeners...');
    
    // Listeners de Órdenes
    this.listenToOrderEvents();
    
    // Listeners de Pagos
    this.listenToPaymentEvents();
    
    // Listeners de Retiros
    this.listenToWithdrawalEvents();
    
    // Listeners de Usuario
    this.listenToUserEvents();
    
    // Listeners de Verificación
    this.listenToVerificationEvents();
    
    // Listeners del Sistema
    this.listenToSystemEvents();
    
    logger.info('✅ Notification listeners initialized successfully');
  }

  /**
   * Listeners de eventos de órdenes
   */
  private static listenToOrderEvents() {
    // Orden creada
    eventEmitter.on(AppEvents.ORDER_CREATED, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.createOrderUpdateNotification(
          payload.userId,
          payload.orderNumber,
          payload.status,
          {
            orderId: payload.orderId,
            estimatedTotal: payload.estimatedTotal,
            ...payload.metadata,
          }
        );
        logger.info('✅ Notification created for ORDER_CREATED', { 
          orderId: payload.orderId 
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_CREATED', { 
          error, 
          payload 
        });
      }
    });

    // Estado de orden cambiado
    eventEmitter.on(AppEvents.ORDER_STATUS_CHANGED, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.createOrderUpdateNotification(
          payload.userId,
          payload.orderNumber,
          payload.status,
          {
            orderId: payload.orderId,
            previousStatus: payload.previousStatus,
            newStatus: payload.status,
            ...payload.metadata,
          }
        );
        logger.info('✅ Notification created for ORDER_STATUS_CHANGED', { 
          orderId: payload.orderId,
          status: payload.status 
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_STATUS_CHANGED', { 
          error, 
          payload 
        });
      }
    });

    // Orden confirmada
    eventEmitter.on(AppEvents.ORDER_CONFIRMED, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'ORDER_UPDATE',
          title: `✅ Orden ${payload.orderNumber} confirmada`,
          message: `Tu orden ha sido confirmada y será procesada pronto`,
          metadata: {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            status: 'CONFIRMED',
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_CONFIRMED', { error });
      }
    });

    // Orden en tránsito
    eventEmitter.on(AppEvents.ORDER_IN_TRANSIT, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'ORDER_UPDATE',
          title: `🚚 Orden ${payload.orderNumber} en camino`,
          message: `Tu orden está en tránsito y será entregada pronto`,
          metadata: {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            status: 'IN_TRANSIT',
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_IN_TRANSIT', { error });
      }
    });

    // Orden entregada
    eventEmitter.on(AppEvents.ORDER_DELIVERED, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'ORDER_UPDATE',
          title: `📦 Orden ${payload.orderNumber} entregada`,
          message: `Tu orden ha sido entregada y está siendo verificada`,
          metadata: {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            status: 'DELIVERED',
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_DELIVERED', { error });
      }
    });

    // Orden verificada
    eventEmitter.on(AppEvents.ORDER_VERIFIED, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'ORDER_UPDATE',
          title: `✅ Orden ${payload.orderNumber} verificada`,
          message: `Tu orden ha sido verificada. El pago será procesado pronto`,
          metadata: {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            status: 'VERIFIED',
            finalTotal: payload.finalTotal,
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_VERIFIED', { error });
      }
    });

    // Orden pagada
    eventEmitter.on(AppEvents.ORDER_PAID, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'PAYMENT_RECEIVED',
          title: `💰 Orden ${payload.orderNumber} pagada`,
          message: `Has recibido el pago de $${payload.finalTotal?.toFixed(2)} en tu billetera`,
          metadata: {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            status: 'PAID',
            amount: payload.finalTotal,
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_PAID', { error });
      }
    });

    // Orden cancelada
    eventEmitter.on(AppEvents.ORDER_CANCELLED, async (payload: OrderEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'ORDER_UPDATE',
          title: `❌ Orden ${payload.orderNumber} cancelada`,
          message: `Tu orden ha sido cancelada`,
          metadata: {
            orderId: payload.orderId,
            orderNumber: payload.orderNumber,
            status: 'CANCELLED',
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for ORDER_CANCELLED', { error });
      }
    });
  }

  /**
   * Listeners de eventos de pagos
   */
  private static listenToPaymentEvents() {
    eventEmitter.on(AppEvents.PAYMENT_RECEIVED, async (payload: PaymentEventPayload) => {
      try {
        await NotificationService.createPaymentReceivedNotification(
          payload.userId,
          payload.amount,
          payload.orderNumber || 'N/A',
          {
            transactionId: payload.transactionId,
            orderId: payload.orderId,
            ...payload.metadata,
          }
        );
        logger.info('✅ Notification created for PAYMENT_RECEIVED', { 
          userId: payload.userId,
          amount: payload.amount 
        });
      } catch (error) {
        logger.error('❌ Error creating notification for PAYMENT_RECEIVED', { error });
      }
    });
  }

  /**
   * Listeners de eventos de retiros
   */
  private static listenToWithdrawalEvents() {
    eventEmitter.on(AppEvents.WITHDRAWAL_COMPLETED, async (payload: WithdrawalEventPayload) => {
      try {
        await NotificationService.createWithdrawalCompletedNotification(
          payload.userId,
          payload.amount,
          payload.bankAccount,
          {
            withdrawalId: payload.withdrawalId,
            ...payload.metadata,
          }
        );
        logger.info('✅ Notification created for WITHDRAWAL_COMPLETED', { 
          withdrawalId: payload.withdrawalId 
        });
      } catch (error) {
        logger.error('❌ Error creating notification for WITHDRAWAL_COMPLETED', { error });
      }
    });

    eventEmitter.on(AppEvents.WITHDRAWAL_FAILED, async (payload: WithdrawalEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'WITHDRAWAL_COMPLETED', // Usar el mismo tipo pero con mensaje de error
          title: '❌ Retiro fallido',
          message: `Tu retiro de $${payload.amount.toFixed(2)} no pudo ser procesado`,
          metadata: {
            withdrawalId: payload.withdrawalId,
            status: 'FAILED',
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for WITHDRAWAL_FAILED', { error });
      }
    });
  }

  /**
   * Listeners de eventos de usuario
   */
  private static listenToUserEvents() {
    eventEmitter.on(AppEvents.USER_REGISTERED, async (payload: UserEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'VERIFICATION_REQUIRED',
          title: '👋 ¡Bienvenido a Wiru!',
          message: `Hola ${payload.firstName}, verifica tu email para comenzar a vender`,
          metadata: {
            email: payload.email,
            ...payload.metadata,
          },
        });
      } catch (error) {
        logger.error('❌ Error creating notification for USER_REGISTERED', { error });
      }
    });

    eventEmitter.on(AppEvents.USER_EMAIL_VERIFIED, async (payload: UserEventPayload) => {
      try {
        await NotificationService.create({
          userId: payload.userId,
          type: 'VERIFICATION_REQUIRED',
          title: '✅ Email verificado',
          message: `Tu email ha sido verificado exitosamente. Ya puedes comenzar a vender`,
          metadata: payload.metadata,
        });
      } catch (error) {
        logger.error('❌ Error creating notification for USER_EMAIL_VERIFIED', { error });
      }
    });
  }

  /**
   * Listeners de eventos de verificación
   */
  private static listenToVerificationEvents() {
    eventEmitter.on(AppEvents.VERIFICATION_REQUIRED, async (payload: VerificationEventPayload) => {
      try {
        await NotificationService.createVerificationRequiredNotification(
          payload.userId,
          payload.verificationType,
          payload.metadata
        );
      } catch (error) {
        logger.error('❌ Error creating notification for VERIFICATION_REQUIRED', { error });
      }
    });
  }

  /**
   * Listeners de eventos del sistema
   */
  private static listenToSystemEvents() {
    eventEmitter.on(AppEvents.SYSTEM_MAINTENANCE, async (payload: SystemEventPayload) => {
      try {
        // Si no hay usuarios específicos, notificar a todos los activos
        if (!payload.affectedUsers || payload.affectedUsers.length === 0) {
          // Esta sería una función especial para notificar a todos
          // Por ahora solo log
          logger.warn('System maintenance notification (all users)', { 
            message: payload.message 
          });
          return;
        }

        // Notificar usuarios específicos
        for (const userId of payload.affectedUsers) {
          await NotificationService.create({
            userId,
            type: 'SYSTEM_MAINTENANCE',
            title: '🔧 Mantenimiento programado',
            message: payload.message,
            metadata: {
              severity: payload.severity,
              ...payload.metadata,
            },
          });
        }
      } catch (error) {
        logger.error('❌ Error creating notification for SYSTEM_MAINTENANCE', { error });
      }
    });
  }
}

export default NotificationListener;