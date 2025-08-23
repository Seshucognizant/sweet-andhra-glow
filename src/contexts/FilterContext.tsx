import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FilterState {
  priceRange: [number, number];
  minRating: number;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
}

interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: FilterState = {
  priceRange: [0, 5000],
  minRating: 0,
  availability: 'all',
  sortBy: 'newest',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider = ({ children }: FilterProviderProps) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = 
    filters.priceRange[0] !== defaultFilters.priceRange[0] ||
    filters.priceRange[1] !== defaultFilters.priceRange[1] ||
    filters.minRating !== defaultFilters.minRating ||
    filters.availability !== defaultFilters.availability ||
    filters.sortBy !== defaultFilters.sortBy;

  return (
    <FilterContext.Provider 
      value={{ 
        filters, 
        updateFilter, 
        resetFilters, 
        hasActiveFilters 
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};