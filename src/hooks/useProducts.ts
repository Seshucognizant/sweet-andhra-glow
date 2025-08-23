import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  rating: number;
  review_count: number;
  category_id?: string;
  stock_quantity: number;
  is_active: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  weight_options: string[];
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

interface ProductFilters {
  categorySlug?: string;
  searchTerm?: string;
  priceRange?: [number, number];
  minRating?: number;
  availability?: 'all' | 'in-stock' | 'out-of-stock';
  sortBy?: 'name' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
}

export const useProducts = (filters: ProductFilters = {}) => {
  const {
    categorySlug,
    searchTerm,
    priceRange,
    minRating,
    availability,
    sortBy = 'newest'
  } = filters;

  return useQuery({
    queryKey: ['products', categorySlug, searchTerm, priceRange, minRating, availability, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('is_active', true);

      // Category filter
      if (categorySlug && categorySlug !== 'all') {
        query = query.eq('categories.slug', categorySlug);
      }

      // Search filter
      if (searchTerm && searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Price range filter
      if (priceRange && (priceRange[0] > 0 || priceRange[1] < 5000)) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }

      // Minimum rating filter
      if (minRating && minRating > 0) {
        query = query.gte('rating', minRating);
      }

      // Availability filter
      if (availability === 'in-stock') {
        query = query.gt('stock_quantity', 0);
      } else if (availability === 'out-of-stock') {
        query = query.eq('stock_quantity', 0);
      }

      // Sorting
      switch (sortBy) {
        case 'name':
          query = query.order('name', { ascending: true });
          break;
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
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data as Product[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data;
    },
  });
};