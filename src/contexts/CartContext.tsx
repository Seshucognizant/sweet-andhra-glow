import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  weight_option?: string;
  product?: {
    name: string;
    price: number;
    image_url: string;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number, weightOption?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart items when user logs in
  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(name, price, image_url)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Cleanup any duplicate rows for same product/weight to ensure single line per item
      const normalize = (w?: string | null) => {
        if (w === undefined || w === null) return null;
        const t = String(w).trim().toLowerCase();
        if (t === '' || t === 'null' || t === 'undefined') return null;
        return t;
      };

      const rows = data || [];
      const groups = new Map<string, { total: number; ids: string[] }>();
      for (const r of rows as any[]) {
        const key = `${r.product_id}:${normalize(r.weight_option) ?? 'null'}`;
        const g = groups.get(key);
        if (g) {
          g.total += r.quantity || 0;
          g.ids.push(r.id);
        } else {
          groups.set(key, { total: r.quantity || 0, ids: [r.id] });
        }
      }

      let changed = false;
      for (const [, g] of groups) {
        if (g.ids.length > 1) {
          changed = true;
          const [keepId, ...dupes] = g.ids;
          const { error: upErr } = await supabase.from('cart_items').update({ quantity: g.total }).eq('id', keepId);
          if (upErr) throw upErr;
          if (dupes.length) {
            const { error: delErr } = await supabase.from('cart_items').delete().in('id', dupes);
            if (delErr) throw delErr;
          }
        }
      }

      if (changed) {
        const { data: fresh, error: refetchErr } = await supabase
          .from('cart_items')
          .select(`*, product:products(name, price, image_url)`) 
          .eq('user_id', user.id);
        if (refetchErr) throw refetchErr;
        setItems(fresh || []);
      } else {
        setItems(rows);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity = 1, weightOption?: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Merge duplicates by normalizing weight options and collapsing rows
      const { data: allRows, error: selectError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (selectError) throw selectError;

      const normalize = (w?: string | null) => {
        if (w === undefined || w === null) return null;
        const t = String(w).trim();
        const lower = t.toLowerCase();
        if (t.length === 0 || lower === 'null' || lower === 'undefined') return null;
        return t;
      };

      const desired = normalize(weightOption);
      const rows = allRows || [];
      const matches = rows.filter((r: any) => normalize(r.weight_option) === desired);

      if (matches.length > 0) {
        const totalExisting = matches.reduce((sum: number, r: any) => sum + (r.quantity || 0), 0);
        const target = matches[0];

        // Update target row with summed quantity + new quantity and normalized weight_option
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: totalExisting + quantity, weight_option: desired })
          .eq('id', target.id);
        if (updateError) throw updateError;

        // Delete duplicate rows beyond the target
        if (matches.length > 1) {
          const duplicateIds = matches.slice(1).map((r: any) => r.id);
          const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .in('id', duplicateIds);
          if (deleteError) throw deleteError;
        }
      } else {
        // No match: insert new row with normalized weight_option
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            weight_option: desired,
          });
        if (insertError) throw insertError;
      }
      
      await loadCartItems();
      toast({
        title: "Added to cart",
        description: "Item added successfully",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadCartItems();
      toast({
        title: "Removed from cart",
        description: "Item removed successfully",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};