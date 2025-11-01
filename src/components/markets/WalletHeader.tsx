import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletDbStore } from '@/stores/walletDb';
import { formatPoints, formatUSD } from '@/lib/format';
import { Wallet, Droplet, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export const WalletHeader = () => {
  const { wallet, claimFaucet, canClaimFaucet, getTimeUntilNextClaim } = useWalletDbStore();

  const handleClaimFaucet = async () => {
    const success = await claimFaucet();
    if (success) {
      toast.success('10,000 points claimed!');
    } else {
      const hoursLeft = Math.ceil(getTimeUntilNextClaim() / (1000 * 60 * 60));
      toast.error(`Faucet available in ${hoursLeft} hours`);
    }
  };

  return (
    <Card className="glass-card border-border/50 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-2xl font-bold">{formatPoints(wallet.points)} PTS</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Realized P&L</p>
            <div className="flex items-center gap-1">
              {wallet.pnlRealized >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-lg font-semibold ${wallet.pnlRealized >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatUSD(wallet.pnlRealized)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleClaimFaucet}
            disabled={!canClaimFaucet()}
            className="gap-2"
          >
            <Droplet className="h-4 w-4" />
            Claim 10k Points
          </Button>
        </div>
      </div>
    </Card>
  );
};
