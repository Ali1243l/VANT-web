/**
 * Formatting utilities for Store Admin
 */

export const formatCurrency = (
  amount: number,
  currency: string = 'IQD',
  _locale: string = 'en'
): string => {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(amount));

    if (currency === 'IQD') {
      return `${formatted} IQD`;
    }
    if (currency === 'USD') {
      return `$${formatted}`;
    }
    return `${formatted} ${currency}`;
  } catch {
    return `${Math.round(amount)} IQD`;
  }
};

export const formatNumber = (
  num: number,
  _locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat('en-US').format(num);
  } catch {
    return num.toString();
  }
};

/**
 * Converts any Arabic-Indic (٠-٩) or Eastern Arabic digits to standard Western/English digits (0-9)
 */
export const toEnglishDigits = (val: string | number): string => {
  if (typeof val === 'number') return val.toString();
  if (!val) return '';
  return val.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    (d.charCodeAt(0) & 0xf).toString()
  );
};

export const formatPercent = (
  val: number,
  includeSign: boolean = true
): string => {
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};

export const formatDate = (
  dateInput: string | Date | number,
  locale: string = 'ar-SA',
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const d = new Date(dateInput);
    const defaultOpts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options || defaultOpts).format(d);
  } catch {
    return String(dateInput);
  }
};

export const formatRelativeTime = (
  dateInput: string | Date | number,
  locale: string = 'ar'
): string => {
  try {
    const then = new Date(dateInput).getTime();
    const now = Date.now();
    const diffSecs = Math.floor((now - then) / 1000);

    if (diffSecs < 60) {
      return locale === 'ar' ? 'الآن' : 'just now';
    }
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) {
      return locale === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return locale === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return locale === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    }
    return formatDate(dateInput, locale);
  } catch {
    return String(dateInput);
  }
};
