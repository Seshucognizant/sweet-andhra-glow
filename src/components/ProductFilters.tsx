import { Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFilters } from "@/contexts/FilterContext";
import { useState } from "react";

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

const availabilityOptions = [
  { value: 'all', label: 'All Products' },
  { value: 'in-stock', label: 'In Stock Only' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

const ProductFilters = () => {
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useFilters();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass-primary hover-lift"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters & Sort
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop Filters - Always Visible */}
      <div className="hidden lg:block">
        <Card className="glass-primary p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold">Filters & Sorting</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
          <FilterContent />
        </Card>
      </div>

      {/* Mobile Filters - Collapsible */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="lg:hidden">
        <CollapsibleContent>
          <Card className="glass-primary p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Filters & Sorting</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <FilterContent />
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const FilterContent = () => {
  const { filters, updateFilter } = useFilters();

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <label className="text-sm font-medium mb-3 block">Sort By</label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter('sortBy', value as typeof filters.sortBy)}
        >
          <SelectTrigger className="glass-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-primary border-border/50">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border/50" />

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium mb-3 block">Price Range</label>
        
        {/* Price Input Fields */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="0"
                value={filters.priceRange[0] === 0 ? '' : filters.priceRange[0]}
                onChange={(e) => {
                  const minPrice = Math.max(0, parseInt(e.target.value) || 0);
                  const maxPrice = Math.max(minPrice, filters.priceRange[1]);
                  updateFilter('priceRange', [minPrice, maxPrice]);
                }}
                className="pl-7 glass-primary"
                min="0"
                max="10000"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="5000"
                value={filters.priceRange[1] === 5000 ? '' : filters.priceRange[1]}
                onChange={(e) => {
                  const maxPrice = Math.min(10000, parseInt(e.target.value) || 5000);
                  const minPrice = Math.min(maxPrice, filters.priceRange[0]);
                  updateFilter('priceRange', [minPrice, maxPrice]);
                }}
                className="pl-7 glass-primary"
                min="0"
                max="10000"
              />
            </div>
          </div>
        </div>
        
        {/* Visual Slider */}
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
          max={5000}
          min={0}
          step={50}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹0</span>
          <span>₹5000+</span>
        </div>
        
        {/* Quick Price Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('priceRange', [0, 200])}
            className="text-xs glass-primary hover-lift"
          >
            Under ₹200
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('priceRange', [200, 500])}
            className="text-xs glass-primary hover-lift"
          >
            ₹200 - ₹500
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('priceRange', [500, 1000])}
            className="text-xs glass-primary hover-lift"
          >
            ₹500 - ₹1000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('priceRange', [1000, 5000])}
            className="text-xs glass-primary hover-lift"
          >
            ₹1000+
          </Button>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Minimum Rating */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Minimum Rating: {filters.minRating === 0 ? 'Any' : `${filters.minRating}+ stars`}
        </label>
        <Slider
          value={[filters.minRating]}
          onValueChange={(value) => updateFilter('minRating', value[0])}
          max={5}
          min={0}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Any</span>
          <span>5 stars</span>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Availability */}
      <div>
        <label className="text-sm font-medium mb-3 block">Availability</label>
        <Select
          value={filters.availability}
          onValueChange={(value) => updateFilter('availability', value as typeof filters.availability)}
        >
          <SelectTrigger className="glass-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-primary border-border/50">
            {availabilityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductFilters;