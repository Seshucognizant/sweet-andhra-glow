import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressForm, Address } from './AddressForm';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Truck, DollarSign } from 'lucide-react';

const initialAddress: Address = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const createOrderMutation = useCreateOrder();
  
  const [shippingAddress, setShippingAddress] = useState<Address>(initialAddress);
  const [billingAddress, setBillingAddress] = useState<Address>(initialAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = 50; // Fixed shipping cost
  const total = getTotalPrice() + shippingCost;

  const validateAddress = (address: Address, prefix: string) => {
    const newErrors: Record<string, string> = {};
    
    if (!address.fullName.trim()) {
      newErrors[`${prefix}fullName`] = 'Full name is required';
    }
    
    if (!address.phone.trim()) {
      newErrors[`${prefix}phone`] = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(address.phone.replace(/\s/g, ''))) {
      newErrors[`${prefix}phone`] = 'Please enter a valid phone number';
    }
    
    if (!address.addressLine1.trim()) {
      newErrors[`${prefix}addressLine1`] = 'Address is required';
    }
    
    if (!address.city.trim()) {
      newErrors[`${prefix}city`] = 'City is required';
    }
    
    if (!address.state) {
      newErrors[`${prefix}state`] = 'State is required';
    }
    
    if (!address.pincode.trim()) {
      newErrors[`${prefix}pincode`] = 'Pincode is required';
    } else if (!/^\d{6}$/.test(address.pincode)) {
      newErrors[`${prefix}pincode`] = 'Please enter a valid 6-digit pincode';
    }
    
    return newErrors;
  };

  const handlePlaceOrder = async () => {
    const shippingErrors = validateAddress(shippingAddress, 'shipping');
    const billingErrors = sameAsShipping ? {} : validateAddress(billingAddress, 'billing');
    
    const allErrors = { ...shippingErrors, ...billingErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    if (items.length === 0) {
      return;
    }

    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        weight_option: item.weight_option,
      }));

      const order = await createOrderMutation.mutateAsync({
        items: orderItems,
        total_amount: total,
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        payment_method: paymentMethod,
      });

      await clearCart();
      onSuccess(order.id);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button onClick={onCancel} className="mt-4">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                    {item.weight_option && ` • ${item.weight_option}`}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shippingCost.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <AddressForm
        title="Shipping Address"
        address={shippingAddress}
        onAddressChange={setShippingAddress}
        errors={Object.fromEntries(
          Object.entries(errors).filter(([key]) => key.startsWith('shipping'))
        )}
      />

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="sameAsShipping"
              checked={sameAsShipping}
              onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
            />
            <Label htmlFor="sameAsShipping">
              Same as shipping address
            </Label>
          </div>
          
          {!sameAsShipping && (
            <AddressForm
              title="Billing Address"
              address={billingAddress}
              onAddressChange={setBillingAddress}
              errors={Object.fromEntries(
                Object.entries(errors).filter(([key]) => key.startsWith('billing'))
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash on Delivery
                <Badge variant="secondary">Recommended</Badge>
              </Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground mt-2">
            Pay with cash when your order is delivered to your doorstep.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Back to Cart
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={createOrderMutation.isPending}
          className="flex-1"
        >
          {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>
    </div>
  );
};