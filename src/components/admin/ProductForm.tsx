import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { Product } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

export const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    original_price: product?.original_price || 0,
    category_id: product?.category_id || '',
    vendor_id: product?.vendor_id || '',
    stock_quantity: product?.stock_quantity || 0,
    image_url: product?.image_url || '',
    is_active: product?.is_active ?? true,
    is_new: product?.is_new || false,
    is_bestseller: product?.is_bestseller || false,
    weight_options: product?.weight_options || [],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const saveProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const productData = {
        ...data,
        category_id: data.category_id || null,
        vendor_id: data.vendor_id || null,
        original_price: data.original_price || null,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({
        title: 'Success',
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Product save error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${product ? 'update' : 'create'} product`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    saveProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleInputChange('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <ImageUpload
        value={formData.image_url}
        onChange={(url) => handleInputChange('image_url', url)}
        onRemove={() => handleInputChange('image_url', '')}
        disabled={saveProductMutation.isPending}
      />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div>
          <Label htmlFor="original_price">Original Price (₹)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vendor_id">Vendor</Label>
        <Select
          value={formData.vendor_id}
          onValueChange={(value) => handleInputChange('vendor_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Product Settings</Label>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_new"
              checked={formData.is_new}
              onCheckedChange={(checked) => handleInputChange('is_new', checked)}
            />
            <Label htmlFor="is_new">New Product</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_bestseller"
              checked={formData.is_bestseller}
              onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
            />
            <Label htmlFor="is_bestseller">Bestseller</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={saveProductMutation.isPending}
          className="gap-2"
        >
          {saveProductMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};