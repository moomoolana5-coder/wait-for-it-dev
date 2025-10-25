import { Star, Loader2 } from "lucide-react";
import { usePulseChainTokens } from "@/hooks/useDexScreener";
import TokenTable from "./TokenTable";

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
      ) : tokens && tokens.length > 0 ? (
        <TokenTable tokens={tokens} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No featured tokens available
        </div>
      )}
    </section>
  );
};

export default FeaturedTokens;
