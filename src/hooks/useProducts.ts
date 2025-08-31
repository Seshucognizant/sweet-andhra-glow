import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Category } from '@/types/product';

export type { Product, Category } from '@/types/product';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name, slug)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedData = data?.map(item => ({
          ...item,
          weight_options: Array.isArray(item.weight_options) ? item.weight_options : [],
          total_reviews: item.review_count || 0,
        })) as Product[] || [];

        setProducts(transformedData);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { 
    products, 
    loading, 
    error,
    // Legacy compatibility
    data: products,
    isLoading: loading 
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;

        setCategories(data || []);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { 
    categories, 
    loading, 
    error,
    // Legacy compatibility
    data: categories,
    isLoading: loading 
  };
};