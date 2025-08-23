import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export const useRecommendations = (productId?: string, limit: number = 8) => {
  const { user } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  return useQuery({
    queryKey: ['recommendations', productId, user?.id, cartItems.length, wishlistItems.length],
    queryFn: async () => {
      try {
        // Get user's interaction data
        const cartProductIds = cartItems.map(item => item.product_id);
        const wishlistProductIds = wishlistItems.map(item => item.product_id);
        const interactedProductIds = [...cartProductIds, ...wishlistProductIds];

        let recommendedProducts: Product[] = [];

        if (productId) {
          // Product-based recommendations (similar products)
          const { data: currentProduct } = await supabase
            .from('products')
            .select('category_id, price')
            .eq('id', productId)
            .single();

          if (currentProduct) {
            // Get products in same category with similar price range
            const priceMin = currentProduct.price * 0.7;
            const priceMax = currentProduct.price * 1.5;

            const { data: similarProducts } = await supabase
              .from('products')
              .select(`
                *,
                category:categories(name, slug)
              `)
              .eq('category_id', currentProduct.category_id)
              .neq('id', productId)
              .gte('price', priceMin)
              .lte('price', priceMax)
              .eq('is_active', true)
              .order('rating', { ascending: false })
              .order('review_count', { ascending: false })
              .limit(limit);

            recommendedProducts = (similarProducts || []).map(p => ({
              ...p,
              weight_options: Array.isArray(p.weight_options) 
                ? p.weight_options.map(String) 
                : []
            })) as Product[];
          }
        } else {
          // General recommendations based on user behavior
          let query = supabase
            .from('products')
            .select(`
              *,
              category:categories(name, slug)
            `)
            .eq('is_active', true);

          // Exclude products already in cart or wishlist
          if (interactedProductIds.length > 0) {
            query = query.not('id', 'in', `(${interactedProductIds.join(',')})`);
          }

          // Get highly rated bestsellers
          const { data: products } = await query
            .gte('rating', 4.0)
            .gte('review_count', 5)
            .or('is_bestseller.eq.true,is_new.eq.true')
            .order('rating', { ascending: false })
            .order('review_count', { ascending: false })
            .limit(limit);

          recommendedProducts = (products || []).map(p => ({
            ...p,
            weight_options: Array.isArray(p.weight_options) 
              ? p.weight_options.map(String) 
              : []
          })) as Product[];
        }

        // If we don't have enough recommendations, fill with top-rated products
        if (recommendedProducts.length < limit) {
          const { data: topRated } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(name, slug)
            `)
            .eq('is_active', true)
            .not('id', 'in', `(${[productId, ...recommendedProducts.map(p => p.id), ...interactedProductIds].filter(Boolean).join(',') || 'null'})`)
            .gte('rating', 4.0)
            .order('rating', { ascending: false })
            .order('review_count', { ascending: false })
            .limit(limit - recommendedProducts.length);

          recommendedProducts = [...recommendedProducts, ...(topRated || []).map(p => ({
            ...p,
            weight_options: Array.isArray(p.weight_options) 
              ? p.weight_options.map(String) 
              : []
          }))];
        }

        return recommendedProducts as Product[];
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for category-based recommendations
export const useCategoryRecommendations = (categoryId: string, excludeProductId?: string, limit: number = 6) => {
  return useQuery({
    queryKey: ['category-recommendations', categoryId, excludeProductId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (excludeProductId) {
        query = query.neq('id', excludeProductId);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching category recommendations:', error);
        return [];
      }

      return data.map(p => ({
        ...p,
        weight_options: Array.isArray(p.weight_options) 
          ? p.weight_options.map(String) 
          : []
      })) as Product[];
    },
    enabled: !!categoryId,
  });
};

// Hook for trending products (based on recent activity)
export const useTrendingProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      // Get products with recent high activity (reviews, high ratings, bestsellers)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('is_active', true)
        .gte('rating', 4.0)
        .or('is_bestseller.eq.true,is_new.eq.true')
        .order('review_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending products:', error);
        return [];
      }

      return data.map(p => ({
        ...p,
        weight_options: Array.isArray(p.weight_options) 
          ? p.weight_options.map(String) 
          : []
      })) as Product[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};