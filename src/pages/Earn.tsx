import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletStore } from '@/stores/wallet';
import { formatPoints } from '@/lib/format';
import { Gift, Wallet, TrendingUp, Clock, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const Earn = () => {
  const { wallet, init, claimFaucet, canClaimFaucet, getTimeUntilNextClaim } = useWalletStore();
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!wallet.address) init();
  }, [wallet.address, init]);

  useEffect(() => {
    const updateCountdown = () => {
      const ms = getTimeUntilNextClaim();
      if (ms <= 0) {
        setCountdown('');
        return;
      }

      const dur = dayjs.duration(ms);
      const hours = Math.floor(dur.asHours());
      const minutes = dur.minutes();
      const seconds = dur.seconds();

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilNextClaim, wallet.claimedFaucetAt]);

  const handleClaim = () => {
    const success = claimFaucet();
    if (success) {
      toast({
        title: 'Faucet claimed!',
        description: 'You received 10,000 Points',
      });
    } else {
      toast({
        title: 'Cannot claim yet',
        description: `Please wait ${countdown}`,
        variant: 'destructive',
      });
    }
  };

  const canClaim = canClaimFaucet();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Earn Points
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Claim free Points every 24 hours to trade on prediction markets
            </p>
          </div>

          {/* Beta Notice */}
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <Info className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              <strong>Beta Testing Phase</strong> – This is a demo app using virtual points. No real money is involved.
            </AlertDescription>
          </Alert>

          {/* Daily Faucet Card */}
          <Card className="glass-card border-border/50 p-8 relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            
            <div className="relative space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <Gift className="h-20 w-20 text-primary relative z-10" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Daily Faucet</h2>
                <p className="text-muted-foreground">Claim 10,000 Points every 24 hours</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary">
                <span>10,000</span>
                <span className="text-2xl text-muted-foreground">PTS</span>
              </div>

              {!canClaim && countdown && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>Next claim in: <strong className="text-foreground">{countdown}</strong></span>
                </div>
              )}

              <Button
                size="lg"
                disabled={!canClaim}
                onClick={handleClaim}
                className="w-full text-lg h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                {canClaim ? (
                  <>
                    <Gift className="h-6 w-6 mr-2" />
                    Claim 10,000 Points
                  </>
                ) : (
                  <>
                    <Clock className="h-6 w-6 mr-2" />
                    Available in {countdown}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Your Stats Card */}
          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">Current Points</span>
                </div>
                <p className="text-2xl font-bold">{formatPoints(wallet.points)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Realized P&L</span>
                </div>
                <p className={`text-2xl font-bold ${
                  wallet.pnlRealized >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {wallet.pnlRealized >= 0 ? '+' : ''}{formatPoints(wallet.pnlRealized)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">Wallet Address</span>
                </div>
                <p className="text-sm font-mono truncate">{wallet.address}</p>
              </div>
            </div>
          </Card>

          {/* How it Works */}
          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-xl font-semibold mb-4">How it Works</h3>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Claim Your Daily Points</p>
                  <p className="text-sm">Get 10,000 free Points every 24 hours from the faucet</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Trade on Markets</p>
                  <p className="text-sm">Use your Points to buy YES/NO shares on prediction markets</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Win & Earn More</p>
                  <p className="text-sm">If you're right, earn Points from the pool. 80% goes to winners!</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Earn;
