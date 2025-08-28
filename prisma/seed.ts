import { PrismaClient, UserRole, UserType, UserStatus, CategoryStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...');

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Limpiando datos existentes...');
    await prisma.walletTransaction.deleteMany();
    await prisma.withdrawal.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.pointsTransaction.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
  }

  // 1. Crear categorías
  console.log('📱 Creando categorías...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Teléfonos Móviles',
        description: 'Smartphones, teléfonos básicos y accesorios móviles',
        pricePerKg: 12.50,
        estimatedWeight: 0.25,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        status: CategoryStatus.ACTIVE,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Laptops y Computadoras',
        description: 'Portátiles, computadoras de escritorio y componentes',
        pricePerKg: 8.75,
        estimatedWeight: 2.5,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        status: CategoryStatus.ACTIVE,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tablets',
        description: 'Tablets, e-readers y dispositivos similares',
        pricePerKg: 10.25,
        estimatedWeight: 0.6,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
        status: CategoryStatus.ACTIVE,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electrodomésticos Pequeños',
        description: 'Licuadoras, tostadoras, cafeteras y similares',
        pricePerKg: 3.50,
        estimatedWeight: 1.8,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        status: CategoryStatus.ACTIVE,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cables y Accesorios',
        description: 'Cables, cargadores, auriculares y accesorios electrónicos',
        pricePerKg: 6.00,
        estimatedWeight: 0.15,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        status: CategoryStatus.ACTIVE,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Consolas de Videojuegos',
        description: 'Consolas, controladores y accesorios de gaming',
        pricePerKg: 15.00,
        estimatedWeight: 3.2,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        status: CategoryStatus.ACTIVE,
      },
    }),
  ]);

  console.log(`✅ ${categories.length} categorías creadas`);

  // 2. Crear usuarios
  console.log('👥 Creando usuarios...');
  
  // Hash para las contraseñas
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Usuario admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@wiru.com',
      password: hashedPassword,
      firstName: 'Diego',
      lastName: 'Zambrano',
      phone: '+593999123456',
      role: UserRole.ADMIN,
      type: UserType.PERSON,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      referralCode: 'ADMIN001',
    },
  });

  // Usuarios regulares
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'usuario1@example.com',
        password: hashedPassword,
        firstName: 'María',
        lastName: 'González',
        phone: '+593987654321',
        role: UserRole.USER,
        type: UserType.PERSON,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        referralCode: 'USER001',
      },
    }),
    prisma.user.create({
      data: {
        email: 'usuario2@example.com',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'Mendoza',
        phone: '+593876543210',
        role: UserRole.USER,
        type: UserType.PERSON,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        referralCode: 'USER002',
        referredBy: 'USER001', // Referido por María
      },
    }),
    prisma.user.create({
      data: {
        email: 'empresa@example.com',
        password: hashedPassword,
        firstName: 'Ana',
        lastName: 'Silva',
        phone: '+593765432109',
        role: UserRole.USER,
        type: UserType.COMPANY,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        referralCode: 'COMP001',
        companyName: 'TechRecycle Cía. Ltda.',
        companyDocument: '1791234567001',
      },
    }),
  ]);

  console.log(`✅ ${users.length + 1} usuarios creados (incluyendo admin)`);

  // 3. Crear wallets para usuarios
  console.log('💰 Creando wallets...');
  const allUsers = [adminUser, ...users];
  
  for (const user of allUsers) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: user.role === UserRole.ADMIN ? 0 : Math.random() * 500,
        availableBalance: user.role === UserRole.ADMIN ? 0 : Math.random() * 400,
        pendingBalance: user.role === UserRole.ADMIN ? 0 : Math.random() * 100,
        currency: 'USD',
      },
    });
  }

  console.log('✅ Wallets creados para todos los usuarios');

  // 4. Crear cuentas bancarias de ejemplo
  console.log('🏦 Creando cuentas bancarias...');
  for (const user of users) {
    await prisma.bankAccount.create({
      data: {
        userId: user.id,
        bankName: 'Banco Pichincha',
        bankCode: 'PICHI', // Valor de ejemplo, ajusta según tu modelo
        accountNumber: `2100${Math.random().toString().slice(2, 10)}`,
        accountType: Math.random() > 0.5 ? 'SAVINGS' : 'CHECKING',
        accountHolderName: `${user.firstName} ${user.lastName}`,
        documentType: 'CEDULA', // Valor de ejemplo, ajusta según tu modelo
        documentNumber: `09${Math.random().toString().slice(2, 10)}`,
        isDefault: true
      },
    });
  }

  console.log('✅ Cuentas bancarias creadas');

  // 5. Crear órdenes de ejemplo
  console.log('📦 Creando órdenes de ejemplo...');
  const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'VERIFIED', 'PAID'];
  
  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const estimatedWeight = Math.random() * 5 + 0.5; // 0.5 - 5.5 kg
    const estimatedTotal = estimatedWeight * parseFloat(category.pricePerKg.toString());
    
    await prisma.order.create({
      data: {
        orderNumber: `WRU-${Date.now() + i}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        userId: user.id,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as any,
        paymentStatus: Math.random() > 0.5 ? 'PENDING' : 'COMPLETED',
        deliveryMethod: Math.random() > 0.5 ? 'HOME_PICKUP' : 'PICKUP_POINT',
        estimatedTotal,
        estimatedWeight,
        finalTotal: Math.random() > 0.5 ? estimatedTotal * (0.9 + Math.random() * 0.2) : null,
        actualWeight: Math.random() > 0.5 ? estimatedWeight * (0.9 + Math.random() * 0.2) : null,
        pickupAddress: {
          street: 'Av. de la República 123',
          city: 'Guayaquil',
          state: 'Guayas',
          zipCode: '090101',
          country: 'Ecuador',
        },
        orderItems: {
          create: {
            categoryId: category.id,
            estimatedWeight,
            pricePerKg: category.pricePerKg,
            estimatedValue: estimatedTotal,
            actualWeight: Math.random() > 0.5 ? estimatedWeight * (0.9 + Math.random() * 0.2) : null,
            actualValue: Math.random() > 0.5 ? estimatedTotal * (0.9 + Math.random() * 0.2) : null,
            images: [
              'https://images.unsplash.com/photo-1512428197675-daae5d4e1d2e?w=400',
              'https://images.unsplash.com/photo-1573883433071-fdd82b72bb4d?w=400',
            ],
            notes: i % 3 === 0 ? 'Dispositivo en buen estado, pantalla funcional' : undefined,
          },
        },
      },
    });
  }

  console.log('✅ 10 órdenes de ejemplo creadas');

  // 6. Crear transacciones de wallet de ejemplo
  console.log('💳 Creando transacciones de ejemplo...');
  for (const user of users) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (wallet) {
      const transactionTypes = ['CREDIT', 'DEBIT'];
      for (let i = 0; i < 5; i++) {
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = Math.random() * 100 + 10;
        
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: type as any,
            amount,
            balanceAfter: parseFloat(wallet.balance.toString()),
            description: type === 'CREDIT' 
              ? `Pago por orden completada` 
              : `Retiro a cuenta bancaria`,
            status: 'COMPLETED',
          },
        });
      }
    }
  }

  console.log('✅ Transacciones de ejemplo creadas');

  console.log('🎉 Seeding completado exitosamente!');
  console.log('\n📧 Credenciales de prueba:');
  console.log('Admin: admin@wiru.com / password123');
  console.log('Usuario: usuario1@example.com / password123');
  console.log('Usuario: usuario2@example.com / password123');
  console.log('Empresa: empresa@example.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });