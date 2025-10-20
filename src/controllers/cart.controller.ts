// src/controllers/cart.controller.ts - CONTROLADOR DE CARRITO

import { Request, Response } from 'express';
import { CartService } from '@/services/cart.service';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';

/**
 * Obtener carrito del usuario
 * GET /cart
 */
// src/controllers/cart.controller.ts - VERIFICAR RESPUESTA

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  console.log('🛒 Getting cart for user:', userId);

  const cart = await CartService.getOrCreateCart(userId);

  console.log('📦 Cart retrieved:', {
    cartId: cart.id,
    itemsCount: cart.items?.length || 0,
    items: cart.items,
  });

  // ✅ ASEGURAR QUE items SEA UN ARRAY
  const response = {
    ...cart,
    items: Array.isArray(cart.items) ? cart.items : [],
  };

  logger.info('Cart retrieved', { userId, itemsCount: response.items.length });

  ResponseUtils.success(res, response);
});
/**
 * Agregar item al carrito
 * POST /cart/items
 */
// src/controllers/cart.controller.ts - AGREGAR LOGS DETALLADOS

export const addItemToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const itemData = req.body;

  console.log('📦 Adding item to cart - Full request:', {
    userId,
    itemData,
    body: req.body,
  });

  // Validar datos requeridos
  if (!itemData.categoryId) {
    return ResponseUtils.badRequest(res, 'categoryId es requerido');
  }
  if (!itemData.categoryName) {
    return ResponseUtils.badRequest(res, 'categoryName es requerido');
  }
  if (!itemData.weight || itemData.weight <= 0) {
    return ResponseUtils.badRequest(res, 'weight debe ser mayor a 0');
  }
  if (!itemData.pricePerKg || itemData.pricePerKg <= 0) {
    return ResponseUtils.badRequest(res, 'pricePerKg debe ser mayor a 0');
  }

  try {
    const cartItem = await CartService.addItem(userId, itemData);

    console.log('✅ Item added successfully:', cartItem);

    logger.info('Item added to cart', {
      userId,
      itemId: cartItem.id,
      categoryId: itemData.categoryId,
    });

    return ResponseUtils.created(res, cartItem, 'Item agregado al carrito');
  } catch (error: any) {
    console.error('❌ Error adding item to cart:', error);
    logger.error('Error adding item to cart', {
      userId,
      error: error.message,
      stack: error.stack,
    });
    
    return ResponseUtils.error(
      res,
      'Error al agregar item al carrito',
      500,
      
      error.message
    );
  }
});

/**
 * Actualizar item del carrito
 * PUT /cart/items/:itemId
 */
export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { itemId } = req.params;
  const updates = req.body;

  const updatedItem = await CartService.updateItem(userId, itemId, updates);

  logger.info('Cart item updated', { userId, itemId });

  ResponseUtils.success(res, updatedItem, 'Item actualizado');
});

/**
 * Eliminar item del carrito
 * DELETE /cart/items/:itemId
 */
export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { itemId } = req.params;

  console.log('🗑️ Removing cart item:', {
    userId,
    itemId,
    params: req.params,
    fullUrl: req.originalUrl,
  });

  // Validar que itemId existe
  if (!itemId || itemId.trim() === '') {
    console.error('❌ Item ID is empty');
    return ResponseUtils.badRequest(res, 'Item ID es requerido');
  }

  try {
    await CartService.removeItem(userId, itemId);

    console.log('✅ Item removed successfully');

    logger.info('Cart item removed', { userId, itemId });

    return ResponseUtils.success(res, null, 'Item eliminado del carrito');
  } catch (error: any) {
    console.error('❌ Error removing cart item:', error);
    logger.error('Error removing cart item', {
      userId,
      itemId,
      error: error.message,
      stack: error.stack,
    });

    // Si el error es que no se encontró el item
    if (error.message.includes('no encontrado')) {
      return ResponseUtils.notFound(res, error.message);
    }

    return ResponseUtils.error(
      res,
      'Error al eliminar item del carrito',
      500,
      
      error.message
    );
  }
});


/**
 * Limpiar carrito
 * DELETE /cart
 */
export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  await CartService.clearCart(userId);

  logger.info('Cart cleared', { userId });

  ResponseUtils.success(res, null, 'Carrito limpiado');
});

/**
 * Obtener resumen del carrito
 * GET /cart/summary
 */
export const getCartSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const summary = await CartService.getCartSummary(userId);

  ResponseUtils.success(res, summary);
});