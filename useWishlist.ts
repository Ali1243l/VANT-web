import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vant_wishlist';
const EVENT_NAME = 'vant-wishlist-update';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setWishlist(stored ? JSON.parse(stored) : []);
      } catch {
        // Fallback
      }
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const isWishlisted = useCallback(
    (id: string | number) => wishlist.includes(String(id)),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (id: string | number) => {
      const idStr = String(id);
      setWishlist((prev) => {
        const next = prev.includes(idStr) ? prev.filter((item) => item !== idStr) : [...prev, idStr];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(EVENT_NAME));
        } catch {
          // LocalStorage fallback
        }
        return next;
      });
    },
    []
  );

  return {
    wishlist,
    wishlistCount: wishlist.length,
    isWishlisted,
    toggleWishlist,
  };
}
