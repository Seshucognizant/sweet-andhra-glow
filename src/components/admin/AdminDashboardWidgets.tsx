import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Activity
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalVendors: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    profiles: { full_name: string | null };
  }>;
}

const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get products count and low stock
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock_quantity');
      
      if (productsError) throw productsError;

      // Get vendors count
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('id', { count: 'exact', head: true });
      
      if (vendorsError) throw vendorsError;

      // Get orders with customer info
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (ordersError) throw ordersError;

      // Get profiles separately to avoid relation issues
      const recentOrders = [];
      if (orders) {
        for (const order of orders) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', order.user_id)
            .single();
          
          recentOrders.push({
            ...order,
            profiles: { full_name: profile?.full_name || 'Unknown Customer' }
          });
        }
      }

      // Get all orders for revenue calculation
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');
      
      if (allOrdersError) throw allOrdersError;

      // Get unique customers count
      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (customersError) throw customersError;

      const lowStockProducts = products?.filter(p => p.stock_quantity < 10) || [];
      const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      return {
        totalProducts: products?.length || 0,
        totalVendors: vendors?.length || 0,
        totalOrders: orders?.length || 0,
        totalCustomers: customers?.length || 0,
        lowStockCount: lowStockProducts.length,
        totalRevenue,
        recentOrders: recentOrders
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });
};

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = "default",
  onClick 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: string;
  color?: "default" | "warning" | "success" | "destructive";
  onClick?: () => void;
}) => {
  const colorClasses = {
    default: "glass-primary hover:bg-gradient-primary/10",
    warning: "glass border-tertiary/20 hover:bg-gradient-tertiary/10",
    success: "glass border-primary/20 hover:bg-gradient-primary/10",
    destructive: "glass border-accent/20 hover:bg-gradient-secondary/10"
  };

  return (
    <Card 
      className={`${colorClasses[color]} cursor-pointer transition-all duration-300 hover-lift animate-scale-in`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivity = ({ orders }: { orders: DashboardStats['recentOrders'] }) => (
  <Card className="glass animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Recent Activity
      </CardTitle>
      <CardDescription>Latest orders and updates</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <p className="font-medium">
                Order #{order.id.slice(0, 8)}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.profiles?.full_name || 'Unknown Customer'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹{order.total_amount}</p>
              <Badge variant={
                order.status === 'completed' ? 'default' : 
                order.status === 'pending' ? 'secondary' : 'destructive'
              }>
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const QuickActions = () => (
  <Card className="glass animate-scale-in">
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      <CardDescription>Commonly used admin tasks</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="glass-primary hover-glow" asChild>
          <Link to="/admin/products">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
        <Button variant="outline" className="glass-primary hover-glow" asChild>
          <Link to="/admin/vendors">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
        <Button variant="outline" className="glass-primary hover-glow">
          <Eye className="mr-2 h-4 w-4" />
          View Reports
        </Button>
        <Button variant="outline" className="glass-primary hover-glow">
          <Edit className="mr-2 h-4 w-4" />
          Site Settings
        </Button>
      </div>
    </CardContent>
  </Card>
);

const AlertsPanel = ({ lowStockCount }: { lowStockCount: number }) => (
  <Card className="glass border-tertiary/20 animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-tertiary">
        <AlertTriangle className="h-5 w-5" />
        Alerts & Notifications
      </CardTitle>
    </CardHeader>
    <CardContent>
      {lowStockCount > 0 ? (
        <div className="flex items-center justify-between p-3 glass-secondary rounded-lg">
          <div>
            <p className="font-medium text-tertiary">Low Stock Alert</p>
            <p className="text-sm text-muted-foreground">
              {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/products">
              View Products
            </Link>
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No active alerts</p>
      )}
    </CardContent>
  </Card>
);

export const AdminDashboardWidgets = () => {
  const { data: stats, isLoading } = useDashboardStats();

  // Real-time updates using Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          // Refetch stats when orders change
          window.location.reload(); // Simple refresh for now
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          description="Active products in inventory"
          icon={Package}
          color="default"
        />
        <StatCard
          title="Total Vendors"
          value={stats?.totalVendors || 0}
          description="Active vendor partnerships"
          icon={Users}
          color="success"
        />
        <StatCard
          title="Recent Orders"
          value={stats?.totalOrders || 0}
          description="Last 5 orders received"
          icon={ShoppingCart}
          color="default"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          description="Total completed sales"
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivity orders={stats?.recentOrders || []} />
        <QuickActions />
        <AlertsPanel lowStockCount={stats?.lowStockCount || 0} />
      </div>
    </div>
  );
};