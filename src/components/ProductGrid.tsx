import { Heart, Star, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductDetail from "@/components/ProductDetail";
import { useProducts, useCategories, Product as ProductType } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const ProductGrid = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { searchTerm, selectedCategory, setSelectedCategory } = useSearch();
  const { data: products, isLoading: productsLoading } = useProducts(selectedCategory, searchTerm);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const toggleFavorite = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleAddToCart = async (product: ProductType) => {
    await addToCart(product.id, 1);
  };

  const categoryOptions = [
    { id: "all", name: "All Products", slug: "all" },
    ...(categories || [])
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Our Sweet Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover authentic Andhra sweets and snacks, crafted with traditional recipes and premium ingredients
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categoriesLoading ? (
            <div className="flex gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          ) : (
            categoryOptions.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.slug)}
                className={selectedCategory === category.slug 
                  ? "bg-gradient-primary hover-glow" 
                  : "glass-primary hover-lift"
                }
              >
                {category.name}
              </Button>
            ))
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="glass overflow-hidden animate-scale-in">
                <Skeleton className="w-full h-64" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </Card>
            ))
          ) : products?.map((product, index) => (
            <Card 
              key={product.id} 
              className="group glass hover-lift cursor-pointer overflow-hidden animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img 
                  src={product.image_url || "/placeholder.svg"} 
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_new && (
                    <Badge className="bg-gradient-tertiary text-white">New</Badge>
                  )}
                  {product.is_bestseller && (
                    <Badge className="bg-gradient-secondary text-white">Bestseller</Badge>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3">
                    <ProductDetail>
                      <Button size="icon" variant="secondary" className="rounded-full glass-primary">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </ProductDetail>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full glass-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Favorite Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 rounded-full glass-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      isInWishlist(product.id) 
                        ? 'text-accent fill-accent' 
                        : 'text-white'
                    }`} 
                  />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.review_count} reviews)
                  </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <span className="font-display text-xl font-bold text-primary">
                      ₹{product.price}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.original_price}
                      </span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-primary hover-glow"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.stock_quantity === 0}
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {!productsLoading && products && products.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="glass-primary hover-lift">
              Load More Products
            </Button>
          </div>
        )}

        {/* No Products Message */}
        {!productsLoading && (!products || products.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;