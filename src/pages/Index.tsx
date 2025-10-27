import Navbar from "@/components/Navbar";
import PromotedTable from "@/components/PromotedTable";
import Footer from "@/components/Footer";
import TokenTicker from "@/components/TokenTicker";
import TabNavigation from "@/components/TabNavigation";
import TrendingTables from "@/components/TrendingTables";
import TokenTable from "@/components/TokenTable";
import { useAllPlatformTokens } from "@/hooks/useAllPlatformTokens";
import { useTrendingByVotes } from "@/hooks/useTrendingByVotes";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { useNewListings } from "@/hooks/useNewListings";
import { useHighlights } from "@/hooks/useHighlights";
import { useTrendingByTradeVolume } from "@/hooks/useTrendingByTradeVolume";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const hash = location.hash;

  const { data: allTokens, isLoading: isLoadingAll } = useAllPlatformTokens();
  const { data: trendingTokens, isLoading: isLoadingTrending } = useTrendingByVotes();
  const { data: topVolumeTokens, isLoading: isLoadingVolume } = useTopByVolume();
  const { data: topGainerTokens, isLoading: isLoadingGainers } = useTopByPriceGain();
  const { data: newListingTokens, isLoading: isLoadingNew } = useNewListings();
  const { data: highlightsTokens, isLoading: isLoadingHighlights } = useHighlights();
  const { data: tradeVolumeTokens, isLoading: isLoadingTradeVolume } = useTrendingByTradeVolume();

  const getActiveTokens = () => {
    switch (hash) {
      case '#trending':
        return {
          tokens: trendingTokens || [],
          isLoading: isLoadingTrending,
          title: 'Trending Tokens',
          description: 'Most voted tokens by the community'
        };
      case '#top-tokens':
        return {
          tokens: topVolumeTokens || [],
          isLoading: isLoadingVolume,
          title: 'Best Performing Tokens by Volume & Price',
          description: 'Tokens with highest trading volume and price performance'
        };
      case '#gainers':
        return {
          tokens: topGainerTokens || [],
          isLoading: isLoadingGainers,
          title: 'Top Gainers',
          description: 'Tokens with biggest price increases in 24 hours'
        };
      case '#highlights':
        return {
          tokens: highlightsTokens || [],
          isLoading: isLoadingHighlights,
          title: 'Highlights',
          description: 'Featured tokens sorted by market cap'
        };
      case '#trade-volume':
        return {
          tokens: tradeVolumeTokens || [],
          isLoading: isLoadingTradeVolume,
          title: 'Trending by Trade Volume',
          description: 'Tokens with highest trading activity'
        };
      case '#new':
        return {
          tokens: newListingTokens || [],
          isLoading: isLoadingNew,
          title: 'New Listings',
          description: 'Recently listed tokens on gigacock'
        };
      default:
        return {
          tokens: allTokens || [],
          isLoading: isLoadingAll,
          title: 'All Tokens',
          description: 'All registered tokens sorted by liquidity'
        };
    }
  };

  const { tokens, isLoading, title, description } = getActiveTokens();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TokenTicker />
      
      <section className="container mx-auto px-4 py-12 space-y-8">
        <TrendingTables />
        <TabNavigation />
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <TokenTable tokens={tokens} isLoading={isLoading} />
        </div>
      </section>

      <PromotedTable />
      <Footer />
    </div>
  );
};

export default Index;
