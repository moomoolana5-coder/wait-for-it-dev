import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TradeBox } from '@/components/markets/TradeBox';
import { RulesPanel } from '@/components/markets/RulesPanel';
import { ActivityPanel } from '@/components/markets/ActivityPanel';
import { TimelinePanel } from '@/components/markets/TimelinePanel';
import { PriceChart } from '@/components/markets/PriceChart';
import { useMarketsStore } from '@/stores/markets';
import { useWalletStore } from '@/stores/wallet';
import { useTradesStore } from '@/stores/trades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Search, Share2, Clock } from 'lucide-react';
import { formatUSD, formatTimeRemaining, formatPoints } from '@/lib/format';
import { cn } from '@/lib/utils';

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMarket, incrementTrending, init, initialized } = useMarketsStore();
  const walletStore = useWalletStore();
  const tradesStore = useTradesStore();
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    if (!initialized) init();
    if (!walletStore.wallet.address) walletStore.init();
    if (!tradesStore.initialized) tradesStore.init();
  }, [initialized, init, walletStore, tradesStore]);

  useEffect(() => {
    if (id) incrementTrending(id);
  }, [id, incrementTrending]);

  const market = id ? getMarket(id) : undefined;

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Market Not Found</h1>
          <Button onClick={() => navigate('/giga-markets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (market.status) {
      case 'OPEN':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CLOSED':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'RESOLVED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate outcome probabilities
  const yesStake = market.yesStake || 0;
  const noStake = market.noStake || 0;
  const totalStake = yesStake + noStake;
  const yesPercent = totalStake > 0 ? (yesStake / totalStake) * 100 : 50;
  const noPercent = totalStake > 0 ? (noStake / totalStake) * 100 : 50;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Myriad"
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>

            {/* Wallet Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Points</p>
                <p className="text-sm font-bold">{formatPoints(walletStore.wallet.points)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">USDC</p>
                <p className="text-sm font-bold">$0</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                + Deposit
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button & Share */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/giga-markets')}
              className="gap-2 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Markets
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share to Earn
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart & Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Header */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{market.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        💎 {formatUSD(market.poolUSD)}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {market.status === 'OPEN' ? formatTimeRemaining(market.closesAt) : market.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${market.source.threshold?.toLocaleString()}</span>
                  <span className="text-lg text-primary">↑ 4.5%</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {yesPercent.toFixed(1)}% chance
                  </span>
                </div>

                {/* Outcome Probabilities */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>${market.outcomes[0]?.label} {yesPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    <span>${market.outcomes[1]?.label} {noPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <PriceChart market={market} />

              {/* Rules Section */}
              <div className="glass-card border-border/50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-bold">Rules</h2>
                <RulesPanel market={market} />
              </div>

              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-card/50">
                  <TabsTrigger value="opinions">Opinions (3)</TabsTrigger>
                  <TabsTrigger value="holders">Holders</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>

                <TabsContent value="opinions" className="mt-6">
                  <ActivityPanel market={market} />
                </TabsContent>

                <TabsContent value="holders" className="mt-6">
                  <div className="glass-card border-border/50 rounded-lg p-6">
                    <p className="text-muted-foreground text-center py-8">No holders yet</p>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <ActivityPanel market={market} />
                </TabsContent>

                <TabsContent value="news" className="mt-6">
                  <div className="glass-card border-border/50 rounded-lg p-6">
                    <p className="text-muted-foreground text-center py-8">No news available</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Trade Box & Timeline */}
            <div className="space-y-6">
              <TradeBox market={market} />
              <TimelinePanel market={market} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketDetail;
