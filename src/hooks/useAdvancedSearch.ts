import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducts';

export interface AdvancedSearchCriteria {
  query: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  availability?: 'all' | 'in-stock' | 'out-of-stock';
  tags?: string[];
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
}

export const useAdvancedSearch = () => {
  const [criteria, setCriteria] = useState<AdvancedSearchCriteria>({
    query: '',
    sortBy: 'relevance'
  });
  
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['advanced-search', criteria],
    queryFn: async () => {
      if (!criteria.query.trim()) return [];

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('is_active', true);

      // Text search
      if (criteria.query.trim()) {
        query = query.or(`name.ilike.%${criteria.query}%,description.ilike.%${criteria.query}%`);
      }

      // Category filter
      if (criteria.categoryId && criteria.categoryId !== 'all') {
        query = query.eq('category_id', criteria.categoryId);
      }

      // Price range filter
      if (criteria.priceMin !== undefined) {
        query = query.gte('price', criteria.priceMin);
      }
      if (criteria.priceMax !== undefined) {
        query = query.lte('price', criteria.priceMax);
      }

      // Rating filter
      if (criteria.minRating !== undefined && criteria.minRating > 0) {
        query = query.gte('rating', criteria.minRating);
      }

      // Availability filter
      if (criteria.availability === 'in-stock') {
        query = query.gt('stock_quantity', 0);
      } else if (criteria.availability === 'out-of-stock') {
        query = query.eq('stock_quantity', 0);
      }

      // Sorting
      switch (criteria.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'popular':
          query = query.order('review_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'relevance':
        default:
          // For relevance, we'll order by a combination of rating and review count
          query = query.order('rating', { ascending: false }).order('review_count', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Advanced search error:', error);
        throw error;
      }

      const transformedData = data?.map(item => ({
        ...item,
        weight_options: Array.isArray(item.weight_options) ? item.weight_options : [],
        review_count: item.review_count || 0,
        total_reviews: item.review_count || 0,
      })) as Product[] || [];

      return transformedData;
    },
    enabled: criteria.query.trim().length > 0,
  });

  const updateCriteria = useCallback((updates: Partial<AdvancedSearchCriteria>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  }, []);

  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const resetCriteria = useCallback(() => {
    setCriteria({
      query: '',
      sortBy: 'relevance'
    });
  }, []);

  return {
    criteria,
    results,
    isLoading,
    error,
    searchHistory,
    updateCriteria,
    addToSearchHistory,
    clearSearchHistory,
    resetCriteria,
  };
};

// Hook for search suggestions/autocomplete
export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return [];

      const { data, error } = await supabase
        .from('products')
        .select('name, id')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(8);

      if (error) {
        console.error('Search suggestions error:', error);
        throw error;
      }

      return data || [];
    },
    enabled: query.trim().length >= 2,
  });
};