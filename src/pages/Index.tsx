import Navbar from "@/components/Navbar";
import TrendingTables from "@/components/TrendingTables";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, Clock, Star, Award } from "lucide-react";
import { useState } from "react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { useNewListings } from "@/hooks/useNewListings";
import { useTopTokens } from "@/hooks/useTopTokens";
import TokenCard from "@/components/TokenCard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [displayCount, setDisplayCount] = useState(50);

  const { data: allTokens, isLoading: loadingAll } = usePulseChainTokens();
  const { data: trendingTokens, isLoading: loadingTrending } = useTopByVolume();
  const { data: gainersTokens, isLoading: loadingGainers } = useTopByPriceGain();
  const { data: newListingsTokens, isLoading: loadingNewListings } = useNewListings();
  const { data: topTokensData, isLoading: loadingTopTokens } = useTopTokens();

  const tabs = [
    { id: "all", label: "All", icon: TrendingUp },
    { id: "trending", label: "Trending", icon: Star },
    { id: "top", label: "Top Tokens", icon: Award },
    { id: "gainers", label: "Top Gainers", icon: Sparkles },
    { id: "new", label: "New Listings", icon: Clock },
  ];

  const sortByLiquidity = (tokens: any[]) => {
    return [...tokens].sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
  };

  const getCurrentTokens = () => {
    let tokens;
    switch (activeTab) {
      case "trending":
        tokens = sortByLiquidity(trendingTokens || []);
        break;
      case "top":
        tokens = sortByLiquidity(topTokensData || []);
        break;
      case "gainers":
        tokens = sortByLiquidity(gainersTokens || []);
        break;
      case "new":
        tokens = sortByLiquidity(newListingsTokens || []);
        break;
      case "all":
      default:
        tokens = sortByLiquidity(allTokens || []);
        break;
    }
    return tokens.slice(0, displayCount);
  };

  const isLoading = () => {
    switch (activeTab) {
      case "trending":
        return loadingTrending;
      case "top":
        return loadingTopTokens;
      case "gainers":
        return loadingGainers;
      case "new":
        return loadingNewListings;
      case "all":
      default:
        return loadingAll;
    }
  };

  const getTotalTokensCount = () => {
    switch (activeTab) {
      case "trending":
        return trendingTokens?.length || 0;
      case "top":
        return topTokensData?.length || 0;
      case "gainers":
        return gainersTokens?.length || 0;
      case "new":
        return newListingsTokens?.length || 0;
      case "all":
      default:
        return allTokens?.length || 0;
    }
  };

  const currentTokens = getCurrentTokens();
  const totalTokens = getTotalTokensCount();
  const hasMore = displayCount < totalTokens;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 50);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setDisplayCount(50);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <TrendingTables />

          <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg rounded-b-none ${
                  activeTab === tab.id
                    ? "bg-card text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          <div>
            {isLoading() ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentTokens.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No tokens found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentTokens.map((token, index) => (
                    <TokenCard
                      key={token.pairAddress}
                      name={token.baseToken.name}
                      symbol={token.baseToken.symbol}
                      logo={token.info?.imageUrl}
                      priceUsd={token.priceUsd}
                      priceChange24h={Number(token.priceChange?.h24 || 0)}
                      volume24h={token.volume.h24}
                      liquidity={token.liquidity.usd}
                      pairAddress={token.pairAddress}
                      baseTokenAddress={token.baseToken.address}
                      socials={token.info?.socials}
                      website={token.info?.websites?.[0]?.url}
                      rank={index + 1}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      className="min-w-[200px]"
                    >
                      Load More ({displayCount} / {totalTokens})
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
