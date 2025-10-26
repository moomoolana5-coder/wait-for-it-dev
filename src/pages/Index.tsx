import Navbar from "@/components/Navbar";
import TrendingTables from "@/components/TrendingTables";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, Clock, Star } from "lucide-react";
import { useState } from "react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { useNewListings } from "@/hooks/useNewListings";
import TokenCard from "@/components/TokenCard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");

  const { data: allTokens, isLoading: loadingAll } = usePulseChainTokens();
  const { data: trendingTokens, isLoading: loadingTrending } = useTopByVolume();
  const { data: gainersTokens, isLoading: loadingGainers } = useTopByPriceGain();
  const { data: newListingsTokens, isLoading: loadingNewListings } = useNewListings();

  const tabs = [
    { id: "all", label: "All", icon: TrendingUp },
    { id: "trending", label: "Trending", icon: Star },
    { id: "gainers", label: "Top Gainers", icon: Sparkles },
    { id: "new", label: "New Listings", icon: Clock },
  ];

  const getCurrentTokens = () => {
    switch (activeTab) {
      case "trending":
        return trendingTokens || [];
      case "gainers":
        return gainersTokens || [];
      case "new":
        return newListingsTokens || [];
      case "all":
      default:
        return allTokens?.slice(0, 50) || [];
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "trending":
        return loadingTrending;
      case "gainers":
        return loadingGainers;
      case "new":
        return loadingNewListings;
      case "all":
      default:
        return loadingAll;
    }
  };

  const currentTokens = getCurrentTokens();

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
                onClick={() => setActiveTab(tab.id)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTokens.map((token) => (
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
