import { useState } from "react";
import { Heart, Star, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ProductDetail from "@/components/ProductDetail";
import andhraSweetsCollection from "@/assets/andhra-sweets-collection.jpg";
import andhraSnacks from "@/assets/andhra-snacks.jpg";
import pootharekulu from "@/assets/pootharekulu.jpg";
import coconutBurfi from "@/assets/coconut-burfi.jpg";
import mysorePak from "@/assets/mysore-pak.jpg";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Premium Gulab Jamun",
    description: "Soft, spongy and syrupy traditional sweet",
    price: 299,
    originalPrice: 349,
    image: andhraSweetsCollection,
    rating: 4.8,
    reviews: 124,
    category: "Traditional Sweets",
    isBestseller: true
  },
  {
    id: 2,
    name: "Andhra Murukku",
    description: "Crispy spiral-shaped traditional snack",
    price: 179,
    image: andhraSnacks,
    rating: 4.6,
    reviews: 89,
    category: "Snacks & Savories",
    isNew: true
  },
  {
    id: 3,
    name: "Pootharekulu",
    description: "Delicate silver leaf sweet specialty",
    price: 449,
    image: pootharekulu,
    rating: 4.9,
    reviews: 67,
    category: "Andhra Specials",
    isBestseller: true
  },
  {
    id: 4,
    name: "Coconut Burfi",
    description: "Rich coconut squares with ghee",
    price: 249,
    image: coconutBurfi,
    rating: 4.7,
    reviews: 156,
    category: "Traditional Sweets"
  },
  {
    id: 5,
    name: "Mysore Pak",
    description: "Ghee-rich golden sweet cubes",
    price: 329,
    originalPrice: 379,
    image: mysorePak,
    rating: 4.8,
    reviews: 201,
    category: "Traditional Sweets",
    isBestseller: true
  },
  {
    id: 6,
    name: "Festival Mix",
    description: "Assorted sweets perfect for celebrations",
    price: 599,
    image: andhraSweetsCollection,
    rating: 4.9,
    reviews: 88,
    category: "Gift Boxes",
    isNew: true
  }
];

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = ["All", "Traditional Sweets", "Andhra Specials", "Snacks & Savories", "Gift Boxes"];

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

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
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-gradient-primary hover-glow" 
                : "glass-primary hover-lift"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="group glass hover-lift cursor-pointer overflow-hidden animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-gradient-tertiary text-white">New</Badge>
                  )}
                  {product.isBestseller && (
                    <Badge className="bg-gradient-secondary text-white">Bestseller</Badge>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3">
                    <ProductDetail />
                    <Button size="icon" variant="secondary" className="rounded-full glass-primary">
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
                      favorites.includes(product.id) 
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
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <span className="font-display text-xl font-bold text-primary">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button size="sm" className="bg-gradient-primary hover-glow">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="glass-primary hover-lift">
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;