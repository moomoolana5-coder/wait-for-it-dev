import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrendingByVotes } from "@/hooks/useTrendingByVotes";
import { useTopByPriceGain } from "@/hooks/useTopByPriceGain";
import { TrendingUp, ChevronRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const QuickStats = () => {
  const { data: trendingData, isLoading: trendingLoading } = useTrendingByVotes();
  const { data: gainersData, isLoading: gainersLoading } = useTopByPriceGain();

  const topTrending = trendingData?.slice(0, 3) || [];
  const topGainers = gainersData?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending
            </CardTitle>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
              View more <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topTrending.length > 0 ? (
            topTrending.map((token, index) => (
              <div key={token.pairAddress} className="flex items-center justify-between hover:bg-accent/5 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                  <img
                    src={token.info?.imageUrl || '/placeholder.svg'}
                    alt={token.baseToken.symbol}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="font-medium">{token.baseToken.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${Number(token.priceUsd) > 0.01 
                      ? Number(token.priceUsd).toFixed(4)
                      : Number(token.priceUsd).toExponential(2)}
                  </div>
                  <div className={`text-sm ${(token.priceChange?.h24 || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(token.priceChange?.h24 || 0) >= 0 ? '▲' : '▼'} {Math.abs(token.priceChange?.h24 || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No trending tokens available</div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Gainers
            </CardTitle>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
              View more <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {gainersLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topGainers.length > 0 ? (
            topGainers.map((token, index) => (
              <div key={token.pairAddress} className="flex items-center justify-between hover:bg-accent/5 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                  <img
                    src={token.info?.imageUrl || '/placeholder.svg'}
                    alt={token.baseToken.symbol}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="font-medium">{token.baseToken.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${Number(token.priceUsd) > 0.01 
                      ? Number(token.priceUsd).toFixed(4)
                      : Number(token.priceUsd).toExponential(2)}
                  </div>
                  <div className="text-sm text-green-500">
                    ▲ {Math.abs(token.priceChange?.h24 || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No gainers available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
