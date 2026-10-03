import { useSiteControls } from '../context/SiteControlsContext';
import type { Product } from '../types';

export function useProducts(): {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalProductsCount: number;
  error: string | null;
  isLiveDatabase: boolean;
  lastSyncTime: Date | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
} {
  const {
    products,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount,
    error,
    isLiveDatabase,
    lastSyncTime,
    refreshProducts,
    loadMoreProducts,
  } = useSiteControls();

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    totalProductsCount,
    error,
    isLiveDatabase,
    lastSyncTime,
    refresh: refreshProducts,
    loadMore: loadMoreProducts,
  };
}
