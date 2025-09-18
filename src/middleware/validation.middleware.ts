// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ResponseUtils } from '@/utils/response.utils';
import logger from '@/config/logger';

// Esquemas comunes reutilizables
export const commonSchemas = {
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email es muy largo')
    .toLowerCase()
    .trim(),
    
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'La contraseña es muy larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número'),
    
  name: z.string()
    .min(1, 'Este campo es requerido')
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'.-]+$/, 'Solo se permiten letras, espacios, apostrofes, puntos y guiones')
    .trim(),
    
  phone: z.string()
    .regex(/^\+?[1-9]\d{8,14}$/, 'Formato de teléfono inválido (+1234567890)')
    .optional()
    .transform(val => val?.trim()),
    
  cuid: z.string().cuid('ID inválido'),
  
  id: z.object({
    id: z.string().cuid('ID inválido'),
  }),

    // Validación de cantidad monetaria
  amount: z.number()
    .positive('La cantidad debe ser positiva')
    .multipleOf(0.01, 'La cantidad debe tener máximo 2 decimales'),

  weight: z.number()
    .positive('El peso debe ser positivo')
    .max(1000, 'El peso no puede ser mayor a 1000 kg'),

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
    // Campos básicos requeridos
    email: commonSchemas.email,
    password: commonSchemas.password,
    // firstName: commonSchemas.name,
    // lastName: commonSchemas.name,
     firstName: z.string().min(2, 'Nombre requerido').max(50).optional(),
    lastName: z.string().min(2, 'Apellido requerido').max(50).optional(),
    phone: commonSchemas.phone,
    
    // Tipo de usuario - aceptar ambos formatos del frontend
    userType: z.enum(['person', 'company']).optional(),
    type: z.enum(['PERSON', 'COMPANY']).optional(),
    
    // Campos del frontend que debemos ignorar en validación pero permitir pasar
    confirmPassword: z.string().optional(),
    acceptTerms: z.boolean().optional(),
    acceptPrivacy: z.boolean().optional(),
    
    // Campos de identificación personal
    identificationNumber: z.string().max(20).optional(),
    identificationType: z.enum(['cedula', 'passport', 'license']).optional(),
    dateOfBirth: z.string().optional(),
    
    // Campos de empresa - múltiples nombres para compatibilidad frontend
    companyName: z.string().min(0).max(100).optional(),
    legalName: z.string().min(2).max(100).optional(),
    taxId: z.string().min(5).max(20).optional(),
    companyDocument: z.string().min(5).max(20).optional(),
    industry: z.string().max(50).optional(),
    companySize: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    
    // Representante legal
    legalRepFirstName: commonSchemas.name.optional(),
    legalRepLastName: commonSchemas.name.optional(),
    legalRepPosition: z.string().max(50).optional(),
    legalRepPhone: commonSchemas.phone,
    legalRepEmail: z.string().email().optional(),
    legalRepId: z.string().optional(),
    
    // Dirección comercial
    businessStreet: z.string().min(5).max(200).optional(),
    businessCity: z.string().min(2).max(100).optional(),
    businessState: z.string().min(2).max(100).optional(),
    businessZipCode: z.string().min(3).max(20).optional(),
    businessCountry: z.string().max(50).optional(),
    
    // Referidos
    referralCode: z.string().max(20).optional(),
  })
  .refine(data => {
    // Validar que userType o type esté presente
    return data.userType || data.type;
  }, {
    message: 'El tipo de usuario es requerido',
    path: ['userType'],
  })
  .refine(data => {
    // Validar campos requeridos para empresas
    const userType = data.userType || (data.type === 'PERSON' ? 'person' : 'company');
    if (userType === 'company') {
      const hasCompanyName = data.companyName || data.legalName;
      const hasCompanyDoc = data.taxId || data.companyDocument;
      return hasCompanyName && hasCompanyDoc;
    }
    return true;
  }, {
    message: 'El nombre y documento de la empresa son requeridos para usuarios tipo empresa',
    path: ['companyName'],
  }),

 resetPassword: z.object({
  email: z.string().email('Email inválido'),
}),

  verifyEmail: z.object({
    token: z.string().min(1, 'El token es requerido'),
  }),

  confirmResetPassword: z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),
}),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }).refine(data => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'El refresh token es requerido'),
  }),
};



// Esquemas OAuth
export const oauthSchemas = {
  googleAuth: z.object({
    credential: z.string().min(1, 'El credential de Google es requerido'),
  }),

  facebookAuth: z.object({
    accessToken: z.string().min(1, 'El access token de Facebook es requerido'),
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
      categoryId: z.string().min(1),
      quantity: z.number().positive(),
      weight: z.number().positive().optional(),
      condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']),
      description: z.string().optional(),
      images: z.array(z.string()).optional().default([]),
      accessories: z.array(z.string()).optional().default([])
    })).min(1, 'At least one item is required'),
    
    deliveryMethod: z.enum(['pickup', 'home_collection']),
    
    // Para pickup
    pickupLocationId: z.string().optional(),
    
    // Para home collection
    collectionAddress: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string().default('Ecuador'),
      additionalInfo: z.string().optional()
    }).optional(),
    
    preferredDate: z.string().optional(),
    preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
    specialInstructions: z.string().optional()
  }),

  updateOrderStatus: z.object({
    status: z.enum([
      'pending', 'confirmed', 'in_transit', 'delivered', 
      'processing', 'completed', 'cancelled'
    ]),
    notes: z.string().optional()
  })
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

   searchQuery: z.object({
    q: z.string().min(1, 'Search term is required'),
    type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']).optional(),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
  }),

  priceCalculation: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    weight: z.number().positive('Weight must be positive').optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']),
    hasAccessories: z.boolean().optional().default(false),
    hasOriginalBox: z.boolean().optional().default(false),
    hasDocumentation: z.boolean().optional().default(false),
    additionalDetails: z.record(z.string(), z.any()).optional()
  }),

  // 🔧 NEW: Material Grade specific schemas
  materialGradeParams: z.object({
    grade: z.enum([
      'LOW_GRADE_GREEN', 'LOW_GRADE_BROWN', 'HIGH_GRADE_CIRCUIT',
      'MIXED_COMPONENTS', 'PENTIUM_III', 'PENTIUM_IV', 'MEDIUM_GRADE'
    ])
  }),

  categoryTypeParams: z.object({
    type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES'])
  }),

  searchByMaterialQuery: z.object({
    q: z.string().min(1, 'Search term is required'),
    materialGrade: z.enum([
      'LOW_GRADE_GREEN', 'LOW_GRADE_BROWN', 'HIGH_GRADE_CIRCUIT',
      'MIXED_COMPONENTS', 'PENTIUM_III', 'PENTIUM_IV', 'MEDIUM_GRADE'
    ]),
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
  }),

  quickEstimate: z.object({
    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']),
    weight: z.number().positive().optional(),
    quantity: z.number().positive().optional().default(1)
  }),

  addImages: z.object({
    images: z.array(z.object({
      url: z.string().url(),
      alt: z.string().optional(),
      type: z.enum(['reference', 'example', 'guide']).optional().default('reference')
    })).min(1, 'At least one image is required')
  }),

  // Existing schemas continue...
  createCategory: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().optional(),
    type: z.enum(['COMPLETE_DEVICES', 'DISMANTLED_DEVICES']),
    materialGrade: z.enum([
      'LOW_GRADE_GREEN', 'LOW_GRADE_BROWN', 'HIGH_GRADE_CIRCUIT',
      'MIXED_COMPONENTS', 'PENTIUM_III', 'PENTIUM_IV', 'MEDIUM_GRADE'
    ]).optional(),
    parentCategoryId: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    referenceImages: z.array(z.string()).optional().default([]),
    examples: z.array(z.string()).optional().default([]),
    estimatedWeight: z.number().positive().optional(),
    pricePerKg: z.number().positive('Price per kg must be positive'),
    pricePerUnit: z.number().positive().optional(),
    minPrice: z.number().positive('Minimum price must be positive'),
    maxPrice: z.number().positive('Maximum price must be positive'),
    acceptedConditions: z.array(z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN'])).min(1),
    requiredFields: z.array(z.string()).optional().default([]),
    conditionMultipliers: z.record(z.string(), z.number().min(0).max(1)).optional(),
    allowsQuantity: z.boolean().optional().default(true),
    requiresPhotos: z.boolean().optional().default(true),
    minPhotos: z.number().min(1).optional().default(2),
    maxPhotos: z.number().min(1).optional().default(10),
    sortOrder: z.number().int().min(0).optional().default(0),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE')
  }),

  updateCategory: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    referenceImages: z.array(z.string()).optional(),
    examples: z.array(z.string()).optional(),
    estimatedWeight: z.number().positive().optional(),
    pricePerKg: z.number().positive().optional(),
    pricePerUnit: z.number().positive().optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    acceptedConditions: z.array(z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN'])).optional(),
    requiredFields: z.array(z.string()).optional(),
    conditionMultipliers: z.record(z.string(), z.number().min(0).max(1)).optional(),
    allowsQuantity: z.boolean().optional(),
    requiresPhotos: z.boolean().optional(),
    minPhotos: z.number().min(1).optional(),
    maxPhotos: z.number().min(1).optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
  })
};

/**
 * Middleware principal de validación
 */
export const validate = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validar body si se proporciona schema
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          const errors: Record<string, string[]> = {};
          
          bodyResult.error.issues.forEach((issue: any) => {
            const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(issue.message || 'Error de validación');
          });

          logger.warn('Body validation error:', { errors, path: req.path });
          ResponseUtils.validationError(res, errors);
          return;
        }
        req.body = bodyResult.data;
      }

      // Validar query si se proporciona schema
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          const errors: Record<string, string[]> = {};
          
          queryResult.error.issues.forEach((issue: any) => {
            const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(issue.message || 'Error de validación');
          });

          logger.warn('Query validation error:', { errors, path: req.path });
          ResponseUtils.validationError(res, errors);
          return;
        }
        Object.assign(req.query, queryResult.data);
      }

      // Validar params si se proporciona schema
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          const errors: Record<string, string[]> = {};
          
          paramsResult.error.issues.forEach((issue: any) => {
            const path = Array.isArray(issue.path) ? issue.path.join('.') : 'unknown';
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(issue.message || 'Error de validación');
          });

          logger.warn('Params validation error:', { errors, path: req.path });
          ResponseUtils.validationError(res, errors);
          return;
        }
        Object.assign(req.params, paramsResult.data);
      }

      next();
    } catch (error: any) {
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
      console.log('🔍 Validating request body:', req.body);
      
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      
      console.log('✅ Validation passed, transformed data:', req.body);
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

        console.log('❌ Validation failed:', errors);
        ResponseUtils.validationError(res, errors);
        return;
      }

      console.error('❌ Unexpected validation error:', error);
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