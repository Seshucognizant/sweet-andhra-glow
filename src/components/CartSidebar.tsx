import { Minus, Plus, X, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LazyImage } from "@/components/ui/LazyImage";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface CartSidebarProps {
  children: React.ReactNode;
}

export const CartSidebar = ({ children }: CartSidebarProps) => {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }
    navigate('/checkout');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart
            {getTotalItems() > 0 && (
              <Badge variant="secondary">{getTotalItems()} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start adding some delicious sweets!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 glass rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <LazyImage
                        src={item.product?.image_url || "/images/placeholder.jpg"}
                        alt={item.product?.name || "Product"}
                        className="w-16 h-16 object-cover rounded-lg"
                        fallbackSrc="/images/placeholder.jpg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.product?.name}
                      </h4>
                      {item.weight_option && (
                        <p className="text-xs text-muted-foreground">
                          {item.weight_option}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">
                          ₹{item.product?.price}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Item Total */}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {item.quantity} × ₹{item.product?.price}
                        </span>
                        <span className="text-sm font-semibold">
                          ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <Separator />
              
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-xl text-primary">
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button 
                onClick={handleCheckout}
                className="w-full bg-gradient-primary hover-glow"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};