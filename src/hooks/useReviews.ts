import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ReviewFilters {
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful';
}

export const useReviews = (productId: string, filters: ReviewFilters = {}) => {
  const { rating, sortBy = 'newest' } = filters;

  return useQuery({
    queryKey: ['reviews', productId, rating, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId);

      // Rating filter
      if (rating && rating > 0) {
        query = query.eq('rating', rating);
      }

      // Sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'rating-high':
          query = query.order('rating', { ascending: false });
          break;
        case 'rating-low':
          query = query.order('rating', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      return data as Review[];
    },
  });
};

export const useSubmitReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      rating, 
      comment 
    }: { 
      productId: string; 
      rating: number; 
      comment?: string; 
    }) => {
      if (!user) {
        throw new Error('You must be logged in to submit a review');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback.",
      });
      
      // Invalidate reviews queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
};

export const useReviewStats = (productId: string) => {
  return useQuery({
    queryKey: ['review-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) {
        throw error;
      }

      const reviews = data || [];
      const totalReviews = reviews.length;
      
      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = sum / totalReviews;

      const distribution = reviews.reduce((acc, review) => {
        acc[review.rating as keyof typeof acc] = (acc[review.rating as keyof typeof acc] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      return {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        distribution
      };
    },
  });
};