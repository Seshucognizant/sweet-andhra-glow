import { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthDialog } from "@/components/AuthDialog";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/hooks/useProducts";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const { data: categories } = useCategories();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categoryItems = categories || [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass backdrop-blur-xl' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="font-display text-xl lg:text-2xl font-bold">
              Andhra Sweets
            </span>
          </div>

          {/* Desktop Categories */}
          <div className="hidden lg:flex items-center space-x-8">
            {categoryItems.map((category) => (
              <button
                key={category.id}
                className="text-foreground/80 hover:text-primary transition-colors duration-200 font-medium"
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
                  className="pl-10 w-64 glass border-0 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth / User Menu */}
            {user ? (
              <UserMenu />
            ) : (
              <AuthDialog>
                <Button variant="outline" size="icon" className="glass-primary hover-glow">
                  <User className="w-5 h-5" />
                </Button>
              </AuthDialog>
            )}

            {/* Cart */}
            <Button variant="outline" size="icon" className="relative glass-primary hover-glow">
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-secondary"
                >
                  {getTotalItems()}
                </Badge>
              )}
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
                  className="pl-10 w-full glass border-0"
                />
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              {categoryItems.map((category) => (
                <button
                  key={category.id}
                  className="block w-full text-left py-2 text-foreground/80 hover:text-primary transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
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