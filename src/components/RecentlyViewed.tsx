import { Clock, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/LazyImage";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface RecentlyViewedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export const RecentlyViewed = ({ 
  limit = 6, 
  showHeader = true,
  className = ""
}: RecentlyViewedProps) => {
  const { 
    recentlyViewed, 
    isLoading, 
    removeFromRecentlyViewed, 
    clearRecentlyViewed 
  } = useRecentlyViewed();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const displayedProducts = limit ? recentlyViewed.slice(0, limit) : recentlyViewed;

  const handleAddToCart = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1, product.weight_options?.[0] || '500g');
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleRemove = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromRecentlyViewed(productId);
    toast({
      title: "Removed from recently viewed",
      description: "Product has been removed from your recently viewed list.",
    });
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Recently Viewed
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-primary animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Recently Viewed
          </h2>
          {recentlyViewed.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecentlyViewed}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {displayedProducts.map((product) => (
          <Card 
            key={product.id} 
            className="glass-primary hover-lift group transition-all duration-300 cursor-pointer relative"
          >
            {/* Remove Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10 rounded-full glass-primary opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
              onClick={(e) => handleRemove(product.id, e)}
            >
              <X className="w-3 h-3" />
            </Button>

            <div className="relative overflow-hidden rounded-t-lg">
              <LazyImage
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                fallbackSrc="/images/placeholder.jpg"
              />
              
              {/* Badges */}
              {(product.is_new || product.is_bestseller) && (
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_new && (
                    <Badge className="bg-gradient-secondary text-white text-xs">
                      New
                    </Badge>
                  )}
                  {product.is_bestseller && (
                    <Badge className="bg-gradient-tertiary text-white text-xs">
                      Bestseller
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary text-sm">₹{product.price}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">⭐ {product.rating}</span>
                </div>
              </div>

              {/* Quick Add Button */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  className="w-full bg-gradient-primary hover-glow text-xs"
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.stock_quantity === 0}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  Only {product.stock_quantity} left!
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};