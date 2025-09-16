export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  original_price?: number;
  image_url?: string | null;
  category_id?: string | null;
  vendor_id?: string | null;
  weight_options: string[] | any;
  ingredients?: string | null;
  stock_quantity: number;
  is_bestseller: boolean | null;
  is_new: boolean | null;
  is_active?: boolean;
  rating: number;
  review_count?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    slug: string;
  } | null;
  vendor?: {
    name: string;
    status: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  weight_option?: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    display_name?: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  weight_option?: string | null;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}