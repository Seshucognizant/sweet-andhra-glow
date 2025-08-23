import { useState, useRef, useEffect } from "react";
import { Search, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchSuggestions } from "@/hooks/useAdvancedSearch";
import { useTrendingProducts } from "@/hooks/useRecommendations";
import { useSearch } from "@/contexts/SearchContext";
import { useNavigate } from "react-router-dom";

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onSelect?: (query: string) => void;
}

export const SearchAutocomplete = ({ 
  placeholder = "Search for sweets...", 
  className = "",
  onSelect 
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved).slice(0, 5) : [];
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchTerm } = useSearch();
  const navigate = useNavigate();
  
  const { data: suggestions = [] } = useSearchSuggestions(query);
  const { data: trending = [] } = useTrendingProducts(4);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
  };

  const handleSelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setIsOpen(false);
    
    // Add to search history
    const currentHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [selectedQuery, ...currentHistory.filter((item: string) => item !== selectedQuery)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    // Trigger search
    setSearchTerm(selectedQuery);
    navigate('/');
    onSelect?.(selectedQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  const showSuggestions = isOpen && (query.length >= 2 || query.length === 0);

  return (
    <div className="relative" ref={inputRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={`pl-10 ${className}`}
        />
      </form>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 glass border border-border/50 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                Product Suggestions
              </div>
              {suggestions.map((product) => (
                <Button
                  key={product.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-accent/50"
                  onClick={() => handleSelect(product.name)}
                >
                  <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{product.name}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-accent/50"
                  onClick={() => handleSelect(search)}
                >
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{search}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Trending Products */}
          {query.length === 0 && trending.length > 0 && (
            <div className="p-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                Trending Now
              </div>
              {trending.map((product) => (
                <Button
                  key={product.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-accent/50"
                  onClick={() => handleSelect(product.name)}
                >
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  <span className="truncate">{product.name}</span>
                </Button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};