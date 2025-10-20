// import { Response } from 'express';

// export interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data?: T;
//   errors?: Record<string, string[]>;
//   pagination?: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
//   timestamp?: string;
// }

// export class ResponseUtils {
//   static internalServerError(res: Response<any, Record<string, any>>, arg1: string) {
//     throw new Error('Method not implemented.');
//   }
//   static badRequest(res: Response<any, Record<string, any>>, arg1: string) {
//       throw new Error('Method not implemented.');
//   }
//   static conflict(res: Response<any, Record<string, any>>, EMAIL_ALREADY_EXISTS: string) {
//       throw new Error('Method not implemented.');
//   }
//   /**
//    * Respuesta exitosa
//    */
//   static success<T>(
//     res: Response,
//     data?: T,
//     message: string = 'Operación exitosa',
//     statusCode: number = 200
//   ): Response<ApiResponse<T>> {
//     return res.status(statusCode).json({
//       success: true,
//       message,
//       data,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta de error
//    */
//   static error(
//     res: Response,
//     message: string = 'Error interno del servidor',
//     statusCode: number = 500,
//     errors?: Record<string, string[]>
//   ): Response<ApiResponse> {
//     return res.status(statusCode).json({
//       success: false,
//       message,
//       errors,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta de validación fallida
//    */
//   static validationError(
//     res: Response,
//     errors: Record<string, string[]>,
//     message: string = 'Datos de entrada inválidos'
//   ): Response<ApiResponse> {
//     return res.status(400).json({
//       success: false,
//       message,
//       errors,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta no autorizada
//    */
//   static unauthorized(
//     res: Response,
//     message: string = 'No autorizado'
//   ): Response<ApiResponse> {
//     return res.status(401).json({
//       success: false,
//       message,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta prohibida
//    */
//   static forbidden(
//     res: Response,
//     message: string = 'Acceso denegado'
//   ): Response<ApiResponse> {
//     return res.status(403).json({
//       success: false,
//       message,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta no encontrado
//    */
//   static notFound(
//     res: Response,
//     message: string = 'Recurso no encontrado'
//   ): Response<ApiResponse> {
//     return res.status(404).json({
//       success: false,
//       message,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta con paginación
//    */
//   static paginated<T>(
//     res: Response,
//     data: T[],
//     pagination: {
//       page: number;
//       limit: number;
//       total: number;
//       totalPages: number;
//     },
//     message: string = 'Datos obtenidos exitosamente'
//   ): Response<ApiResponse<T[]>> {
//     return res.status(200).json({
//       success: true,
//       message,
//       data,
//       pagination,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta creado
//    */
//   static created<T>(
//     res: Response,
//     data?: T,
//     message: string = 'Recurso creado exitosamente'
//   ): Response<ApiResponse<T>> {
//     return res.status(201).json({
//       success: true,
//       message,
//       data,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   /**
//    * Respuesta sin contenido
//    */
//   static noContent(res: Response): Response {
//     return res.status(204).send();
//   }
// }




// src/utils/response.utils.ts
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

  
  /**
   * Respuesta de error 400 - Bad Request
   */
  static badRequest(
    res: Response,
    message: string = 'Solicitud inválida',
    errors?: Record<string, string[]>
  ): Response<ApiResponse> {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta de error 409 - Conflict
   */
  static conflict(
    res: Response,
    message: string = 'Conflicto con el estado actual del recurso'
  ): Response<ApiResponse> {
    return res.status(409).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta de error 500 - Internal Server Error
   */
  static internalServerError(
    res: Response,
    message: string = 'Error interno del servidor'
  ): Response<ApiResponse> {
    return res.status(500).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
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
   * Respuesta de error genérica
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
   * Respuesta no autorizada (401)
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
   * Respuesta prohibida (403)
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
   * Respuesta no encontrado (404)
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
   * Respuesta demasiadas solicitudes (429)
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Demasiadas solicitudes'
  ): Response<ApiResponse> {
    return res.status(429).json({
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
   * Respuesta creado (201)
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
   * Respuesta actualizado (200)
   */
  static updated<T>(
    res: Response,
    data?: T,
    message: string = 'Recurso actualizado exitosamente'
  ): Response<ApiResponse<T>> {
    return res.status(200).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta eliminado (200)
   */
  static deleted(
    res: Response,
    message: string = 'Recurso eliminado exitosamente'
  ): Response<ApiResponse> {
    return res.status(200).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Respuesta sin contenido (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Respuesta aceptada (202)
   */
  static accepted<T>(
    res: Response,
    data?: T,
    message: string = 'Solicitud aceptada para procesamiento'
  ): Response<ApiResponse<T>> {
    return res.status(202).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}