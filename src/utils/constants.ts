// // Roles de usuario
// export const USER_ROLES = {
//   USER: 'USER',
//   ADMIN: 'ADMIN',
//   MODERATOR: 'MODERATOR',
// } as const;

// // Tipos de usuario
// export const USER_TYPES = {
//   PERSON: 'PERSON',
//   COMPANY: 'COMPANY',
// } as const;

// // Estados de usuario
// export const USER_STATUS = {
//   ACTIVE: 'ACTIVE',
//   INACTIVE: 'INACTIVE',
//   SUSPENDED: 'SUSPENDED',
//   PENDING_VERIFICATION: 'PENDING_VERIFICATION',
// } as const;

// // Estados de orden
// export const ORDER_STATUS = {
//   PENDING: 'PENDING',
//   CONFIRMED: 'CONFIRMED',
//   IN_TRANSIT: 'IN_TRANSIT',
//   DELIVERED: 'DELIVERED',
//   VERIFIED: 'VERIFIED',
//   PAID: 'PAID',
//   CANCELLED: 'CANCELLED',
// } as const;

// // Estados de pago
// export const PAYMENT_STATUS = {
//   PENDING: 'PENDING',
//   PROCESSING: 'PROCESSING',
//   COMPLETED: 'COMPLETED',
//   FAILED: 'FAILED',
//   CANCELLED: 'CANCELLED',
//   REFUNDED: 'REFUNDED',
// } as const;

// // Estados de billetera
// export const WALLET_STATUS = {
//   ACTIVE: 'ACTIVE',
//   SUSPENDED: 'SUSPENDED',
//   CLOSED: 'CLOSED',
// } as const;

// // Tipos de transacción de billetera
// export const TRANSACTION_TYPES = {
//   CREDIT: 'CREDIT',
//   DEBIT: 'DEBIT',
//   HOLD: 'HOLD',
//   RELEASE: 'RELEASE',
//   FEE: 'FEE',
// } as const;

// // Estados de transacción
// export const TRANSACTION_STATUS = {
//   PENDING: 'PENDING',
//   COMPLETED: 'COMPLETED',
//   FAILED: 'FAILED',
//   CANCELLED: 'CANCELLED',
// } as const;

// // Estados de retiro
// export const WITHDRAWAL_STATUS = {
//   PENDING: 'PENDING',
//   PROCESSING: 'PROCESSING',
//   COMPLETED: 'COMPLETED',
//   FAILED: 'FAILED',
//   CANCELLED: 'CANCELLED',
// } as const;

// // Tipos de cuenta bancaria
// export const BANK_ACCOUNT_TYPES = {
//   SAVINGS: 'SAVINGS',
//   CHECKING: 'CHECKING',
// } as const;

// // Tipos de documento
// export const DOCUMENT_TYPES = {
//   CEDULA: 'CEDULA',
//   PASSPORT: 'PASSPORT',
//   RUC: 'RUC',
// } as const;

// // Métodos de entrega
// export const DELIVERY_METHODS = {
//   PICKUP_POINT: 'PICKUP_POINT',
//   HOME_PICKUP: 'HOME_PICKUP',
// } as const;

// // Estados de categoría
// export const CATEGORY_STATUS = {
//   ACTIVE: 'ACTIVE',
//   INACTIVE: 'INACTIVE',
// } as const;

// // Tipos de notificación
// export const NOTIFICATION_TYPES = {
//   ORDER_UPDATE: 'ORDER_UPDATE',
//   PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
//   WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',
//   VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
//   SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
// } as const;

// // Estados de notificación
// export const NOTIFICATION_STATUS = {
//   UNREAD: 'UNREAD',
//   READ: 'READ',
//   ARCHIVED: 'ARCHIVED',
// } as const;

// // Configuraciones de paginación
// export const PAGINATION = {
//   DEFAULT_PAGE: 1,
//   DEFAULT_LIMIT: 10,
//   MAX_LIMIT: 100,
// } as const;

// // Configuraciones de archivos
// export const FILE_CONFIG = {
//   MAX_SIZE: 5 * 1024 * 1024, // 5MB
//   ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
//   ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
// } as const;

// // Configuraciones de rate limiting
// export const RATE_LIMITS = {
//   GENERAL: {
//     windowMs: 15 * 60 * 1000, // 15 minutos
//     max: 100, // máximo 100 requests por ventana
//   },
//   AUTH: {
//     windowMs: 15 * 60 * 1000, // 15 minutos
//     max: 6, // máximo 5 intentos de login por ventana
//   },
//   UPLOAD: {
//     windowMs: 60 * 1000, // 1 minuto
//     max: 10, // máximo 10 uploads por minuto
//   },
// } as const;

// // Configuraciones de billetera
// export const WALLET_CONFIG = {
//   MIN_WITHDRAWAL: 10.00,
//   MAX_WITHDRAWAL: 5000.00,
//   DAILY_LIMIT: 10000.00,
//   KUSHKI_FEE_PERCENTAGE: 0.035, // 3.5%
// } as const;

// // Mensajes de error comunes
// export const ERROR_MESSAGES = {
//   UNAUTHORIZED: 'No autorizado para realizar esta acción',
//   FORBIDDEN: 'Acceso denegado',
//   NOT_FOUND: 'Recurso no encontrado',
//   VALIDATION_ERROR: 'Los datos proporcionados no son válidos',
//   INTERNAL_ERROR: 'Error interno del servidor',
//   USER_NOT_FOUND: 'Usuario no encontrado',
//   INVALID_CREDENTIALS: 'Credenciales inválidas',
//   EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
//   TOKEN_EXPIRED: 'Token expirado',
//   INVALID_TOKEN: 'Token inválido',
//   INSUFFICIENT_BALANCE: 'Saldo insuficiente',
//   ORDER_NOT_FOUND: 'Orden no encontrada',
//   WALLET_NOT_FOUND: 'Billetera no encontrada',
// } as const;

// // Mensajes de éxito comunes
// export const SUCCESS_MESSAGES = {
//   USER_CREATED: 'Usuario creado exitosamente',
//   LOGIN_SUCCESS: 'Inicio de sesión exitoso',
//   LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
//   ORDER_CREATED: 'Orden creada exitosamente',
//   PAYMENT_PROCESSED: 'Pago procesado exitosamente',
//   WITHDRAWAL_CREATED: 'Retiro creado exitosamente',
//   EMAIL_SENT: 'Email enviado exitosamente',
//   PASSWORD_RESET: 'Contraseña restablecida exitosamente',
// } as const;







export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  REGISTER_SUCCESS: '¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta.',
  EMAIL_VERIFIED: 'Email verificado exitosamente',
  EMAIL_VERIFICATION_SENT: 'Email de verificación enviado',
  PASSWORD_RESET_SENT: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
  PASSWORD_RESET_SUCCESS: 'Contraseña restablecida exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  TOKENS_REFRESHED: 'Tokens renovados exitosamente',
  
  // User
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  EMAIL_UPDATED: 'Email actualizado exitosamente',
  USER_CREATED: 'Usuario creado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  USER_STATUS_UPDATED: 'Estado del usuario actualizado',
  
  // General
  OPERATION_SUCCESS: 'Operación exitosa',
  DATA_RETRIEVED: 'Datos obtenidos exitosamente',
  RESOURCE_CREATED: 'Recurso creado exitosamente',
  RESOURCE_UPDATED: 'Recurso actualizado exitosamente',
  RESOURCE_DELETED: 'Recurso eliminado exitosamente',
} as const;

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  UNAUTHORIZED: 'No autorizado. Acceso denegado.',
  TOKEN_MISSING: 'Token de acceso requerido',
  TOKEN_INVALID: 'Token de acceso inválido',
  TOKEN_EXPIRED: 'Token de acceso expirado',
  REFRESH_TOKEN_INVALID: 'Refresh token inválido',
  EMAIL_NOT_VERIFIED: 'Email no verificado',
  EMAIL_ALREADY_VERIFIED: 'El email ya ha sido verificado',
  VERIFICATION_TOKEN_INVALID: 'Token de verificación inválido o expirado',
  RESET_TOKEN_INVALID: 'Token de restablecimiento inválido o expirado',
  CURRENT_PASSWORD_INCORRECT: 'Contraseña actual incorrecta',
  
  // User status
  USER_INACTIVE: 'Usuario inactivo',
  USER_SUSPENDED: 'Usuario suspendido',
  USER_PENDING_VERIFICATION: 'Usuario pendiente de verificación',
  
  // Validation
  VALIDATION_ERROR: 'Datos de entrada inválidos',
  REQUIRED_FIELD: 'Este campo es requerido',
  EMAIL_FORMAT_INVALID: 'Formato de email inválido',
  PASSWORD_TOO_WEAK: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número',
  PHONE_FORMAT_INVALID: 'Formato de teléfono inválido',
  
  // Permissions
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes para esta acción',
  ADMIN_REQUIRED: 'Se requieren permisos de administrador',
  MODERATOR_REQUIRED: 'Se requieren permisos de moderador o superior',
  OWNER_REQUIRED: 'Solo puedes acceder a tu propio perfil',
  
  // General
  INTERNAL_ERROR: 'Error interno del servidor',
  NOT_FOUND: 'Recurso no encontrado',
  CONFLICT: 'Conflicto con el estado actual del recurso',
  TOO_MANY_REQUESTS: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  BAD_REQUEST: 'Solicitud incorrecta',
  FORBIDDEN: 'Acceso denegado',
  
  // Business logic
  COMPANY_DATA_REQUIRED: 'Los datos de empresa son requeridos para este tipo de usuario',
  INVALID_USER_TYPE: 'Tipo de usuario inválido',
  REFERRAL_CODE_INVALID: 'Código de referido inválido',
  
  // Email service
  EMAIL_SEND_FAILED: 'Error al enviar email',
  EMAIL_SERVICE_UNAVAILABLE: 'Servicio de email no disponible',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export const USER_TYPES = {
  PERSON: 'PERSON',
  COMPANY: 'COMPANY',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
} as const;

export const TOKEN_TYPES = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  CHANGE_EMAIL: 'CHANGE_EMAIL',
} as const;

export const OAUTH_PROVIDERS = {
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
} as const;

export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'ORDER_UPDATE',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  VERIFIED: 'VERIFIED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

// Configuraciones
export const CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // JWT
  ACCESS_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  
  // Verification tokens
  EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
  PASSWORD_RESET_EXPIRY: 2 * 60 * 60 * 1000, // 2 horas
  
  // File uploads
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Business rules
  MIN_WITHDRAWAL_AMOUNT: 10,
  MAX_WITHDRAWAL_AMOUNT: 10000,
  PLATFORM_FEE_PERCENTAGE: 0.03, // 3%
  
  // Referral system
  REFERRAL_BONUS: 5, // $5 USD por referido
  
} as const;

// Configuraciones de rate limiting
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 6, // máximo 5 intentos de login por ventana
  },
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 uploads por minuto
  },
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PHONE: /^\+?[1-9]\d{8,14}$/,
  REFERRAL_CODE: /^[A-Z0-9]{6,10}$/,
  ECUADORIAN_CEDULA: /^\d{10}$/,
  RUC: /^\d{13}$/,
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Eventos del sistema
export const SYSTEM_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_EMAIL_VERIFIED: 'user.email_verified',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  USER_PROFILE_UPDATED: 'user.profile_updated',
  
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  
  WITHDRAWAL_REQUESTED: 'withdrawal.requested',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
} as const;