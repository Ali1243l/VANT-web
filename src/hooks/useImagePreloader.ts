import { useEffect } from 'react';
import type { Product } from '../types';

// Global cache to avoid redundant network requests across component mounts and filter shifts
const preloadedCache = new Set<string>();

export function preloadImage(url: string): Promise<void> {
  if (!url || preloadedCache.has(url)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      preloadedCache.add(url);
      resolve();
    };
    img.onerror = () => {
      // Mark as attempted even on error so we don't endlessly retry broken URLs
      preloadedCache.add(url);
      resolve();
    };
  });
}

/**
 * Preloads upcoming images 600px ahead of the viewport using IntersectionObserver.
 * Also preloads secondary gallery angles so detail modals open instantaneously.
 */
export function useImagePreloader(products: Product[]) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // Map product IDs to their full image lists
    const productMap = new Map<string, string[]>();
    for (const p of products) {
      const urls = [p.image_url, ...(p.images || [])].filter(Boolean);
      productMap.set(String(p.id), urls);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const productId = target.getAttribute('data-preload-product-id');
            if (productId) {
              const urls = productMap.get(productId) || [];
              urls.forEach((url) => preloadImage(url));
              // Unobserve once preloading has been triggered for this card
              observer.unobserve(target);
            }
          }
        });
      },
      {
        root: null,
        // 600px proactive look-ahead margin as requested by user
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.01,
      }
    );

    // Give DOM a frame to layout before querying card sentinels
    const rafId = requestAnimationFrame(() => {
      const elements = document.querySelectorAll('[data-preload-product-id]');
      elements.forEach((el) => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [products]);
}
