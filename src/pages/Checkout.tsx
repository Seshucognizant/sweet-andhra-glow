import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleOrderSuccess = (newOrderId: string) => {
    setOrderId(newOrderId);
  };

  const handleBackToShopping = () => {
    navigate('/');
  };

  if (orderId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                Order Placed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for your order. Your order ID is:
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="font-mono text-sm">{orderId}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                We'll send you a confirmation email shortly with order details and tracking information.
              </p>
              
              <div className="flex gap-4 justify-center pt-4">
                <Button variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
                  <Package className="w-4 h-4 mr-2" />
                  View Order
                </Button>
                <Button onClick={handleBackToShopping}>
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <CheckoutForm
            onSuccess={handleOrderSuccess}
            onCancel={handleBackToShopping}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;