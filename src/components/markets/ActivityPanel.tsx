import { Market, Trade } from '@/types/market';
import { Card } from '@/components/ui/card';
import { useTradesStore } from '@/stores/trades';
import { formatPoints, formatPercent, formatDate } from '@/lib/format';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityPanelProps = {
  market: Market;
};

export const ActivityPanel = ({ market }: ActivityPanelProps) => {
  const { getTrades } = useTradesStore();
  const trades = getTrades(market.id).sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
  );

  if (trades.length === 0) {
    return (
      <Card className="glass-card border-border/50 p-12">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No trades yet</p>
          <p className="text-sm mt-2">Be the first to trade on this market!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      
      <div className="space-y-3">
        {trades.map((trade) => {
          const isBullish = trade.side === 'YES' || trade.side === 'A';
          const sideLabel = market.outcomes.find((o) => o.key === trade.side)?.label || trade.side;
          
          return (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  isBullish ? "bg-primary/20" : "bg-secondary/20"
                )}>
                  {isBullish ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-secondary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    Bought {sideLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trade.wallet.slice(0, 6)}...{trade.wallet.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">{formatPoints(trade.amountPts)} pts</p>
                <p className="text-sm text-muted-foreground">
                  @ {formatPercent(trade.price)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
