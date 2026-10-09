import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://gjjsdnyfhhbacuciqwbq.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqanNkbnlmaGhiYWN1Y2lxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3OTg4NDYsImV4cCI6MjEwNjM3NDg0Nn0.mx093sChSMmr_EwFlISmPAMo1q-XTBB1Fq9XX83p15Y';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Convert any Eastern Arabic (٠-٩) or Persian (۰-۹) numerals to Western Latin numerals (0-9).
 */
export function toWesternNumerals(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

/**
 * Format price with Western numerals and IQD currency (e.g. "20,000 IQD")
 */
export function formatPrice(price: number, currency: string = 'IQD'): string {
  if (typeof price !== 'number' || isNaN(price)) return `0 IQD`;
  const normalizedCurrency = currency === 'ar' ? 'IQD' : (currency || 'IQD');
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(price);

  return `${formattedNumber} ${normalizedCurrency}`;
}
