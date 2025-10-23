// src/routes/notification.routes.ts

import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import * as notificationController from '@/controllers/notification.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /notifications
 * Obtener notificaciones del usuario
 * Query params: status, type, dateFrom, dateTo, page, limit
 */
router.get('/', notificationController.getNotifications);

/**
 * GET /notifications/stats
 * Obtener estadísticas de notificaciones
 */
router.get('/stats', notificationController.getStats);

/**
 * GET /notifications/unread-count
 * Obtener contador de notificaciones no leídas
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * PUT /notifications/read-all
 * Marcar todas las notificaciones como leídas
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * PUT /notifications/:id/read
 * Marcar notificación específica como leída
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * PUT /notifications/:id/archive
 * Archivar notificación
 */
router.put('/:id/archive', notificationController.archive);

/**
 * DELETE /notifications/read
 * Eliminar todas las notificaciones leídas
 */
router.delete('/read', notificationController.deleteAllRead);

/**
 * DELETE /notifications/:id
 * Eliminar notificación específica
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * POST /notifications/test (solo desarrollo)
 * Crear notificación de prueba
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test', notificationController.createTestNotification);
}

export default router;