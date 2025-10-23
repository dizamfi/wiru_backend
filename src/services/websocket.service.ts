import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '@/config/env';
import logger from '@/config/logger';
import { JwtUtils } from '@/utils/jwt.utils';
import eventEmitter, { AppEvents } from './eventEmitter.service';

/**
 * Servicio de WebSockets para notificaciones en tiempo real
 * Permite enviar notificaciones instantáneas a los usuarios conectados
 */

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  /**
   * Inicializar servidor de WebSockets
   */
  initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
        credentials: true,
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
    this.setupEventListeners();

    logger.info('✅ WebSocket server initialized');
  }

  /**
   * Middleware de autenticación
   */
  private setupMiddleware() {
    this.io?.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Verificar token
        const decoded = JwtUtils.verifyAccessToken(token);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;

        logger.debug('Socket authenticated', { 
          socketId: socket.id, 
          userId: socket.userId 
        });

        next();
      } catch (error) {
        logger.error('Socket authentication error', { error });
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * Configurar handlers de conexión
   */
  private setupConnectionHandlers() {
    this.io?.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      
      logger.info('✅ User connected via WebSocket', { 
        socketId: socket.id, 
        userId 
      });

      // Agregar socket al mapa de usuarios conectados
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)?.add(socket.id);

      // Unir a room personal del usuario
      socket.join(`user:${userId}`);

      // Enviar evento de bienvenida
      socket.emit('connected', {
        message: 'Connected to notification service',
        userId,
        timestamp: new Date().toISOString(),
      });

      // Handler de desconexión
      socket.on('disconnect', () => {
        logger.info('User disconnected from WebSocket', { 
          socketId: socket.id, 
          userId 
        });

        // Remover socket del mapa
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }
      });

      // Handler para marcar notificación como leída (opcional)
      socket.on('notification:read', async (data: { notificationId: string }) => {
        logger.debug('Notification marked as read via WebSocket', { 
          notificationId: data.notificationId, 
          userId 
        });
        
        // Aquí podrías llamar al servicio para marcar como leída
        // await NotificationService.markAsRead(data.notificationId, userId);
      });

      // Handler para obtener contador de no leídas
      socket.on('notification:get-unread-count', async () => {
        try {
          const count = await this.getUnreadCount(userId);
          socket.emit('notification:unread-count', { count });
        } catch (error) {
          logger.error('Error getting unread count via WebSocket', { error });
        }
      });
    });
  }

  /**
   * Configurar listeners de eventos del sistema
   * Escucha eventos y envía notificaciones en tiempo real
   */
  private setupEventListeners() {
    // Escuchar TODOS los eventos de órdenes
    const orderEvents = [
      AppEvents.ORDER_CREATED,
      AppEvents.ORDER_STATUS_CHANGED,
      AppEvents.ORDER_CONFIRMED,
      AppEvents.ORDER_IN_TRANSIT,
      AppEvents.ORDER_DELIVERED,
      AppEvents.ORDER_VERIFIED,
      AppEvents.ORDER_PAID,
      AppEvents.ORDER_CANCELLED,
    ];

    orderEvents.forEach(event => {
      eventEmitter.on(event, (payload: any) => {
        this.sendNotificationToUser(payload.userId, {
          type: 'order_update',
          event,
          data: payload,
          timestamp: new Date().toISOString(),
        });
      });
    });

    // Escuchar eventos de pagos
    eventEmitter.on(AppEvents.PAYMENT_RECEIVED, (payload: any) => {
      this.sendNotificationToUser(payload.userId, {
        type: 'payment_received',
        event: AppEvents.PAYMENT_RECEIVED,
        data: payload,
        timestamp: new Date().toISOString(),
      });
    });

    // Escuchar eventos de retiros
    eventEmitter.on(AppEvents.WITHDRAWAL_COMPLETED, (payload: any) => {
      this.sendNotificationToUser(payload.userId, {
        type: 'withdrawal_completed',
        event: AppEvents.WITHDRAWAL_COMPLETED,
        data: payload,
        timestamp: new Date().toISOString(),
      });
    });

    // Escuchar eventos de verificación
    eventEmitter.on(AppEvents.VERIFICATION_REQUIRED, (payload: any) => {
      this.sendNotificationToUser(payload.userId, {
        type: 'verification_required',
        event: AppEvents.VERIFICATION_REQUIRED,
        data: payload,
        timestamp: new Date().toISOString(),
      });
    });

    logger.info('✅ WebSocket event listeners configured');
  }

  /**
   * Enviar notificación a un usuario específico
   */
  sendNotificationToUser(userId: string, notification: any) {
    if (!this.io) {
      logger.warn('WebSocket server not initialized');
      return;
    }

    // Enviar a todos los sockets del usuario (múltiples dispositivos/pestañas)
    this.io.to(`user:${userId}`).emit('notification', notification);

    logger.debug('Notification sent via WebSocket', { 
      userId, 
      type: notification.type 
    });
  }

  /**
   * Enviar notificación a múltiples usuarios
   */
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Broadcast a todos los usuarios conectados
   */
  broadcast(notification: any) {
    if (!this.io) {
      logger.warn('WebSocket server not initialized');
      return;
    }

    this.io.emit('notification', notification);
    logger.info('Notification broadcasted to all users', { 
      type: notification.type 
    });
  }

  /**
   * Obtener número de usuarios conectados
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Verificar si un usuario está conectado
   */
  isUserConnected(userId: string): boolean {
    const sockets = this.connectedUsers.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  /**
   * Obtener estadísticas de conexiones
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalSockets: Array.from(this.connectedUsers.values())
        .reduce((sum, sockets) => sum + sockets.size, 0),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper: Obtener contador de no leídas
   */
  private async getUnreadCount(userId: string): Promise<number> {
    try {
      const prisma = (await import('@/config/database')).default;
      return await prisma.notification.count({
        where: {
          userId,
          status: 'UNREAD',
        },
      });
    } catch (error) {
      logger.error('Error getting unread count', { error });
      return 0;
    }
  }
}

// Singleton
export const webSocketService = new WebSocketService();
export default webSocketService;