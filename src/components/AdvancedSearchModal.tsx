import { useState } from "react";
import { Search, Filter, X, Clock, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAdvancedSearch, AdvancedSearchCriteria } from "@/hooks/useAdvancedSearch";
import { useCategories } from "@/hooks/useProducts";

interface AdvancedSearchModalProps {
  children: React.ReactNode;
}

export const AdvancedSearchModal = ({ children }: AdvancedSearchModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories } = useCategories();
  const {
    criteria,
    results,
    isLoading,
    searchHistory,
    updateCriteria,
    addToSearchHistory,
    clearSearchHistory,
    resetCriteria,
  } = useAdvancedSearch();

  const [localCriteria, setLocalCriteria] = useState<AdvancedSearchCriteria>(criteria);

  const handleSearch = () => {
    updateCriteria(localCriteria);
    if (localCriteria.query.trim()) {
      addToSearchHistory(localCriteria.query.trim());
    }
  };

  const handleReset = () => {
    const resetData = { query: '', sortBy: 'relevance' as const };
    setLocalCriteria(resetData);
    resetCriteria();
  };

  const handleSearchFromHistory = (query: string) => {
    const newCriteria = { ...localCriteria, query };
    setLocalCriteria(newCriteria);
    updateCriteria(newCriteria);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Search Criteria Panel */}
          <div className="lg:col-span-1 overflow-y-auto space-y-6 pr-2">
            {/* Search Query */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Search Query</Label>
              <Input
                placeholder="Search for products..."
                value={localCriteria.query}
                onChange={(e) => setLocalCriteria(prev => ({ ...prev, query: e.target.value }))}
                className="glass-primary"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Recent Searches</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 6).map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearchFromHistory(query)}
                      className="text-xs glass-primary hover-lift"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <Select
                value={localCriteria.categoryId || 'all'}
                onValueChange={(value) => setLocalCriteria(prev => ({ 
                  ...prev, 
                  categoryId: value === 'all' ? undefined : value 
                }))}
              >
                <SelectTrigger className="glass-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Price Range: ₹{localCriteria.priceMin || 0} - ₹{localCriteria.priceMax || 5000}
              </Label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localCriteria.priceMin || ''}
                    onChange={(e) => setLocalCriteria(prev => ({ 
                      ...prev, 
                      priceMin: parseInt(e.target.value) || undefined 
                    }))}
                    className="glass-primary text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={localCriteria.priceMax || ''}
                    onChange={(e) => setLocalCriteria(prev => ({ 
                      ...prev, 
                      priceMax: parseInt(e.target.value) || undefined 
                    }))}
                    className="glass-primary text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Minimum Rating: {localCriteria.minRating || 0}+ stars
              </Label>
              <Slider
                value={[localCriteria.minRating || 0]}
                onValueChange={(value) => setLocalCriteria(prev => ({ 
                  ...prev, 
                  minRating: value[0] 
                }))}
                max={5}
                min={0}
                step={0.5}
                className="mt-2"
              />
            </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Availability</Label>
              <Select
                value={localCriteria.availability || 'all'}
                onValueChange={(value) => setLocalCriteria(prev => ({ 
                  ...prev, 
                  availability: value as 'all' | 'in-stock' | 'out-of-stock' 
                }))}
              >
                <SelectTrigger className="glass-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock Only</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Sort By</Label>
              <Select
                value={localCriteria.sortBy || 'relevance'}
                onValueChange={(value) => setLocalCriteria(prev => ({ 
                  ...prev, 
                  sortBy: value as typeof localCriteria.sortBy 
                }))}
              >
                <SelectTrigger className="glass-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSearch} 
                className="flex-1 bg-gradient-primary hover-glow"
                disabled={!localCriteria.query.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="glass-primary"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {results.length > 0 ? `${results.length} Results` : 'Search Results'}
              </h3>
              {criteria.query && (
                <Badge variant="outline" className="bg-gradient-secondary text-white">
                  "{criteria.query}"
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-lg p-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-3"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((product) => (
                  <div key={product.id} className="glass rounded-lg p-4 hover-lift">
                    <img
                      src={product.image_url || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-full aspect-square object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold mb-1 truncate">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">₹{product.price}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐ {product.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({product.review_count})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : criteria.query ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products found matching your criteria</p>
                <p className="text-sm mt-2">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter a search query to find products</p>
                <p className="text-sm mt-2">Use the filters to refine your search</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};