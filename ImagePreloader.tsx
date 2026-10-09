import type { Product } from '../types';
import { useImagePreloader } from '../hooks/useImagePreloader';

interface Props {
  products: Product[];
}

/**
 * Declarative component that activates Intersection Observer prefetching
 * for upcoming items in the masonry grid and their modal gallery angles.
 */
export default function ImagePreloader({ products }: Props) {
  useImagePreloader(products);
  return null;
}
