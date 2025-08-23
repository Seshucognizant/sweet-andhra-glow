import { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, Star, User, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthDialog } from "@/components/AuthDialog";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSearch } from "@/contexts/SearchContext";
import { useCategories } from "@/hooks/useProducts";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } = useSearch();
  const { data: categories } = useCategories();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setSearchTerm(localSearchTerm);
        if (localSearchTerm || searchTerm) {
          navigate('/');
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, setSearchTerm, navigate]);

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    navigate('/');
    setIsMenuOpen(false);
  };

  const categoryItems = categories || [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass backdrop-blur-xl' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80 cursor-pointer"
            title="Go to Homepage"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="font-display text-xl lg:text-2xl font-bold">
              Andhra Sweets
            </span>
          </Link>

          {/* Desktop Categories */}
          <div className="hidden lg:flex items-center space-x-8">
            {categoryItems.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`transition-colors duration-200 font-medium ${
                  selectedCategory === category.slug 
                    ? 'text-primary font-semibold' 
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for sweets..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 w-64 glass border-0 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth / User Menu */}
            {user ? (
              <>
                <Button variant="outline" size="icon" className="relative glass-primary hover-glow" asChild>
                  <Link to="/wishlist">
                    <Heart className="w-5 h-5" />
                    {wishlistItems.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-secondary"
                      >
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </Link>
                </Button>
                
                <Button variant="outline" size="icon" className="glass-primary hover-glow" asChild>
                  <Link to="/orders">
                    <Package className="w-5 h-5" />
                  </Link>
                </Button>
                
                <UserMenu />
              </>
            ) : (
              <AuthDialog>
                <Button variant="outline" size="icon" className="glass-primary hover-glow">
                  <User className="w-5 h-5" />
                </Button>
              </AuthDialog>
            )}

            {/* Cart */}
            <Button 
              variant="outline" 
              size="icon" 
              className="relative glass-primary hover-glow"
              asChild
            >
              <Link to="/checkout">
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-secondary"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden glass-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden glass rounded-lg mt-4 p-4 animate-slide-up">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for sweets..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 w-full glass border-0"
                />
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              {categoryItems.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`block w-full text-left py-2 transition-colors duration-200 font-medium ${
                    selectedCategory === category.slug 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;