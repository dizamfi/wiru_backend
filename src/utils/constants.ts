// Roles de usuario
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

// Tipos de usuario
export const USER_TYPES = {
  PERSON: 'PERSON',
  COMPANY: 'COMPANY',
} as const;

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
} as const;

// Estados de orden
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  VERIFIED: 'VERIFIED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

// Estados de billetera
export const WALLET_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CLOSED: 'CLOSED',
} as const;

// Tipos de transacción de billetera
export const TRANSACTION_TYPES = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
  HOLD: 'HOLD',
  RELEASE: 'RELEASE',
  FEE: 'FEE',
} as const;

// Estados de transacción
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// Estados de retiro
export const WITHDRAWAL_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// Tipos de cuenta bancaria
export const BANK_ACCOUNT_TYPES = {
  SAVINGS: 'SAVINGS',
  CHECKING: 'CHECKING',
} as const;

// Tipos de documento
export const DOCUMENT_TYPES = {
  CEDULA: 'CEDULA',
  PASSPORT: 'PASSPORT',
  RUC: 'RUC',
} as const;

// Métodos de entrega
export const DELIVERY_METHODS = {
  PICKUP_POINT: 'PICKUP_POINT',
  HOME_PICKUP: 'HOME_PICKUP',
} as const;

// Estados de categoría
export const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'ORDER_UPDATE',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  WITHDRAWAL_COMPLETED: 'WITHDRAWAL_COMPLETED',
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
} as const;

// Estados de notificación
export const NOTIFICATION_STATUS = {
  UNREAD: 'UNREAD',
  READ: 'READ',
  ARCHIVED: 'ARCHIVED',
} as const;

// Configuraciones de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Configuraciones de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
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

// Configuraciones de billetera
export const WALLET_CONFIG = {
  MIN_WITHDRAWAL: 10.00,
  MAX_WITHDRAWAL: 5000.00,
  DAILY_LIMIT: 10000.00,
  KUSHKI_FEE_PERCENTAGE: 0.035, // 3.5%
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado para realizar esta acción',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos',
  INTERNAL_ERROR: 'Error interno del servidor',
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  TOKEN_EXPIRED: 'Token expirado',
  INVALID_TOKEN: 'Token inválido',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  ORDER_NOT_FOUND: 'Orden no encontrada',
  WALLET_NOT_FOUND: 'Billetera no encontrada',
} as const;

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuario creado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  ORDER_CREATED: 'Orden creada exitosamente',
  PAYMENT_PROCESSED: 'Pago procesado exitosamente',
  WITHDRAWAL_CREATED: 'Retiro creado exitosamente',
  EMAIL_SENT: 'Email enviado exitosamente',
  PASSWORD_RESET: 'Contraseña restablecida exitosamente',
} as const;