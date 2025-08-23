import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducts';

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENTLY_VIEWED = 20;

export const useRecentlyViewed = () => {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch product details for recently viewed IDs
  const { data: recentlyViewed = [], isLoading } = useQuery({
    queryKey: ['recently-viewed', recentlyViewedIds],
    queryFn: async () => {
      if (recentlyViewedIds.length === 0) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .in('id', recentlyViewedIds)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching recently viewed products:', error);
        return [];
      }

      // Maintain the order based on recentlyViewedIds
      const orderedProducts = recentlyViewedIds.map(id => 
        data?.find(product => product.id === id)
      ).filter(Boolean) as Product[];

      return orderedProducts;
    },
    enabled: recentlyViewedIds.length > 0,
  });

  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds(prev => {
      // Remove if already exists, then add to beginning
      const filtered = prev.filter(id => id !== productId);
      const newIds = [productId, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds(prev => {
      const newIds = prev.filter(id => id !== productId);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  }, []);

  return {
    recentlyViewed,
    isLoading,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
  };
};