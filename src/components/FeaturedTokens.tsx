import { Star, Loader2 } from "lucide-react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import TokenCard from "./TokenCard";

const FeaturedTokens = () => {
  const { data: tokens, isLoading } = usePulseChainTokens();

  return (
    <section className="space-y-6" id="featured">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Featured Tokens</h2>
            <p className="text-sm text-muted-foreground">Top performing tokens on gigacock</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens?.map((token) => (
            <TokenCard
              key={`${token.baseToken.address}-${token.pairAddress}`}
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
    </section>
  );
};

export default FeaturedTokens;
