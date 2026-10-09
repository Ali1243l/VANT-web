import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { useSiteControls } from '../context/SiteControlsContext';
import type { Product as StoreProduct, ProductAvailability } from '../types';
import { getStoredSubscribers, addSubscriber as addStoredSubscriber, removeSubscriber as removeStoredSubscriber } from '../lib/newsletter';

export type AdminView = 'dashboard' | 'orders' | 'products' | 'sizes' | 'offers' | 'banners' | 'subscribers' | 'welcome_modal' | 'controls' | 'social' | 'backup' | 'settings' | 'security';

export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'ready_to_wear' | 'bespoke';

export interface OrderItem {
  productId: string;
  name: string;
  nameEn: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize: string;
  fabricOption?: string;
}

export interface BespokeDetails {
  clientMeasurements?: {
    chest?: string;
    waist?: string;
    shoulder?: string;
    sleeveLength?: string;
    jacketLength?: string;
    collar?: string;
    height?: string;
    posture?: string;
  };
  artisanNotes?: string;
  fabricSelection?: string;
  urgency?: 'standard' | 'high_priority' | 'royal_vip';
  atelierMaster?: string;
  fittingDate?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  titleEn: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  orderDate: string;
  type: OrderType;
  isVip?: boolean;
  bespokeDetails?: BespokeDetails;
  timeline: OrderTimelineEvent[];
  paymentMethod: string;
  trackingNumber?: string;
}

export interface ProductVariant {
  id: string;
  colorNameAr: string; // e.g., 'أسود ملكي'
  colorNameEn: string; // e.g., 'Royal Black'
  colorHex: string; // e.g., '#000000' (For UI swatch rendering)
  price?: number; // Optional override: if set, overrides base price
  salePrice?: number; 
  stock: number;
  sizes: string[]; // Specific sizes available FOR THIS COLOR ONLY
  images: string[]; // Images specifically for this color
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  sku: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: 'active' | 'draft' | 'outOfStock' | 'lowStock';
  imageUrl: string;
  images?: string[];
  sizes?: string[];
  descriptionAr?: string;
  descriptionEn?: string;
  materialDetails?: string;
  availabilityStatus?: 'in_stock' | 'limited' | 'coming_soon' | 'sold_out';
  isOnOffer?: boolean;
  offerCampaign?: string;
  offerBadgeText?: string;
  salesCount: number;
  rating: number;
  createdAt: string;
  // Color Variants System (PIM)
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export interface Offer {
  id: string;
  title: string;
  titleEn: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  status: 'active' | 'scheduled' | 'expired';
  usedCount: number;
  maxUses?: number;
  startDate: string;
  endDate: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'unsubscribed';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate?: string;
  tags: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'stock' | 'system';
}

export interface SiteSettings {
  storeName: string;
  storeNameEn: string;
  currency: string;
  emailAlerts: boolean;
  smsAlerts: boolean;

  // 1. Global Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessageAr: string;
  maintenanceMessageEn: string;
  maintenanceEstimatedBack: string;

  // 2. Splash Screen Customizer
  splashMotif: 'hanger' | 'scissors' | 'monogram' | 'needle' | 'crown';
  splashTextAr: string;
  splashTextEn: string;
  splashDurationMs: number;

  // 3. Store Front Banners
  heroBannerBg: string;
  heroHeadlineAr: string;
  heroHeadlineEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroCtaTextAr: string;
  heroCtaTextEn: string;
  heroCtaLink: string;

  // 4. WhatsApp Multi-Number
  whatsappOrdersNumber: string;
  whatsappOrdersName: string;
  whatsappConciergeNumber: string;
  whatsappConciergeName: string;
  whatsappDefaultMsg: string;
  pin?: string;
}

export const defaultSiteSettings: SiteSettings = {
  storeName: 'دار الرافدين للأزياء والتصميم الرفيع',
  storeNameEn: 'Dar Al-Rafidain Haute Couture & Luxury Goods',
  currency: 'IQD',
  emailAlerts: true,
  smsAlerts: false,
  pin: '1234',

  maintenanceMode: false,
  maintenanceMessageAr: 'نقوم حالياً بتجهيز وإطلاق المجموعة الحصرية الجديدة. سنعود لاستقبال طلباتكم الفاخرة قريباً جداً.',
  maintenanceMessageEn: 'We are currently curating and preparing our new exclusive bespoke collection. We will reopen shortly for orders.',
  maintenanceEstimatedBack: 'خلال ساعتين (2 Hours)',

  splashMotif: 'hanger',
  splashTextAr: 'دار الرافدين للأزياء • أصالة الحرفة العراقية',
  splashTextEn: 'Dar Al-Rafidain • Iraqi Haute Couture & Craftsmanship',
  splashDurationMs: 2500,

  heroBannerBg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
  heroHeadlineAr: 'أناقة لا تتكرر • إرث الخياطة الرفيعة',
  heroHeadlineEn: 'Timeless Elegance • The Legacy of Bespoke Tailoring',
  heroSubtitleAr: 'اكتشف أرقى أقمشة الصوف الكشميري الإيطالي والحرير الطبيعي بتفصيل يدوي دقيق يحاكي طموحك.',
  heroSubtitleEn: 'Discover exquisite Italian cashmere and pure mulberry silk hand-tailored to royal perfection.',
  heroBadgeAr: 'الموسم الجديد 2026 • متوفر الآن',
  heroBadgeEn: 'New Season 2026 • Exclusive Release',
  heroCtaTextAr: 'استكشف التشكيلة الملكية',
  heroCtaTextEn: 'Explore Royal Collection',
  heroCtaLink: '#products',

  whatsappOrdersNumber: '+9647701234567',
  whatsappOrdersName: 'قسم إدارة واستلام الطلبات الفورية',
  whatsappConciergeNumber: '+9647809876543',
  whatsappConciergeName: 'كونسيرج التفصيل الخاص والخياطة الراقية (Bespoke)',
  whatsappDefaultMsg: 'مرحباً، أود الاستفسار عن تفصيل قطعة خاصة من دار الرافدين.',
};

interface AdminContextType {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  isLocked: boolean;
  lock: () => void;
  unlock: (pin: string) => boolean;
  pin: string;
  setPin: (pin: string) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  toggleLang: () => void;
  currentStore: string;
  setCurrentStore: (store: string) => void;
  
  // Data State
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductOffer: (id: string) => void;
  
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'usedCount'>) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  
  subscribers: Subscriber[];
  addSubscriber: (sub: Omit<Subscriber, 'id' | 'joinedDate' | 'totalOrders' | 'totalSpent'>) => void;
  deleteSubscriber: (id: string) => void;

  // Order Management System (OMS) & Concierge
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void;
  updateOrderArtisanNotes: (id: string, notes: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'orderDate' | 'timeline'>) => void;

  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;

  // Global modals state
  isOfferModalOpen: boolean;
  setIsOfferModalOpen: (open: boolean) => void;

  // Master Site Controls & Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{ success: boolean; syncedWithCloud: boolean }>;
}

const defaultProducts: Product[] = [
  {
    id: 'prod-tshirt',
    name: 'تيشيرت بيما قطن ملكي مطرز (إصدار فاخر)',
    nameEn: 'Royal Embroidered Pima Cotton Tee',
    sku: 'TEE-7701',
    category: 'ملابس وأزياء',
    price: 45000,
    salePrice: 39000,
    stock: 42,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    descriptionAr: 'تيشيرت مصمم من خيوط قطن البيما البيروفي فائق النعومة، بقَصّة عصرية وخياطة مزدوجة مع تطريز ناعم لشعار الدار على الصدر.',
    descriptionEn: 'Ultra-luxurious Peruvian Pima cotton tailored t-shirt featuring bespoke dual-stitch hem and signature subtle chest embroidery.',
    materialDetails: '100% قطن بيما طويل التيلة، مقاوم للانكماش والبهتان بعد الغسيل المتكرر',
    availabilityStatus: 'in_stock',
    isOnOffer: true,
    salesCount: 184,
    rating: 4.9,
    createdAt: '2026-03-05',
    hasVariants: true,
    variants: [
      {
        id: 'var-tee-black',
        colorNameAr: 'أسود ملكي',
        colorNameEn: 'Royal Black',
        colorHex: '#0f172a',
        price: 45000,
        salePrice: 39000,
        stock: 18,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
        ],
      },
      {
        id: 'var-tee-white',
        colorNameAr: 'أبيض ناصع لؤلؤي',
        colorNameEn: 'Pearl White',
        colorHex: '#f8fafc',
        price: 45000,
        salePrice: 39000,
        stock: 14,
        sizes: ['M', 'L', 'XL'],
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
        ],
      },
      {
        id: 'var-tee-emerald',
        colorNameAr: 'أخضر زمردي إمبريالي',
        colorNameEn: 'Imperial Emerald',
        colorHex: '#064e3b',
        price: 48000,
        salePrice: 42000,
        stock: 10,
        sizes: ['M', 'L', 'XL'],
        images: [
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
        ],
      },
    ],
  },
  {
    id: 'prod-1',
    name: 'سماعات رأس لاسلكية برو ماكس',
    nameEn: 'Wireless Pro Max Headphones',
    sku: 'AUDIO-8821',
    category: 'إلكترونيات',
    price: 125000,
    salePrice: 105000,
    stock: 24,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
    ],
    sizes: ['Standard', 'Over-Ear'],
    descriptionAr: 'سماعات رأس احترافية مع ميزة إلغاء الضوضاء النشط، صوت محيطي ثلاثي الأبعاد، وبطارية تدوم حتى 40 ساعة من التشغيل المستمر.',
    descriptionEn: 'High-fidelity over-ear headphones featuring active noise cancellation, spatial audio, and up to 40 hours battery life.',
    materialDetails: 'ألومنيوم مؤكسد، وسائد إسفنجية متكيفة Memory Foam مغلفة بجلد بروتيني ناعم',
    availabilityStatus: 'in_stock',
    isOnOffer: true,
    salesCount: 142,
    rating: 4.8,
    createdAt: '2026-02-14',
    hasVariants: true,
    variants: [
      {
        id: 'var-audio-black',
        colorNameAr: 'رمادي غامق فلكي',
        colorNameEn: 'Space Grey',
        colorHex: '#1e293b',
        price: 125000,
        salePrice: 105000,
        stock: 14,
        sizes: ['Standard', 'Over-Ear'],
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        ],
      },
      {
        id: 'var-audio-silver',
        colorNameAr: 'فضي بلاتيني',
        colorNameEn: 'Platinum Silver',
        colorHex: '#cbd5e1',
        price: 125000,
        salePrice: 105000,
        stock: 10,
        sizes: ['Standard', 'Over-Ear'],
        images: [
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
        ],
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'ساعة ذكية ألترا إديشن - تيتانيوم',
    nameEn: 'Smartwatch Ultra Titanium',
    sku: 'WATCH-4410',
    category: 'إلكترونيات',
    price: 195000,
    salePrice: 175000,
    stock: 8,
    status: 'lowStock',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80',
    ],
    sizes: ['41mm', '45mm', '49mm'],
    descriptionAr: 'ساعة ذكية فائقة التحمل بهيكل تيتانيوم مصقول، شاشة أموليد ساطعة تحت أشعة الشمس، ومستشعرات دقيقة للصحة والتمارين والغطس.',
    descriptionEn: 'Rugged titanium smartwatch engineered for extreme endurance, outdoor sports, deep diving, and comprehensive biometric tracking.',
    materialDetails: 'تيتانيوم درجة طيران، زجاج ياقوتي مقاوم للخدش، حزام سيليكون طبي مرن',
    availabilityStatus: 'limited',
    isOnOffer: true,
    salesCount: 98,
    rating: 4.9,
    createdAt: '2026-03-01',
  },
  {
    id: 'prod-3',
    name: 'حقيبة ظهر للابتوب جلد كلاسيكي مقاوم للماء',
    nameEn: 'Classic Waterproof Leather Backpack',
    sku: 'BAG-1022',
    category: 'إكسسوارات',
    price: 65000,
    stock: 45,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80',
    ],
    sizes: ['14 inch', '15.6 inch', '17 inch'],
    descriptionAr: 'حقيبة ظهر تنفيذية أنيقة تتسع لجهاز لابتوب حتى 16 بوصة مع بطانة مضادة للصدمات ومنفذ شحن USB مدمج وجيوب أمان مخفية.',
    descriptionEn: 'Classic executive leather backpack with water-resistant coating, dedicated padded laptop sleeve, and quick-access utility compartments.',
    materialDetails: 'جلد طبيعي نباتي مدبوغ يدويّاً، سحابات YKK مقاومة للماء والصدأ',
    availabilityStatus: 'in_stock',
    isOnOffer: false,
    salesCount: 210,
    rating: 4.7,
    createdAt: '2026-01-20',
  },
  {
    id: 'prod-4',
    name: 'لوحة مفاتيح ميكانيكية مخصصة RGB',
    nameEn: 'Custom RGB Mechanical Keyboard',
    sku: 'KEY-9081',
    category: 'ملحقات الحاسوب',
    price: 85000,
    salePrice: 72000,
    stock: 0,
    status: 'outOfStock',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    ],
    sizes: ['60%', '75%', 'TKL', 'Full-Size'],
    descriptionAr: 'كيبورد ميكانيكي بمفاتيح قابلة للتبديل الساخن (Hot-swap)، عزل صوت مزدوج، وإضاءة RGB قابلة للتخصيص بالكامل.',
    descriptionEn: 'Custom hot-swappable mechanical keyboard with south-facing RGB, gasket-mount design, and PBT double-shot keycaps.',
    materialDetails: 'هيكل ألومنيوم CNC، أغطية مفاتيح PBT، سويتشات تشحيم مصنعي',
    availabilityStatus: 'sold_out',
    isOnOffer: true,
    salesCount: 76,
    rating: 4.6,
    createdAt: '2026-02-28',
  },
  {
    id: 'prod-5',
    name: 'قاعدة شحن لاسلكية مغناطيسية 3 في 1',
    nameEn: '3-in-1 Magnetic Wireless Charging Station',
    sku: 'CHG-3011',
    category: 'إلكترونيات',
    price: 38000,
    stock: 62,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80',
    ],
    sizes: ['One Size'],
    descriptionAr: 'محطة شحن سريعة وقابلة للطي لشحن الهاتف والساعة وسماعات الأذن في وقت واحد بقوة تصل إلى 15 واط مع حماية متكاملة.',
    descriptionEn: 'Foldable 3-in-1 magnetic wireless stand for simultaneous charging of smartphone, smartwatch, and wireless earbuds.',
    materialDetails: 'سبائك ألومنيوم وسيليكون مضاد للانزلاق مع مؤشر إضاءة ذكي',
    availabilityStatus: 'in_stock',
    isOnOffer: false,
    salesCount: 310,
    rating: 4.8,
    createdAt: '2026-03-12',
  },
  {
    id: 'prod-6',
    name: 'نظارة شمسية بإطار من ألياف الكربون',
    nameEn: 'Carbon Fiber Polarized Sunglasses',
    sku: 'SUN-7703',
    category: 'إكسسوارات',
    price: 45000,
    stock: 15,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&q=80',
    ],
    sizes: ['M', 'L'],
    descriptionAr: 'نظارة شمسية خفيفة الوزن للغاية مستقطبة بعدسات UV400 تحمي بنسبة 100% من الأشعة فوق البنفسجية وإطار فائق المتانة.',
    descriptionEn: 'Ultralight polarized sunglasses with genuine carbon fiber arms, UV400 anti-glare protection, and spring hinges.',
    materialDetails: 'ألياف كربون حقيقية Carbon Fiber، عدسات بولي كربونات مستقطبة عالية الدقة',
    availabilityStatus: 'in_stock',
    isOnOffer: false,
    salesCount: 64,
    rating: 4.5,
    createdAt: '2026-03-18',
  },
];

const defaultOffers: Offer[] = [
  {
    id: 'off-1',
    title: 'خصم أسبوع التسوق 20%',
    titleEn: 'Shopping Week 20% Off',
    code: 'BAGHDAD20',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 35000,
    status: 'active',
    usedCount: 382,
    maxUses: 1000,
    startDate: '2026-09-01',
    endDate: '2026-10-31',
  },
  {
    id: 'off-2',
    title: 'قسيمة الشحن المجاني للطلبات',
    titleEn: 'Free Delivery Voucher',
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 7000,
    minSpend: 25000,
    status: 'active',
    usedCount: 890,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: 'off-3',
    title: 'عرض تخفيضات الشتاء (خصم 20%)',
    titleEn: 'Winter Clearance Sale (20% Off)',
    code: 'WINTER20',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 25000,
    status: 'active',
    usedCount: 450,
    maxUses: 500,
    startDate: '2026-01-10',
    endDate: '2026-12-31',
  },
  {
    id: 'off-4',
    title: 'خصم ترحيبي للعملاء الجدد 10%',
    titleEn: 'Welcome 10% Off',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 20000,
    status: 'active',
    usedCount: 612,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
];

const defaultSubscribers: Subscriber[] = [
  {
    id: 'sub-1',
    name: 'علي الرافدين',
    email: 'ali.rafidain@example.com',
    phone: '+964 770 123 4567',
    status: 'active',
    totalOrders: 9,
    totalSpent: 1250000,
    joinedDate: '2025-11-12',
    lastOrderDate: '2026-03-28',
    tags: ['عميل VIP', 'إلكترونيات'],
  },
  {
    id: 'sub-2',
    name: 'سارة الكرخي',
    email: 'sara.karkh@example.com',
    phone: '+964 780 987 6543',
    status: 'active',
    totalOrders: 4,
    totalSpent: 420000,
    joinedDate: '2026-01-05',
    lastOrderDate: '2026-04-01',
    tags: ['متكرر'],
  },
  {
    id: 'sub-3',
    name: 'عمر البصري',
    email: 'omar.basra@example.com',
    phone: '+964 750 222 3344',
    status: 'active',
    totalOrders: 14,
    totalSpent: 2650000,
    joinedDate: '2025-08-19',
    lastOrderDate: '2026-04-06',
    tags: ['عميل VIP', 'مشتريات كبرى'],
  },
  {
    id: 'sub-4',
    name: 'مريم الزبيدي',
    email: 'maryam.z@example.com',
    phone: '+964 771 777 8899',
    status: 'unsubscribed',
    totalOrders: 1,
    totalSpent: 65000,
    joinedDate: '2026-02-14',
    lastOrderDate: '2026-02-14',
    tags: ['عرض أول'],
  },
  {
    id: 'sub-5',
    name: 'حيدر الجبوري',
    email: 'haider.j@example.com',
    phone: '+964 782 444 5566',
    status: 'active',
    totalOrders: 6,
    totalSpent: 780000,
    joinedDate: '2025-12-01',
    lastOrderDate: '2026-03-15',
    tags: ['إلكترونيات'],
  },
];

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'طلب جديد #ORD-9821',
    message: 'تم إتمام عملية شراء بقيمة 195,000 IQD بواسطة عمر البصري',
    time: 'منذ 5 دقائق',
    read: false,
    type: 'order',
  },
  {
    id: 'notif-2',
    title: 'تنبيه مخزون منخفض',
    message: 'ساعة ذكية ألترا إديشن تيتانيوم تبقى منها 8 قطع فقط',
    time: 'منذ ساعتين',
    read: false,
    type: 'stock',
  },
  {
    id: 'notif-3',
    title: 'تم تفعيل كود الخصم BAGHDAD20',
    message: 'سجل الكود 18 عملية استخدام جديدة اليوم',
    time: 'منذ 4 ساعات',
    read: true,
    type: 'system',
  },
];

const defaultOrders: Order[] = [
  {
    id: 'ORD-8821',
    customerName: 'الشيخ عبد الله السعدون',
    customerPhone: '+9647701239988',
    customerEmail: 'a.alsaadoun@royal.iq',
    shippingAddress: 'بغداد، حي المنصور - شارع الأميرات، مجمع الفلل الخاصة رقم 14',
    status: 'pending_payment',
    orderDate: '2026-04-08 11:30',
    type: 'bespoke',
    isVip: true,
    totalPrice: 485000,
    paymentMethod: 'تحويل كونسيرج خاص (VIP Wire Transfer)',
    trackingNumber: 'IQ-VIP-8821',
    items: [
      {
        productId: 'bespoke-01',
        name: 'دشداشة صوف كشميري ملكي مطرزة يدوياً',
        nameEn: 'Royal Hand-Embroidered Cashmere Dishdasha',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
        price: 320000,
        quantity: 1,
        selectedSize: 'Bespoke Custom',
        fabricOption: 'صوف كشمير إيطالي نقي 100% (Super 180s - كحلي ملكي)',
      },
      {
        productId: 'bespoke-02',
        name: 'بشت نجفي أصيل خيوط ذهبية زري فرنسي',
        nameEn: 'Authentic Najafi Bisht with French Gold Zari',
        imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
        price: 165000,
        quantity: 1,
        selectedSize: 'Bespoke Custom',
        fabricOption: 'صوف ربيعي ياباني درجة أولى مع تطريز قيطان يدوي',
      },
    ],
    bespokeDetails: {
      urgency: 'royal_vip',
      atelierMaster: 'الأستاذ جواد البغدادي (كبير خياطي الأتيليه)',
      fittingDate: '2026-04-12 16:00',
      clientMeasurements: {
        chest: '112 cm',
        waist: '98 cm',
        shoulder: '48.5 cm',
        sleeveLength: '64 cm',
        jacketLength: '146 cm (Dishdasha Full)',
        collar: '43 cm',
        height: '183 cm',
        posture: 'مستقيم مع ميلان خفيف للكتف الأيمن (Athletic Royal)',
      },
      artisanNotes: 'طلب تطريز الحروف الأولى (A.S) بخيوط حريرية غير مرئية عند حافة الأكمام الداخلية. تجهيز بروفة القياس الأولى خلال 48 ساعة.',
      fabricSelection: 'Loro Piana Cashmere - Navy Blue #4401',
    },
    timeline: [
      {
        status: 'pending_payment',
        title: 'استلام طلب التفصيل الخاص VIP',
        titleEn: 'VIP Bespoke Order Initiated',
        timestamp: '2026-04-08 11:30',
        note: 'تم تسجيل القياسات المخصصة عبر مستشار الكونسيرج وبانتظار تأكيد الإيداع المالي.',
      },
    ],
  },
  {
    id: 'ORD-8819',
    customerName: 'د. سرمد النعيمي',
    customerPhone: '+9647805541234',
    customerEmail: 'dr.sarmad@hospital.iq',
    shippingAddress: 'بغداد، الجادرية - قرب جامعة بغداد، برج النخيل 7B',
    status: 'processing',
    orderDate: '2026-04-07 14:15',
    type: 'bespoke',
    isVip: true,
    totalPrice: 380000,
    paymentMethod: 'بطاقة ماستركارد مصرف الرافدين الرقمي',
    trackingNumber: 'IQ-BESPOKE-8819',
    items: [
      {
        productId: 'bespoke-03',
        name: 'بدلة تاكسيدو ملكية صوف سوبر 150s مع ياقة ساتان',
        nameEn: 'Black Tie Royal Tuxedo Super 150s Wool',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
        price: 380000,
        quantity: 1,
        selectedSize: 'Bespoke Slim Fit',
        fabricOption: 'صوف إنجليزي إكسترا فاين من دار Scabal',
      },
    ],
    bespokeDetails: {
      urgency: 'high_priority',
      atelierMaster: 'المعلم كريكور هاكوبيان (مشرف بدلات السهرة)',
      fittingDate: '2026-04-10 18:30',
      clientMeasurements: {
        chest: '104 cm',
        waist: '86 cm',
        shoulder: '46 cm',
        sleeveLength: '62.5 cm',
        jacketLength: '76 cm',
        collar: '41 cm',
        height: '178 cm',
        posture: 'قوام رياضي معتدل - صدر عريض',
      },
      artisanNotes: 'البدلة مخصصة لحفل تكريم رسمي يوم 15 نيسان. تم الانتهاء من قص الباترون والبدء بالخياطة اليدوية لبطانة الحرير.',
      fabricSelection: 'Scabal Midnight Black Barathea',
    },
    timeline: [
      {
        status: 'pending_payment',
        title: 'اعتماد الطلب ودفع الرسوم',
        titleEn: 'Order Payment Verified',
        timestamp: '2026-04-07 14:15',
      },
      {
        status: 'processing',
        title: 'قص القماش وبدء الخياطة في الأتيليه',
        titleEn: 'Pattern Drafting & Tailoring in Atelier',
        timestamp: '2026-04-07 16:40',
        note: 'تم نقل القماش لقسم القص اليدوي وتحديد جلسة البروفة.',
      },
    ],
  },
  {
    id: 'ORD-8815',
    customerName: 'عمر البصري',
    customerPhone: '+9647712345678',
    customerEmail: 'omar.basri@techiq.com',
    shippingAddress: 'البصرة، حي العشار - شارع الاستقلال، مجمع النخبة الطبي',
    status: 'processing',
    orderDate: '2026-04-07 10:20',
    type: 'ready_to_wear',
    isVip: false,
    totalPrice: 170000,
    paymentMethod: 'الدفع عند الاستلام (COD)',
    items: [
      {
        productId: 'prod-1',
        name: 'سماعات رأس لاسلكية برو ماكس',
        nameEn: 'Wireless Pro Max Headphones',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        price: 105000,
        quantity: 1,
        selectedSize: 'Over-Ear',
      },
      {
        productId: 'prod-3',
        name: 'حقيبة ظهر للابتوب جلد كلاسيكي مقاوم للماء',
        nameEn: 'Classic Waterproof Leather Backpack',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
        price: 65000,
        quantity: 1,
        selectedSize: '15.6 inch',
      },
    ],
    timeline: [
      {
        status: 'pending_payment',
        title: 'استلام الطلب وتأكيد الهاتف',
        titleEn: 'Order Placed & Confirmed',
        timestamp: '2026-04-07 10:20',
      },
      {
        status: 'processing',
        title: 'تجهيز الشحنة والتغليف الفاخر',
        titleEn: 'Packaging & Warehouse Inspection',
        timestamp: '2026-04-07 12:00',
        note: 'فحص جودة العلبة الأصلية ووضع ملصق الحماية الأمني.',
      },
    ],
  },
  {
    id: 'ORD-8810',
    customerName: 'م. ليلى الشمري',
    customerPhone: '+9647729988776',
    customerEmail: 'layla.sh@architect.iq',
    shippingAddress: 'أربيل، دريم سيتي - فيلا رقم 208',
    status: 'shipped',
    orderDate: '2026-04-06 18:00',
    type: 'bespoke',
    isVip: true,
    totalPrice: 320000,
    paymentMethod: 'ZainCash زين كاش المحفظة الذكية',
    trackingNumber: 'IQ-EXPRESS-9921',
    items: [
      {
        productId: 'bespoke-04',
        name: 'عباءة حريرية مطرزة بنقوش سومرية مذهبة',
        nameEn: 'Sumerian Gold-Embroidered Pure Silk Abaya',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
        price: 320000,
        quantity: 1,
        selectedSize: 'Bespoke Custom Length',
        fabricOption: 'حرير التوت الطبيعي الإيطالي 100% بلون الزمرد الملكي',
      },
    ],
    bespokeDetails: {
      urgency: 'high_priority',
      atelierMaster: 'السيدة هناء البدر (مصممة قسم الهوت كوتور)',
      fittingDate: 'تمت البروفة بنجاح',
      clientMeasurements: {
        chest: '96 cm',
        waist: '74 cm',
        shoulder: '40 cm',
        sleeveLength: '60 cm',
        jacketLength: '142 cm',
        height: '170 cm',
        posture: 'قوام رشيق معتدل',
      },
      artisanNotes: 'تغليف الهدايا الملكي مع بطاقة تهنئة خاصة وعطر المسك الطبيعي للأقمشة.',
      fabricSelection: 'Emerald Pure Silk Crepe de Chine',
    },
    timeline: [
      {
        status: 'pending_payment',
        title: 'استلام الطلب وتأكيد الدفع',
        titleEn: 'Order Payment Confirmed',
        timestamp: '2026-04-06 18:00',
      },
      {
        status: 'processing',
        title: 'اكتمال التفصيل واجتياز فحص الجودة',
        titleEn: 'Tailoring & Quality Clearance',
        timestamp: '2026-04-07 14:00',
      },
      {
        status: 'shipped',
        title: 'تسليم الشحنة لشركة التوصيل السريع VIP',
        titleEn: 'Handed to VIP Express Courier',
        timestamp: '2026-04-08 09:30',
        note: 'رقم التتبع IQ-EXPRESS-9921 متوقع الوصول خلال 24 ساعة.',
      },
    ],
  },
  {
    id: 'ORD-8798',
    customerName: 'حيدر الجبوري',
    customerPhone: '+9647824445566',
    customerEmail: 'haider.j@example.com',
    shippingAddress: 'بغداد، المنصور - شارع 14 رمضان، عمارة الأمل ط3',
    status: 'delivered',
    orderDate: '2026-04-05 13:40',
    type: 'ready_to_wear',
    isVip: false,
    totalPrice: 175000,
    paymentMethod: 'Qi Card كي كارد الائتماني',
    trackingNumber: 'IQ-DELIV-4100',
    items: [
      {
        productId: 'prod-2',
        name: 'ساعة ذكية ألترا إديشن - تيتانيوم',
        nameEn: 'Smartwatch Ultra Titanium',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        price: 175000,
        quantity: 1,
        selectedSize: '49mm',
      },
    ],
    timeline: [
      {
        status: 'pending_payment',
        title: 'دفع ناجح وتجهيز الطلب',
        titleEn: 'Paid & Processing',
        timestamp: '2026-04-05 13:40',
      },
      {
        status: 'processing',
        title: 'تجهيز الشحنة في المستودع',
        titleEn: 'Dispatched from Hub',
        timestamp: '2026-04-05 15:00',
      },
      {
        status: 'shipped',
        title: 'خروج الشحنة مع مندوب التوصيل',
        titleEn: 'Out for Delivery',
        timestamp: '2026-04-06 10:00',
      },
      {
        status: 'delivered',
        title: 'تم الاستلام بنجاح وتوقيع العميل',
        titleEn: 'Delivered & Signed',
        timestamp: '2026-04-06 14:15',
        note: 'تم التقييم بـ 5 نجوم من قبل العميل.',
      },
    ],
  },
  {
    id: 'ORD-8772',
    customerName: 'زيد طارق العاني',
    customerPhone: '+9647801122334',
    customerEmail: 'zaid.t@example.com',
    shippingAddress: 'بغداد، الكرادة - ساحة كهرمانة، بناية الشرق',
    status: 'cancelled',
    orderDate: '2026-04-04 09:10',
    type: 'ready_to_wear',
    isVip: false,
    totalPrice: 65000,
    paymentMethod: 'الدفع عند الاستلام (COD)',
    items: [
      {
        productId: 'prod-3',
        name: 'حقيبة ظهر للابتوب جلد كلاسيكي مقاوم للماء',
        nameEn: 'Classic Waterproof Leather Backpack',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
        price: 65000,
        quantity: 1,
        selectedSize: '14 inch',
      },
    ],
    timeline: [
      {
        status: 'pending_payment',
        title: 'تسجيل الطلب',
        titleEn: 'Order Created',
        timestamp: '2026-04-04 09:10',
      },
      {
        status: 'cancelled',
        title: 'إلغاء الطلب بناءً على رغبة العميل',
        titleEn: 'Order Cancelled by Customer Request',
        timestamp: '2026-04-04 11:30',
        note: 'اختار العميل تغيير مقاس اللابتوب وإعادة الطلب لاحقاً.',
      },
    ],
  },
];



const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const siteControls = useSiteControls();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);

  // Authentication & Locking directly tied to SiteControlsContext
  const isLocked = !siteControls.isAdminUnlocked;
  const lock = useCallback(() => {
    siteControls.lockAdmin();
  }, [siteControls]);

  const unlock = useCallback((enteredPin: string) => {
    return siteControls.unlockAdmin(enteredPin);
  }, [siteControls]);

  const pin = '1234';
  const setPin = useCallback((newPin: string) => {
    siteControls.setAdminPin(newPin);
  }, [siteControls]);

  // Language state
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const currentStore = siteControls.siteSettings.welcome_title_ar || 'دار ڤانت (VANT)';
  const setCurrentStore = useCallback((name: string) => {
    siteControls.updateSiteSettings({ welcome_title_ar: name });
  }, [siteControls]);

  // Bidirectional Product Adapter between StoreProduct and New Admin Product
  const mapStoreProductToAdminProduct = useCallback((sp: StoreProduct): Product => {
    const rawAvailability = sp.availability || 'in_stock';
    let status: 'active' | 'draft' | 'outOfStock' | 'lowStock' = 'active';
    let availabilityStatus: 'in_stock' | 'limited' | 'coming_soon' | 'sold_out' = 'in_stock';

    if (rawAvailability === 'sold_out') {
      status = 'outOfStock';
      availabilityStatus = 'sold_out';
    } else if (rawAvailability === 'limited') {
      status = 'lowStock';
      availabilityStatus = 'limited';
    } else if (rawAvailability === 'coming_soon') {
      status = 'draft';
      availabilityStatus = 'coming_soon';
    } else {
      status = 'active';
      availabilityStatus = 'in_stock';
    }

    const effectivePrice = sp.price || 0;
    const salePrice = (sp.is_offer && sp.original_price && sp.original_price > sp.price)
      ? sp.price
      : undefined;
    const basePrice = (sp.is_offer && sp.original_price && sp.original_price > sp.price)
      ? sp.original_price
      : effectivePrice;

    return {
      id: String(sp.id),
      name: sp.title_ar || sp.title,
      nameEn: sp.title,
      sku: 'VANT-' + sp.id,
      category: sp.category_ar || sp.category,
      price: basePrice,
      salePrice: salePrice,
      stock: rawAvailability === 'sold_out' ? 0 : 25,
      status,
      imageUrl: sp.image_url,
      images: sp.images && sp.images.length > 0 ? sp.images : [sp.image_url],
      sizes: sp.sizes || ['S', 'M', 'L', 'XL'],
      descriptionAr: sp.description_ar || sp.description,
      descriptionEn: sp.description,
      materialDetails: sp.material || 'صوف كشميري إيطالي نقي',
      availabilityStatus,
      isOnOffer: !!sp.is_offer,
      offerCampaign: sp.offer_badge_ar || 'عرض حصري',
      offerBadgeText: sp.offer_badge_ar || (sp.is_offer ? 'خصم خاص' : undefined),
      salesCount: 12,
      rating: 5.0,
      createdAt: sp.created_at ? sp.created_at.split('T')[0] : '2026-03-01',
      hasVariants: false,
    };
  }, []);

  // Sync products with SiteControlsContext
  const products: Product[] = useMemo(() => {
    if (siteControls.products && siteControls.products.length > 0) {
      return siteControls.products.map(mapStoreProductToAdminProduct);
    }
    return defaultProducts;
  }, [siteControls.products, mapStoreProductToAdminProduct]);

  // Derive product metrics helper
  const deriveProductMetricsFromVariants = (prod: Partial<Product>): Partial<Product> => {
    if (!prod.hasVariants || !prod.variants || prod.variants.length === 0) {
      return prod;
    }
    const totalStock = prod.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    const firstVariant = prod.variants[0];
    let effectivePrice = prod.price;
    if (typeof effectivePrice !== 'number' || effectivePrice <= 0) {
      effectivePrice = firstVariant?.price || 0;
    }
    let effectiveSalePrice = prod.salePrice;
    if ((typeof effectiveSalePrice !== 'number' || effectiveSalePrice <= 0) && firstVariant?.salePrice) {
      effectiveSalePrice = firstVariant.salePrice;
    }
    let status = prod.status || 'active';
    let availabilityStatus = prod.availabilityStatus || 'in_stock';
    if (totalStock === 0) {
      status = 'outOfStock';
      availabilityStatus = 'sold_out';
    } else if (totalStock <= 5) {
      status = 'lowStock';
      availabilityStatus = 'limited';
    } else if (status === 'outOfStock' || status === 'lowStock') {
      status = 'active';
      availabilityStatus = 'in_stock';
    }
    const variantImages = prod.variants.flatMap((v) => v.images || []).filter(Boolean);
    const variantSizes = Array.from(new Set(prod.variants.flatMap((v) => v.sizes || []))).filter(Boolean);
    const primaryImage =
      firstVariant?.images?.[0] ||
      (prod.imageUrl && !prod.imageUrl.includes('photo-1505740420928') ? prod.imageUrl : variantImages[0]) ||
      prod.imageUrl ||
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80';

    return {
      ...prod,
      stock: totalStock,
      price: effectivePrice,
      salePrice: effectiveSalePrice,
      status,
      availabilityStatus,
      imageUrl: primaryImage,
      images: prod.images && prod.images.length > 0 ? prod.images : (variantImages.length > 0 ? variantImages : [primaryImage]),
      sizes: variantSizes.length > 0 ? variantSizes : prod.sizes,
      isOnOffer: !!effectiveSalePrice && effectiveSalePrice > 0 && effectiveSalePrice < effectivePrice,
    };
  };

  const addProduct = useCallback((newProd: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating'>) => {
    const enriched = deriveProductMetricsFromVariants(newProd);
    let availability: ProductAvailability = 'in_stock';
    if (enriched.availabilityStatus === 'sold_out') availability = 'sold_out';
    else if (enriched.availabilityStatus === 'limited') availability = 'limited';
    else if (enriched.availabilityStatus === 'coming_soon') availability = 'coming_soon';

    const variantColors = (enriched.variants || [])
      .map((v) => v.colorNameAr || v.colorNameEn)
      .filter(Boolean);

    const allImages = enriched.images && enriched.images.length > 0
      ? enriched.images
      : [enriched.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80'];

    siteControls.addProduct({
      title: enriched.nameEn || enriched.name || 'New Item',
      title_ar: enriched.name,
      price: enriched.salePrice || enriched.price || 0,
      original_price: enriched.salePrice ? enriched.price : undefined,
      category: enriched.category || 'Outerwear',
      category_ar: enriched.category,
      sizes: enriched.sizes && enriched.sizes.length > 0 ? enriched.sizes : ['S', 'M', 'L', 'XL'],
      colors: variantColors.length > 0 ? variantColors : undefined,
      image_url: enriched.imageUrl || allImages[0],
      images: allImages,
      description: enriched.descriptionEn,
      description_ar: enriched.descriptionAr,
      material: enriched.materialDetails,
      availability,
      is_offer: enriched.isOnOffer,
      offer_badge_ar: enriched.offerBadgeText || enriched.offerCampaign,
    });
  }, [siteControls]);

  const updateProduct = useCallback((id: string, updated: Partial<Product>) => {
    const patch: Partial<StoreProduct> = {};
    if (updated.name) patch.title_ar = updated.name;
    if (updated.nameEn) patch.title = updated.nameEn;
    if (updated.price !== undefined) {
      if (updated.salePrice) {
        patch.price = updated.salePrice;
        patch.original_price = updated.price;
        patch.is_offer = true;
      } else {
        patch.price = updated.price;
        patch.is_offer = false;
      }
    } else if (updated.salePrice !== undefined) {
      patch.price = updated.salePrice;
      patch.is_offer = true;
    }
    if (updated.category) {
      patch.category = updated.category;
      patch.category_ar = updated.category;
    }
    if (updated.imageUrl) patch.image_url = updated.imageUrl;
    if (updated.images) patch.images = updated.images;
    if (updated.sizes) patch.sizes = updated.sizes;
    if (updated.descriptionAr) patch.description_ar = updated.descriptionAr;
    if (updated.descriptionEn) patch.description = updated.descriptionEn;
    if (updated.materialDetails) patch.material = updated.materialDetails;
    if (updated.availabilityStatus) {
      patch.availability = updated.availabilityStatus as ProductAvailability;
    }
    if (updated.isOnOffer !== undefined) {
      patch.is_offer = updated.isOnOffer;
    }
    if (updated.offerBadgeText || updated.offerCampaign) {
      patch.offer_badge_ar = updated.offerBadgeText || updated.offerCampaign;
    }

    siteControls.updateProduct(id, patch);
  }, [siteControls]);

  const deleteProduct = useCallback((id: string) => {
    siteControls.deleteProduct(id);
  }, [siteControls]);

  const toggleProductOffer = useCallback((id: string) => {
    const target = siteControls.products.find((p) => String(p.id) === String(id));
    if (target) {
      const willBeOffer = !target.is_offer;
      const basePrice = target.original_price || target.price;
      const newSalePrice = willBeOffer ? Math.round((basePrice * 0.85) / 500) * 500 : basePrice;
      siteControls.updateProduct(id, {
        is_offer: willBeOffer,
        original_price: willBeOffer ? basePrice : undefined,
        price: willBeOffer ? newSalePrice : basePrice,
        offer_badge_ar: willBeOffer ? 'خصم 15%' : undefined,
      });
    }
  }, [siteControls]);

  // Offers System (integrated with campaigns)
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const saved = localStorage.getItem('vant_offers_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultOffers;
  });

  const addOffer = useCallback((newOff: Omit<Offer, 'id' | 'usedCount'>) => {
    const offer: Offer = {
      ...newOff,
      id: 'off-' + Date.now(),
      usedCount: 0,
    };
    setOffers((prev) => {
      const next = [offer, ...prev];
      try { localStorage.setItem('vant_offers_v1', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateOffer = useCallback((id: string, updated: Partial<Offer>) => {
    setOffers((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, ...updated } : o));
      try { localStorage.setItem('vant_offers_v1', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setOffers((prev) => {
      const next = prev.filter((o) => o.id !== id);
      try { localStorage.setItem('vant_offers_v1', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Subscribers adapter (bridged with newsletter.ts)
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const raw = getStoredSubscribers();
    if (raw && raw.length > 0) {
      return raw.map((s, idx) => ({
        id: s.id,
        name: s.email.split('@')[0],
        email: s.email,
        phone: '+964780' + Math.floor(1000000 + idx * 234567),
        status: s.status,
        totalOrders: 1,
        totalSpent: 45000,
        joinedDate: s.subscribed_at ? s.subscribed_at.split('T')[0] : '2026-03-01',
        tags: s.tags || ['VIP'],
      }));
    }
    return defaultSubscribers;
  });

  const addSubscriber = useCallback((newSub: Omit<Subscriber, 'id' | 'joinedDate' | 'totalOrders' | 'totalSpent'>) => {
    const sub: Subscriber = {
      ...newSub,
      id: 'sub-' + Date.now(),
      joinedDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
    };
    addStoredSubscriber(newSub.email);
    setSubscribers((prev) => [sub, ...prev]);
  }, []);

  const deleteSubscriber = useCallback((id: string) => {
    const target = subscribers.find((s) => s.id === id);
    if (target) {
      removeStoredSubscriber(target.email);
    }
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }, [subscribers]);

  // Orders Management System (OMS)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('vant_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultOrders;
  });

  const updateOrderStatus = useCallback((id: string, newStatus: OrderStatus, note?: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== id) return order;
        const now = new Date();
        const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
        const statusTitles: Record<OrderStatus, { ar: string; en: string }> = {
          pending_payment: { ar: 'بانتظار تأكيد الدفع', en: 'Pending Payment' },
          processing: { ar: 'جاري العمل في الأتيليه والتجهيز', en: 'In Atelier / Processing' },
          shipped: { ar: 'تم شحن الطلب وتحديد التتبع', en: 'Order Dispatched / Shipped' },
          delivered: { ar: 'تم التسليم بنجاح', en: 'Delivered Successfully' },
          cancelled: { ar: 'تم إلغاء الطلب', en: 'Order Cancelled' },
        };
        const newTimelineEvent: OrderTimelineEvent = {
          status: newStatus,
          title: statusTitles[newStatus]?.ar || newStatus,
          titleEn: statusTitles[newStatus]?.en || newStatus,
          timestamp,
          note: note || undefined,
        };
        return {
          ...order,
          status: newStatus,
          timeline: [...order.timeline, newTimelineEvent],
        };
      });
      try { localStorage.setItem('vant_orders_v1', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const updateOrderArtisanNotes = useCallback((id: string, notes: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== id) return order;
        return {
          ...order,
          bespokeDetails: {
            ...order.bespokeDetails,
            artisanNotes: notes,
          },
        };
      });
      try { localStorage.setItem('vant_orders_v1', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const addOrder = useCallback((newOrderData: Omit<Order, 'id' | 'orderDate' | 'timeline'>) => {
    const now = new Date();
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newOrder: Order = {
      ...newOrderData,
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      orderDate: timestamp,
      timeline: [
        {
          status: newOrderData.status,
          title: 'إنشاء الطلب الجديد',
          titleEn: 'Order Created',
          timestamp,
        },
      ],
    };
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try { localStorage.setItem('vant_orders_v1', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Site Settings adapter synced seamlessly with SiteControlsContext
  const siteSettings: SiteSettings = useMemo(() => {
    const sc = siteControls.siteSettings;
    return {
      storeName: sc.welcome_title_ar || 'دار ڤانت للأزياء الرفيعة',
      storeNameEn: sc.welcome_title_en || 'Maison VANT Haute Couture',
      currency: siteControls.currencyCode || 'IQD',
      emailAlerts: true,
      smsAlerts: false,
      pin: '1234',
      maintenanceMode: !!sc.maintenance_mode,
      maintenanceMessageAr: sc.maintenance_message_ar || 'نقوم حالياً بتجهيز وإطلاق المجموعة الحصرية الجديدة. سنعود لاستقبال طلباتكم الفاخرة قريباً جداً.',
      maintenanceMessageEn: sc.maintenance_message || 'We are currently curating and preparing our new exclusive collection.',
      maintenanceEstimatedBack: 'خلال وقت قصير',
      splashMotif: (sc.splash_motif === 'hanger' || sc.splash_motif === 'scissors' || sc.splash_motif === 'monogram')
        ? (sc.splash_motif as any)
        : 'hanger',
      splashTextAr: sc.loading_text_ar || 'ڤانت للأزياء • أصالة الحرفة الرفيعة',
      splashTextEn: sc.loading_text_en || 'VANT • High-Fashion & Modern Silhouettes',
      splashDurationMs: 2200,
      heroBannerBg: siteControls.controls['banner_hero_bg']?.actionValue || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
      heroHeadlineAr: siteControls.controls['banner_hero_title']?.label_ar || 'الصياغة المعمارية للأزياء الهادئة',
      heroHeadlineEn: siteControls.controls['banner_hero_title']?.label_en || 'Architectural Silhouettes in Virgin Wool',
      heroSubtitleAr: siteControls.controls['banner_hero_subtitle']?.label_ar || 'تصاميم تم تفصيلها بدقة هندسية في أرقى المعامل الإيطالية.',
      heroSubtitleEn: siteControls.controls['banner_hero_subtitle']?.label_en || 'Engineered with sculptural precision from virgin Italian wool.',
      heroBadgeAr: siteControls.controls['banner_hero_tag']?.label_ar || 'ڤانت · كتالوج موسم 2026',
      heroBadgeEn: siteControls.controls['banner_hero_tag']?.label_en || 'MAISON VANT · WINTER CAPSULE 2026',
      heroCtaTextAr: siteControls.controls['banner_hero_btn']?.label_ar || 'تصفح كافة القطع',
      heroCtaTextEn: siteControls.controls['banner_hero_btn']?.label_en || 'Browse All Pieces',
      heroCtaLink: '#products',
      whatsappOrdersNumber: siteControls.controls['cfg_whatsapp_phone']?.actionValue || '+9647701234567',
      whatsappOrdersName: 'قسم إدارة واستلام الطلبات الفورية',
      whatsappConciergeNumber: siteControls.controls['cfg_bespoke_phone']?.actionValue || '+9647809876543',
      whatsappConciergeName: 'كونسيرج التفصيل الخاص والخياطة الراقية',
      whatsappDefaultMsg: 'مرحباً، أود الاستفسار عن تفصيل قطعة خاصة من دار ڤانت.',
    };
  }, [siteControls.siteSettings, siteControls.currencyCode, siteControls.controls]);

  const updateSiteSettings = useCallback(async (partial: Partial<SiteSettings>): Promise<{ success: boolean; syncedWithCloud: boolean }> => {
    const scPatch: any = {};
    if (partial.maintenanceMode !== undefined) {
      scPatch.maintenance_mode = partial.maintenanceMode;
    }
    if (partial.maintenanceMessageAr !== undefined) {
      scPatch.maintenance_message_ar = partial.maintenanceMessageAr;
    }
    if (partial.maintenanceMessageEn !== undefined) {
      scPatch.maintenance_message = partial.maintenanceMessageEn;
    }
    if (partial.storeName !== undefined) {
      scPatch.welcome_title_ar = partial.storeName;
    }
    if (partial.storeNameEn !== undefined) {
      scPatch.welcome_title_en = partial.storeNameEn;
    }
    if (partial.splashTextAr !== undefined) {
      scPatch.loading_text_ar = partial.splashTextAr;
    }
    if (partial.splashTextEn !== undefined) {
      scPatch.loading_text_en = partial.splashTextEn;
    }
    if (partial.splashMotif !== undefined) {
      scPatch.splash_motif = partial.splashMotif;
    }
    if (partial.currency && (partial.currency === 'د.ع' || partial.currency === 'IQD' || partial.currency === 'USD')) {
      siteControls.setCurrencyCode(partial.currency as any);
    }
    if (partial.pin) {
      siteControls.setAdminPin(partial.pin);
    }
    if (partial.heroHeadlineAr) {
      siteControls.updateControl('banner_hero_title', { label_ar: partial.heroHeadlineAr });
    }
    if (partial.heroHeadlineEn) {
      siteControls.updateControl('banner_hero_title', { label_en: partial.heroHeadlineEn });
    }
    if (partial.heroSubtitleAr) {
      siteControls.updateControl('banner_hero_subtitle', { label_ar: partial.heroSubtitleAr });
    }
    if (partial.heroSubtitleEn) {
      siteControls.updateControl('banner_hero_subtitle', { label_en: partial.heroSubtitleEn });
    }
    if (partial.heroBannerBg) {
      siteControls.updateControl('banner_hero_bg', { actionValue: partial.heroBannerBg });
    }
    if (partial.whatsappOrdersNumber) {
      siteControls.updateControl('cfg_whatsapp_phone', { actionValue: partial.whatsappOrdersNumber });
    }
    if (partial.whatsappConciergeNumber) {
      siteControls.updateControl('cfg_bespoke_phone', { actionValue: partial.whatsappConciergeNumber });
    }

    await siteControls.updateSiteSettings(scPatch);
    return { success: true, syncedWithCloud: true };
  }, [siteControls]);

  // Sync document direction
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  return (
    <AdminContext.Provider
      value={{
        activeView,
        setActiveView,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        isLocked,
        lock,
        unlock,
        pin,
        setPin,
        lang,
        setLang,
        toggleLang,
        currentStore,
        setCurrentStore,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductOffer,
        offers,
        addOffer,
        updateOffer,
        deleteOffer,
        subscribers,
        addSubscriber,
        deleteSubscriber,
        orders,
        updateOrderStatus,
        updateOrderArtisanNotes,
        addOrder,
        notifications,
        markNotificationsAsRead,
        isOfferModalOpen,
        setIsOfferModalOpen,
        siteSettings,
        updateSiteSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminBridge = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminBridge must be used within an AdminProvider');
  }
  return context;
};

export default useAdminBridge;
