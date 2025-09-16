import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [products, vendors, orders, customers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('vendors').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ]);

      const lowStockProducts = await supabase
        .from('products')
        .select('id')
        .lt('stock_quantity', 10)
        .eq('is_active', true);

      return {
        totalProducts: products.count || 0,
        totalVendors: vendors.count || 0,
        totalOrders: orders.count || 0,
        totalCustomers: customers.count || 0,
        lowStockCount: lowStockProducts.data?.length || 0,
      };
    },
  });

  const dashboardCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Vendors',
      value: stats?.totalVendors || 0,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's an overview of your business.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-md`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : stats?.lowStockCount ? (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">
                    {stats.lowStockCount} products are running low on stock
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No alerts at this time</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-md hover:bg-accent text-sm">
                Add New Product
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-accent text-sm">
                Create Purchase Order
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-accent text-sm">
                Add New Vendor
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-accent text-sm">
                View Recent Orders
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};