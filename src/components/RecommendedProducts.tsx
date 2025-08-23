import { ChevronRight, Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/LazyImage";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useToast } from "@/hooks/use-toast";
import ProductDetail from "@/components/ProductDetail";

interface RecommendedProductsProps {
  title?: string;
  productId?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export const RecommendedProducts = ({ 
  title = "Recommended for You", 
  productId, 
  limit = 8, 
  showHeader = true,
  className = ""
}: RecommendedProductsProps) => {
  const { data: recommendations = [], isLoading } = useRecommendations(productId, limit);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { toast } = useToast();

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

  const handleWishlistToggle = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist(product.id);
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const handleProductClick = (product: any) => {
    addToRecentlyViewed(product.id);
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-primary animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <Card 
            key={product.id} 
            className="glass-primary hover-lift group transition-all duration-300 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <LazyImage
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                fallbackSrc="/images/placeholder.jpg"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
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

              {/* Wishlist Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 rounded-full glass-primary opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleWishlistToggle(product, e)}
              >
                <Heart 
                  className={`w-4 h-4 ${
                    isInWishlist(product.id) 
                      ? 'text-accent fill-accent' 
                      : 'text-foreground'
                  }`} 
                />
              </Button>

              {/* Quick Add to Cart */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  className="w-full bg-gradient-primary hover-glow text-sm"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.review_count})
                  </span>
                </div>
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category.name}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-primary">₹{product.price}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.original_price}
                    </span>
                  )}
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ProductDetail productId={product.id}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Quick View
                    </Button>
                  </ProductDetail>
                </div>
              </div>

              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <p className="text-xs text-orange-500 mt-2">
                  Only {product.stock_quantity} left!
                </p>
              )}
              
              {product.stock_quantity === 0 && (
                <p className="text-xs text-red-500 mt-2">Out of stock</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};