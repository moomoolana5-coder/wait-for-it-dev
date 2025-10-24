import { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePlatformTokenSearch } from '@/hooks/usePlatformTokenSearch';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface TokenSearchProps {
  className?: string;
  onResultClick?: () => void;
}

const TokenSearch = ({ className = '', onResultClick }: TokenSearchProps) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = usePlatformTokenSearch(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  const handleTokenClick = (tokenAddress: string) => {
    navigate(`/token/${tokenAddress}`);
    setQuery('');
    setShowResults(false);
    onResultClick?.();
  };

  const displayedResults = searchResults?.slice(0, 5) || [];

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input 
        placeholder="Search tokens in GIGACOCK..." 
        className="pl-10 bg-secondary/50 border-border/50 focus:border-primary transition-all"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setShowResults(true)}
      />

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50 shadow-xl z-50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : displayedResults.length > 0 ? (
            <div className="py-2">
              {displayedResults.map((pair) => (
                <button
                  key={pair.pairAddress}
                  onClick={() => handleTokenClick(pair.baseToken.address)}
                  className="w-full px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center gap-3 text-left group"
                >
                  {/* Token Icon */}
                  {pair.info?.imageUrl && (
                    <img 
                      src={pair.info.imageUrl} 
                      alt={pair.baseToken.symbol}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {pair.baseToken.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {pair.quoteToken.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {pair.baseToken.address.slice(0, 8)}...{pair.baseToken.address.slice(-6)}
                    </div>
                  </div>

                  {/* Price & Change */}
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      ${parseFloat(pair.priceUsd || '0').toFixed(6)}
                    </div>
                    {pair.priceChange?.h24 !== undefined && (
                      <div className={`text-xs flex items-center gap-1 justify-end ${
                        pair.priceChange.h24 >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        <TrendingUp className="h-3 w-3" />
                        {pair.priceChange.h24 >= 0 ? '+' : ''}
                        {pair.priceChange.h24.toFixed(2)}%
                      </div>
                    )}
                  </div>

                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}

              {searchResults && searchResults.length > 5 && (
                <div className="px-4 py-2 text-center text-xs text-muted-foreground border-t border-border/50">
                  Showing {displayedResults.length} of {searchResults.length} results
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <div>No tokens found in GIGACOCK platform</div>
              <div className="text-xs mt-1">Try searching by token name or contract address</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default TokenSearch;
