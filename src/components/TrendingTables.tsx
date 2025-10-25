import { TrendingUp, Volume2, Flame, Loader2 } from "lucide-react";
import { useTrendingByVotes } from "@/hooks/useTrendingByVotes";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import TokenTable from "./TokenTable";

const TrendingTables = () => {
  const { data: votedTokens, isLoading: loadingVoted } = useTrendingByVotes();
  const { data: volumeTokens, isLoading: loadingVolume } = useTopByVolume();
  const { data: gainTokens, isLoading: loadingGain } = useTopByPriceGain();

  const topVoted = votedTokens?.slice(0, 3) || [];
  const topVolume = volumeTokens || [];
  const topGain = gainTokens || [];

  return (
    <div className="space-y-8">
      {/* Trending by Votes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Trending by Votes</h2>
            <p className="text-sm text-muted-foreground">Most voted tokens by the community</p>
          </div>
        </div>
        {loadingVoted ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : topVoted.length > 0 ? (
          <TokenTable tokens={topVoted} showRank={true} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">No trending tokens available</div>
        )}
      </div>

      {/* Trending by Volume */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Volume2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Trending by Trading Volume</h2>
            <p className="text-sm text-muted-foreground">Highest volume tokens in 24 hours</p>
          </div>
        </div>
        {loadingVolume ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : topVolume.length > 0 ? (
          <TokenTable tokens={topVolume} showRank={true} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">No volume data available</div>
        )}
      </div>

      {/* Trending by Price Gain */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Biggest Gainers</h2>
            <p className="text-sm text-muted-foreground">Top performing tokens by price increase</p>
          </div>
        </div>
        {loadingGain ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : topGain.length > 0 ? (
          <TokenTable tokens={topGain} showRank={true} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">No price gain data available</div>
        )}
      </div>
    </div>
  );
};

export default TrendingTables;
