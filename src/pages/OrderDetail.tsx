import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useOrderById } from '@/hooks/useOrders';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const { data: order, isLoading, error } = useOrderById(orderId || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Order not found</h3>
                <p className="text-muted-foreground mb-4">
                  The order you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button asChild>
                  <Link to="/orders">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
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
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status & Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Order Information
                    <div className="flex gap-2">
                      <Badge 
                        className={statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}
                      >
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p className="font-medium">
                          {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium">
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items ({order.order_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items?.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-4">
                          {item.product?.image_url && (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                            {item.weight_option && (
                              <p className="text-sm text-muted-foreground">
                                Weight: {item.weight_option}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{item.price}</p>
                            <p className="text-sm text-muted-foreground">
                              Total: ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {index < (order.order_items?.length || 0) - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary & Address */}
            <div className="space-y-6">
              {/* Order Total */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span>₹{order.total_amount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{order.shipping_address.fullName}</p>
                      <p>{order.shipping_address.phone}</p>
                      <p>{order.shipping_address.addressLine1}</p>
                      {order.shipping_address.addressLine2 && (
                        <p>{order.shipping_address.addressLine2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                      <p>{order.shipping_address.pincode}</p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Address */}
              {order.billing_address && JSON.stringify(order.billing_address) !== JSON.stringify(order.shipping_address) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{order.billing_address.fullName}</p>
                      <p>{order.billing_address.phone}</p>
                      <p>{order.billing_address.addressLine1}</p>
                      {order.billing_address.addressLine2 && (
                        <p>{order.billing_address.addressLine2}</p>
                      )}
                      <p>
                        {order.billing_address.city}, {order.billing_address.state}
                      </p>
                      <p>{order.billing_address.pincode}</p>
                      <p>{order.billing_address.country}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;