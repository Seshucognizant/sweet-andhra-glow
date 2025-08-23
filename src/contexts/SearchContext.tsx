import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SearchContextType {
  searchTerm: string;
  selectedCategory: string;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';

  const setSearchTerm = useCallback((term: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (term) {
      newParams.set('search', term);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const setSelectedCategory = useCallback((category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const clearSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('category');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return (
    <SearchContext.Provider 
      value={{ 
        searchTerm, 
        selectedCategory, 
        setSearchTerm, 
        setSelectedCategory, 
        clearSearch 
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};