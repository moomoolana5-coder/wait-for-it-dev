import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { useTradesStore } from '@/stores/trades';
import { calculatePositions } from '@/lib/settlement';
import { formatPoints } from '@/lib/format';
import { Users } from 'lucide-react';

type HoldersPanelProps = {
  market: Market;
};

export const HoldersPanel = ({ market }: HoldersPanelProps) => {
  const { getTrades } = useTradesStore();
  const trades = getTrades(market.id);

  // Get unique wallets
  const uniqueWallets = Array.from(new Set(trades.map((t) => t.wallet)));

  if (uniqueWallets.length === 0) {
    return (
      <Card className="glass-card border-border/50 p-12">
        <div className="text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No holders yet</p>
          <p className="text-sm mt-2">Trade to become the first holder!</p>
        </div>
      </Card>
    );
  }

  const holderDetails = uniqueWallets.map((wallet) => {
    const positions = calculatePositions(market.id, wallet, trades);
    const totalShares = positions.reduce((sum, p) => sum + p.shares, 0);
    const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);

    return {
      wallet,
      positions,
      totalShares,
      totalCost,
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  return (
    <Card className="glass-card border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">
        Holders ({holderDetails.length})
      </h3>
      
      <div className="space-y-3">
        {holderDetails.map(({ wallet, positions, totalShares, totalCost }) => (
          <div
            key={wallet}
            className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
          >
            <div className="flex-1">
              <p className="font-medium">
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </p>
              <div className="flex gap-2 mt-1">
                {positions.map((pos) => {
                  const sideLabel = market.outcomes.find((o) => o.key === pos.side)?.label || pos.side;
                  return (
                    <span
                      key={pos.side}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {sideLabel}: {pos.shares.toFixed(0)}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium">{formatPoints(totalCost)} pts</p>
              <p className="text-sm text-muted-foreground">
                {totalShares.toFixed(0)} shares
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
