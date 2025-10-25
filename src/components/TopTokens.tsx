import { TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import TokenTable from "./TokenTable";

const TopTokens = () => {
  const { data: tokens, isLoading } = usePulseChainTokens();

  // Get top performing tokens (sorted by volume and price change)
  const topTokens = tokens
    ?.filter(token => token.priceChange.h24 > 0)
    .sort((a, b) => (b.volume.h24 * (1 + b.priceChange.h24/100)) - (a.volume.h24 * (1 + a.priceChange.h24/100)))
    .slice(0, 6) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Top Tokens</h2>
            <p className="text-sm text-muted-foreground">Best performing tokens by volume & price</p>
          </div>
        </div>
        <a href="#more" className="text-primary hover:text-accent transition-colors flex items-center gap-1 font-medium">
          View All <ChevronRight className="h-4 w-4" />
        </a>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : topTokens.length > 0 ? (
        <TokenTable tokens={topTokens} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No top tokens available
        </div>
      )}
    </div>
  );
};

export default TopTokens;
