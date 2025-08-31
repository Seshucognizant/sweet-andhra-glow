import { useState } from "react";
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Truck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LazyImage } from "@/components/ui/LazyImage";
import { ProductReviews } from "@/components/ProductReviews";
import { useReviewStats } from "@/hooks/useReviews";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-gulab-jamun.jpg";
import andhraSweetsCollection from "@/assets/andhra-sweets-collection.jpg";

const ProductDetail = ({ children, productId }: { children?: React.ReactNode; productId: string }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState("500g");
  const [isFavorite, setIsFavorite] = useState(false);

  // Get real review stats from database
  const { data: reviewStats } = useReviewStats(productId);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = {
    id: productId,
    name: "Premium Gulab Jamun",
    description: "Soft, spongy and syrupy traditional sweet made with authentic recipe",
    price: 299,
    originalPrice: 349,
    rating: reviewStats?.averageRating || 4.8,
    reviews: reviewStats?.totalReviews || 0,
    category: "Traditional Sweets",
    inStock: true,
    images: [heroImage, andhraSweetsCollection],
    weights: ["250g", "500g", "1kg", "2kg"],
    prices: { "250g": 149, "500g": 299, "1kg": 549, "2kg": 999 }
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    setQuantity(prev => 
      type === 'increase' ? prev + 1 : Math.max(1, prev - 1)
    );
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity, selectedWeight);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} (${selectedWeight}) added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentPrice = product.prices[selectedWeight as keyof typeof product.prices];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="glass-primary">
          Quick View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl glass-primary">
              <LazyImage 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-96 object-cover hover:scale-110 transition-transform duration-500"
                fallbackSrc="/images/placeholder.jpg"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 rounded-full glass-primary"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-accent fill-accent' : 'text-foreground'}`} />
              </Button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index 
                      ? 'border-primary shadow-lg' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <LazyImage src={image} alt="" className="w-full h-full object-cover" fallbackSrc="/images/placeholder.jpg" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-gradient-secondary text-white">Bestseller</Badge>
                <Badge variant="outline">Traditional</Badge>
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) 
                          ? 'text-primary fill-primary' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="font-display text-3xl font-bold text-primary">₹{currentPrice}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
              <Badge className="bg-gradient-tertiary text-white">15% OFF</Badge>
            </div>

            {/* Weight Selection */}
            <div>
              <h3 className="font-semibold mb-3">Select Weight:</h3>
              <div className="flex flex-wrap gap-2">
                {product.weights.map((weight) => (
                  <Button
                    key={weight}
                    variant={selectedWeight === weight ? "default" : "outline"}
                    onClick={() => setSelectedWeight(weight)}
                    className={selectedWeight === weight 
                      ? "bg-gradient-primary" 
                      : "glass-primary hover-lift"
                    }
                  >
                    {weight}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantity:</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('decrease')}
                  className="glass-primary"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange('increase')}
                  className="glass-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-gradient-primary hover-glow text-lg py-6"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₹{currentPrice * quantity}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="glass-primary hover-lift">
                  Buy Now
                </Button>
                <Button variant="outline" size="lg" className="glass-primary hover-lift">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 pt-4">
              <div className="flex items-center space-x-3 p-3 glass rounded-lg">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm">Free delivery on orders above ₹500</span>
              </div>
              <div className="flex items-center space-x-3 p-3 glass rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">100% authentic & fresh guarantee</span>
              </div>
              <div className="flex items-center space-x-3 p-3 glass rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm">Same day delivery in select cities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Separator className="my-6" />
        <Tabs defaultValue="description" className="px-6 pb-6">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6 space-y-4">
            <h3 className="font-display text-xl font-semibold">About this product</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our Premium Gulab Jamun is crafted using traditional Andhra recipes passed down through generations. 
              Made with the finest milk solids, these golden-brown spheres are soaked in aromatic sugar syrup 
              infused with cardamom and rose water. Each bite delivers the perfect balance of sweetness and texture 
              that melts in your mouth.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Made with pure ghee and premium milk</li>
                <li>No artificial colors or preservatives</li>
                <li>Traditional Andhra recipe</li>
                <li>Perfect for festivals and special occasions</li>
                <li>Stays fresh for up to 5 days when refrigerated</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="ingredients" className="mt-6">
            <h3 className="font-display text-xl font-semibold mb-4">Ingredients</h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Main Ingredients:</strong> Milk solids, Pure ghee, All-purpose flour, Sugar, Cardamom, Rose water</p>
              <p><strong>Allergens:</strong> Contains dairy and gluten</p>
              <p><strong>Shelf Life:</strong> 5 days from date of manufacture</p>
              <p><strong>Storage:</strong> Store in refrigerator below 8°C</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;