import { useSiteControls } from '../context/SiteControlsContext';
import type { Product } from '../types';

export function useProducts(): {
  products: Product[];
  loading: boolean;
  error: string | null;
  isLiveDatabase: boolean;
  lastSyncTime: Date | null;
  refresh: () => Promise<void>;
} {
  const { products, loading, error, isLiveDatabase, lastSyncTime, refreshProducts } = useSiteControls();

  return {
    products,
    loading,
    error,
    isLiveDatabase,
    lastSyncTime,
    refresh: refreshProducts,
  };
}
