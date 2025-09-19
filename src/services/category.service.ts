// src/services/category.service.ts

import prisma from '@/config/database';
import { Category } from '@prisma/client';

interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
  breadcrumb?: Array<{ id: string; name: string; slug: string }>;
}

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  type: 'COMPLETE_DEVICES' | 'DISMANTLED_DEVICES';
  parentId?: string;
  isLeaf?: boolean;
  pricePerKg?: number;
  icon?: string;
  color?: string;
  images?: string[];
  thumbnailImage?: string;
  metadata?: any;
  createdBy?: string;
}

interface SearchOptions {
  type?: string;
  leafOnly?: boolean;
}

interface CategoryOptions {
  includeChildren?: boolean;
  includeBreadcrumb?: boolean;
}

export class CategoryService {
  /**
   * Obtener árbol completo de categorías
   */
  static async getCategoryTree(type?: string): Promise<CategoryTreeNode[]> {
    const whereCondition: any = {
      status: 'ACTIVE',
      parentId: null // Solo categorías raíz
    };

    if (type) {
      whereCondition.type = type;
    }

    const rootCategories = await prisma.category.findMany({
      where: whereCondition,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: { status: 'ACTIVE' },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        }
      }
    });

    // Construir árbol recursivamente
    const buildTree = async (categories: any[]): Promise<CategoryTreeNode[]> => {
      const tree: CategoryTreeNode[] = [];

      for (const category of categories) {
        const node: CategoryTreeNode = { ...category, children: [] };

        if (category.children && category.children.length > 0) {
          // Obtener hijos con sus propios hijos
          const childrenWithGrandchildren = await prisma.category.findMany({
            where: {
              parentId: category.id,
              status: 'ACTIVE'
            },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
              children: {
                where: { status: 'ACTIVE' },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
              }
            }
          });

          node.children = await buildTree(childrenWithGrandchildren);
        }

        tree.push(node);
      }

      return tree;
    };

    return buildTree(rootCategories);
  }

  /**
   * Obtener hijos directos de una categoría
   */
  static async getCategoryChildren(categoryId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        parentId: categoryId,
        status: 'ACTIVE'
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
  }

  /**
   * Obtener breadcrumb de una categoría
   */
  static async getCategoryBreadcrumb(categoryId: string): Promise<Array<{ id: string; name: string; slug: string }>> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true, path: true }
    });

    if (!category || !category.path) {
      return [];
    }

    // Obtener todas las categorías en el path
    const categories = await prisma.category.findMany({
      where: {
        slug: { in: category.path }
      },
      select: { id: true, name: true, slug: true },
      orderBy: { level: 'asc' }
    });

    // Ordenar según el path
    const orderedBreadcrumb = category.path.map(slug => 
      categories.find(cat => cat.slug === slug)
    ).filter(Boolean) as Array<{ id: string; name: string; slug: string }>;

    return orderedBreadcrumb;
  }

  /**
   * Obtener categorías raíz
   */
  static async getRootCategories(type?: string): Promise<Category[]> {
    const whereCondition: any = {
      status: 'ACTIVE',
      parentId: null
    };

    if (type) {
      whereCondition.type = type;
    }

    return prisma.category.findMany({
      where: whereCondition,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
  }

  /**
   * Obtener solo categorías finales (seleccionables)
   */
  static async getLeafCategories(type?: string): Promise<Category[]> {
    const whereCondition: any = {
      status: 'ACTIVE',
      isLeaf: true
    };

    if (type) {
      whereCondition.type = type;
    }

    return prisma.category.findMany({
      where: whereCondition,
      orderBy: [{ fullPath: 'asc' }, { name: 'asc' }]
    });
  }

  /**
   * Obtener categoría por ID con opciones
   */
  static async getCategoryById(categoryId: string, options: CategoryOptions = {}): Promise<CategoryTreeNode | null> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: options.includeChildren ? {
          where: { status: 'ACTIVE' },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        } : false
      }
    });

    if (!category) return null;

    const result: CategoryTreeNode = { ...category };

    if (options.includeBreadcrumb) {
      result.breadcrumb = await this.getCategoryBreadcrumb(categoryId);
    }

    return result;
  }

  /**
   * Buscar categorías por nombre
   */
  static async searchCategories(query: string, options: SearchOptions = {}): Promise<Category[]> {
    const whereCondition: any = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query.toLowerCase() } }
      ]
    };

    if (options.type) {
      whereCondition.type = options.type;
    }

    if (options.leafOnly) {
      whereCondition.isLeaf = true;
    }

    return prisma.category.findMany({
      where: whereCondition,
      orderBy: [
        { level: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      take: 50 // Límite de resultados
    });
  }

  /**
   * Crear nueva categoría
   */
  static async createCategory(data: CreateCategoryData): Promise<Category> {
    // Generar slug si no se proporciona
    if (!data.slug) {
      data.slug = data.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    // Calcular level y path si tiene padre
    let level = 0;
    let path: string[] = [data.slug];
    let fullPath = data.slug;

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { level: true, path: true, fullPath: true }
      });

      if (parent) {
        level = parent.level + 1;
        path = [...parent.path, data.slug];
        fullPath = `${parent.fullPath}/${data.slug}`;
      }
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        parentId: data.parentId,
        level,
        path,
        fullPath,
        isLeaf: data.isLeaf || false,
        pricePerKg: data.pricePerKg,
        icon: data.icon,
        color: data.color,
        images: data.images || [],
        thumbnailImage: data.thumbnailImage,
        metadata: data.metadata || {},
        createdBy: data.createdBy
      }
    });
  }

  /**
   * Actualizar categoría
   */
  static async updateCategory(categoryId: string, data: Partial<CreateCategoryData>): Promise<Category | null> {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) return null;

    // Si se cambia el slug, recalcular paths
    let updateData: any = { ...data };

    if (data.slug && data.slug !== existingCategory.slug) {
      const newPath = [...existingCategory.path.slice(0, -1), data.slug];
      const newFullPath = newPath.join('/');
      
      updateData.path = newPath;
      updateData.fullPath = newFullPath;
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });
  }

  /**
   * Eliminar categoría (soft delete)
   */
  static async deleteCategory(categoryId: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { children: true }
    });

    if (!category) return null;

    // No permitir eliminar si tiene hijos activos
    if (category.children.some(child => child.status === 'ACTIVE')) {
      throw new Error('No se puede eliminar una categoría que tiene subcategorías activas');
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: { status: 'INACTIVE' }
    });
  }

  /**
   * Reordenar categorías hermanas
   */
  static async reorderCategories(parentId: string | null, newOrder: string[]): Promise<void> {
    const transaction = newOrder.map((categoryId, index) =>
      prisma.category.update({
        where: { id: categoryId },
        data: { sortOrder: index }
      })
    );

    await prisma.$transaction(transaction);
  }

  /**
   * Obtener estadísticas de uso de una categoría
   */
  static async getCategoryStats(categoryId: string): Promise<any> {
    const [category, orderItemsCount, totalValue] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.orderItem.count({ where: { categoryId } }),
      prisma.orderItem.aggregate({
        where: { categoryId },
        _sum: { actualValue: true, estimatedValue: true },
        _avg: { actualValue: true, estimatedValue: true }
      })
    ]);

    return {
      category,
      usage: {
        totalOrders: orderItemsCount,
        totalActualValue: totalValue._sum.actualValue || 0,
        totalEstimatedValue: totalValue._sum.estimatedValue || 0,
        avgActualValue: totalValue._avg.actualValue || 0,
        avgEstimatedValue: totalValue._avg.estimatedValue || 0
      }
    };
  }

  /**
   * Validar si una categoría puede ser seleccionada
   */
  static async validateCategorySelection(categoryId: string): Promise<{ valid: boolean; message?: string }> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return { valid: false, message: 'Categoría no encontrada' };
    }

    if (category.status !== 'ACTIVE') {
      return { valid: false, message: 'Categoría no está activa' };
    }

    if (!category.isLeaf) {
      return { valid: false, message: 'Debe seleccionar una subcategoría específica' };
    }

    return { valid: true };
  }

  /**
   * Obtener categorías con imágenes de referencia
   */
  static async getCategoriesWithImages(type?: string): Promise<Category[]> {
    const whereCondition: any = {
      status: 'ACTIVE',
      isLeaf: true,
      images: { isEmpty: false }
    };

    if (type) {
      whereCondition.type = type;
    }

    return prisma.category.findMany({
      where: whereCondition,
      orderBy: [{ fullPath: 'asc' }, { name: 'asc' }]
    });
  }
}