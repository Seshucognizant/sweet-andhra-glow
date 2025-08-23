import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  const [searchTerm, setSearchTermState] = useState('');
  const [selectedCategory, setSelectedCategoryState] = useState('all');
  
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    setSelectedCategoryState(category);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTermState('');
    setSelectedCategoryState('all');
  }, []);

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