import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TokenTicker from "@/components/TokenTicker";
import TabNavigation from "@/components/TabNavigation";
import TrendingTables from "@/components/TrendingTables";
import TokenTable from "@/components/TokenTable";
import NetworkStatsBar from "@/components/stats/NetworkStatsBar";
import { useAllPlatformTokens } from "@/hooks/useAllPlatformTokens";
import { usePaginatedTokens } from "@/hooks/usePaginatedTokens";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useStablecoinTicker } from "@/hooks/useStablecoinTicker";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  
  const { data: allTokens, isLoading: isLoadingAll } = useAllPlatformTokens();
  const { data: stablecoins, isLoading: isLoadingStablecoins } = useStablecoinTicker();
  
  const {
    tokens,
    hasMore,
    loadMore,
    isLoading,
    total,
    currentCount,
  } = usePaginatedTokens(allTokens || [], isLoadingAll);

  const getTitle = () => {
    switch (activeTab) {
      case 'trending':
        return 'Trending Tokens';
      case 'top-tokens':
        return 'Top Tokens';
      case 'gainers':
        return 'Biggest Gainers';
      case 'losers':
        return 'Biggest Losers';
      case 'new':
        return 'New Listings';
      default:
        return 'All Tokens';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TokenTicker />
      
      <section className="container mx-auto px-4 py-12 space-y-8">
        <NetworkStatsBar />
        <TrendingTables />
        <TabNavigation />
        
        {/* Stablecoin Ticker */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm overflow-hidden rounded-lg">
          {isLoadingStablecoins ? (
            <div className="flex items-center gap-6 px-6 py-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : stablecoins && stablecoins.length > 0 ? (
            <div className="ticker-container">
              <div 
                className="ticker-content"
                style={{
                  animationDuration: '30s',
                }}
              >
                {Array.from({ length: 3 }, () => stablecoins).flat().map((token, idx) => {
                  const priceChange = token.priceChange?.h24 || 0;
                  const isPositive = priceChange >= 0;
                  
                  return (
                    <div
                      key={`${token.pairAddress}-${idx}`}
                      className="ticker-item flex items-center gap-2 px-6 py-3 whitespace-nowrap"
                    >
                      {token.info?.imageUrl && (
                        <img
                          src={token.info.imageUrl}
                          alt={token.baseToken.symbol}
                          className="h-5 w-5 rounded-full flex-shrink-0"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-semibold text-foreground">
                        {token.baseToken.symbol}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${Number(token.priceUsd).toFixed(4)}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? 'text-accent' : 'text-destructive'
                        }`}
                      >
                        {isPositive ? '↗' : '↘'} {Math.abs(priceChange).toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-6 py-3">
              <p className="text-sm text-muted-foreground">No stablecoin data available</p>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">{getTitle()}</h2>
          </div>
          
          <TokenTable tokens={tokens} isLoading={isLoading} />
          
          {!isLoading && tokens.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-muted-foreground">
                Showing {currentCount} of {total} tokens
              </p>
              
              {hasMore && (
                <Button
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  Load More
                </Button>
              )}
            </div>
          )}

          {!isLoading && tokens.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tokens found for this category</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
