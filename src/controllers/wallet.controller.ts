import { Request, Response } from 'express';
import prisma from '@/config/database';
import { ResponseUtils } from '@/utils/response.utils';
import { catchAsync } from '@/middleware/error.middleware';
import logger from '@/config/logger';

/**
 * Obtener wallet del usuario
 * GET /wallet/balance
 */
export const getWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        select: {
          id: true,
          type: true,
          amount: true,
          fee: true,
          balanceAfter: true,
          status: true,
          description: true,
          createdAt: true,
          order: {
            select: {
              orderNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  // Crear wallet si no existe
  if (!wallet) {
    wallet = {
      ...(await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          availableBalance: 0,
          pendingBalance: 0,
        },
      })),
      transactions: [],
    };

    logger.info('Wallet created for user', { userId });
  }

  ResponseUtils.success(res, wallet, 'Wallet obtenido exitosamente');
});

/**
 * Obtener balance simple
 * GET /wallet/balance
 */
export const getBalance = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: {
      balance: true,
      availableBalance: true,
      pendingBalance: true,
      currency: true,
      status: true,
    },
  });

  // Crear wallet si no existe
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
      },
      select: {
        balance: true,
        availableBalance: true,
        pendingBalance: true,
        currency: true,
        status: true,
      },
    });
  }

  ResponseUtils.success(res, wallet, 'Balance obtenido exitosamente');
});

/**
 * Obtener historial de transacciones
 * GET /wallet/transactions
 */
export const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;

  const skip = (page - 1) * limit;

  // Obtener wallet del usuario
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wallet) {
    ResponseUtils.notFound(res, 'Wallet no encontrado');
    return;
  }

  const where: any = { walletId: wallet.id };
  if (type) {
    where.type = type;
  }

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      select: {
        id: true,
        type: true,
        amount: true,
        fee: true,
        balanceAfter: true,
        status: true,
        description: true,
        metadata: true,
        createdAt: true,
        order: {
          select: {
            orderNumber: true,
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  ResponseUtils.success(res, { transactions, pagination }, 'Transacciones obtenidas');
});

/**
 * Crear transacción (uso interno - admin o sistema)
 * POST /wallet/transaction
 */
export const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const { userId, type, amount, orderId, description, metadata } = req.body;

  // Obtener o crear wallet
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
      },
    });
  }

  // Calcular nuevo balance
  let newBalance = parseFloat(wallet.balance.toString());
  let newAvailableBalance = parseFloat(wallet.availableBalance.toString());
  let newPendingBalance = parseFloat(wallet.pendingBalance.toString());

  switch (type) {
    case 'CREDIT':
      newBalance += amount;
      newAvailableBalance += amount;
      break;
    case 'DEBIT':
      if (newAvailableBalance < amount) {
        return ResponseUtils.badRequest(res, 'Balance insuficiente');
      }
      newBalance -= amount;
      newAvailableBalance -= amount;
      break;
    case 'HOLD':
      if (newAvailableBalance < amount) {
        return ResponseUtils.badRequest(res, 'Balance insuficiente para retener');
      }
      newAvailableBalance -= amount;
      newPendingBalance += amount;
      break;
    case 'RELEASE':
      newAvailableBalance += amount;
      newPendingBalance -= amount;
      break;
  }

  // Crear transacción y actualizar wallet en una transacción
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet!.id,
        orderId,
        type,
        amount,
        balanceAfter: newBalance,
        description,
        metadata,
        status: 'COMPLETED',
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet!.id },
      data: {
        balance: newBalance,
        availableBalance: newAvailableBalance,
        pendingBalance: newPendingBalance,
      },
    });

    return { transaction, wallet: updatedWallet };
  });

  logger.info('Wallet transaction created', { 
    userId,
    transactionId: result.transaction.id,
    type,
    amount,
    newBalance: result.wallet.balance
  });

  return ResponseUtils.created(res, result, 'Transacción creada exitosamente');
});

/**
 * Solicitar retiro
 * POST /wallet/withdraw
 */
export const requestWithdrawal = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { amount, bankAccountId, notes } = req.body;

  // Verificar wallet y balance disponible
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    ResponseUtils.notFound(res, 'Wallet no encontrado');
    return;
  }

  if (parseFloat(wallet.availableBalance.toString()) < amount) {
    return ResponseUtils.badRequest(res, 'Balance insuficiente para retiro');
  }

  // Verificar cuenta bancaria
  const bankAccount = await prisma.bankAccount.findUnique({
    where: { 
      id: bankAccountId,
      userId,
    },
  });

  if (!bankAccount) {
    return ResponseUtils.notFound(res, 'Cuenta bancaria no encontrada');
  }

  // Crear solicitud de retiro
  const withdrawal = await prisma.$transaction(async (tx) => {
    // Crear el retiro
    const newWithdrawal = await tx.withdrawal.create({
      data: {
        walletId: wallet.id,
        bankAccountId,
        amount,
        status: 'PENDING',
        kushkiFee: 0.35,
        netAmount: amount - 0.35,
      },
    });

    // Retener el monto (HOLD)
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'HOLD',
        amount,
        balanceAfter: parseFloat(wallet.balance.toString()),
        description: `Retención para retiro ${newWithdrawal.id}`,
        status: 'COMPLETED',
      },
    });

    // Actualizar balances del wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: parseFloat(wallet.availableBalance.toString()) - amount,
        pendingBalance: parseFloat(wallet.pendingBalance.toString()) + amount,
      },
    });

    return newWithdrawal;
  });

  logger.info('Withdrawal requested', { 
    userId,
    withdrawalId: withdrawal.id,
    amount
  });

  return ResponseUtils.created(res, withdrawal, 'Solicitud de retiro creada exitosamente');
});

/**
 * Obtener historial de retiros
 * GET /wallet/withdrawals
 */
export const getWithdrawals = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const skip = (page - 1) * limit;

  // Obtener wallet del usuario
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wallet) {
    return ResponseUtils.notFound(res, 'Wallet no encontrado');
  }

  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { walletId: wallet.id },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        // processedAt: true,
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
            accountType: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.withdrawal.count({ where: { walletId: wallet.id } }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return ResponseUtils.success(res, { withdrawals, pagination }, 'Historial de retiros obtenido');
});

/**
 * Procesar retiro (admin)
 * PUT /wallet/withdrawals/:id/process
 */
export const processWithdrawal = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, kushkiTransactionId, notes } = req.body;

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id },
    include: { wallet: true },
  });

  if (!withdrawal) {
    return ResponseUtils.notFound(res, 'Retiro no encontrado');
  }

  if (withdrawal.status !== 'PENDING') {
    return ResponseUtils.badRequest(res, 'El retiro ya ha sido procesado');
  }

  const updatedWithdrawal = await prisma.$transaction(async (tx) => {
    // Actualizar el retiro
    const updated = await tx.withdrawal.update({
      where: { id },
      data: {
        status,
        // processedAt: new Date(),
      },
    });

    const wallet = withdrawal.wallet;
    const amount = parseFloat(withdrawal.amount.toString());

    if (status === 'COMPLETED') {
      // Liberar el monto retenido y completar la transacción
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount,
          balanceAfter: parseFloat(wallet.balance.toString()) - amount,
          description: `Retiro completado ${id}`,
          status: 'COMPLETED',
        },
      });

      // Actualizar balances del wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: parseFloat(wallet.balance.toString()) - amount,
          pendingBalance: parseFloat(wallet.pendingBalance.toString()) - amount,
        },
      });
    } else if (status === 'FAILED') {
      // Liberar el monto retenido de vuelta al balance disponible
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'RELEASE',
          amount,
          balanceAfter: parseFloat(wallet.balance.toString()),
          description: `Retiro fallido ${id} - fondos liberados`,
          status: 'COMPLETED',
        },
      });

      // Actualizar balances del wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: parseFloat(wallet.availableBalance.toString()) + amount,
          pendingBalance: parseFloat(wallet.pendingBalance.toString()) - amount,
        },
      });
    }

    return updated;
  });

  logger.info('Withdrawal processed', { 
    withdrawalId: id,
    status,
    processedBy: (req as any).user?.id
  });

  return ResponseUtils.success(res, updatedWithdrawal, 'Retiro procesado exitosamente');
});

/**
 * Obtener estadísticas de wallet (admin)
 * GET /wallet/admin/stats
 */
export const getWalletStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await prisma.$transaction(async (tx) => {
    const [
      totalWallets,
      activeWallets,
      totalBalance,
      totalAvailableBalance,
      totalPendingBalance,
      totalTransactions,
      totalWithdrawals,
      pendingWithdrawals,
      completedWithdrawals
    ] = await Promise.all([
      tx.wallet.count(),
      tx.wallet.count({ where: { status: 'ACTIVE' } }),
      tx.wallet.aggregate({
        _sum: { balance: true }
      }),
      tx.wallet.aggregate({
        _sum: { availableBalance: true }
      }),
      tx.wallet.aggregate({
        _sum: { pendingBalance: true }
      }),
      tx.walletTransaction.count(),
      tx.withdrawal.count(),
      tx.withdrawal.count({ where: { status: 'PENDING' } }),
      tx.withdrawal.count({ where: { status: 'COMPLETED' } })
    ]);

    return {
      totalWallets,
      activeWallets,
      totalBalance: totalBalance._sum.balance || 0,
      totalAvailableBalance: totalAvailableBalance._sum.availableBalance || 0,
      totalPendingBalance: totalPendingBalance._sum.pendingBalance || 0,
      totalTransactions,
      totalWithdrawals,
      pendingWithdrawals,
      completedWithdrawals,
    };
  });

  ResponseUtils.success(res, stats, 'Estadísticas de wallets obtenidas');
});