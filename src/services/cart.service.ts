// // src/services/cart.service.ts - SERVICIO DE CARRITO

// import prisma from '@/config/database';
// import { Prisma } from '@prisma/client';

// export interface AddToCartData {
//   categoryId: string;
//   categoryName: string;
//   categoryPath: string;
//   weight: number;
//   quantity: number;
//   pricePerKg: number;
//   estimatedValue: number;
//   images: string[];
//   notes?: string;
// }

// export class CartService {
//   /**
//    * Obtener o crear carrito del usuario
//    */
//   static async getOrCreateCart(userId: string) {
//     let cart = await prisma.cart.findUnique({
//       where: { userId },
//       include: {
//         items: {
//           include: {
//             category: {
//               select: {
//                 id: true,
//                 name: true,
//                 pricePerKg: true,
//                 images: true,
//                 thumbnailImage: true,
//               },
//             },
//           },
//           orderBy: { createdAt: 'desc' },
//         },
//       },
//     });

//     if (!cart) {
//       cart = await prisma.cart.create({
//         data: { userId },
//         include: {
//           items: {
//             include: {
//               category: {
//                 select: {
//                   id: true,
//                   name: true,
//                   pricePerKg: true,
//                   images: true,
//                   thumbnailImage: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//     }

//     return cart;
//   }

//   /**
//    * Agregar item al carrito
//    */
//   static async addItem(userId: string, itemData: AddToCartData) {
//     const cart = await this.getOrCreateCart(userId);

//     // Verificar si el item ya existe en el carrito
//     const existingItem = await prisma.cartItem.findFirst({
//       where: {
//         cartId: cart.id,
//         categoryId: itemData.categoryId,
//         weight: itemData.weight,
//       },
//     });

//     let cartItem;

//     if (existingItem) {
//       // Actualizar cantidad y valor
//       cartItem = await prisma.cartItem.update({
//         where: { id: existingItem.id },
//         data: {
//           quantity: existingItem.quantity + itemData.quantity,
//           estimatedValue: new Prisma.Decimal(
//             parseFloat(existingItem.estimatedValue.toString()) + itemData.estimatedValue
//           ),
//           images: [...existingItem.images, ...itemData.images],
//         },
//         include: {
//           category: true,
//         },
//       });
//     } else {
//       // Crear nuevo item
//       cartItem = await prisma.cartItem.create({
//         data: {
//           cartId: cart.id,
//           categoryId: itemData.categoryId,
//           categoryName: itemData.categoryName,
//           categoryPath: itemData.categoryPath,
//           weight: itemData.weight,
//           quantity: itemData.quantity,
//           pricePerKg: itemData.pricePerKg,
//           estimatedValue: itemData.estimatedValue,
//           images: itemData.images,
//           notes: itemData.notes,
//         },
//         include: {
//           category: true,
//         },
//       });
//     }

//     return cartItem;
//   }

//   /**
//    * Actualizar item del carrito
//    */
//   static async updateItem(
//     userId: string,
//     itemId: string,
//     updates: Partial<AddToCartData>
//   ) {
//     const cart = await this.getOrCreateCart(userId);

//     const item = await prisma.cartItem.findFirst({
//       where: {
//         id: itemId,
//         cartId: cart.id,
//       },
//     });

//     if (!item) {
//       throw new Error('Item no encontrado en el carrito');
//     }

//     const updatedItem = await prisma.cartItem.update({
//       where: { id: itemId },
//       data: updates,
//       include: {
//         category: true,
//       },
//     });

//     return updatedItem;
//   }

//   /**
//    * Eliminar item del carrito
//    */
//   static async removeItem(userId: string, itemId: string) {
//     const cart = await this.getOrCreateCart(userId);

//     const item = await prisma.cartItem.findFirst({
//       where: {
//         id: itemId,
//         cartId: cart.id,
//       },
//     });

//     if (!item) {
//       throw new Error('Item no encontrado en el carrito');
//     }

//     await prisma.cartItem.delete({
//       where: { id: itemId },
//     });

//     return { success: true };
//   }

//   /**
//    * Limpiar carrito completo
//    */
//   static async clearCart(userId: string) {
//     const cart = await this.getOrCreateCart(userId);

//     await prisma.cartItem.deleteMany({
//       where: { cartId: cart.id },
//     });

//     return { success: true };
//   }

//   /**
//    * Obtener resumen del carrito
//    */
//   static async getCartSummary(userId: string) {
//     const cart = await this.getOrCreateCart(userId);

//     const items = await prisma.cartItem.findMany({
//       where: { cartId: cart.id },
//     });

//     const totalItems = items.length;
//     const totalWeight = items.reduce(
//       (sum, item) => sum + parseFloat(item.weight.toString()) * item.quantity,
//       0
//     );
//     const totalValue = items.reduce(
//       (sum, item) => sum + parseFloat(item.estimatedValue.toString()),
//       0
//     );

//     return {
//       totalItems,
//       totalWeight,
//       totalValue,
//       items,
//     };
//   }
// }




// src/services/cart.service.ts - VERSIÓN MEJORADA

import prisma from '@/config/database';
import { Prisma } from '@prisma/client';

export interface AddToCartData {
  categoryId: string;
  categoryName: string;
  categoryPath: string;
  weight: number;
  quantity: number;
  pricePerKg: number;
  estimatedValue: number;
  images: string[];
  notes?: string;
}

export class CartService {
  /**
   * Obtener o crear carrito del usuario
   */
  static async getOrCreateCart(userId: string) {
    console.log('🛒 Getting or creating cart for user:', userId);

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                pricePerKg: true,
                images: true,
                thumbnailImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      console.log('📝 Creating new cart for user:', userId);
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  pricePerKg: true,
                  images: true,
                  thumbnailImage: true,
                },
              },
            },
          },
        },
      });
    }

    console.log('✅ Cart found/created:', {
      cartId: cart.id,
      itemsCount: cart.items.length,
    });

    return cart;
  }

  /**
   * Agregar item al carrito
   */
  static async addItem(userId: string, itemData: AddToCartData) {
    console.log('📦 Adding item to cart:', {
      userId,
      itemData,
    });

    // Validar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: itemData.categoryId },
    });

    if (!category) {
      throw new Error(`Categoría ${itemData.categoryId} no encontrada`);
    }

    const cart = await this.getOrCreateCart(userId);

    console.log('🔍 Checking for existing item in cart...');

    // Verificar si el item ya existe en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        categoryId: itemData.categoryId,
        weight: itemData.weight,
      },
    });

    let cartItem;

    if (existingItem) {
      console.log('📝 Updating existing cart item:', existingItem.id);

      // Actualizar cantidad y valor
      const newQuantity = existingItem.quantity + itemData.quantity;
      const newEstimatedValue = parseFloat(existingItem.estimatedValue.toString()) + itemData.estimatedValue;
      const newImages = [...existingItem.images, ...itemData.images];

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          estimatedValue: new Prisma.Decimal(newEstimatedValue),
          images: newImages,
          updatedAt: new Date(),
        },
        include: {
          category: true,
        },
      });

      console.log('✅ Cart item updated:', {
        itemId: cartItem.id,
        newQuantity,
        newEstimatedValue,
      });
    } else {
      console.log('📝 Creating new cart item...');

      // Crear nuevo item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          categoryId: itemData.categoryId,
          categoryName: itemData.categoryName,
          categoryPath: itemData.categoryPath,
          weight: new Prisma.Decimal(itemData.weight),
          quantity: itemData.quantity,
          pricePerKg: new Prisma.Decimal(itemData.pricePerKg),
          estimatedValue: new Prisma.Decimal(itemData.estimatedValue),
          images: itemData.images || [],
          notes: itemData.notes || null,
        },
        include: {
          category: true,
        },
      });

      console.log('✅ New cart item created:', {
        itemId: cartItem.id,
        categoryId: cartItem.categoryId,
        quantity: cartItem.quantity,
      });
    }

    return cartItem;
  }

  /**
   * Actualizar item del carrito
   */
  static async updateItem(
    userId: string,
    itemId: string,
    updates: Partial<AddToCartData>
  ) {
    console.log('📝 Updating cart item:', { userId, itemId, updates });

    const cart = await this.getOrCreateCart(userId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new Error('Item no encontrado en el carrito');
    }

    const updateData: any = {};

    if (updates.weight !== undefined) {
      updateData.weight = new Prisma.Decimal(updates.weight);
    }
    if (updates.quantity !== undefined) {
      updateData.quantity = updates.quantity;
    }
    if (updates.pricePerKg !== undefined) {
      updateData.pricePerKg = new Prisma.Decimal(updates.pricePerKg);
    }
    if (updates.estimatedValue !== undefined) {
      updateData.estimatedValue = new Prisma.Decimal(updates.estimatedValue);
    }
    if (updates.images !== undefined) {
      updateData.images = updates.images;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        category: true,
      },
    });

    console.log('✅ Cart item updated successfully');

    return updatedItem;
  }

  /**
   * Eliminar item del carrito
   */
  static async removeItem(userId: string, itemId: string) {
    console.log('🗑️ Removing cart item:', { userId, itemId });

    const cart = await this.getOrCreateCart(userId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new Error('Item no encontrado en el carrito');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    console.log('✅ Cart item removed successfully');

    return { success: true };
  }

  /**
   * Limpiar carrito completo
   */
  static async clearCart(userId: string) {
    console.log('🧹 Clearing cart for user:', userId);

    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log('✅ Cart cleared successfully');

    return { success: true };
  }

  /**
   * Obtener resumen del carrito
   */
  static async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const totalItems = items.length;
    const totalWeight = items.reduce(
      (sum, item) => sum + parseFloat(item.weight.toString()) * item.quantity,
      0
    );
    const totalValue = items.reduce(
      (sum, item) => sum + parseFloat(item.estimatedValue.toString()),
      0
    );

    return {
      totalItems,
      totalWeight,
      totalValue,
      items,
    };
  }
}