import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminDashboardWidgets } from '@/components/admin/AdminDashboardWidgets';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Bell,
  Zap,
  Settings,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Welcome notification
const showWelcomeNotification = () => {
  toast({
    title: "Welcome to Admin Dashboard! 🎉",
    description: "Use Ctrl+Shift+A for quick access anytime.",
  });
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Show welcome notification on mount
  useEffect(() => {
    const timer = setTimeout(showWelcomeNotification, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display bg-gradient-hero bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's your business overview at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gradient-primary">
            <Zap className="mr-1 h-3 w-3" />
            Live Updates
          </Badge>
          <Button variant="outline" size="sm" className="glass-primary hover-glow">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-primary border-0">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminDashboardWidgets />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdminCharts />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/admin/products">
              <Card className="glass hover-lift cursor-pointer animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Product Management
                  </CardTitle>
                  <CardDescription>
                    Manage your product catalog, inventory, and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full glass-primary">
                    <Eye className="mr-2 h-4 w-4" />
                    Manage Products
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/vendors">
              <Card className="glass hover-lift cursor-pointer animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Vendor Management
                  </CardTitle>
                  <CardDescription>
                    Manage vendor relationships and partnerships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full glass-secondary">
                    <Eye className="mr-2 h-4 w-4" />
                    Manage Vendors
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="glass hover-lift cursor-pointer animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-tertiary" />
                  Order Management
                </CardTitle>
                <CardDescription>
                  Track and manage customer orders and fulfillment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <Eye className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};