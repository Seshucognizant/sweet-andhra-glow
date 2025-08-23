import { Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
        <label className="text-sm font-medium mb-3 block">
          Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
        </label>
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