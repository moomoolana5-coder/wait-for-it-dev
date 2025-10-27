import { useState } from "react";
import Navbar from "@/components/Navbar";
import PromotedTable from "@/components/PromotedTable";
import Footer from "@/components/Footer";
import TokenTicker from "@/components/TokenTicker";
import TabNavigation from "@/components/TabNavigation";
import TrendingTables from "@/components/TrendingTables";
import TokenTable from "@/components/TokenTable";
import NetworkStatsBar from "@/components/stats/NetworkStatsBar";
import { useAllPlatformTokens } from "@/hooks/useAllPlatformTokens";
import { useTrendingByVotes } from "@/hooks/useTrendingByVotes";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { useNewListings } from "@/hooks/useNewListings";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const hash = location.hash;
  
  const { data: allTokens, isLoading: isLoadingAll } = useAllPlatformTokens();
  const { data: trendingTokens, isLoading: isLoadingTrending } = useTrendingByVotes();
  const { data: topVolumeTokens, isLoading: isLoadingVolume } = useTopByVolume();
  const { data: topGainerTokens, isLoading: isLoadingGainers } = useTopByPriceGain();
  const { data: newListingTokens, isLoading: isLoadingNew } = useNewListings();
  
  // Determine which tokens to display based on active tab
  const getActiveTokens = () => {
    switch (hash) {
      case '#trending':
        return { tokens: trendingTokens || [], isLoading: isLoadingTrending, title: 'Trending Tokens' };
      case '#top-tokens':
        return { tokens: topVolumeTokens || [], isLoading: isLoadingVolume, title: 'Top Tokens by Volume' };
      case '#gainers':
        return { tokens: topGainerTokens || [], isLoading: isLoadingGainers, title: 'Biggest Gainers' };
      case '#new':
        return { tokens: newListingTokens || [], isLoading: isLoadingNew, title: 'New Listings' };
      default:
        return { tokens: allTokens || [], isLoading: isLoadingAll, title: 'All Tokens' };
    }
  };
  
  const { tokens, isLoading, title } = getActiveTokens();

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
            <h2 className="text-3xl font-bold">{title}</h2>
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
