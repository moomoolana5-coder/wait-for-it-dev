import { useState, useEffect } from 'react';
import { MarketsHeader } from '@/components/markets/MarketsHeader';
import { MarketsSidebar } from '@/components/markets/MarketsSidebar';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { Gift, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Earn() {
  const { currentWallet, claimFaucet, canClaimFaucet, getWallet } = useWalletStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [countdown, setCountdown] = useState('');

  const wallet = getWallet(currentWallet);
  const canClaim = canClaimFaucet(currentWallet);

  useEffect(() => {
    if (!canClaim && wallet.claimedFaucetAt) {
      const interval = setInterval(() => {
        const lastClaim = new Date(wallet.claimedFaucetAt!).getTime();
        const now = Date.now();
        const diff = 24 * 60 * 60 * 1000 - (now - lastClaim);

        if (diff <= 0) {
          setCountdown('Ready!');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (60 * 60 * 1000));
          const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((diff % (60 * 1000)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canClaim, wallet.claimedFaucetAt]);

  const handleClaim = () => {
    if (claimFaucet(currentWallet)) {
      toast.success('Claimed 10,000 Points!');
    } else {
      toast.error('Faucet on cooldown');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <MarketsHeader />
      <div className="flex">
        <MarketsSidebar onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Earn Points</h1>

            <Card className="p-8 bg-gradient-to-br from-primary/20 to-card rounded-2xl border-2 border-primary/30 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Gift className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Daily Faucet</h2>
                <p className="text-muted-foreground">
                  Claim free points every 24 hours to start trading
                </p>
              </div>

              {!canClaim && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-mono">{countdown}</span>
                </div>
              )}

              <Button
                size="lg"
                className="text-lg px-8 py-6"
                disabled={!canClaim}
                onClick={handleClaim}
              >
                Claim 10,000 Points
              </Button>

              <p className="text-sm text-muted-foreground">
                Current balance: {wallet.points.toLocaleString()} Points
              </p>
            </Card>

            <Card className="p-6 bg-card/50 rounded-2xl border border-border/50">
              <h3 className="font-semibold mb-4">How to Earn More</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Trade on prediction markets to grow your balance</li>
                <li>• Win resolved markets to earn 80% of the pool</li>
                <li>• Return daily to claim the faucet</li>
                <li>• Refer friends (coming soon)</li>
              </ul>
            </Card>
          </div>
        </main>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
