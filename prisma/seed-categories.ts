// prisma/seed-categories.ts
import { PrismaClient, CategoryType, CategoryStatus, MaterialGrade } from '@prisma/client';

const prisma = new PrismaClient();

// Dispositivos Completos según requerimientos
const completeDevicesCategories = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    description: 'Teléfonos inteligentes de cualquier marca y modelo',
    type: CategoryType.COMPLETE_DEVICES,
    icon: '📱',
    estimatedWeight: 0.2,
    basePrice: 50.0,
    minPrice: 10.0,
    maxPrice: 300.0,
    pricePerKg: 250.0,
    referenceImages: [
      '/images/categories/smartphones/iphone.jpg',
      '/images/categories/smartphones/samsung.jpg',
      '/images/categories/smartphones/android.jpg'
    ],
    examples: [
      'iPhone (todas las versiones)',
      'Samsung Galaxy Series',
      'Huawei P Series',
      'Xiaomi Mi/Redmi',
      'OnePlus',
      'Google Pixel'
    ],
    requiredFields: ['brand', 'model', 'condition', 'storage'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.6,
      POOR: 0.4,
      BROKEN: 0.2
    },
    allowsQuantity: true,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 8
  },
  {
    id: 'laptops',
    name: 'Laptops y Notebooks',
    description: 'Computadoras portátiles de escritorio y gaming',
    type: CategoryType.COMPLETE_DEVICES,
    icon: '💻',
    estimatedWeight: 2.5,
    basePrice: 80.0,
    minPrice: 30.0,
    maxPrice: 800.0,
    pricePerKg: 32.0,
    referenceImages: [
      '/images/categories/laptops/macbook.jpg',
      '/images/categories/laptops/dell.jpg',
      '/images/categories/laptops/hp.jpg',
      '/images/categories/laptops/gaming.jpg'
    ],
    examples: [
      'MacBook Air/Pro',
      'Dell XPS/Inspiron',
      'HP Pavilion/EliteBook',
      'Lenovo ThinkPad/IdeaPad',
      'ASUS VivoBook/ROG',
      'Acer Aspire/Predator'
    ],
    requiredFields: ['brand', 'model', 'condition', 'processor', 'ram', 'storage'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      FAIR: 0.65,
      POOR: 0.45,
      BROKEN: 0.25
    },
    allowsQuantity: true,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 10
  },
  {
    id: 'tablets',
    name: 'Tablets',
    description: 'Tabletas iPad, Android y Windows',
    type: CategoryType.COMPLETE_DEVICES,
    icon: '📱',
    estimatedWeight: 0.5,
    basePrice: 40.0,
    minPrice: 15.0,
    maxPrice: 400.0,
    pricePerKg: 80.0,
    referenceImages: [
      '/images/categories/tablets/ipad.jpg',
      '/images/categories/tablets/samsung-tab.jpg',
      '/images/categories/tablets/surface.jpg'
    ],
    examples: [
      'iPad (todas las versiones)',
      'Samsung Galaxy Tab',
      'Microsoft Surface',
      'Huawei MatePad',
      'Lenovo Tab',
      'Amazon Fire'
    ],
    requiredFields: ['brand', 'model', 'condition', 'storage'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.6,
      POOR: 0.4,
      BROKEN: 0.2
    },
    allowsQuantity: true,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'desktop-computers',
    name: 'Computadoras de Escritorio',
    description: 'PCs de escritorio, All-in-One y estaciones de trabajo',
    type: CategoryType.COMPLETE_DEVICES,
    icon: '🖥️',
    estimatedWeight: 8.0,
    basePrice: 25.0,
    minPrice: 20.0,
    maxPrice: 600.0,
    pricePerKg: 3.0,
    referenceImages: [
      '/images/categories/desktops/imac.jpg',
      '/images/categories/desktops/dell-optiplex.jpg',
      '/images/categories/desktops/hp-pavilion.jpg',
      '/images/categories/desktops/custom-pc.jpg'
    ],
    examples: [
      'iMac',
      'Dell OptiPlex/Inspiron',
      'HP Pavilion/EliteDesk',
      'Lenovo ThinkCentre',
      'ASUS VivoPC',
      'PCs Armadas/Gaming'
    ],
    requiredFields: ['brand', 'model', 'condition', 'processor', 'ram'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      FAIR: 0.7,
      POOR: 0.5,
      BROKEN: 0.3
    },
    allowsQuantity: true,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 8
  },
  {
    id: 'gaming-consoles',
    name: 'Consolas de Videojuegos',
    description: 'PlayStation, Xbox, Nintendo y consolas retro',
    type: CategoryType.COMPLETE_DEVICES,
    icon: '🎮',
    estimatedWeight: 3.0,
    basePrice: 60.0,
    minPrice: 25.0,
    maxPrice: 500.0,
    pricePerKg: 20.0,
    referenceImages: [
      '/images/categories/consoles/ps5.jpg',
      '/images/categories/consoles/xbox.jpg',
      '/images/categories/consoles/nintendo.jpg'
    ],
    examples: [
      'PlayStation 5/4/3',
      'Xbox Series X/S/One',
      'Nintendo Switch/3DS',
      'PlayStation Vita/PSP',
      'Consolas Retro'
    ],
    requiredFields: ['brand', 'model', 'condition', 'generation'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.6,
      POOR: 0.4,
      BROKEN: 0.25
    },
    allowsQuantity: true,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'networking-equipment',
    name: 'Equipos de Red',
    description: 'Routers, switches, access points y equipos de conectividad',
    type: CategoryType.COMPLETE_DEVICES,
    icon: '📡',
    estimatedWeight: 1.0,
    basePrice: 15.0,
    minPrice: 5.0,
    maxPrice: 150.0,
    pricePerKg: 15.0,
    referenceImages: [
      '/images/categories/networking/router.jpg',
      '/images/categories/networking/switch.jpg',
      '/images/categories/networking/access-point.jpg'
    ],
    examples: [
      'Router WiFi',
      'Switch Ethernet',
      'Access Point',
      'Modem ADSL/Fibra',
      'Repetidor WiFi',
      'Firewall'
    ],
    requiredFields: ['brand', 'model', 'condition', 'type'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.6,
      POOR: 0.4,
      BROKEN: 0.2
    },
    allowsQuantity: true,
    requiresPhotos: true,
    minPhotos: 1,
    maxPhotos: 4
  }
];

// Dispositivos Desarmables según el diagrama detallado
const dismantledDevicesCategories = [
  // BAJO GRADO
  // Marrón
  {
    id: 'low-grade-brown-yellow-green',
    name: 'Bajo Grado → Marrón → Verde/Amarillo',
    description: 'Placas con componentes de color verde y amarillo, típicamente de equipos de telecomunicaciones',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_BROWN,
    icon: '🟫',
    image: '/images/categories/dismantled/brown-yellow-green.jpg',
    pricePerKg: 8.5,
    minPrice: 4.0,
    maxPrice: 18.0,
    basePrice: 8.5,
    referenceImages: [
      '/images/categories/dismantled/brown-yellow-green-1.jpg',
      '/images/categories/dismantled/brown-yellow-green-2.jpg',
      '/images/categories/dismantled/telecom-boards.jpg'
    ],
    examples: [
      'Placas de teléfonos fijos antiguos',
      'Circuitos de equipos de telecomunicaciones',
      'Placas de centrales telefónicas',
      'Componentes de sistemas de comunicación'
    ],
    requiredFields: ['condition', 'componentType'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.75,
      POOR: 0.55,
      BROKEN: 0.35
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 8
  },
  {
    id: 'low-grade-brown-color',
    name: 'Bajo Grado → Marrón → Color',
    description: 'Placas marrones con componentes de colores variados, principalmente de equipos electrónicos básicos',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_BROWN,
    icon: '🟤',
    image: '/images/categories/dismantled/brown-color.jpg',
    pricePerKg: 7.0,
    minPrice: 3.5,
    maxPrice: 15.0,
    basePrice: 7.0,
    referenceImages: [
      '/images/categories/dismantled/brown-color-1.jpg',
      '/images/categories/dismantled/brown-color-2.jpg',
      '/images/categories/dismantled/old-electronics.jpg'
    ],
    examples: [
      'Placas de radios antiguos',
      'Circuitos de televisores viejos',
      'Componentes de equipos de audio vintage',
      'Placas de electrodomésticos básicos'
    ],
    requiredFields: ['condition', 'approximateAge'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      FAIR: 0.7,
      POOR: 0.5,
      BROKEN: 0.3
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'low-grade-brown-doble-socket',
    name: 'Bajo Grado → Marrón → Doble Socket',
    description: 'Placas con dobles conectores, comunes en equipos de procesamiento dual',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_BROWN,
    icon: '🔌',
    image: '/images/categories/dismantled/doble-socket.jpg',
    pricePerKg: 9.5,
    minPrice: 4.5,
    maxPrice: 20.0,
    basePrice: 9.5,
    referenceImages: [
      '/images/categories/dismantled/dual-socket-1.jpg',
      '/images/categories/dismantled/dual-socket-2.jpg',
      '/images/categories/dismantled/server-boards.jpg'
    ],
    examples: [
      'Placas madre de servidores antiguos',
      'Motherboards con doble procesador',
      'Placas de estaciones de trabajo',
      'Sistemas de cómputo industrial básico'
    ],
    requiredFields: ['condition', 'socketType', 'processorCount'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.75,
      POOR: 0.55,
      BROKEN: 0.35
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 8
  },

  // Verde
  {
    id: 'low-grade-green-verde-amarillo',
    name: 'Bajo Grado → Verde → Verde/Amarillo',
    description: 'Placas base verdes con componentes amarillos, típicas de computadoras personales básicas',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_GREEN,
    icon: '🟢',
    image: '/images/categories/dismantled/green-yellow.jpg',
    pricePerKg: 6.5,
    minPrice: 3.0,
    maxPrice: 14.0,
    basePrice: 6.5,
    referenceImages: [
      '/images/categories/dismantled/green-yellow-1.jpg',
      '/images/categories/dismantled/green-yellow-2.jpg',
      '/images/categories/dismantled/basic-motherboards.jpg'
    ],
    examples: [
      'Placas madre de PCs básicas',
      'Motherboards de computadoras de oficina',
      'Placas de equipos de entrada',
      'Circuitos de sistemas económicos'
    ],
    requiredFields: ['condition', 'formFactor'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      FAIR: 0.7,
      POOR: 0.5,
      BROKEN: 0.3
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'low-grade-green-color',
    name: 'Bajo Grado → Verde → Color',
    description: 'Placas verdes con componentes de colores mixtos, de equipos electrónicos diversos',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_GREEN,
    icon: '💚',
    image: '/images/categories/dismantled/green-color.jpg',
    pricePerKg: 5.5,
    minPrice: 2.5,
    maxPrice: 12.0,
    basePrice: 5.5,
    referenceImages: [
      '/images/categories/dismantled/green-color-1.jpg',
      '/images/categories/dismantled/green-color-2.jpg',
      '/images/categories/dismantled/mixed-green-boards.jpg'
    ],
    examples: [
      'Placas de equipos de entretenimiento',
      'Circuitos de periféricos',
      'Componentes de impresoras básicas',
      'Placas de equipos de red económicos'
    ],
    requiredFields: ['condition'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.65,
      POOR: 0.45,
      BROKEN: 0.25
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },

  // PENTIUM III
  {
    id: 'pentium-iii',
    name: 'Pentium III',
    description: 'Procesadores Pentium III y placas madre compatibles de la era 1999-2003',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_GREEN,
    icon: '🖥️',
    image: '/images/categories/dismantled/pentium3.jpg',
    pricePerKg: 12.0,
    minPrice: 6.0,
    maxPrice: 25.0,
    basePrice: 12.0,
    referenceImages: [
      '/images/categories/dismantled/pentium3-cpu.jpg',
      '/images/categories/dismantled/pentium3-motherboard.jpg',
      '/images/categories/dismantled/slot1-socket.jpg'
    ],
    examples: [
      'Procesadores Intel Pentium III',
      'Placas madre Socket 370',
      'Placas madre Slot 1',
      'Sistemas completos Pentium III'
    ],
    requiredFields: ['condition', 'processorModel', 'socketType'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.75,
      POOR: 0.55,
      BROKEN: 0.35
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },

  // PENTIUM IV
  {
    id: 'pentium-iv-ventas-2-chip',
    name: 'Pentium IV → Ventas 2 Chip',
    description: 'Sistemas Pentium IV con configuración de doble chip o doble núcleo',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '💻',
    image: '/images/categories/dismantled/pentium4-dual.jpg',
    pricePerKg: 15.0,
    minPrice: 8.0,
    maxPrice: 30.0,
    basePrice: 15.0,
    referenceImages: [
      '/images/categories/dismantled/pentium4-dual-1.jpg',
      '/images/categories/dismantled/pentium4-dual-2.jpg',
      '/images/categories/dismantled/dual-core-boards.jpg'
    ],
    examples: [
      'Procesadores Pentium IV dual',
      'Placas madre con doble socket P4',
      'Sistemas workstation Pentium IV',
      'Configuraciones de alto rendimiento P4'
    ],
    requiredFields: ['condition', 'processorModel', 'coreCount'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.8,
      POOR: 0.6,
      BROKEN: 0.4
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 8
  },
  {
    id: 'pentium-iv-colores-2-chip',
    name: 'Pentium IV → Colores 2 Chip',
    description: 'Placas Pentium IV con componentes de colores distintivos y doble configuración',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '🌈',
    image: '/images/categories/dismantled/pentium4-colors.jpg',
    pricePerKg: 14.0,
    minPrice: 7.0,
    maxPrice: 28.0,
    basePrice: 14.0,
    referenceImages: [
      '/images/categories/dismantled/pentium4-colors-1.jpg',
      '/images/categories/dismantled/pentium4-colors-2.jpg',
      '/images/categories/dismantled/colorful-boards.jpg'
    ],
    examples: [
      'Placas P4 con componentes coloridos',
      'Motherboards gaming Pentium IV',
      'Placas overclocking P4',
      'Sistemas entusiastas Pentium IV'
    ],
    requiredFields: ['condition', 'processorModel', 'brandFeatures'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.8,
      POOR: 0.6,
      BROKEN: 0.4
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 8
  },
  {
    id: 'pentium-iv-colores-1-chip',
    name: 'Pentium IV → Colores 1 Chip',
    description: 'Procesadores y placas Pentium IV estándar con un solo chip y componentes coloridos',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '🎨',
    image: '/images/categories/dismantled/pentium4-single.jpg',
    pricePerKg: 11.0,
    minPrice: 5.5,
    maxPrice: 22.0,
    basePrice: 11.0,
    referenceImages: [
      '/images/categories/dismantled/pentium4-single-1.jpg',
      '/images/categories/dismantled/pentium4-single-2.jpg',
      '/images/categories/dismantled/standard-p4.jpg'
    ],
    examples: [
      'Procesadores Pentium IV estándar',
      'Placas madre Socket 478',
      'Placas madre Socket 775',
      'Sistemas desktop Pentium IV'
    ],
    requiredFields: ['condition', 'processorModel', 'socketType'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      FAIR: 0.7,
      POOR: 0.5,
      BROKEN: 0.3
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'pentium-iv-ventas-1-chip',
    name: 'Pentium IV → Ventas 1 Chip',
    description: 'Procesadores Pentium IV de un solo núcleo para venta directa',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '🔧',
    image: '/images/categories/dismantled/pentium4-retail.jpg',
    pricePerKg: 10.0,
    minPrice: 5.0,
    maxPrice: 20.0,
    basePrice: 10.0,
    referenceImages: [
      '/images/categories/dismantled/pentium4-retail-1.jpg',
      '/images/categories/dismantled/pentium4-retail-2.jpg',
      '/images/categories/dismantled/p4-processors.jpg'
    ],
    examples: [
      'CPUs Pentium IV sueltos',
      'Procesadores P4 sin placa',
      'Chips Pentium IV recuperados',
      'CPUs para reventa'
    ],
    requiredFields: ['condition', 'processorModel', 'frequency'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.85,
      FAIR: 0.7,
      POOR: 0.5,
      BROKEN: 0.3
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'pentium-iv-chinos',
    name: 'Pentium IV → Chinos',
    description: 'Procesadores y placas Pentium IV de fabricación china o clones',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.LOW_GRADE_GREEN,
    icon: '🏭',
    image: '/images/categories/dismantled/pentium4-chinese.jpg',
    pricePerKg: 8.0,
    minPrice: 4.0,
    maxPrice: 16.0,
    basePrice: 8.0,
    referenceImages: [
      '/images/categories/dismantled/pentium4-chinese-1.jpg',
      '/images/categories/dismantled/pentium4-chinese-2.jpg',
      '/images/categories/dismantled/chinese-clones.jpg'
    ],
    examples: [
      'Clones de Pentium IV',
      'Placas fabricadas en China',
      'Procesadores compatibles P4',
      'Sistemas económicos asiáticos'
    ],
    requiredFields: ['condition', 'manufacturer', 'authenticity'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.65,
      POOR: 0.45,
      BROKEN: 0.25
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 8
  },

  // MEDIO GRADO
  // Boards tipo 1
  {
    id: 'medium-grade-boards-type1-tablet',
    name: 'Medio Grado → Boards tipo 1 → Tablet',
    description: 'Placas madre de tablets con componentes de grado medio',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '📱',
    image: '/images/categories/dismantled/tablet-boards.jpg',
    pricePerKg: 18.0,
    minPrice: 10.0,
    maxPrice: 35.0,
    basePrice: 18.0,
    referenceImages: [
      '/images/categories/dismantled/tablet-board-1.jpg',
      '/images/categories/dismantled/tablet-board-2.jpg',
      '/images/categories/dismantled/mobile-circuits.jpg'
    ],
    examples: [
      'Placas madre de iPad',
      'Circuitos de tablets Android',
      'Placas de tablets Samsung',
      'Motherboards de tablets Huawei'
    ],
    requiredFields: ['condition', 'brand', 'model', 'storageCapacity'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.8,
      POOR: 0.6,
      BROKEN: 0.4
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 8
  },
  {
    id: 'medium-grade-boards-type1-laptop',
    name: 'Medio Grado → Boards tipo 1 → Laptop',
    description: 'Placas madre de laptops de gama media con componentes valiosos',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '💻',
    image: '/images/categories/dismantled/laptop-boards.jpg',
    pricePerKg: 22.0,
    minPrice: 12.0,
    maxPrice: 45.0,
    basePrice: 22.0,
    referenceImages: [
      '/images/categories/dismantled/laptop-board-1.jpg',
      '/images/categories/dismantled/laptop-board-2.jpg',
      '/images/categories/dismantled/notebook-circuits.jpg'
    ],
    examples: [
      'Placas madre de MacBook',
      'Motherboards de laptops Dell',
      'Circuitos de notebooks HP',
      'Placas de ultrabooks Lenovo'
    ],
    requiredFields: ['condition', 'brand', 'model', 'processorType'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.8,
      POOR: 0.6,
      BROKEN: 0.4
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 3,
    maxPhotos: 10
  },
  {
    id: 'medium-grade-boards-type1-lectora',
    name: 'Medio Grado → Boards tipo 1 → Lectora',
    description: 'Placas de dispositivos lectores (CD/DVD/Blu-ray, lectores de tarjetas)',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '💿',
    image: '/images/categories/dismantled/reader-boards.jpg',
    pricePerKg: 12.0,
    minPrice: 6.0,
    maxPrice: 24.0,
    basePrice: 12.0,
    referenceImages: [
      '/images/categories/dismantled/dvd-reader-board.jpg',
      '/images/categories/dismantled/cd-reader-board.jpg',
      '/images/categories/dismantled/card-reader-board.jpg'
    ],
    examples: [
      'Placas de lectores DVD',
      'Circuitos de lectores Blu-ray',
      'Placas de lectores de tarjetas',
      'Componentes de unidades ópticas'
    ],
    requiredFields: ['condition', 'deviceType', 'readerType'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.75,
      POOR: 0.55,
      BROKEN: 0.35
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 6
  },
  {
    id: 'medium-grade-boards-type1-impresora',
    name: 'Medio Grado → Boards tipo 1 → Impresora',
    description: 'Placas madre de impresoras de gama media y alta',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '🖨️',
    image: '/images/categories/dismantled/printer-boards.jpg',
    pricePerKg: 14.0,
    minPrice: 7.0,
    maxPrice: 28.0,
    basePrice: 14.0,
    referenceImages: [
      '/images/categories/dismantled/printer-board-1.jpg',
      '/images/categories/dismantled/printer-board-2.jpg',
      '/images/categories/dismantled/multifunctional-board.jpg'
    ],
    examples: [
      'Placas de impresoras HP LaserJet',
      'Circuitos de impresoras Canon',
      'Placas de multifuncionales Epson',
      'Motherboards de impresoras industriales'
    ],
    requiredFields: ['condition', 'brand', 'printerType'],
    conditionMultipliers: {
      EXCELLENT: 1.0,
      GOOD: 0.9,
      FAIR: 0.75,
      POOR: 0.55,
      BROKEN: 0.35
    },
    allowsQuantity: false,
    requiresPhotos: true,
    minPhotos: 2,
    maxPhotos: 8
  },
  {
    id: 'medium-grade-boards-type1-modem',
    name: 'Medio Grado → Boards tipo 1 → Modem',
    description: 'Placas de módems, routers y equipos de telecomunicaciones de gama media',
    type: CategoryType.DISMANTLED_DEVICES,
    materialGrade: MaterialGrade.MIXED_COMPONENTS,
    icon: '📡',
    image: '/images/categories/dismantled/modem-boards.jpg',
    pricePerKg: 16.0,
    minPrice: 8.0,
    maxPrice: 32.0,
    basePrice: 16.0,
    referenceImages: [
            '/images/categories/dismantled/modem-board-1.jpg',
            '/images/categories/dismantled/router-board.jpg',
            '/images/categories/dismantled/telecom-equipment.jpg'
          ],
          examples: [
            'Placas de módems ADSL',
            'Circuitos de routers WiFi',
            'Placas de equipos de telecomunicaciones',
            'Motherboards de módems industriales'
          ],
          requiredFields: ['condition', 'deviceType', 'connectionType'],
          conditionMultipliers: {
            EXCELLENT: 1.0,
            GOOD: 0.9,
            FAIR: 0.75,
            POOR: 0.55,
            BROKEN: 0.35
          },
          allowsQuantity: false,
          requiresPhotos: true,
          minPhotos: 2,
          maxPhotos: 8
        }
      ];

export async function seedCategories() {
  console.log('🌱 Seeding categories...');

  // Limpiar categorías existentes
  await prisma.category.deleteMany();

  // Insertar dispositivos completos
  for (const category of completeDevicesCategories) {
    await prisma.category.create({
      data: {
        ...category,
        status: CategoryStatus.ACTIVE,
        metadata: {
          lastUpdated: new Date().toISOString(),
          createdBy: 'system'
        }
      }
    });
  }

  // Insertar dispositivos desarmables
  for (const category of dismantledDevicesCategories) {
    await prisma.category.create({
      data: {
        ...category,
        status: CategoryStatus.ACTIVE,
        estimatedWeight: 0.5, // Peso por defecto para cálculos
        metadata: {
          lastUpdated: new Date().toISOString(),
          createdBy: 'system'
        }
      }
    });
  }

  console.log('✅ Categories seeded successfully');
  console.log(`📊 Created ${completeDevicesCategories.length + dismantledDevicesCategories.length} categories`);
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedCategories()
    .catch((e) => {
      console.error('❌ Error seeding categories:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

