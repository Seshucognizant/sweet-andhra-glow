export interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  tax_id: string | null;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  payment_terms: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  vendor_id: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  total_amount: number;
  expected_delivery_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface VendorProduct {
  id: string;
  vendor_id: string;
  product_id: string;
  vendor_sku: string | null;
  cost_price: number | null;
  lead_time_days: number | null;
  minimum_order_quantity: number;
  is_primary_vendor: boolean;
  created_at: string;
}