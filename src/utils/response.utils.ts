import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
}

export class ResponseUtils {
  static badRequest(res: Response<any, Record<string, any>>, arg1: string) {
      throw new Error('Method not implemented.');
  }
  static conflict(res: Response<any, Record<string, any>>, EMAIL_ALREADY_EXISTS: string) {
      throw new Error('Method not implemented.');
  }
  /**
   * Respuesta exitosa
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Operación exitosa',
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta de error
   */
  static error(
    res: Response,
    message: string = 'Error interno del servidor',
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta de validación fallida
   */
  static validationError(
    res: Response,
    errors: Record<string, string[]>,
    message: string = 'Datos de entrada inválidos'
  ): Response<ApiResponse> {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta no autorizada
   */
  static unauthorized(
    res: Response,
    message: string = 'No autorizado'
  ): Response<ApiResponse> {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta prohibida
   */
  static forbidden(
    res: Response,
    message: string = 'Acceso denegado'
  ): Response<ApiResponse> {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta no encontrado
   */
  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado'
  ): Response<ApiResponse> {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta con paginación
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Datos obtenidos exitosamente'
  ): Response<ApiResponse<T[]>> {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta creado
   */
  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Recurso creado exitosamente'
  ): Response<ApiResponse<T>> {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta sin contenido
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}