import { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, ExternalLink, Droplet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePlatformTokenSearch } from '@/hooks/usePlatformTokenSearch';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

  // Debounce search query (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showResults) {
        setQuery('');
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults]);

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

  const formatLiquidity = (liquidity?: number) => {
    if (!liquidity) return 'N/A';
    if (liquidity >= 1_000_000) return `$${(liquidity / 1_000_000).toFixed(2)}M`;
    if (liquidity >= 1_000) return `$${(liquidity / 1_000).toFixed(2)}K`;
    return `$${liquidity.toFixed(0)}`;
  };

  const getTokenInitials = (symbol: string) => {
    return symbol.slice(0, 2).toUpperCase();
  };

  const displayedResults = searchResults || [];

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
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50 shadow-xl z-50">
          {isLoading ? (
            <div className="py-2 space-y-2 px-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedResults.length > 0 ? (
            <div className="py-2">
              {displayedResults.map((pair) => (
                <button
                  key={pair.pairAddress}
                  onClick={() => handleTokenClick(pair.baseToken.address)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTokenClick(pair.baseToken.address);
                    }
                  }}
                  className="w-full px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center gap-3 text-left group"
                >
                  {/* Token Icon with Fallback */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {pair.info?.imageUrl ? (
                      <img 
                        src={pair.info.imageUrl} 
                        alt={pair.baseToken.symbol}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const fallback = e.currentTarget.nextElementSibling as HTMLDivElement;
                          if (fallback) {
                            e.currentTarget.style.display = 'none';
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary text-sm"
                      style={{ display: pair.info?.imageUrl ? 'none' : 'flex' }}
                    >
                      {getTokenInitials(pair.baseToken.symbol)}
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {pair.baseToken.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground font-medium">
                        {pair.baseToken.symbol}
                      </span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="text-muted-foreground/60 truncate">
                        {pair.baseToken.address.slice(0, 6)}...{pair.baseToken.address.slice(-4)}
                      </span>
                    </div>
                  </div>

                  {/* Price, Change & Liquidity */}
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-foreground text-sm">
                      ${parseFloat(pair.priceUsd || '0').toFixed(8)}
                    </div>
                    {pair.priceChange?.h24 !== undefined && (
                      <div className={`text-xs font-medium flex items-center gap-1 justify-end ${
                        pair.priceChange.h24 >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        <TrendingUp className="h-3 w-3" />
                        {pair.priceChange.h24 >= 0 ? '+' : ''}
                        {pair.priceChange.h24.toFixed(2)}%
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Droplet className="h-3 w-3" />
                      {formatLiquidity(pair.liquidity?.usd)}
                    </div>
                  </div>

                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}

              {displayedResults.length >= 50 && (
                <div className="px-4 py-2 text-center text-xs text-muted-foreground border-t border-border/50">
                  Showing top 50 GIGACOCK tokens
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-muted-foreground font-medium">
                No GIGACOCK tokens found for "{query}"
              </div>
              <div className="text-xs text-muted-foreground/70 mt-2">
                Search by contract address (0x...), name, or symbol
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default TokenSearch;
