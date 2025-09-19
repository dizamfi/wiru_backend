// // prisma/seed-categories-hierarchical.ts

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Estructura de categorías jerárquicas
// const categoryStructure = {
//   name: 'Dispositivos Desarmables',
//   slug: 'dispositivos-desarmables',
//   type: 'DISMANTLED_DEVICES',
//   description: 'Dispositivos electrónicos que pueden ser desarmados para recuperar componentes valiosos',
//   color: '#10B981',
//   icon: 'fas fa-microchip',
//   children: [
//     {
//       name: 'Bajo Grado',
//       slug: 'bajo-grado',
//       description: 'Componentes de bajo valor con materiales básicos',
//       color: '#8B5CF6',
//       icon: 'fas fa-layer-group',
//       children: [
//         {
//           name: 'Marrón',
//           slug: 'marron',
//           description: 'Boards de color marrón, generalmente de equipos antiguos',
//           isLeaf: true,
//           pricePerKg: 2.50,
//           color: '#8B4513',
//           images: [
//             'https://example.com/images/categories/marron-1.jpg',
//             'https://example.com/images/categories/marron-2.jpg'
//           ],
//           thumbnailImage: 'https://example.com/images/categories/marron-thumb.jpg'
//         },
//         {
//           name: 'Verde',
//           slug: 'verde',
//           description: 'Boards de color verde básico, componentes estándar',
//           isLeaf: true,
//           pricePerKg: 3.00,
//           color: '#22C55E',
//           images: [
//             'https://example.com/images/categories/verde-1.jpg',
//             'https://example.com/images/categories/verde-2.jpg'
//           ],
//           thumbnailImage: 'https://example.com/images/categories/verde-thumb.jpg'
//         }
//       ]
//     },
//     {
//       name: 'Pentium III',
//       slug: 'pentium-iii',
//       description: 'Boards y componentes de la era Pentium III',
//       color: '#F59E0B',
//       icon: 'fas fa-memory',
//       children: [
//         {
//           name: 'Verde/Amarillo',
//           slug: 'verde-amarillo',
//           description: 'Boards verdes con componentes amarillos de Pentium III',
//           isLeaf: true,
//           pricePerKg: 12.00,
//           color: '#84CC16',
//           images: [
//             'https://example.com/images/categories/p3-verde-amarillo-1.jpg'
//           ]
//         },
//         {
//           name: 'Color',
//           slug: 'color',
//           description: 'Boards de colores variados de Pentium III',
//           isLeaf: true,
//           pricePerKg: 10.00,
//           color: '#EC4899'
//         },
//         {
//           name: 'Doble Socket',
//           slug: 'doble-socket',
//           description: 'Motherboards con doble socket de Pentium III',
//           isLeaf: true,
//           pricePerKg: 15.00,
//           color: '#8B5CF6'
//         }
//       ]
//     },
//     {
//       name: 'Pentium IV',
//       slug: 'pentium-iv',
//       description: 'Boards y componentes de la era Pentium IV',
//       color: '#EF4444',
//       icon: 'fas fa-microchip',
//       children: [
//         {
//           name: 'Verdes 2 Chip',
//           slug: 'verdes-2-chip',
//           description: 'Boards verdes con 2 chips principales',
//           isLeaf: true,
//           pricePerKg: 8.50,
//           color: '#059669'
//         },
//         {
//           name: 'Colores 1 Chip',
//           slug: 'colores-1-chip',
//           description: 'Boards de colores con 1 chip principal',
//           isLeaf: true,
//           pricePerKg: 6.00,
//           color: '#DC2626'
//         },
//         {
//           name: 'Verdes 1 Chip',
//           slug: 'verdes-1-chip',
//           description: 'Boards verdes con 1 chip principal',
//           isLeaf: true,
//           pricePerKg: 7.00,
//           color: '#16A34A'
//         },
//         {
//           name: 'Chinas',
//           slug: 'chinas',
//           description: 'Boards de fabricación china, calidad estándar',
//           isLeaf: true,
//           pricePerKg: 4.50,
//           color: '#F97316'
//         },
//         {
//           name: 'Doble Socket',
//           slug: 'p4-doble-socket',
//           description: 'Motherboards Pentium IV con doble socket',
//           isLeaf: true,
//           pricePerKg: 12.00,
//           color: '#7C3AED'
//         }
//       ]
//     },
//     {
//       name: 'Medio Grado',
//       slug: 'medio-grado',
//       description: 'Componentes de valor medio con materiales mixtos',
//       color: '#0EA5E9',
//       icon: 'fas fa-layer-group',
//       children: [
//         {
//           name: 'Boards Tipo 1',
//           slug: 'boards-tipo-1',
//           description: 'Boards de primera categoría, alta densidad de componentes',
//           color: '#0284C7',
//           children: [
//             {
//               name: 'Tablet',
//               slug: 'tablet',
//               description: 'Motherboards de tablets',
//               isLeaf: true,
//               pricePerKg: 25.00,
//               color: '#0369A1'
//             },
//             {
//               name: 'Laptop',
//               slug: 'laptop',
//               description: 'Motherboards de laptops',
//               isLeaf: true,
//               pricePerKg: 30.00,
//               color: '#075985'
//             },
//             {
//               name: 'Lectora',
//               slug: 'lectora',
//               description: 'Boards de lectores ópticos',
//               isLeaf: true,
//               pricePerKg: 18.00,
//               color: '#0C4A6E'
//             }
//           ]
//         },
//         {
//           name: 'Boards Tipo 2',
//           slug: 'boards-tipo-2',
//           description: 'Boards de segunda categoría',
//           color: '#06B6D4',
//           children: [
//             {
//               name: 'Impresora',
//               slug: 'impresora',
//               description: 'Motherboards de impresoras',
//               isLeaf: true,
//               pricePerKg: 15.00,
//               color: '#0891B2'
//             },
//             {
//               name: 'Modem',
//               slug: 'modem',
//               description: 'Boards de modems y equipos de red',
//               color: '#0E7490',
//               children: [
//                 {
//                   name: 'Decodificador Buena',
//                   slug: 'decodificador-buena',
//                   description: 'Decodificadores en buen estado',
//                   isLeaf: true,
//                   pricePerKg: 20.00,
//                   color: '#155E75'
//                 },
//                 {
//                   name: 'Decodificador Mala',
//                   slug: 'decodificador-mala',
//                   description: 'Decodificadores en mal estado',
//                   isLeaf: true,
//                   pricePerKg: 12.00,
//                   color: '#164E63'
//                 }
//               ]
//             }
//           ]
//         },
//         {
//           name: 'Boards Tipo 3',
//           slug: 'boards-tipo-3',
//           description: 'Boards de tercera categoría, componentes básicos',
//           isLeaf: true,
//           pricePerKg: 8.00,
//           color: '#0F766E'
//         },
//         {
//           name: 'Centrales Telefónicas',
//           slug: 'centrales-telefonicas',
//           description: 'Equipment de centrales telefónicas',
//           isLeaf: true,
//           pricePerKg: 22.00,
//           color: '#059669'
//         },
//         {
//           name: 'Centrales Intermedias',
//           slug: 'centrales-intermedias',
//           description: 'Equipment intermedio de telecomunicaciones',
//           isLeaf: true,
//           pricePerKg: 18.00,
//           color: '#047857'
//         }
//       ]
//     },
//     {
//       name: 'Alto Grado',
//       slug: 'alto-grado',
//       description: 'Componentes de alto valor con materiales preciosos',
//       isLeaf: true,
//       pricePerKg: 45.00,
//       color: '#DC2626',
//       icon: 'fas fa-gem',
//       images: [
//         'https://example.com/images/categories/alto-grado-1.jpg',
//         'https://example.com/images/categories/alto-grado-2.jpg'
//       ],
//       thumbnailImage: 'https://example.com/images/categories/alto-grado-thumb.jpg'
//     }
//   ]
// };

// async function createCategoryHierarchy(categoryData: any, parentId: string | null = null, level: number = 0, parentPath: string[] = []) {
//   const currentPath = [...parentPath, categoryData.slug];
//   const fullPath = currentPath.join('/');
  
//   console.log(`Creating category: ${categoryData.name} (Level: ${level})`);
  
//   const category = await prisma.category.create({
//     data: {
//       name: categoryData.name,
//       slug: categoryData.slug,
//       description: categoryData.description || '',
//       type: categoryData.type || 'DISMANTLED_DEVICES',
//       parentId: parentId,
//       level: level,
//       path: currentPath,
//       fullPath: fullPath,
//       isLeaf: categoryData.isLeaf || false,
//       sortOrder: categoryData.sortOrder || 0,
//       icon: categoryData.icon,
//       color: categoryData.color,
//       images: categoryData.images || [],
//       thumbnailImage: categoryData.thumbnailImage,
//       ...(categoryData.pricePerKg !== undefined && {
//         pricePerKg: parseFloat(categoryData.pricePerKg.toString())
//       }),
//       minWeight: categoryData.minWeight ? parseFloat(categoryData.minWeight.toString()) : null,
//       maxWeight: categoryData.maxWeight ? parseFloat(categoryData.maxWeight.toString()) : null,
//       metadata: categoryData.metadata || {},
//       status: 'ACTIVE'
//     }
//   });

//   // Crear hijos recursivamente
//   if (categoryData.children) {
//     for (const childData of categoryData.children) {
//       await createCategoryHierarchy(childData, category.id, level + 1, currentPath);
//     }
//   }

//   return category;
// }

// async function seedCategories() {
//   console.log('🌱 Starting categories seeding...');

//   try {
//     // Limpiar categorías existentes (opcional)
//     console.log('🗑️  Cleaning existing categories...');
//     await prisma.orderItem.deleteMany({});
//     await prisma.category.deleteMany({});

//     // Crear estructura jerárquica
//     console.log('📋 Creating category hierarchy...');
//     await createCategoryHierarchy(categoryStructure);

//     console.log('✅ Categories seeded successfully!');

//     // Mostrar resumen
//     const totalCategories = await prisma.category.count();
//     const leafCategories = await prisma.category.count({ where: { isLeaf: true } });
    
//     console.log(`📊 Summary:`);
//     console.log(`   Total categories: ${totalCategories}`);
//     console.log(`   Leaf categories: ${leafCategories}`);
//     console.log(`   Branch categories: ${totalCategories - leafCategories}`);

//   } catch (error) {
//     console.error('❌ Error seeding categories:', error);
//     throw error;
//   }
// }

// async function main() {
//   await seedCategories();
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// export default main;





// prisma/seed-categories-hierarchical.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estructura de categorías jerárquicas - AMBOS TIPOS
const categoryStructures = [
  // ==========================================
  // DISPOSITIVOS COMPLETOS
  // ==========================================
  {
    name: 'Dispositivos Completos',
    slug: 'dispositivos-completos',
    type: 'COMPLETE_DEVICES',
    description: 'Dispositivos electrónicos completos y funcionales que se evalúan como unidad completa',
    color: '#3B82F6',
    icon: 'fas fa-laptop',
    children: [
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Computadoras portátiles de todas las marcas y especificaciones',
        color: '#1E40AF',
        icon: 'fas fa-laptop',
        children: [
          {
            name: 'MacBooks',
            slug: 'macbooks',
            description: 'Laptops Apple MacBook (Air, Pro, todas las generaciones)',
            isLeaf: true,
            pricePerKg: 850.00,
            color: '#6B7280',
            images: [
              'https://example.com/images/macbook-1.jpg',
              'https://example.com/images/macbook-2.jpg'
            ],
            thumbnailImage: 'https://example.com/images/macbook-thumb.jpg',
            metadata: {
              avgWeight: 1.4,
              requiredAccessories: ['cargador'],
              evaluationCriteria: ['pantalla', 'teclado', 'bateria', 'funcionamiento']
            }
          },
          {
            name: 'Laptops Gaming',
            slug: 'laptops-gaming',
            description: 'Laptops para gaming de marcas como Alienware, MSI, ASUS ROG, etc.',
            isLeaf: true,
            pricePerKg: 650.00,
            color: '#DC2626'
          },
          {
            name: 'Laptops Empresariales',
            slug: 'laptops-empresariales',
            description: 'ThinkPad, Dell Latitude, HP EliteBook y similares',
            isLeaf: true,
            pricePerKg: 450.00,
            color: '#1F2937'
          },
          {
            name: 'Laptops Básicas',
            slug: 'laptops-basicas',
            description: 'Laptops de consumo general, entrada y gama media',
            isLeaf: true,
            pricePerKg: 280.00,
            color: '#6B7280'
          },
          {
            name: 'Ultrabooks',
            slug: 'ultrabooks',
            description: 'Laptops ultradelgadas de alta gama (Dell XPS, Surface, etc.)',
            isLeaf: true,
            pricePerKg: 720.00,
            color: '#7C3AED'
          }
        ]
      },
      {
        name: 'Celulares',
        slug: 'celulares',
        description: 'Teléfonos móviles smartphones y celulares básicos',
        color: '#059669',
        icon: 'fas fa-mobile-alt',
        children: [
          {
            name: 'iPhones',
            slug: 'iphones',
            description: 'Teléfonos Apple iPhone de todas las generaciones',
            isLeaf: true,
            pricePerKg: 1200.00,
            color: '#1F2937',
            images: [
              'https://example.com/images/iphone-1.jpg',
              'https://example.com/images/iphone-2.jpg'
            ]
          },
          {
            name: 'Samsung Galaxy',
            slug: 'samsung-galaxy',
            description: 'Samsung Galaxy S, Note, A y otras series',
            isLeaf: true,
            pricePerKg: 380.00,
            color: '#1E40AF'
          },
          {
            name: 'Celulares Premium',
            slug: 'celulares-premium',
            description: 'Gama alta: Huawei P/Mate, Xiaomi Mi, OnePlus, Google Pixel',
            isLeaf: true,
            pricePerKg: 420.00,
            color: '#7C2D12'
          },
          {
            name: 'Celulares Gama Media',
            slug: 'celulares-gama-media',
            description: 'Gama media: Redmi, Galaxy A, Moto G, etc.',
            isLeaf: true,
            pricePerKg: 180.00,
            color: '#0369A1'
          },
          {
            name: 'Celulares Básicos',
            slug: 'celulares-basicos',
            description: 'Celulares básicos, feature phones y gama de entrada',
            isLeaf: true,
            pricePerKg: 45.00,
            color: '#374151'
          }
        ]
      },
      {
        name: 'Tablets',
        slug: 'tablets',
        description: 'Tabletas de todas las marcas y tamaños',
        color: '#7C3AED',
        icon: 'fas fa-tablet-alt',
        children: [
          {
            name: 'iPads',
            slug: 'ipads',
            description: 'Apple iPad (Air, Pro, Mini, estándar)',
            isLeaf: true,
            pricePerKg: 650.00,
            color: '#1F2937'
          },
          {
            name: 'Tablets Android Premium',
            slug: 'tablets-android-premium',
            description: 'Samsung Galaxy Tab, Huawei MatePad Pro, etc.',
            isLeaf: true,
            pricePerKg: 320.00,
            color: '#059669'
          },
          {
            name: 'Tablets Básicas',
            slug: 'tablets-basicas',
            description: 'Tablets de entrada y gama media',
            isLeaf: true,
            pricePerKg: 120.00,
            color: '#6B7280'
          }
        ]
      },
      {
        name: 'Consolas',
        slug: 'consolas',
        description: 'Consolas de videojuegos de todas las generaciones',
        color: '#DC2626',
        icon: 'fas fa-gamepad',
        children: [
          {
            name: 'PlayStation',
            slug: 'playstation',
            description: 'Consolas Sony PlayStation (PS3, PS4, PS5)',
            isLeaf: true,
            pricePerKg: 180.00,
            color: '#1E40AF'
          },
          {
            name: 'Xbox',
            slug: 'xbox',
            description: 'Consolas Microsoft Xbox (360, One, Series)',
            isLeaf: true,
            pricePerKg: 165.00,
            color: '#059669'
          },
          {
            name: 'Nintendo',
            slug: 'nintendo',
            description: 'Nintendo Switch, Wii, Wii U, 3DS',
            isLeaf: true,
            pricePerKg: 220.00,
            color: '#DC2626'
          },
          {
            name: 'Consolas Retro',
            slug: 'consolas-retro',
            description: 'Consolas clásicas y retro de colección',
            isLeaf: true,
            pricePerKg: 95.00,
            color: '#7C2D12'
          }
        ]
      },
      {
        name: 'Computadoras de Escritorio',
        slug: 'computadoras-escritorio',
        description: 'PCs de escritorio, All-in-One y estaciones de trabajo',
        color: '#0F766E',
        icon: 'fas fa-desktop',
        children: [
          {
            name: 'iMacs',
            slug: 'imacs',
            description: 'Apple iMac de todas las generaciones',
            isLeaf: true,
            pricePerKg: 420.00,
            color: '#6B7280'
          },
          {
            name: 'PCs Gaming',
            slug: 'pcs-gaming',
            description: 'Computadoras para gaming con componentes de alto rendimiento',
            isLeaf: true,
            pricePerKg: 350.00,
            color: '#DC2626'
          },
          {
            name: 'All-in-One',
            slug: 'all-in-one',
            description: 'Computadoras todo-en-uno (HP, Dell, Lenovo)',
            isLeaf: true,
            pricePerKg: 280.00,
            color: '#1E40AF'
          },
          {
            name: 'PCs Oficina',
            slug: 'pcs-oficina',
            description: 'Computadoras de escritorio para oficina estándar',
            isLeaf: true,
            pricePerKg: 150.00,
            color: '#374151'
          }
        ]
      },
      {
        name: 'Accesorios Electrónicos',
        slug: 'accesorios-electronicos',
        description: 'Accesorios y periféricos electrónicos',
        color: '#8B5CF6',
        icon: 'fas fa-headphones',
        children: [
          {
            name: 'AirPods y Auriculares Premium',
            slug: 'airpods-auriculares-premium',
            description: 'AirPods, auriculares Bose, Sony, Beats de gama alta',
            isLeaf: true,
            pricePerKg: 850.00,
            color: '#1F2937'
          },
          {
            name: 'Smartwatches',
            slug: 'smartwatches',
            description: 'Apple Watch, Samsung Galaxy Watch, etc.',
            isLeaf: true,
            pricePerKg: 720.00,
            color: '#059669'
          },
          {
            name: 'Cámaras Digitales',
            slug: 'camaras-digitales',
            description: 'Cámaras DSLR, mirrorless y compactas',
            isLeaf: true,
            pricePerKg: 380.00,
            color: '#7C2D12'
          },
          {
            name: 'Equipos de Audio',
            slug: 'equipos-audio',
            description: 'Bocinas, soundbars, equipos de sonido',
            isLeaf: true,
            pricePerKg: 95.00,
            color: '#0369A1'
          }
        ]
      }
    ]
  },
  // ==========================================
  // DISPOSITIVOS DESARMABLES (existente)
  // ==========================================
  {
    name: 'Dispositivos Desarmables',
    slug: 'dispositivos-desarmables',
    type: 'DISMANTLED_DEVICES',
    description: 'Dispositivos electrónicos que pueden ser desarmados para recuperar componentes valiosos',
    color: '#10B981',
    icon: 'fas fa-microchip',
    children: [
    {
      name: 'Bajo Grado',
      slug: 'bajo-grado',
      description: 'Componentes de bajo valor con materiales básicos',
      color: '#8B5CF6',
      icon: 'fas fa-layer-group',
      children: [
        {
          name: 'Marrón',
          slug: 'marron',
          description: 'Boards de color marrón, generalmente de equipos antiguos',
          isLeaf: true,
          pricePerKg: 2.50,
          color: '#8B4513',
          images: [
            'https://example.com/images/categories/marron-1.jpg',
            'https://example.com/images/categories/marron-2.jpg'
          ],
          thumbnailImage: 'https://example.com/images/categories/marron-thumb.jpg'
        },
        {
          name: 'Verde',
          slug: 'verde',
          description: 'Boards de color verde básico, componentes estándar',
          isLeaf: true,
          pricePerKg: 3.00,
          color: '#22C55E',
          images: [
            'https://example.com/images/categories/verde-1.jpg',
            'https://example.com/images/categories/verde-2.jpg'
          ],
          thumbnailImage: 'https://example.com/images/categories/verde-thumb.jpg'
        }
      ]
    },
    {
      name: 'Pentium III',
      slug: 'pentium-iii',
      description: 'Boards y componentes de la era Pentium III',
      color: '#F59E0B',
      icon: 'fas fa-memory',
      children: [
        {
          name: 'Verde/Amarillo',
          slug: 'verde-amarillo',
          description: 'Boards verdes con componentes amarillos de Pentium III',
          isLeaf: true,
          pricePerKg: 12.00,
          color: '#84CC16',
          images: [
            'https://example.com/images/categories/p3-verde-amarillo-1.jpg'
          ]
        },
        {
          name: 'Color',
          slug: 'color',
          description: 'Boards de colores variados de Pentium III',
          isLeaf: true,
          pricePerKg: 10.00,
          color: '#EC4899'
        },
        {
          name: 'Doble Socket',
          slug: 'doble-socket',
          description: 'Motherboards con doble socket de Pentium III',
          isLeaf: true,
          pricePerKg: 15.00,
          color: '#8B5CF6'
        }
      ]
    },
    {
      name: 'Pentium IV',
      slug: 'pentium-iv',
      description: 'Boards y componentes de la era Pentium IV',
      color: '#EF4444',
      icon: 'fas fa-microchip',
      children: [
        {
          name: 'Verdes 2 Chip',
          slug: 'verdes-2-chip',
          description: 'Boards verdes con 2 chips principales',
          isLeaf: true,
          pricePerKg: 8.50,
          color: '#059669'
        },
        {
          name: 'Colores 1 Chip',
          slug: 'colores-1-chip',
          description: 'Boards de colores con 1 chip principal',
          isLeaf: true,
          pricePerKg: 6.00,
          color: '#DC2626'
        },
        {
          name: 'Verdes 1 Chip',
          slug: 'verdes-1-chip',
          description: 'Boards verdes con 1 chip principal',
          isLeaf: true,
          pricePerKg: 7.00,
          color: '#16A34A'
        },
        {
          name: 'Chinas',
          slug: 'chinas',
          description: 'Boards de fabricación china, calidad estándar',
          isLeaf: true,
          pricePerKg: 4.50,
          color: '#F97316'
        },
        {
          name: 'Doble Socket',
          slug: 'p4-doble-socket',
          description: 'Motherboards Pentium IV con doble socket',
          isLeaf: true,
          pricePerKg: 12.00,
          color: '#7C3AED'
        }
      ]
    },
    {
      name: 'Medio Grado',
      slug: 'medio-grado',
      description: 'Componentes de valor medio con materiales mixtos',
      color: '#0EA5E9',
      icon: 'fas fa-layer-group',
      children: [
        {
          name: 'Boards Tipo 1',
          slug: 'boards-tipo-1',
          description: 'Boards de primera categoría, alta densidad de componentes',
          color: '#0284C7',
          children: [
            {
              name: 'Tablet',
              slug: 'tablet',
              description: 'Motherboards de tablets',
              isLeaf: true,
              pricePerKg: 25.00,
              color: '#0369A1'
            },
            {
              name: 'Laptop',
              slug: 'laptop',
              description: 'Motherboards de laptops',
              isLeaf: true,
              pricePerKg: 30.00,
              color: '#075985'
            },
            {
              name: 'Lectora',
              slug: 'lectora',
              description: 'Boards de lectores ópticos',
              isLeaf: true,
              pricePerKg: 18.00,
              color: '#0C4A6E'
            }
          ]
        },
        {
          name: 'Boards Tipo 2',
          slug: 'boards-tipo-2',
          description: 'Boards de segunda categoría',
          color: '#06B6D4',
          children: [
            {
              name: 'Impresora',
              slug: 'impresora',
              description: 'Motherboards de impresoras',
              isLeaf: true,
              pricePerKg: 15.00,
              color: '#0891B2'
            },
            {
              name: 'Modem',
              slug: 'modem',
              description: 'Boards de modems y equipos de red',
              color: '#0E7490',
              children: [
                {
                  name: 'Decodificador Buena',
                  slug: 'decodificador-buena',
                  description: 'Decodificadores en buen estado',
                  isLeaf: true,
                  pricePerKg: 20.00,
                  color: '#155E75'
                },
                {
                  name: 'Decodificador Mala',
                  slug: 'decodificador-mala',
                  description: 'Decodificadores en mal estado',
                  isLeaf: true,
                  pricePerKg: 12.00,
                  color: '#164E63'
                }
              ]
            }
          ]
        },
        {
          name: 'Boards Tipo 3',
          slug: 'boards-tipo-3',
          description: 'Boards de tercera categoría, componentes básicos',
          isLeaf: true,
          pricePerKg: 8.00,
          color: '#0F766E'
        },
        {
          name: 'Centrales Telefónicas',
          slug: 'centrales-telefonicas',
          description: 'Equipment de centrales telefónicas',
          isLeaf: true,
          pricePerKg: 22.00,
          color: '#059669'
        },
        {
          name: 'Centrales Intermedias',
          slug: 'centrales-intermedias',
          description: 'Equipment intermedio de telecomunicaciones',
          isLeaf: true,
          pricePerKg: 18.00,
          color: '#047857'
        }
      ]
    },
    {
      name: 'Alto Grado',
      slug: 'alto-grado',
      description: 'Componentes de alto valor con materiales preciosos',
      isLeaf: true,
      pricePerKg: 45.00,
      color: '#DC2626',
      icon: 'fas fa-gem',
      images: [
        'https://example.com/images/categories/alto-grado-1.jpg',
        'https://example.com/images/categories/alto-grado-2.jpg'
      ],
      thumbnailImage: 'https://example.com/images/categories/alto-grado-thumb.jpg'
    }
  ]
},
];

async function createCategoryHierarchy(categoryData: any, parentId: string | null = null, level: number = 0, parentPath: string[] = []) {
  const currentPath = [...parentPath, categoryData.slug];
  const fullPath = currentPath.join('/');
  
  console.log(`Creating category: ${categoryData.name} (Level: ${level})`);
  
  const category = await prisma.category.create({
    data: {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || '',
      type: categoryData.type || 'DISMANTLED_DEVICES',
      parentId: parentId,
      level: level,
      path: currentPath,
      fullPath: fullPath,
      isLeaf: categoryData.isLeaf || false,
      sortOrder: categoryData.sortOrder || 0,
      icon: categoryData.icon,
      color: categoryData.color,
      images: categoryData.images || [],
      thumbnailImage: categoryData.thumbnailImage,
      pricePerKg: categoryData.pricePerKg ? parseFloat(categoryData.pricePerKg.toString()) : null,
      minWeight: categoryData.minWeight ? parseFloat(categoryData.minWeight.toString()) : null,
      maxWeight: categoryData.maxWeight ? parseFloat(categoryData.maxWeight.toString()) : null,
      metadata: categoryData.metadata || {},
      status: 'ACTIVE'
    }
  });

  // Crear hijos recursivamente
  if (categoryData.children) {
    for (const childData of categoryData.children) {
      await createCategoryHierarchy(childData, category.id, level + 1, currentPath);
    }
  }

  return category;
}

// ← AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL
async function seedCategories() {
  console.log('🌱 Starting categories seeding...');

  try {
    // Limpiar categorías existentes (opcional)
    console.log('🗑️  Cleaning existing categories...');
    await prisma.orderItem.deleteMany({});
    await prisma.category.deleteMany({});

    // Crear estructuras jerárquicas para ambos tipos
    console.log('📋 Creating category hierarchies...');
    
    // ← CORRECCIÓN: Iterar sobre cada estructura individualmente
    for (const structure of categoryStructures) {
      console.log(`\n🔄 Processing: ${structure.name} (${structure.type})`);
      await createCategoryHierarchy(structure);
    }

    console.log('\n✅ Categories seeded successfully!');

    // Mostrar resumen
    const totalCategories = await prisma.category.count();
    const leafCategories = await prisma.category.count({ where: { isLeaf: true } });
    const completeDevices = await prisma.category.count({ where: { type: 'COMPLETE_DEVICES' } });
    const dismantledDevices = await prisma.category.count({ where: { type: 'DISMANTLED_DEVICES' } });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total categories: ${totalCategories}`);
    console.log(`   Leaf categories: ${leafCategories}`);
    console.log(`   Branch categories: ${totalCategories - leafCategories}`);
    console.log(`   Complete devices: ${completeDevices}`);
    console.log(`   Dismantled devices: ${dismantledDevices}`);

    // Mostrar categorías con precios más altos
    const topPriceCategories = await prisma.category.findMany({
      where: { 
        pricePerKg: { not: null },
        isLeaf: true 
      },
      select: { 
        name: true, 
        type: true,
        pricePerKg: true 
      },
      orderBy: { pricePerKg: 'desc' },
      take: 5
    });

    console.log(`\n💰 Top 5 most valuable categories:`);
    topPriceCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.type}): $${cat.pricePerKg}/kg`);
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function main() {
  await seedCategories();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default main;