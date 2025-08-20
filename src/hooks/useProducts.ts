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

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (categorySlug && categorySlug !== 'all') {
        query = query.eq('categories.slug', categorySlug);
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