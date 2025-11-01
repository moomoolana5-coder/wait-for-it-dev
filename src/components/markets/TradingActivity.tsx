import { useEffect, useState } from 'react';
import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTradesStore } from '@/stores/trades';
import { formatPoints } from '@/lib/format';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

type TradingActivityProps = {
  market: Market;
};

export const TradingActivity = ({ market }: TradingActivityProps) => {
  const { getTrades, subscribeToTrades, trades: allTrades } = useTradesStore();
  const [trades, setTrades] = useState<any[]>([]);

  // Subscribe to realtime trades updates
  useEffect(() => {
    const unsubscribe = subscribeToTrades();
    return () => unsubscribe();
  }, [subscribeToTrades]);

  // Update trades when allTrades changes
  useEffect(() => {
    const marketTrades = getTrades(market.id);
    setTrades(marketTrades.slice(0, 20));
  }, [market.id, getTrades, allTrades]);

  if (trades.length === 0) {
    return (
      <Card className="glass-card border-border/50 p-12">
        <div className="text-center text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No trading activity yet</p>
          <p className="text-sm mt-2">Be the first to trade on this market!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">
        Trading Activity ({trades.length})
      </h3>
      
      <div className="space-y-2">
        {trades.map((trade) => {
          const isBullish = trade.side === 'YES' || trade.side === 'A';
          const sideLabel = market.outcomes.find((o) => o.key === trade.side)?.label || trade.side;
          
          return (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isBullish ? (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm font-mono">
                      {trade.wallet.slice(0, 6)}...{trade.wallet.slice(-4)}
                    </span>
                    <Badge 
                      variant={isBullish ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {sideLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(trade.ts), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatPoints(trade.amountPts)} PTS
                </p>
                <p className="text-xs text-muted-foreground">
                  {trade.shares.toFixed(2)} shares @ ${trade.price.toFixed(4)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
