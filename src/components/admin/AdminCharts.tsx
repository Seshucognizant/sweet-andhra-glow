import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Package, Users, ShoppingCart } from 'lucide-react';

interface ChartData {
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  vendorData: Array<{
    name: string;
    products: number;
    rating: number;
  }>;
}

const useChartData = () => {
  return useQuery({
    queryKey: ['admin-chart-data'],
    queryFn: async (): Promise<ChartData> => {
      // Get sales data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const salesPromises = last7Days.map(async (date) => {
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', date)
          .lt('created_at', `${date}T23:59:59.999Z`)
          .eq('payment_status', 'completed');

        const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const ordersCount = orders?.length || 0;

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue,
          orders: ordersCount
        };
      });

      const salesData = await Promise.all(salesPromises);

      // Get category distribution
      const { data: categories } = await supabase
        .from('categories')
        .select(`
          name,
          products(count)
        `);

      const colors = ['hsl(45, 85%, 55%)', 'hsl(5, 75%, 50%)', 'hsl(25, 85%, 58%)', 'hsl(220, 70%, 50%)', 'hsl(120, 60%, 50%)'];
      
      const categoryData = categories?.map((cat, index) => ({
        name: cat.name,
        value: cat.products?.length || 0,
        color: colors[index % colors.length]
      })) || [];

      // Get vendor performance
      const { data: vendors } = await supabase
        .from('vendors')
        .select(`
          name,
          rating,
          vendor_products(count)
        `)
        .limit(5);

      const vendorData = vendors?.map(vendor => ({
        name: vendor.name.length > 15 ? vendor.name.substring(0, 15) + '...' : vendor.name,
        products: vendor.vendor_products?.length || 0,
        rating: vendor.rating || 0
      })) || [];

      return {
        salesData,
        categoryData,
        vendorData
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border">
        <p className="font-medium">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }} className="text-sm">
            {pld.dataKey === 'revenue' ? `Revenue: ₹${pld.value}` : `${pld.dataKey}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SalesChart = ({ data }: { data: ChartData['salesData'] }) => (
  <Card className="glass animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Sales Overview
      </CardTitle>
      <CardDescription>Revenue and orders for the last 7 days</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(45, 85%, 55%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(45, 85%, 55%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-xs" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(45, 85%, 55%)"
            fillOpacity={1}
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const CategoryChart = ({ data }: { data: ChartData['categoryData'] }) => (
  <Card className="glass animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Product Categories
      </CardTitle>
      <CardDescription>Distribution of products by category</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const VendorChart = ({ data }: { data: ChartData['vendorData'] }) => (
  <Card className="glass animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Top Vendors
      </CardTitle>
      <CardDescription>Vendor performance by product count</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" className="text-xs" tick={{ fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            className="text-xs" 
            tick={{ fontSize: 12 }} 
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="products" 
            fill="hsl(5, 75%, 50%)" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const OrdersChart = ({ data }: { data: ChartData['salesData'] }) => (
  <Card className="glass animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        Orders Trend
      </CardTitle>
      <CardDescription>Daily order count for the last week</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-xs" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="hsl(25, 85%, 58%)"
            strokeWidth={3}
            dot={{ fill: 'hsl(25, 85%, 58%)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(25, 85%, 58%)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const AdminCharts = () => {
  const { data: chartData, isLoading } = useChartData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!chartData) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChart data={chartData.salesData} />
        <OrdersChart data={chartData.salesData} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryChart data={chartData.categoryData} />
        <VendorChart data={chartData.vendorData} />
      </div>
    </div>
  );
};