// import { Router } from 'express';

// // Importar rutas específicas
// import authRoutes from './auth.routes';
// import userRoutes from './users.routes';
// import walletRoutes from './wallet.routes';
// import orderRoutes from './orders.routes';
// import categoryRoutes from './categories.routes';
// import uploadRoutes from './upload.routes';
// import webhookRoutes from './webhooks.routes';
// // import paymentRoutes from './payments.routes';
// // import adminRoutes from './admin.routes';

// const router = Router();

// // Ruta de diagnóstico para verificar que todas las rutas estén cargadas
// router.get('/debug/routes', (req, res) => {
//   const routes: any[] = [];
  
//   // Función recursiva para extraer rutas
//   function extractRoutes(stack: any[], basePath = '') {
//     stack.forEach((layer: any) => {
//       if (layer.route) {
//         // Ruta directa
//         const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
//         routes.push({
//           path: basePath + layer.route.path,
//           methods: methods,
//           type: 'route'
//         });
//       } else if (layer.name === 'router' && layer.handle.stack) {
//         // Sub-router
//         const match = layer.regexp.toString().match(/^\/\^\\?(.*?)\\\?\$/);
//         const routerPath = match ? match[1].replace(/\\\//g, '/') : '';
//         extractRoutes(layer.handle.stack, basePath + routerPath);
//       }
//     });
//   }

//   // Extraer rutas del router actual
//   if ((router as any).stack) {
//     extractRoutes((router as any).stack, '/api/v1');
//   }

//   res.json({
//     success: true,
//     message: 'Diagnóstico de rutas',
//     data: {
//       totalRoutes: routes.length,
//       routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
//       loadedModules: {
//         auth: !!authRoutes,
//         users: !!userRoutes,
//         wallet: !!walletRoutes,
//         orders: !!orderRoutes,
//         categories: !!categoryRoutes,
//         upload: !!uploadRoutes,
//         webhooks: !!webhookRoutes
//       }
//     }
//   });
// });
// router.get('/status', (req, res) => {
//   res.json({
//     success: true,
//     message: 'API funcionando correctamente',
//     timestamp: new Date().toISOString(),
//     routes: {
//       auth: '/auth',
//       users: '/users',
//       wallet: '/wallet',
//       orders: '/orders',
//       categories: '/categories',
//       upload: '/upload',
//       webhooks: '/webhooks',
//       payments: '/payments',
//       admin: '/admin'
//     }
//   });
// });

// // Montar rutas específicas
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/wallet', walletRoutes);
// router.use('/orders', orderRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/upload', uploadRoutes);
// router.use('/webhooks', webhookRoutes);
// // router.use('/payments', paymentRoutes);
// // router.use('/admin', adminRoutes);

// export default router;




import { Router } from 'express';

// Importar rutas específicas
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import walletRoutes from './wallet.routes';
import orderRoutes from './orders.routes';
import categoryRoutes from './categories.routes';
import uploadRoutes from './upload.routes';
import webhookRoutes from './webhooks.routes';
// import paymentRoutes from './payments.routes';
// import adminRoutes from './admin.routes';

const router = Router();

// Ruta de diagnóstico para verificar que todas las rutas estén cargadas
router.get('/debug/routes', (req, res) => {
  const routes: any[] = [];
  
  // Función recursiva para extraer rutas
  function extractRoutes(stack: any[], basePath = '') {
    stack.forEach((layer: any) => {
      if (layer.route) {
        // Ruta directa
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({
          path: basePath + layer.route.path,
          methods: methods,
          type: 'route'
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Sub-router
        const match = layer.regexp.toString().match(/^\/\^\\?(.*?)\\\?\$/);
        const routerPath = match ? match[1].replace(/\\\//g, '/') : '';
        extractRoutes(layer.handle.stack, basePath + routerPath);
      }
    });
  }

  // Extraer rutas del router actual
  if ((router as any).stack) {
    extractRoutes((router as any).stack, '/api/v1');
  }

  res.json({
    success: true,
    message: 'Diagnóstico de rutas',
    data: {
      totalRoutes: routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
      loadedModules: {
        auth: !!authRoutes,
        users: !!userRoutes,
        wallet: !!walletRoutes,
        orders: !!orderRoutes,
        categories: !!categoryRoutes,
        upload: !!uploadRoutes,
        webhooks: !!webhookRoutes
      }
    }
  });
});
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/auth',
      users: '/users',
      wallet: '/wallet',
      orders: '/orders',
      categories: '/categories',
      upload: '/upload',
      webhooks: '/webhooks',
      payments: '/payments',
      admin: '/admin'
    }
  });
});

// Montar rutas específicas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/webhooks', webhookRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/admin', adminRoutes);

// Middleware para rutas no encontradas dentro de /api/v1
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada en la API`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/v1/status',
      '/api/v1/debug/routes', 
      '/api/v1/categories',
      '/api/v1/auth/*',
      '/api/v1/users/*',
      '/api/v1/wallet/*',
      '/api/v1/orders/*',
      '/api/v1/upload/*',
      '/api/v1/webhooks/*'
    ]
  });
});

export default router;