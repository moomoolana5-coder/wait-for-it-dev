import Navbar from "@/components/Navbar";
import PromotedTable from "@/components/PromotedTable";
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

const Index = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  
  const { data: allTokens, isLoading: isLoadingAll } = useAllPlatformTokens();
  
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

      <PromotedTable />
      <Footer />
    </div>
  );
};

export default Index;
