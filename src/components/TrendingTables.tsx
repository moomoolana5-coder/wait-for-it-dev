import { useState } from "react";
import { ChevronRight, TrendingUp, Volume2, Clock, TrendingDown } from "lucide-react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import VoteButton from "./VoteButton";
import { Link } from "react-router-dom";
import { FaTwitter, FaTelegram, FaDiscord } from "react-icons/fa";
import { Globe } from "lucide-react";

type TabType = "all" | "trending" | "top-tokens" | "top-gainers" | "new-listings";

const TokenListTable = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { data: tokens, isLoading } = usePulseChainTokens();

  const filteredTokens = () => {
    if (!tokens) return [];

    switch (activeTab) {
      case "trending":
        return [...tokens].sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0)).slice(0, 20);
      case "top-tokens":
        return [...tokens].sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)).slice(0, 20);
      case "top-gainers":
        return [...tokens].sort((a, b) => (b.priceChange?.h24 || 0) - (a.priceChange?.h24 || 0)).slice(0, 20);
      case "new-listings":
        return [...tokens].sort((a, b) => b.pairCreatedAt - a.pairCreatedAt).slice(0, 20);
      default:
        return tokens.slice(0, 20);
    }
  };

  const getSocialIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('twitter') || lowerType === 'x') {
      return <FaTwitter className="h-3 w-3" />;
    }
    if (lowerType.includes('telegram')) {
      return <FaTelegram className="h-3 w-3" />;
    }
    if (lowerType.includes('discord')) {
      return <FaDiscord className="h-3 w-3" />;
    }
    return null;
  };

  const tabs = [
    { id: "all" as TabType, label: "All", icon: TrendingUp },
    { id: "trending" as TabType, label: "Trending", icon: TrendingUp },
    { id: "top-tokens" as TabType, label: "Top Tokens", icon: TrendingDown },
    { id: "top-gainers" as TabType, label: "Top Gainers", icon: TrendingUp },
    { id: "new-listings" as TabType, label: "New Listings", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start border-b border-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTokens().map((token, index) => (
            <div
              key={token.pairAddress}
              className="group relative bg-card/50 backdrop-blur rounded-lg border border-border/50 p-4 hover:border-primary/30 transition-all duration-300 hover:bg-card/70"
            >
              <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
                <div className="flex items-center gap-1 w-8 text-muted-foreground font-semibold flex-shrink-0">
                  #{index + 1}
                </div>

                <Link
                  to={`/token/${token.baseToken.address}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  {token.info?.imageUrl ? (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-10 h-10 rounded-full border border-border/30 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/40/6366f1/ffffff?text=${token.baseToken.symbol.charAt(0)}`;
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {token.baseToken.symbol.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                      {token.baseToken.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{token.baseToken.symbol}</p>
                  </div>
                </Link>

                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  {token.info?.websites?.[0]?.url && (
                    <a
                      href={token.info.websites[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="h-3 w-3" />
                      Website
                    </a>
                  )}
                  {token.info?.socials?.slice(0, 3).map((social, idx) => {
                    const icon = getSocialIcon(social.type);
                    if (!icon) return null;

                    return (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {icon}
                      </a>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0 w-full lg:w-auto flex-wrap lg:flex-nowrap">
                  <div className="text-right min-w-[90px]">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-semibold text-sm">${parseFloat(token.priceUsd).toFixed(8)}</div>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="text-xs text-muted-foreground">24h Change</div>
                    <div
                      className={`font-semibold text-sm ${
                        token.priceChange.h24 >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {token.priceChange.h24 >= 0 ? "+" : ""}
                      {token.priceChange.h24.toFixed(2)}%
                    </div>
                  </div>

                  <div className="text-right min-w-[100px] hidden lg:block">
                    <div className="text-xs text-muted-foreground">Volume 24h</div>
                    <div className="font-semibold text-sm">${token.volume.h24.toLocaleString()}</div>
                  </div>

                  <div className="text-right min-w-[100px] hidden lg:block">
                    <div className="text-xs text-muted-foreground">Liquidity</div>
                    <div className="font-semibold text-sm">${token.liquidity.usd.toLocaleString()}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <VoteButton tokenAddress={token.baseToken.address} voteType="bullish" />
                    <VoteButton tokenAddress={token.baseToken.address} voteType="bearish" />
                  </div>

                  <a
                    href={`https://dexscreener.com/pulsechain/${token.pairAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors hidden lg:block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenListTable;
