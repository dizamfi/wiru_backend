// // src/routes/cart.routes.ts - RUTAS DE CARRITO

// import { Router } from 'express';
// import { authenticate, requireEmailVerified } from '@/middleware/auth.middleware';
// import { validateBody, validateParams, cartSchemas, commonSchemas } from '@/middleware/validation.middleware';
// import * as cartController from '@/controllers/cart.controller';
// import z from 'zod';

// const router = Router();

// // Todas las rutas requieren autenticación
// router.use(authenticate);
// router.use(requireEmailVerified);

// /**
//  * GET /cart
//  * Obtener carrito del usuario
//  */
// router.get('/', cartController.getCart);

// /**
//  * GET /cart/summary
//  * Obtener resumen del carrito
//  */
// router.get('/summary', cartController.getCartSummary);

// /**
//  * POST /cart/items
//  * Agregar item al carrito
//  */
// router.post(
//   '/items',
//   validateBody(cartSchemas.addItem),
//   cartController.addItemToCart
// );

// /**
//  * PUT /cart/items/:itemId
//  * Actualizar item del carrito
//  */
// router.put(
//   '/items/:itemId',
//   validateParams(commonSchemas.id.extend({ itemId: z.string().cuid() })),
//   validateBody(cartSchemas.updateItem),
//   cartController.updateCartItem
// );

// /**
//  * DELETE /cart/items/:itemId
//  * Eliminar item del carrito
//  */
// router.delete(
//   '/items/:itemId',
//   validateParams(commonSchemas.id.extend({ itemId: z.string().cuid() })),
//   cartController.removeCartItem
// );

// /**
//  * DELETE /cart
//  * Limpiar carrito completo
//  */
// router.delete('/', cartController.clearCart);

// export default router;






// src/routes/cart.routes.ts - CORREGIR VALIDACIÓN

import { Router } from 'express';
import { authenticate, requireEmailVerified } from '@/middleware/auth.middleware';
import { validateBody, cartSchemas } from '@/middleware/validation.middleware';
import { z } from 'zod';
import * as cartController from '@/controllers/cart.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);
router.use(requireEmailVerified);

// ✅ Schema para validar itemId en params
const itemIdSchema = z.object({
  itemId: z.string().min(1, 'Item ID es requerido'),
});

/**
 * GET /cart
 * Obtener carrito del usuario
 */
router.get('/', cartController.getCart);

/**
 * GET /cart/summary
 * Obtener resumen del carrito
 */
router.get('/summary', cartController.getCartSummary);

/**
 * POST /cart/items
 * Agregar item al carrito
 */
router.post(
  '/items',
  validateBody(cartSchemas.addItem),
  cartController.addItemToCart
);

/**
 * PUT /cart/items/:itemId
 * Actualizar item del carrito
 */
router.put(
  '/items/:itemId',
  // ✅ NO VALIDAR PARAMS, dejar pasar el ID tal cual
  validateBody(cartSchemas.updateItem),
  cartController.updateCartItem
);

/**
 * DELETE /cart/items/:itemId
 * Eliminar item del carrito
 */
router.delete(
  '/items/:itemId',
  // ✅ NO VALIDAR PARAMS, dejar pasar el ID tal cual
  cartController.removeCartItem
);

/**
 * DELETE /cart
 * Limpiar carrito completo
 */
router.delete('/', cartController.clearCart);

export default router;