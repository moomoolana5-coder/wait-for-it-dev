import { Clock, ChevronRight, Loader2 } from "lucide-react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import TokenCard from "./TokenCard";
import { Link } from "react-router-dom";

const TokenListings = () => {
  const { data: tokens, isLoading } = usePulseChainTokens();

  // Get newest tokens (sorted by pairCreatedAt)
  const newListings = tokens
    ?.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt)
    .slice(0, 6) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">New Listings</h2>
            <p className="text-sm text-muted-foreground">Recently added tokens on gigacock</p>
          </div>
        </div>
        <Link to="/new-listings" className="text-primary hover:text-accent transition-colors flex items-center gap-1 font-medium">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newListings.map((token) => (
            <TokenCard
              key={token.pairAddress}
              name={token.baseToken.name}
              symbol={token.baseToken.symbol}
              logo={token.info?.imageUrl}
              priceUsd={token.priceUsd}
              priceChange24h={token.priceChange.h24}
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
  );
};

export default TokenListings;
