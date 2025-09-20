// src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env';
import logger from '@/config/logger';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryImageSizes {
  original: string;      // Imagen original
  large: string;         // 800x600 para vista detalle
  medium: string;        // 400x300 para listados
  thumbnail: string;     // 200x200 para thumbnails
  icon: string;          // 64x64 para iconos
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  sizes: CloudinaryImageSizes;
}

export class CloudinaryService {
  
  /**
   * Subir imagen de categoría con múltiples tamaños optimizados
   */
  static async uploadCategoryImage(
    imageBuffer: Buffer,
    categorySlug: string,
    filename: string
  ): Promise<UploadResult> {
    try {
      // Subir imagen original
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        {
          folder: `wiru/categories/${categorySlug}`,
          public_id: `${categorySlug}-${filename}`,
          format: 'webp', // Convertir a WebP para mejor compresión
          quality: 'auto:good',
          fetch_format: 'auto',
          flags: 'progressive',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        }
      );

      // Generar URLs optimizadas para diferentes tamaños
      const baseUrl = uploadResult.secure_url.replace('/upload/', '/upload/');
      const publicId = uploadResult.public_id;

      const sizes: CloudinaryImageSizes = {
        // Imagen original optimizada
        original: cloudinary.url(publicId, {
          quality: 'auto:good',
          fetch_format: 'auto',
          flags: 'progressive'
        }),

        // Grande - Para vista de detalle (800x600)
        large: cloudinary.url(publicId, {
          width: 800,
          height: 600,
          crop: 'fit',
          quality: 'auto:good',
          fetch_format: 'auto',
          flags: 'progressive'
        }),

        // Mediano - Para listados (400x300)
        medium: cloudinary.url(publicId, {
          width: 400,
          height: 300,
          crop: 'fit',
          quality: 'auto:best',
          fetch_format: 'auto',
          flags: 'progressive'
        }),

        // Thumbnail - Para previews (200x200)
        thumbnail: cloudinary.url(publicId, {
          width: 200,
          height: 200,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto:best',
          fetch_format: 'auto',
          flags: 'progressive'
        }),

        // Icono - Para menús y navegación (64x64)
        icon: cloudinary.url(publicId, {
          width: 64,
          height: 64,
          crop: 'fill',
          gravity: 'center',
          quality: 'auto:best',
          fetch_format: 'auto',
          flags: 'progressive'
        })
      };

      logger.info('Category image uploaded successfully', {
        publicId: uploadResult.public_id,
        categorySlug,
        sizes: Object.keys(sizes)
      });

      return {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        sizes
      };

    } catch (error) {
      logger.error('Error uploading category image:', error);
      throw new Error(`Failed to upload category image: ${error}`);
    }
  }

  /**
   * Subir múltiples imágenes para galería de categoría
   */
  static async uploadCategoryGallery(
    images: Buffer[],
    categorySlug: string
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = images.map((imageBuffer, index) => 
        this.uploadCategoryImage(imageBuffer, categorySlug, `gallery-${index + 1}`)
      );

      const results = await Promise.all(uploadPromises);
      
      logger.info('Category gallery uploaded successfully', {
        categorySlug,
        imageCount: results.length
      });

      return results;
    } catch (error) {
      logger.error('Error uploading category gallery:', error);
      throw new Error(`Failed to upload category gallery: ${error}`);
    }
  }

  /**
   * Eliminar imagen de categoría
   */
  static async deleteCategoryImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info('Category image deleted successfully', { publicId });
    } catch (error) {
      logger.error('Error deleting category image:', error);
      throw new Error(`Failed to delete category image: ${error}`);
    }
  }

  /**
   * Generar URL optimizada dinámicamente
   */
  static generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      width: options.width || 'auto',
      height: options.height || 'auto',
      crop: options.crop || 'fit',
      quality: options.quality || 'auto:good',
      fetch_format: options.format || 'auto',
      flags: 'progressive'
    });
  }

  /**
   * Obtener estadísticas de uso de imágenes
   */
  static async getCategoryImageStats(): Promise<any> {
    try {
      const stats = await cloudinary.api.usage();
      return {
        totalImages: stats.resources,
        bandwidth: stats.bandwidth,
        storage: stats.storage,
        transformations: stats.transformations
      };
    } catch (error) {
      logger.error('Error getting image stats:', error);
      return null;
    }
  }
}

export default CloudinaryService;