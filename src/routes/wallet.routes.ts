import { Router } from 'express';

// Importar middleware
import { validateBody, validateParams, validateQuery, walletSchemas, commonSchemas } from '@/middleware/validation.middleware';
import { authenticate, requireEmailVerified, requireUserType } from '@/middleware/auth.middleware';
import { walletRateLimit, withdrawalRateLimit } from '@/middleware/rateLimit.middleware';

// Importar controladores (los crearemos después)
// import * as walletController from '@/controllers/wallet.controller';

const router = Router();

// Aplicar autenticación y verificación de email a todas las rutas
router.use(authenticate);
router.use(requireEmailVerified);
router.use(requireUserType('PERSON')); // Solo usuarios tipo PERSON tienen billetera

// === RUTAS DE BILLETERA ===

/**
 * GET /wallet/balance
 * Obtener balance de la billetera
 */
router.get(
  '/balance',
  // walletController.getBalance
  (req, res) => {
    res.json({
      success: true,
      message: 'Balance de billetera - En desarrollo',
      data: {
        userId: (req as any).user?.id,
        balance: 150.75,
        availableBalance: 140.25,
        pendingBalance: 10.50,
        currency: 'USD'
      }
    });
  }
);

/**
 * GET /wallet/transactions
 * Obtener historial de transacciones
 */
router.get(
  '/transactions',
  validateQuery(commonSchemas.pagination),
  // walletController.getTransactions
  (req, res) => {
    res.json({
      success: true,
      message: 'Historial de transacciones - En desarrollo',
      data: {
        transactions: [
          {
            id: 'tx_123',
            type: 'CREDIT',
            amount: 45.50,
            description: 'Pago por orden ORD-123',
            status: 'COMPLETED',
            createdAt: new Date().toISOString()
          }
        ],
        pagination: {
          page: req.query.page || 1,
          limit: req.query.limit || 10,
          total: 1,
          totalPages: 1
        }
      }
    });
  }
);

// === RUTAS DE CUENTAS BANCARIAS ===

/**
 * GET /wallet/bank-accounts
 * Obtener cuentas bancarias del usuario
 */
router.get(
  '/bank-accounts',
  // walletController.getBankAccounts
  (req, res) => {
    res.json({
      success: true,
      message: 'Cuentas bancarias - En desarrollo',
      data: {
        bankAccounts: [
          {
            id: 'ba_123',
            bankName: 'Banco Pichincha',
            accountNumber: '****1234',
            accountType: 'SAVINGS',
            isDefault: true,
            isVerified: true
          }
        ]
      }
    });
  }
);

/**
 * POST /wallet/bank-accounts
 * Agregar nueva cuenta bancaria
 */
router.post(
  '/bank-accounts',
  walletRateLimit,
  validateBody(walletSchemas.addBankAccount),
  // walletController.addBankAccount
  (req, res) => {
    res.json({
      success: true,
      message: 'Cuenta bancaria agregada - En desarrollo',
      data: {
        userId: (req as any).user?.id,
        bankAccount: {
          id: 'ba_new',
          ...req.body,
          accountNumber: '****' + req.body.accountNumber.slice(-4),
          isVerified: false
        }
      }
    });
  }
);

/**
 * PUT /wallet/bank-accounts/:id/default
 * Establecer cuenta bancaria como predeterminada
 */
router.put(
  '/bank-accounts/:id/default',
  validateParams(commonSchemas.id),
  // walletController.setDefaultBankAccount
  (req, res) => {
    res.json({
      success: true,
      message: 'Cuenta bancaria predeterminada actualizada - En desarrollo',
      data: { bankAccountId: req.params.id }
    });
  }
);

/**
 * DELETE /wallet/bank-accounts/:id
 * Eliminar cuenta bancaria
 */
router.delete(
  '/bank-accounts/:id',
  validateParams(commonSchemas.id),
  // walletController.deleteBankAccount
  (req, res) => {
    res.json({
      success: true,
      message: 'Cuenta bancaria eliminada - En desarrollo',
      data: { bankAccountId: req.params.id }
    });
  }
);

// === RUTAS DE RETIROS ===

/**
 * POST /wallet/withdraw
 * Crear solicitud de retiro
 */
router.post(
  '/withdraw',
  withdrawalRateLimit,
  validateBody(walletSchemas.withdrawal),
  // walletController.createWithdrawal
  (req, res) => {
    res.json({
      success: true,
      message: 'Solicitud de retiro creada - En desarrollo',
      data: {
        withdrawalId: 'wd_123',
        amount: req.body.amount,
        kushkiFee: req.body.amount * 0.035,
        netAmount: req.body.amount * 0.965,
        status: 'PENDING',
        estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }
);

/**
 * GET /wallet/withdrawals
 * Obtener historial de retiros
 */
router.get(
  '/withdrawals',
  validateQuery(commonSchemas.pagination),
  // walletController.getWithdrawals
  (req, res) => {
    res.json({
      success: true,
      message: 'Historial de retiros - En desarrollo',
      data: {
        withdrawals: [
          {
            id: 'wd_123',
            amount: 100.00,
            kushkiFee: 3.50,
            netAmount: 96.50,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
            completedDate: new Date().toISOString()
          }
        ],
        pagination: {
          page: req.query.page || 1,
          limit: req.query.limit || 10,
          total: 1,
          totalPages: 1
        }
      }
    });
  }
);

/**
 * GET /wallet/withdrawals/:id
 * Obtener detalles de un retiro específico
 */
router.get(
  '/withdrawals/:id',
  validateParams(commonSchemas.id),
  // walletController.getWithdrawalById
  (req, res) => {
    res.json({
      success: true,
      message: 'Detalles del retiro - En desarrollo',
      data: {
        withdrawal: {
          id: req.params.id,
          amount: 100.00,
          kushkiFee: 3.50,
          netAmount: 96.50,
          status: 'PROCESSING',
          kushkiTransferId: 'kt_456',
          bankAccount: {
            bankName: 'Banco Pichincha',
            accountNumber: '****1234'
          },
          createdAt: new Date().toISOString()
        }
      }
    });
  }
);

/**
 * DELETE /wallet/withdrawals/:id
 * Cancelar retiro (solo si está en estado PENDING)
 */
router.delete(
  '/withdrawals/:id',
  validateParams(commonSchemas.id),
  // walletController.cancelWithdrawal
  (req, res) => {
    res.json({
      success: true,
      message: 'Retiro cancelado - En desarrollo',
      data: { withdrawalId: req.params.id }
    });
  }
);

// === RUTAS DE INFORMACIÓN ===

/**
 * GET /wallet/limits
 * Obtener límites de retiro
 */
router.get(
  '/limits',
  // walletController.getWithdrawalLimits
  (req, res) => {
    res.json({
      success: true,
      message: 'Límites de retiro - En desarrollo',
      data: {
        minAmount: 10.00,
        maxAmount: 5000.00,
        dailyLimit: 10000.00,
        weeklyLimit: 20000.00,
        monthlyLimit: 50000.00,
        kushkiFeePercentage: 3.5
      }
    });
  }
);

/**
 * GET /wallet/fees
 * Obtener información de tarifas
 */
router.get(
  '/fees',
  // walletController.getFees
  (req, res) => {
    res.json({
      success: true,
      message: 'Información de tarifas - En desarrollo',
      data: {
        withdrawalFee: {
          percentage: 3.5,
          minimum: 1.00,
          maximum: 50.00
        },
        currency: 'USD'
      }
    });
  }
);

export default router;