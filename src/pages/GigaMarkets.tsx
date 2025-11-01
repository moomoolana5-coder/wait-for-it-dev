import { useEffect, useState } from 'react';
import { HeroCarousel } from '@/components/markets/HeroCarousel';
import { MarketCard } from '@/components/markets/MarketCard';
import { useMarketsStore } from '@/stores/markets';
import { useWalletStore } from '@/stores/wallet';
import { useTradesStore } from '@/stores/trades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, Volume2, Clock, Filter, Menu } from 'lucide-react';
import { formatPoints } from '@/lib/format';
import { cn } from '@/lib/utils';

const GigaMarkets = () => {
  const { markets, initialized, init } = useMarketsStore();
  const walletStore = useWalletStore();
  const tradesStore = useTradesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'newest' | 'trending' | 'volume' | 'ending' | 'open'>('newest');
  const [tokenFilter, setTokenFilter] = useState('all');

  useEffect(() => {
    if (!initialized) init();
    if (!walletStore.wallet.address) walletStore.init();
    if (!tradesStore.initialized) tradesStore.init();
  }, [initialized, walletStore, tradesStore, init]);

  const filteredMarkets = markets
    .filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (activeFilter === 'trending') return b.trendingScore - a.trendingScore;
      if (activeFilter === 'volume') return b.poolUSD - a.poolUSD;
      if (activeFilter === 'ending') {
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      }
      if (activeFilter === 'open') {
        return a.status === 'OPEN' ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Myriad"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>

            {/* Wallet Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Limbo 🎲</p>
                <p className="text-sm font-bold">12,5k pts</p>
              </div>
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Carousel */}
          <HeroCarousel markets={markets.slice(0, 5)} />

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>

            <Button
              variant={activeFilter === 'newest' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('newest')}
              className={cn(
                activeFilter === 'newest' && 'bg-primary text-primary-foreground'
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Newest
            </Button>

            <Button
              variant={activeFilter === 'trending' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('trending')}
              className={cn(
                activeFilter === 'trending' && 'bg-primary text-primary-foreground'
              )}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>

            <Button
              variant={activeFilter === 'volume' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('volume')}
              className={cn(
                activeFilter === 'volume' && 'bg-primary text-primary-foreground'
              )}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Volume
            </Button>

            <Button
              variant={activeFilter === 'ending' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('ending')}
              className={cn(
                activeFilter === 'ending' && 'bg-primary text-primary-foreground'
              )}
            >
              <Clock className="h-4 w-4 mr-2" />
              Ending
            </Button>

            <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Open" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tokenFilter} onValueChange={setTokenFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Tokens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tokens</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No markets found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GigaMarkets;
