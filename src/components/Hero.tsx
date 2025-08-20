import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-gulab-jamun.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Premium Andhra Gulab Jamun"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="glass-primary rounded-full p-4">
          <Star className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="glass-secondary rounded-full p-3">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 glass-primary rounded-full px-6 py-2 mb-4">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Authentic Andhra Flavors</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Traditional Sweets
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Crafted with Love
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Experience the rich heritage of Andhra Pradesh through our handcrafted sweets, 
                made with authentic recipes passed down through generations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:scale-105 transition-transform duration-200 text-white font-semibold px-8 py-6 text-lg hover-glow"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="glass-primary hover-lift font-semibold px-8 py-6 text-lg"
              >
                Gift Boxes
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl lg:text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Sweet Varieties</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl lg:text-3xl font-bold text-accent">25</div>
                <div className="text-sm text-muted-foreground">Years Heritage</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl lg:text-3xl font-bold text-tertiary">1000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Main Product Image */}
              <div className="glass rounded-3xl p-6 hover-lift">
                <img 
                  src={heroImage} 
                  alt="Premium Gulab Jamun"
                  className="w-full h-80 lg:h-96 object-cover rounded-2xl"
                />
                <div className="absolute top-8 right-8 glass-secondary rounded-full p-3">
                  <div className="text-center">
                    <div className="font-display text-lg font-bold text-accent">₹299</div>
                    <div className="text-xs text-accent-foreground">per kg</div>
                  </div>
                </div>
              </div>

              {/* Quality Badge */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="glass-primary rounded-full px-6 py-3 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;