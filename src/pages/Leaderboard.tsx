import { useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/stores/wallet';
import { useTradesStore } from '@/stores/trades';
import { TrendingUp, TrendingDown, Trophy, Medal, Award } from 'lucide-react';
import { formatPoints } from '@/lib/format';

type LeaderboardEntry = {
  rank: number;
  wallet: string;
  points: number;
  pnlRealized: number;
  winRate: number;
  tradesCount: number;
};

const Leaderboard = () => {
  const walletStore = useWalletStore();
  const tradesStore = useTradesStore();

  useEffect(() => {
    if (!walletStore.wallet.address) walletStore.init();
    if (!tradesStore.initialized) tradesStore.init();
  }, [walletStore, tradesStore]);

  const leaderboardData = useMemo((): LeaderboardEntry[] => {
    // Get unique wallets from trades
    const walletMap = new Map<string, {
      trades: number;
      wins: number;
    }>();

    tradesStore.trades.forEach(trade => {
      const existing = walletMap.get(trade.wallet) || { trades: 0, wins: 0 };
      walletMap.set(trade.wallet, {
        trades: existing.trades + 1,
        wins: existing.wins,
      });
    });

    // Create leaderboard entries
    const entries: LeaderboardEntry[] = [{
      rank: 1,
      wallet: walletStore.wallet.address,
      points: walletStore.wallet.points,
      pnlRealized: walletStore.wallet.pnlRealized,
      winRate: 0,
      tradesCount: walletMap.get(walletStore.wallet.address)?.trades || 0,
    }];

    // Add some mock entries for demonstration
    const mockEntries: LeaderboardEntry[] = [
      {
        rank: 2,
        wallet: 'guest-alpha-trader',
        points: 125000,
        pnlRealized: 45000,
        winRate: 72,
        tradesCount: 156,
      },
      {
        rank: 3,
        wallet: 'guest-beta-whale',
        points: 98000,
        pnlRealized: 28000,
        winRate: 65,
        tradesCount: 203,
      },
      {
        rank: 4,
        wallet: 'guest-gamma-degen',
        points: 87500,
        pnlRealized: 12500,
        winRate: 58,
        tradesCount: 89,
      },
      {
        rank: 5,
        wallet: 'guest-delta-hodler',
        points: 76200,
        pnlRealized: -5000,
        winRate: 48,
        tradesCount: 67,
      },
      {
        rank: 6,
        wallet: 'guest-epsilon-yolo',
        points: 65000,
        pnlRealized: 8000,
        winRate: 55,
        tradesCount: 134,
      },
    ];

    return [...entries, ...mockEntries].sort((a, b) => b.points - a.points).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [walletStore.wallet, tradesStore.trades]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top traders ranked by Points balance and performance
            </p>
          </div>

          {/* Leaderboard Table */}
          <Card className="glass-card border-border/50 p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Wallet</div>
                <div className="col-span-2 text-right">Points</div>
                <div className="col-span-2 text-right">P&L</div>
                <div className="col-span-2 text-right">Win Rate</div>
                <div className="col-span-2 text-right">Trades</div>
              </div>

              {/* Entries */}
              <div className="space-y-2">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.wallet}
                    className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg transition-all hover:bg-muted/50 ${
                      entry.wallet === walletStore.wallet.address
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-card'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Wallet */}
                    <div className="col-span-3 flex items-center">
                      <span className="font-mono text-sm truncate">
                        {entry.wallet}
                      </span>
                      {entry.wallet === walletStore.wallet.address && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </div>

                    {/* Points */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="font-bold">{formatPoints(entry.points)}</span>
                    </div>

                    {/* P&L */}
                    <div className="col-span-2 flex items-center justify-end">
                      <div className={`flex items-center gap-1 ${
                        entry.pnlRealized >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {entry.pnlRealized >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-semibold">
                          {entry.pnlRealized >= 0 ? '+' : ''}{formatPoints(entry.pnlRealized)}
                        </span>
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span>{entry.winRate}%</span>
                    </div>

                    {/* Trades */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-muted-foreground">{entry.tradesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Info Banner */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Rankings update in real-time based on Points balance</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
