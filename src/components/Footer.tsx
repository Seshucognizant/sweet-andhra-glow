import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-background via-muted/30 to-background border-t">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold">Andhra Sweets</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Bringing authentic Andhra flavors to your doorstep with traditional recipes 
              crafted with love and premium ingredients.
            </p>
            <div className="flex space-x-4">
              <Button size="icon" variant="outline" className="glass-primary hover-glow rounded-full">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="glass-primary hover-glow rounded-full">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="glass-primary hover-glow rounded-full">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="glass-primary hover-glow rounded-full">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                "Traditional Sweets",
                "Andhra Specials", 
                "Snacks & Savories",
                "Festival Treats",
                "Gift Boxes",
                "About Us",
                "Our Story"
              ].map((link) => (
                <li key={link}>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Customer Care</h3>
            <ul className="space-y-3">
              {[
                "Help & Support",
                "Track Your Order",
                "Returns & Refunds",
                "Shipping Info",
                "Bulk Orders",
                "FAQs",
                "Privacy Policy"
              ].map((link) => (
                <li key={link}>
                  <button className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-semibold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    123 Heritage Street, Visakhapatnam, 
                    Andhra Pradesh 530001
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">+91 9876543210</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">hello@andhrasweets.com</p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest offers and sweet updates
              </p>
              <div className="space-y-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="glass border-0"
                />
                <Button className="w-full bg-gradient-primary hover-glow">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Andhra Sweets. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">Terms of Service</button>
            <button className="hover:text-primary transition-colors">Privacy Policy</button>
            <button className="hover:text-primary transition-colors">Cookie Policy</button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span>in India</span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t bg-muted/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xs">✓</span>
              </div>
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xs">✓</span>
              </div>
              <span>Fresh Guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xs">✓</span>
              </div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xs">✓</span>
              </div>
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;