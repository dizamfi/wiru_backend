// src/controllers/upload.controller.ts - CONTROLADOR DE UPLOAD

import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';
import multer from 'multer';
import { env } from '@/config/env';


// Configurar Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Configurar Multer para manejar archivos en memoria
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

/**
 * Subir una imagen a Cloudinary
 * POST /upload/image
 */
export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return ResponseUtils.badRequest(res, 'No se proporcionó ningún archivo');
  }

  const userId = (req as any).user?.id;
  const folder = req.body.folder || 'orders';

  console.log('📤 Uploading image:', {
    userId,
    folder,
    fileSize: req.file.size,
    mimetype: req.file.mimetype,
  });

  try {
    // Subir a Cloudinary usando buffer
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `wiru/${folder}`,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file!.buffer);
    });

    logger.info('Image uploaded to Cloudinary', {
      userId,
      publicId: result.public_id,
      url: result.secure_url,
    });

    return ResponseUtils.success(res, {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    console.error('❌ Error uploading to Cloudinary:', error);
    logger.error('Cloudinary upload error', { userId, error: error.message });
    
    return ResponseUtils.error(
      res,
      'Error al subir la imagen',
      500,
     error.message
    );
  }
});

/**
 * Subir múltiples imágenes
 * POST /upload/multiple
 */
export const uploadMultipleImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return ResponseUtils.badRequest(res, 'No se proporcionaron archivos');
  }

  const userId = (req as any).user?.id;
  const folder = req.body.folder || 'orders';

  console.log('📤 Uploading multiple images:', {
    userId,
    folder,
    count: files.length,
  });

  try {
    // Subir todas las imágenes en paralelo
    const uploadPromises = files.map(async (file) => {
      return new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `wiru/${folder}`,
            resource_type: 'auto',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    const images = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }));

    logger.info('Multiple images uploaded to Cloudinary', {
      userId,
      count: images.length,
    });

    return ResponseUtils.success(res, { images });
  } catch (error: any) {
    console.error('❌ Error uploading multiple images:', error);
    logger.error('Cloudinary multiple upload error', {
      userId,
      error: error.message,
    });

    return ResponseUtils.error(
      res,
      'Error al subir las imágenes',
      500,
      
      error.message
    );
  }
});

/**
 * Eliminar imagen de Cloudinary
 * DELETE /upload/image/:publicId
 */
export const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const { publicId } = req.params;
  const userId = (req as any).user?.id;

  if (!publicId) {
    return ResponseUtils.badRequest(res, 'Public ID es requerido');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    logger.info('Image deleted from Cloudinary', { userId, publicId, result });

    return ResponseUtils.success(res, { result });
  } catch (error: any) {
    console.error('❌ Error deleting from Cloudinary:', error);
    logger.error('Cloudinary delete error', { userId, publicId, error: error.message });

    return ResponseUtils.error(
      res,
      'Error al eliminar la imagen',
      500,
      
      error.message
    );
  }
});