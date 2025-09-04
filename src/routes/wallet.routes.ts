import { Router } from 'express';

// Importar middleware
import { validateBody, validateParams, validateQuery, walletSchemas, commonSchemas } from '@/middleware/validation.middleware';
import { authenticate, requireEmailVerified, requireAdmin } from '@/middleware/auth.middleware';
import { walletRateLimit, withdrawalRateLimit } from '@/middleware/rateLimit.middleware';

// Importar controladores REALES
import * as walletController from '@/controllers/wallet.controller';
import { processWithdrawal } from '../controllers/wallet.controller';

const router = Router();

// Aplicar autenticación y verificación de email a todas las rutas
router.use(authenticate);
router.use(requireEmailVerified);

// === RUTAS DE BILLETERA PERSONAL ===

/**
 * GET /wallet
 * Obtener wallet completo con transacciones recientes
 */
router.get('/', walletController.getWallet);

/**
 * GET /wallet/balance
 * Obtener solo el balance de la billetera
 */
router.get('/balance', walletController.getBalance);

/**
 * GET /wallet/transactions
 * Obtener historial de transacciones
 */
router.get(
  '/transactions',
  validateQuery(commonSchemas.pagination),
  walletController.getTransactions
);

/**
 * POST /wallet/withdraw
 * Solicitar retiro de fondos
 */
router.post(
  '/withdraw',
  withdrawalRateLimit,
  validateBody(walletSchemas.withdraw),
  walletController.requestWithdrawal
);

/**
 * GET /wallet/withdrawals
 * Obtener historial de retiros
 */
router.get(
  '/withdrawals',
  validateQuery(commonSchemas.pagination),
  walletController.getWithdrawals
);

// === RUTAS ADMINISTRATIVAS ===

/**
 * POST /wallet/transaction
 * Crear transacción manual (solo admins)
 */
router.post(
  '/transaction',
  requireAdmin,
  validateBody(walletSchemas.createTransaction),
  walletController.createTransaction
);

/**
 * PUT /wallet/withdrawals/:id/process
 * Procesar solicitud de retiro (solo admins)
 */
router.put(
  '/withdrawals/:id/process',
  requireAdmin,
  validateParams(commonSchemas.id),
  validateBody(walletSchemas.processWithdrawal),
  walletController.processWithdrawal
);

/**
 * GET /wallet/admin/stats
 * Obtener estadísticas de wallets (solo admins)
 */
router.get(
  '/admin/stats',
  requireAdmin,
  walletController.getWalletStats
);

export default router;