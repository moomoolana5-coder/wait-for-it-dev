import { TrendingUp, Volume2, Flame } from "lucide-react";
import { useTrendingByVotes } from "@/hooks/useTrendingByVotes";
import { useTopByVolume } from "@/hooks/useTopByVolume";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const TrendingTables = () => {
  const { data: votedTokens, isLoading: loadingVoted } = useTrendingByVotes();
  const { data: volumeTokens, isLoading: loadingVolume } = useTopByVolume();
  const { data: gainTokens, isLoading: loadingGain } = useTopByPriceGain();

  const topVoted = votedTokens?.slice(0, 3) || [];
  const topVolume = volumeTokens || [];
  const topGain = gainTokens || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Trending by Votes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Trending by Votes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingVoted ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topVoted.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            topVoted.map((token) => (
              <Link
                key={token.pairAddress}
                to={`/token/${token.baseToken.address}`}
                className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.info?.imageUrl && (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">{token.baseToken.symbol}</span>
                </div>
                <span className="text-sm text-green-500">
                  +{token.priceChange.h24.toFixed(1)}%
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Trending by Volume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-accent" />
            Trending by trading volume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingVolume ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topVolume.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            topVolume.map((token) => (
              <Link
                key={token.pairAddress}
                to={`/token/${token.baseToken.address}`}
                className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.info?.imageUrl && (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">{token.baseToken.symbol}</span>
                </div>
                <span className={`text-sm ${token.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24.toFixed(1)}%
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Trending by Price Gain */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Biggest Gainers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingGain ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topGain.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            topGain.map((token) => (
              <Link
                key={token.pairAddress}
                to={`/token/${token.baseToken.address}`}
                className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {token.info?.imageUrl && (
                    <img
                      src={token.info.imageUrl}
                      alt={token.baseToken.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">{token.baseToken.symbol}</span>
                </div>
                <span className="text-sm text-green-500">
                  +{token.priceChange.h24.toFixed(1)}%
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingTables;
