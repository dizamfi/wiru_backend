import { Router } from 'express';

// Importar middleware
import { 
  validateBody, 
  validateParams, 
  validateQuery, 
  orderSchemas,
  commonSchemas 
} from '@/middleware/validation.middleware';
import { 
  authenticate, 
  requireAdmin,
  requireEmailVerified 
} from '@/middleware/auth.middleware';
import { generalRateLimit } from '@/middleware/rateLimit.middleware';

// Importar controladores REALES
import * as orderController from '@/controllers/order.controller';
import { updateOrderStatus } from '../controllers/order.controller';

const router = Router();

// Aplicar autenticación a todas las rutas de órdenes
router.use(authenticate);
router.use(requireEmailVerified); // Requerir email verificado para órdenes

// === RUTAS DE USUARIO ===

/**
 * POST /orders
 * Crear nueva orden
 */
router.post(
  '/',
  validateBody(orderSchemas.createOrder),
  orderController.createOrder
);

/**
 * GET /orders
 * Obtener órdenes del usuario autenticado
 */
router.get(
  '/',
  validateQuery(commonSchemas.pagination),
  orderController.getUserOrders
);

/**
 * GET /orders/:id
 * Obtener orden específica por ID
 */
router.get(
  '/:id',
  validateParams(commonSchemas.id),
  orderController.getOrderById
);

/**
 * PUT /orders/:id/cancel
 * Cancelar orden propia
 */
router.put(
  '/:id/cancel',
  validateParams(commonSchemas.id),
  orderController.cancelOrder
);

// === RUTAS ADMINISTRATIVAS ===

/**
 * GET /orders/admin/all
 * Obtener todas las órdenes (solo admins)
 */
router.get(
  '/admin/all',
  requireAdmin,
  validateQuery(commonSchemas.pagination),
  orderController.getAllOrders
);

/**
 * GET /orders/admin/stats
 * Obtener estadísticas de órdenes (solo admins)
 */
router.get(
  '/admin/stats',
  requireAdmin,
  orderController.getOrderStats
);

/**
 * PUT /orders/:id/status
 * Actualizar estado de orden (solo admins)
 */
router.put(
  '/:id/status',
  requireAdmin,
  validateParams(commonSchemas.id),
  validateBody(orderSchemas.updateStatus),
  orderController.updateOrderStatus
);

export default router;