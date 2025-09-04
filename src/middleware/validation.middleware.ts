// import { Request, Response, NextFunction } from 'express';
// import { z, ZodSchema } from 'zod';
// import { ResponseUtils } from '@/utils/response.utils';
// import logger from '@/config/logger';

// // Esquemas de validación comunes
// export const commonSchemas = {
//   // Validación de ID
//   id: z.string().cuid('ID debe ser un CUID válido'),
  
//   // Validación de email
//   email: z.string().email('Email debe tener un formato válido').toLowerCase(),
  
//   // Validación de contraseña
//   password: z.string()
//     .min(8, 'La contraseña debe tener al menos 8 caracteres')
//     .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
//     .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
//     .regex(/\d/, 'La contraseña debe tener al menos un número'),
  
//   // Validación de teléfono
//   phone: z.string()
//     .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
//     .optional(),
  
//   // Validación de nombres
//   name: z.string()
//     .min(2, 'El nombre debe tener al menos 2 caracteres')
//     .max(50, 'El nombre no puede tener más de 50 caracteres')
//     .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
//   // Validación de cantidad monetaria
//   amount: z.number()
//     .positive('La cantidad debe ser positiva')
//     .multipleOf(0.01, 'La cantidad debe tener máximo 2 decimales'),
  
//   // Validación de peso
//   weight: z.number()
//     .positive('El peso debe ser positivo')
//     .max(1000, 'El peso no puede ser mayor a 1000 kg'),
  
//   // Validación de paginación
//   pagination: z.object({
//     page: z.string()
//       .optional()
//       .transform(val => val ? parseInt(val) : 1)
//       .refine(val => val > 0, 'La página debe ser mayor a 0'),
//     limit: z.string()
//       .optional()
//       .transform(val => val ? parseInt(val) : 10)
//       .refine(val => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100'),
//   }),
// };

// // Esquemas específicos de autenticación
// export const authSchemas = {
//   login: z.object({
//     email: commonSchemas.email,
//     password: z.string().min(1, 'La contraseña es requerida'),
//   }),

//   register: z.object({
//     email: commonSchemas.email,
//     password: commonSchemas.password,
//     firstName: commonSchemas.name,
//     lastName: commonSchemas.name,
//     phone: commonSchemas.phone,
//     type: z.enum(['PERSON', 'COMPANY']).default('PERSON'),
//     referralCode: z.string().optional(),
//     companyName: z.string().optional(),
//     companyDocument: z.string().optional(),
//   }).refine(data => {
//     if (data.type === 'COMPANY') {
//       return data.companyName && data.companyDocument;
//     }
//     return true;
//   }, {
//     message: 'El nombre y documento de la empresa son requeridos para usuarios tipo empresa',
//     path: ['companyName'],
//   }),

//   resetPassword: z.object({
//     email: commonSchemas.email,
//   }),

//   changePassword: z.object({
//     currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
//     newPassword: commonSchemas.password,
//     confirmPassword: z.string(),
//   }).refine(data => data.newPassword === data.confirmPassword, {
//     message: 'Las contraseñas no coinciden',
//     path: ['confirmPassword'],
//   }),

//   refreshToken: z.object({
//     refreshToken: z.string().min(1, 'El refresh token es requerido'),
//   }),
// };

// // Esquemas de usuario
// export const userSchemas = {
//   updateProfile: z.object({
//     firstName: commonSchemas.name.optional(),
//     lastName: commonSchemas.name.optional(),
//     phone: commonSchemas.phone,
//     companyName: z.string().optional(),
//     companyDocument: z.string().optional(),
//   }),

//   updateEmail: z.object({
//     newEmail: commonSchemas.email,
//     password: z.string().min(1, 'La contraseña es requerida para cambiar el email'),
//   }),

//    updateStatus: z.object({
//     status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
//   }),
// };

// // Schemas para categorías
// export const categorySchemas = {
//   createCategory: z.object({
//     name: z.string().min(2).max(100),
//     description: z.string().max(500).optional(),
//     pricePerKg: z.number().min(0).max(999.99),
//     image: z.string().url().optional(),
//     estimatedWeight: z.number().min(0).max(100).optional(),
//   }),
  
//   updateCategory: z.object({
//     name: z.string().min(2).max(100).optional(),
//     description: z.string().max(500).optional(),
//     pricePerKg: z.number().min(0).max(999.99).optional(),
//     image: z.string().url().optional(),
//     estimatedWeight: z.number().min(0).max(100).optional(),
//     status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
//   }),
// };

// // // Schemas para órdenes
// // export const orderSchemas = {
// //   createOrder: z.object({
// //     items: z.array(z.object({
// //       categoryId: z.string().cuid(),
// //       estimatedWeight: z.number().min(0.1).max(100),
// //       images: z.array(z.string().url()).optional().default([]),
// //       notes: z.string().max(500).optional(),
// //     })).min(1),
// //     deliveryMethod: z.enum(['PICKUP_POINT', 'HOME_PICKUP']),
// //     pickupAddress: z.object({
// //       street: z.string().min(5).max(200),
// //       city: z.string().min(2).max(100),
// //       state: z.string().min(2).max(100),
// //       zipCode: z.string().min(3).max(20),
// //       country: z.string().default('Ecuador'),
// //       notes: z.string().max(500).optional(),
// //     }).optional(),
// //   }),
  
// //   updateStatus: z.object({
// //     status: z.enum(['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED', 'PAID', 'CANCELLED']),
// //     actualWeight: z.number().min(0).max(1000).optional(),
// //     trackingNumber: z.string().max(100).optional(),
// //     notes: z.string().max(1000).optional(),
// //   }),
// // };

// // // Schemas para wallet
// // export const walletSchemas = {
// //   withdraw: z.object({
// //     amount: z.number().min(10).max(10000),
// //     bankAccountId: z.string().cuid(),
// //     notes: z.string().max(500).optional(),
// //   }),
  
// //   createTransaction: z.object({
// //     userId: z.string().cuid(),
// //     type: z.enum(['CREDIT', 'DEBIT', 'HOLD', 'RELEASE']),
// //     amount: z.number().min(0.01).max(100000),
// //     orderId: z.string().cuid().optional(),
// //     description: z.string().max(500),
// //     metadata: z.record(z.string(), z.any()).optional(),
// //   }),
  
// //   processWithdrawal: z.object({
// //     status: z.enum(['COMPLETED', 'FAILED']),
// //     kushkiTransactionId: z.string().optional(),
// //     notes: z.string().max(1000).optional(),
// //   }),
// // };

// // Schemas para cuentas bancarias
// export const bankAccountSchemas = {
//   create: z.object({
//     bankName: z.string().min(2).max(100),
//     accountNumber: z.string().min(8).max(30),
//     accountType: z.enum(['SAVINGS', 'CHECKING']),
//     accountHolderName: z.string().min(2).max(200),
//     accountHolderDocument: z.string().min(8).max(20),
//     isDefault: z.boolean().default(false),
//   }),
  
//   update: z.object({
//     bankName: z.string().min(2).max(100).optional(),
//     accountType: z.enum(['SAVINGS', 'CHECKING']).optional(),
//     accountHolderName: z.string().min(2).max(200).optional(),
//     isDefault: z.boolean().optional(),
//     isActive: z.boolean().optional(),
//   }),
// };

// // Esquemas de billetera
// export const walletSchemas = {
//   withdrawal: z.object({
//     amount: commonSchemas.amount
//       .min(10, 'El monto mínimo de retiro es $10')
//       .max(5000, 'El monto máximo de retiro es $5000'),
//     bankAccountId: commonSchemas.id,
//   }),

//   addBankAccount: z.object({
//     bankName: z.string().min(1, 'El nombre del banco es requerido'),
//     bankCode: z.string().min(1, 'El código del banco es requerido'),
//     accountNumber: z.string()
//       .min(8, 'El número de cuenta debe tener al menos 8 dígitos')
//       .max(20, 'El número de cuenta no puede tener más de 20 dígitos')
//       .regex(/^\d+$/, 'El número de cuenta solo puede contener números'),
//     accountType: z.enum(['SAVINGS', 'CHECKING']),
//     accountHolderName: z.string()
//       .min(2, 'El nombre del titular debe tener al menos 2 caracteres')
//       .max(100, 'El nombre del titular no puede tener más de 100 caracteres'),
//     documentType: z.enum(['CEDULA', 'PASSPORT', 'RUC']),
//     documentNumber: z.string()
//       .min(8, 'El número de documento debe tener al menos 8 caracteres')
//       .max(20, 'El número de documento no puede tener más de 20 caracteres'),
//     isDefault: z.boolean().default(false),
//   }),
// };

// // Esquemas de órdenes
// export const orderSchemas = {
//   createOrder: z.object({
//     items: z.array(z.object({
//       categoryId: commonSchemas.id,
//       estimatedWeight: commonSchemas.weight,
//       images: z.array(z.string().url()).min(1, 'Se requiere al menos una imagen'),
//       notes: z.string().optional(),
//     })).min(1, 'Se requiere al menos un item'),
//     deliveryMethod: z.enum(['PICKUP_POINT', 'HOME_PICKUP']),
//     pickupAddress: z.object({
//       street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
//       city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
//       state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
//       zipCode: z.string().min(5, 'El código postal debe tener al menos 5 caracteres'),
//       country: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
//       phone: commonSchemas.phone,
//       instructions: z.string().optional(),
//     }).optional(),
//     notes: z.string().optional(),
//   }),

//   updateOrderStatus: z.object({
//     status: z.enum(['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED', 'PAID', 'CANCELLED']),
//     notes: z.string().optional(),
//   }),
// };

// /**
//  * Middleware de validación genérico
//  */
// export const validate = (schema: ZodSchema) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       // Combinar todos los datos de la request
//       const data = Object.assign({}, req.body, req.params, req.query);

//       // Validar los datos
//       const validatedData = schema.parse(data);

//       // Asignar los datos validados de vuelta a la request
//       Object.assign(req.body, validatedData);
//       Object.assign(req.params, validatedData);
//       Object.assign(req.query, validatedData);

//       next();
//     } catch (error: any) {
//       // Verificar si es un error de Zod
//       if (error && error.name === 'ZodError' && Array.isArray(error.errors)) {
//         const errors: Record<string, string[]> = {};
        
//         error.errors.forEach((err: any) => {
//           const path = Array.isArray(err.path) ? err.path.join('.') : 'unknown';
//           if (!errors[path]) {
//             errors[path] = [];
//           }
//           errors[path].push(err.message || 'Error de validación');
//         });

//         logger.warn('Validation error:', { errors, path: req.path });
        
//         ResponseUtils.validationError(res, errors);
//         return;
//       }

//       logger.error('Unexpected validation error:', error);
//       ResponseUtils.error(res, 'Error de validación inesperado');
//       return;
//     }
//   };
// };

// /**
//  * Middleware para validar solo el body
//  */
// export const validateBody = (schema: ZodSchema) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       const validatedData = schema.parse(req.body);
//       req.body = validatedData;
//       next();
//     } catch (error: any) {
//       if (error && error.name === 'ZodError' && Array.isArray(error.errors)) {
//         const errors: Record<string, string[]> = {};
        
//         error.errors.forEach((err: any) => {
//           const path = Array.isArray(err.path) ? err.path.join('.') : 'unknown';
//           if (!errors[path]) {
//             errors[path] = [];
//           }
//           errors[path].push(err.message || 'Error de validación');
//         });

//         ResponseUtils.validationError(res, errors);
//         return;
//       }

//       ResponseUtils.error(res, 'Error de validación inesperado');
//       return;
//     }
//   };
// };

// /**
//  * Middleware para validar solo los parámetros
//  */
// export const validateParams = (schema: ZodSchema) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       const validatedData = schema.parse(req.params);
//       Object.assign(req.params, validatedData);
//       next();
//     } catch (error: any) {
//       if (error && error.name === 'ZodError' && Array.isArray(error.errors)) {
//         const errors: Record<string, string[]> = {};
        
//         error.errors.forEach((err: any) => {
//           const path = Array.isArray(err.path) ? err.path.join('.') : 'unknown';
//           if (!errors[path]) {
//             errors[path] = [];
//           }
//           errors[path].push(err.message || 'Error de validación');
//         });

//         ResponseUtils.validationError(res, errors);
//         return;
//       }

//       ResponseUtils.error(res, 'Error de validación inesperado');
//       return;
//     }
//   };
// };

// /**
//  * Middleware para validar solo la query
//  */
// export const validateQuery = (schema: ZodSchema) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       const validatedData = schema.parse(req.query);
//       Object.assign(req.query, validatedData);
//       next();
//     } catch (error: any) {
//       if (error && error.name === 'ZodError' && Array.isArray(error.errors)) {
//         const errors: Record<string, string[]> = {};
        
//         error.errors.forEach((err: any) => {
//           const path = Array.isArray(err.path) ? err.path.join('.') : 'unknown';
//           if (!errors[path]) {
//             errors[path] = [];
//           }
//           errors[path].push(err.message || 'Error de validación');
//         });

//         ResponseUtils.validationError(res, errors);
//         return;
//       }

//       ResponseUtils.error(res, 'Error de validación inesperado');
//       return;
//     }
//   };
// };





import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ResponseUtils } from '@/utils/response.utils';
import logger from '@/config/logger';

// Esquemas de validación comunes
export const commonSchemas = {
  // Validación de ID
  id: z.object({
    id: z.string().min(1, 'ID es requerido'),
  }),
  
  // Validación de email
  email: z.string().email('Email debe tener un formato válido').transform(val => val.toLowerCase()),
  
  // Validación de contraseña
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
    .regex(/\d/, 'La contraseña debe tener al menos un número'),
  
  // Validación de teléfono
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional(),
  
  // Validación de nombres
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  // Validación de cantidad monetaria
  amount: z.number()
    .positive('La cantidad debe ser positiva')
    .multipleOf(0.01, 'La cantidad debe tener máximo 2 decimales'),
  
  // Validación de peso
  weight: z.number()
    .positive('El peso debe ser positivo')
    .max(1000, 'El peso no puede ser mayor a 1000 kg'),
  
  // Validación de paginación
  pagination: z.object({
    page: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 1)
      .refine(val => val > 0, 'La página debe ser mayor a 0'),
    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val) : 10)
      .refine(val => val > 0 && val <= 100, 'El límite debe estar entre 1 y 100'),
  }),
};

// Esquemas específicos de autenticación
export const authSchemas = {
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'La contraseña es requerida'),
  }),

  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    phone: commonSchemas.phone,
    type: z.enum(['PERSON', 'COMPANY']).default('PERSON'),
    referralCode: z.string().optional(),
    companyName: z.string().optional(),
    companyDocument: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.type === 'COMPANY') {
      if (!data.companyName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre de la empresa es requerido para usuarios tipo empresa',
          path: ['companyName'],
        });
      }
      if (!data.companyDocument) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El documento de la empresa es requerido para usuarios tipo empresa',
          path: ['companyDocument'],
        });
      }
    }
  }),

  resetPassword: z.object({
    email: commonSchemas.email,
  }),

  confirmResetPassword: z.object({
    token: z.string().min(1, 'Token es requerido'),
    newPassword: commonSchemas.password,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string(),
  }).superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      });
    }
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'El refresh token es requerido'),
  }),


  // Verificación de email
  verifyEmail: z.object({
    token: z.string().min(1, 'Token de verificación requerido'),
  }),

  // Reenviar verificación
  resendVerification: z.object({
    email: commonSchemas.email,
  }),

  // Reset de contraseña avanzado
  resetPasswordWithToken: z.object({
    token: z.string().min(1, 'Token de reset requerido'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string(),
  }).superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      });
    }
  }),

  // OAuth Google
  googleLogin: z.object({
    accessToken: z.string().optional(),
    idToken: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (!data.accessToken && !data.idToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Se requiere accessToken o idToken',
        path: ['accessToken'],
      });
    }
  }),

  // OAuth Facebook
  facebookLogin: z.object({
    accessToken: z.string().min(1, 'Access token de Facebook requerido'),
  }),

  // Cambiar email
  changeEmail: z.object({
    newEmail: commonSchemas.email,
    password: z.string().min(1, 'Contraseña requerida para cambiar email'),
  }),

  // Logout avanzado
  logoutAdvanced: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
    logoutAll: z.boolean().optional().default(false),
  }),

  // Verificar token
  verifyToken: z.object({
    token: z.string().min(1, 'Token requerido'),
  }),

};

// Schemas para parámetros OAuth
export const oauthParamSchemas = {
  provider: z.object({
    provider: z.enum(['google', 'facebook'], {
      error: 'Proveedor debe ser google o facebook',
    }),
  }),
};

// Esquemas de usuario
export const userSchemas = {
  updateProfile: z.object({
    firstName: commonSchemas.name.optional(),
    lastName: commonSchemas.name.optional(),
    phone: commonSchemas.phone,
    companyName: z.string().optional(),
    companyDocument: z.string().optional(),
  }),

  updateEmail: z.object({
    newEmail: commonSchemas.email,
    password: z.string().min(1, 'La contraseña es requerida para cambiar el email'),
  }),

  updateStatus: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  }),
};

// Schemas para categorías
export const categorySchemas = {
  createCategory: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    pricePerKg: z.number().min(0).max(999.99),
    image: z.string().url().optional(),
    estimatedWeight: z.number().min(0).max(100).optional(),
  }),
  
  updateCategory: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    pricePerKg: z.number().min(0).max(999.99).optional(),
    image: z.string().url().optional(),
    estimatedWeight: z.number().min(0).max(100).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

// Schemas para cuentas bancarias
export const bankAccountSchemas = {
  create: z.object({
    bankName: z.string().min(2).max(100),
    accountNumber: z.string().min(8).max(30),
    accountType: z.enum(['SAVINGS', 'CHECKING']),
    accountHolderName: z.string().min(2).max(200),
    accountHolderDocument: z.string().min(8).max(20),
    isDefault: z.boolean().default(false),
  }),
  
  update: z.object({
    bankName: z.string().min(2).max(100).optional(),
    accountType: z.enum(['SAVINGS', 'CHECKING']).optional(),
    accountHolderName: z.string().min(2).max(200).optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
};

// Esquemas de billetera
export const walletSchemas = {
  withdraw: z.object({
    amount: commonSchemas.amount
      .min(10, 'El monto mínimo de retiro es $10')
      .max(5000, 'El monto máximo de retiro es $5000'),
    bankAccountId: z.string().min(1, 'ID de cuenta bancaria requerido'),
    notes: z.string().max(500).optional(),
  }),

  // createTransaction: z.object({
  //   userId: z.string().min(1, 'ID de usuario requerido'),
  //   type: z.enum(['CREDIT', 'DEBIT', 'HOLD', 'RELEASE']),
  //   amount: z.number().min(0.01).max(100000),
  //   orderId: z.string().optional(),
  //   description: z.string().max(500),
  //   metadata: z.record(z.string(), z.any()).optional(),
  // }),

  // processWithdrawal: z.object({
  //   status: z.enum(['COMPLETED', 'FAILED']),
  //   kushkiTransactionId: z.string().optional(),
  //   notes: z.string().max(1000).optional(),
  // }),

  // addBankAccount: z.object({
  //   bankName: z.string().min(1, 'El nombre del banco es requerido'),
  //   bankCode: z.string().min(1, 'El código del banco es requerido'),
  //   accountNumber: z.string()
  //     .min(8, 'El número de cuenta debe tener al menos 8 dígitos')
  //     .max(20, 'El número de cuenta no puede tener más de 20 dígitos')
  //     .regex(/^\d+$/, 'El número de cuenta solo puede contener números'),
  //   accountType: z.enum(['SAVINGS', 'CHECKING']),
  //   accountHolderName: z.string()
  //     .min(2, 'El nombre del titular debe tener al menos 2 caracteres')
  //     .max(100, 'El nombre del titular no puede tener más de 100 caracteres'),
  //   documentType: z.enum(['CEDULA', 'PASSPORT', 'RUC']),
  //   documentNumber: z.string()
  //     .min(8, 'El número de documento debe tener al menos 8 caracteres')
  //     .max(20, 'El número de documento no puede tener más de 20 caracteres'),
  //   isDefault: z.boolean().default(false),
  // }),

   withdrawal: z.object({
    amount: commonSchemas.amount
      .min(10, 'El monto mínimo de retiro es $10')
      .max(5000, 'El monto máximo de retiro es $5000'),
    bankAccountId: z.string().min(1, 'ID de cuenta bancaria requerido'),
    notes: z.string().max(500).optional(),
  }),

  createTransaction: z.object({
    userId: z.string().min(1, 'ID de usuario requerido'),
    type: z.enum(['CREDIT', 'DEBIT', 'HOLD', 'RELEASE']),
    amount: z.number().min(0.01).max(100000),
    orderId: z.string().optional(),
    description: z.string().max(500),
    metadata: z.record(z.string(), z.any()).optional(),
  }),

  processWithdrawal: z.object({
    status: z.enum(['COMPLETED', 'FAILED']),
    kushkiTransactionId: z.string().optional(),
    notes: z.string().max(1000).optional(),
  }),

  addBankAccount: z.object({
    bankName: z.string().min(1, 'El nombre del banco es requerido'),
    bankCode: z.string().min(1, 'El código del banco es requerido'),
    accountNumber: z.string()
      .min(8, 'El número de cuenta debe tener al menos 8 dígitos')
      .max(20, 'El número de cuenta no puede tener más de 20 dígitos')
      .regex(/^\d+$/, 'El número de cuenta solo puede contener números'),
    accountType: z.enum(['SAVINGS', 'CHECKING']),
    accountHolderName: z.string()
      .min(2, 'El nombre del titular debe tener al menos 2 caracteres')
      .max(100, 'El nombre del titular no puede tener más de 100 caracteres'),
    documentType: z.enum(['CEDULA', 'PASSPORT', 'RUC']),
    documentNumber: z.string()
      .min(8, 'El número de documento debe tener al menos 8 caracteres')
      .max(20, 'El número de documento no puede tener más de 20 caracteres'),
    isDefault: z.boolean().default(false),
  }),
};

// Esquemas de órdenes
export const orderSchemas = {
  createOrder: z.object({
    items: z.array(z.object({
      categoryId: z.string().min(1, 'ID de categoría requerido'),
      estimatedWeight: commonSchemas.weight,
      images: z.array(z.string().url()).min(1, 'Se requiere al menos una imagen'),
      notes: z.string().optional(),
    })).min(1, 'Se requiere al menos un item'),
    deliveryMethod: z.enum(['PICKUP_POINT', 'HOME_PICKUP']),
    pickupAddress: z.object({
      street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
      city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
      state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
      zipCode: z.string().min(5, 'El código postal debe tener al menos 5 caracteres'),
      country: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
      phone: commonSchemas.phone,
      instructions: z.string().optional(),
    }).optional(),
    notes: z.string().optional(),
  }),

  updateStatus: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED', 'PAID', 'CANCELLED']),
    actualWeight: z.number().min(0).max(1000).optional(),
    trackingNumber: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
  }),
};

/**
 * Middleware de validación genérico
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Combinar todos los datos de la request
      const data = Object.assign({}, req.body, req.params, req.query);

      // Validar los datos
      const validatedData = schema.parse(data);

      // Asignar los datos validados de vuelta a la request
      Object.assign(req.body, validatedData);
      Object.assign(req.params, validatedData);
      Object.assign(req.query, validatedData);

      next();
    } catch (error: any) {
      // Verificar si es un error de Zod
      if (error && error.name === 'ZodError' && Array.isArray(error.issues)) {
        const errors: Record<string, string[]> = {};
        
        error.issues.forEach((issue: any) => {
          const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message || 'Error de validación');
        });

        logger.warn('Validation error:', { errors, path: req.path });
        
        ResponseUtils.validationError(res, errors);
        return;
      }

      logger.error('Unexpected validation error:', error);
      ResponseUtils.error(res, 'Error de validación inesperado');
      return;
    }
  };
};

/**
 * Middleware para validar solo el body
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      if (error && error.name === 'ZodError' && Array.isArray(error.issues)) {
        const errors: Record<string, string[]> = {};
        
        error.issues.forEach((issue: any) => {
          const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message || 'Error de validación');
        });

        ResponseUtils.validationError(res, errors);
        return;
      }

      ResponseUtils.error(res, 'Error de validación inesperado');
      return;
    }
  };
};

/**
 * Middleware para validar solo los parámetros
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      Object.assign(req.params, validatedData);
      next();
    } catch (error: any) {
      if (error && error.name === 'ZodError' && Array.isArray(error.issues)) {
        const errors: Record<string, string[]> = {};
        
        error.issues.forEach((issue: any) => {
          const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message || 'Error de validación');
        });

        ResponseUtils.validationError(res, errors);
        return;
      }

      ResponseUtils.error(res, 'Error de validación inesperado');
      return;
    }
  };
};

/**
 * Middleware para validar solo la query
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      Object.assign(req.query, validatedData);
      next();
    } catch (error: any) {
      if (error && error.name === 'ZodError' && Array.isArray(error.issues)) {
        const errors: Record<string, string[]> = {};
        
        error.issues.forEach((issue: any) => {
          const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message || 'Error de validación');
        });

        ResponseUtils.validationError(res, errors);
        return;
      }

      ResponseUtils.error(res, 'Error de validación inesperado');
      return;
    }
  };
};


// Esquemas OAuth
export const oauthSchemas = {
  googleAuth: z.object({
    credential: z.string().min(1, 'Google credential es requerido'),
  }),

  facebookAuth: z.object({
    accessToken: z.string().min(1, 'Facebook access token es requerido'),
  }),
};