// src/services/eventEmitter.service.ts

import { EventEmitter } from 'events';
import logger from '@/config/logger';

/**
 * Sistema centralizado de eventos para toda la aplicación
 * Permite desacoplar la lógica de negocio de las notificaciones
 */

// Tipos de eventos del sistema
export enum AppEvents {
  // Eventos de Órdenes
  ORDER_CREATED = 'order.created',
  ORDER_STATUS_CHANGED = 'order.status.changed',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_IN_TRANSIT = 'order.in_transit',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_VERIFIED = 'order.verified',
  ORDER_PAID = 'order.paid',
  ORDER_CANCELLED = 'order.cancelled',
  
  // Eventos de Pagos
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_PROCESSING = 'payment.processing',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  
  // Eventos de Retiros
  WITHDRAWAL_REQUESTED = 'withdrawal.requested',
  WITHDRAWAL_PROCESSING = 'withdrawal.processing',
  WITHDRAWAL_COMPLETED = 'withdrawal.completed',
  WITHDRAWAL_FAILED = 'withdrawal.failed',
  
  // Eventos de Usuario
  USER_REGISTERED = 'user.registered',
  USER_EMAIL_VERIFIED = 'user.email.verified',
  USER_PROFILE_UPDATED = 'user.profile.updated',
  
  // Eventos de Verificación
  VERIFICATION_REQUIRED = 'verification.required',
  VERIFICATION_COMPLETED = 'verification.completed',
  
  // Eventos del Sistema
  SYSTEM_MAINTENANCE = 'system.maintenance',
  SYSTEM_ERROR = 'system.error',
}

// Interfaces para los payloads de eventos
export interface OrderEventPayload {
  orderId: string;
  userId: string;
  orderNumber: string;
  status: string;
  previousStatus?: string;
  estimatedTotal?: number;
  finalTotal?: number;
  metadata?: any;
}

export interface PaymentEventPayload {
  userId: string;
  amount: number;
  orderId?: string;
  orderNumber?: string;
  transactionId: string;
  metadata?: any;
}

export interface WithdrawalEventPayload {
  userId: string;
  withdrawalId: string;
  amount: number;
  bankAccount: string;
  status: string;
  metadata?: any;
}

export interface UserEventPayload {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  metadata?: any;
}

export interface VerificationEventPayload {
  userId: string;
  verificationType: string;
  metadata?: any;
}

export interface SystemEventPayload {
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers?: string[];
  metadata?: any;
}

class EventEmitterService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Aumentar límite para producción
    
    // Log de eventos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.onAny((event, data) => {
        logger.debug(`Event emitted: ${event}`, { data });
      });
    }
  }

  /**
   * Escuchar cualquier evento (útil para debugging)
   */
  onAny(callback: (event: string, data: any) => void) {
    const events = Object.values(AppEvents);
    events.forEach(event => {
      this.on(event, (data) => callback(event, data));
    });
  }

  /**
   * Emitir evento de orden creada
   */
  emitOrderCreated(payload: OrderEventPayload) {
    logger.info('Event: Order created', { orderId: payload.orderId });
    this.emit(AppEvents.ORDER_CREATED, payload);
  }

  /**
   * Emitir evento de cambio de estado de orden
   */
  emitOrderStatusChanged(payload: OrderEventPayload) {
    logger.info('Event: Order status changed', { 
      orderId: payload.orderId, 
      status: payload.status 
    });
    this.emit(AppEvents.ORDER_STATUS_CHANGED, payload);
    
    // También emitir evento específico del estado
    const statusEventMap: Record<string, AppEvents> = {
      CONFIRMED: AppEvents.ORDER_CONFIRMED,
      IN_TRANSIT: AppEvents.ORDER_IN_TRANSIT,
      DELIVERED: AppEvents.ORDER_DELIVERED,
      VERIFIED: AppEvents.ORDER_VERIFIED,
      PAID: AppEvents.ORDER_PAID,
      CANCELLED: AppEvents.ORDER_CANCELLED,
    };
    
    const specificEvent = statusEventMap[payload.status];
    if (specificEvent) {
      this.emit(specificEvent, payload);
    }
  }

  /**
   * Emitir evento de pago recibido
   */
  emitPaymentReceived(payload: PaymentEventPayload) {
    logger.info('Event: Payment received', { 
      userId: payload.userId, 
      amount: payload.amount 
    });
    this.emit(AppEvents.PAYMENT_RECEIVED, payload);
  }

  /**
   * Emitir evento de retiro completado
   */
  emitWithdrawalCompleted(payload: WithdrawalEventPayload) {
    logger.info('Event: Withdrawal completed', { 
      withdrawalId: payload.withdrawalId 
    });
    this.emit(AppEvents.WITHDRAWAL_COMPLETED, payload);
  }

  /**
   * Emitir evento de usuario registrado
   */
  emitUserRegistered(payload: UserEventPayload) {
    logger.info('Event: User registered', { userId: payload.userId });
    this.emit(AppEvents.USER_REGISTERED, payload);
  }

  /**
   * Emitir evento de verificación requerida
   */
  emitVerificationRequired(payload: VerificationEventPayload) {
    logger.info('Event: Verification required', { 
      userId: payload.userId,
      type: payload.verificationType 
    });
    this.emit(AppEvents.VERIFICATION_REQUIRED, payload);
  }

  /**
   * Emitir evento de mantenimiento del sistema
   */
  emitSystemMaintenance(payload: SystemEventPayload) {
    logger.warn('Event: System maintenance', { message: payload.message });
    this.emit(AppEvents.SYSTEM_MAINTENANCE, payload);
  }
}

// Singleton: Una sola instancia para toda la aplicación
export const eventEmitter = new EventEmitterService();

export default eventEmitter;