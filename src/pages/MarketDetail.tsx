import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TradeBox } from '@/components/markets/TradeBox';
import { RulesPanel } from '@/components/markets/RulesPanel';
import { ActivityPanel } from '@/components/markets/ActivityPanel';
import { HoldersPanel } from '@/components/markets/HoldersPanel';
import { TradingActivity } from '@/components/markets/TradingActivity';
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
import { useWplsPrice } from '@/hooks/useWplsPrice';
import { useAutoResolve } from '@/hooks/useAutoResolve';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMarket, incrementTrending, init, initialized } = useMarketsStore();
  const walletStore = useWalletStore();
  const tradesStore = useTradesStore();
  const [activeTab, setActiveTab] = useState('activity');
  const [timeRemaining, setTimeRemaining] = useState('');
  const { priceData, loading: priceLoading } = useWplsPrice();

  useEffect(() => {
    if (!initialized) init();
    if (!walletStore.wallet.address) walletStore.init();
    if (!tradesStore.initialized) tradesStore.init();
    
    // Subscribe to realtime updates
    const unsubscribeTrades = tradesStore.subscribeToTrades();
    const unsubscribeMarkets = useMarketsStore.getState().subscribeToMarkets();
    
    return () => {
      unsubscribeTrades();
      unsubscribeMarkets();
    };
  }, [initialized, init, walletStore, tradesStore]);

  useEffect(() => {
    if (id) incrementTrending(id);
  }, [id, incrementTrending]);

  const market = id ? getMarket(id) : undefined;
  
  // Auto-resolve market when time is up
  useAutoResolve(market);

  // Update countdown every second
  useEffect(() => {
    if (!market) return;

    const updateTimeRemaining = () => {
      const now = dayjs();
      const closesAt = dayjs(market.closesAt);
      const diff = closesAt.diff(now);

      if (diff <= 0) {
        setTimeRemaining('Market Closed');
        return;
      }

      const duration = dayjs.duration(diff);
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      if (hours > 0) {
        setTimeRemaining(`Closes in ${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`Closes in ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`Closes in ${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [market]);

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

  // Calculate outcome probabilities based on actual trades
  const marketTrades = tradesStore.getTrades(market.id);
  const yesStake = market.type === 'YES_NO'
    ? marketTrades.filter((t) => t.side === 'YES').reduce((sum, t) => sum + (t.amountPts || 0), 0)
    : marketTrades.filter((t) => t.side === 'A').reduce((sum, t) => sum + (t.amountPts || 0), 0);
  const noStake = market.type === 'YES_NO'
    ? marketTrades.filter((t) => t.side === 'NO').reduce((sum, t) => sum + (t.amountPts || 0), 0)
    : marketTrades.filter((t) => t.side === 'B').reduce((sum, t) => sum + (t.amountPts || 0), 0);
  const totalStake = yesStake + noStake;
  const yesPercent = totalStake > 0 ? (yesStake / totalStake) * 100 : 0;
  const noPercent = totalStake > 0 ? (noStake / totalStake) * 100 : 0;

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
                placeholder="Search"
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
                      <span className={cn(
                        "flex items-center gap-1 font-medium",
                        market.status === 'CLOSED' ? "text-yellow-500" : 
                        timeRemaining.includes('Closed') ? "text-red-500" :
                        timeRemaining.includes('s') && !timeRemaining.includes('m') && !timeRemaining.includes('h') ? "text-red-500 animate-pulse" :
                        timeRemaining.includes('m') && parseInt(timeRemaining.split('m')[0].split(' ').pop() || '0') < 5 ? "text-orange-500" :
                        "text-primary"
                      )}>
                        <Clock className="h-3 w-3" />
                        {timeRemaining}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current WPLS Price */}
                {market.source.provider === 'DEXSCREENER' && (
                  <div className="glass-card border-border/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current WPLS Price</span>
                      {market.source.threshold && (
                        <span className="text-xs text-muted-foreground">
                          Target: ${market.source.threshold.toFixed(6)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      {priceLoading ? (
                        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                      ) : priceData ? (
                        <>
                          <span className="text-3xl font-bold">
                            ${priceData.price.toFixed(6)}
                          </span>
                          <Badge 
                            variant={priceData.priceChange24h >= 0 ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {priceData.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceData.priceChange24h).toFixed(2)}%
                          </Badge>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Price unavailable</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${totalStake > 0 ? totalStake.toLocaleString() : '0'}
                  </span>
                  {totalStake > 0 ? (
                    <>
                      <span className={`text-lg ${yesPercent > 50 ? 'text-primary' : 'text-destructive'}`}>
                        {yesPercent > 50 ? '↑' : '↓'} {Math.abs(yesPercent - 50).toFixed(1)}%
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {yesPercent.toFixed(1)}% chance
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground ml-2">
                      No trades yet
                    </span>
                  )}
                </div>

                {/* Outcome Probabilities */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{market.outcomes[0]?.label} {yesPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span>{market.outcomes[1]?.label} {noPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <PriceChart market={market} />

              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-card/50">
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="holders">Holders</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="mt-6">
                  <ActivityPanel market={market} />
                </TabsContent>

                <TabsContent value="holders" className="mt-6">
                  <HoldersPanel market={market} />
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <TradingActivity market={market} />
                </TabsContent>

                <TabsContent value="news" className="mt-6">
                  <div className="glass-card border-border/50 rounded-lg p-6">
                    <p className="text-muted-foreground text-center py-8">No news available</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Rules Section */}
              <div className="glass-card border-border/50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-bold">Rules</h2>
                <RulesPanel market={market} />
              </div>
            </div>

            {/* Right Column - Trade Box */}
            <div className="space-y-6">
              <TradeBox market={market} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketDetail;
