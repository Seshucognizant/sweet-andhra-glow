import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SEOHead, getHomeSEO } from "@/components/SEOHead";
import { LazyRecommendedProducts, LazyRecentlyViewed } from "@/components/LazyComponent";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  usePerformanceMonitor();

  return (
    <ErrorBoundary>
      <SEOHead {...getHomeSEO()} />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <Hero />
          <ProductGrid />
          
          {/* Lazy loaded sections for better performance */}
          <Suspense fallback={
            <div className="container mx-auto px-4 py-12">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          }>
          <section className="container mx-auto px-4 py-12">
            <LazyRecommendedProducts title="Recommended for You" limit={8} />
          </section>
          </Suspense>

          <Suspense fallback={
            <div className="container mx-auto px-4 py-12">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          }>
          <section className="container mx-auto px-4 py-12">
            <LazyRecentlyViewed limit={6} />
          </section>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
