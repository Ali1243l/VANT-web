/**
 * Maison VANT - Application Configuration & Production Constants
 */

export const DEFAULT_WHATSAPP_PHONE = (
  import.meta.env.VITE_WHATSAPP_PHONE || '9647000000000'
).replace(/[^0-9]/g, '');

export const PRODUCTS_PAGE_SIZE = 12;

export const HERO_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80';
