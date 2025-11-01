import { useEffect, useState } from 'react';
import { HeroCarousel } from '@/components/markets/HeroCarousel';
import { MarketCard } from '@/components/markets/MarketCard';
import { useMarketsStore } from '@/stores/markets';
import { useWalletStore } from '@/stores/wallet';
import { useTradesStore } from '@/stores/trades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, Volume2, Clock, Filter } from 'lucide-react';
import { formatPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';

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
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Carousel */}
          <HeroCarousel markets={markets.slice(0, 5)} />

          {/* Search + Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-background/50 border-border/50 h-9"
              />
            </div>

            {/* Filter Buttons */}
            <Button
              variant={activeFilter === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('newest')}
              className={cn(
                'rounded-full h-9 px-4 flex items-center gap-2',
                activeFilter === 'newest' 
                  ? 'bg-white text-black hover:bg-white/90 border-0' 
                  : 'bg-transparent border-border/50 text-foreground hover:bg-muted/30'
              )}
              aria-label="Filter by newest"
            >
              <Filter className="h-4 w-4" />
              <span>Newest</span>
            </Button>

            <Button
              variant={activeFilter === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('trending')}
              className={cn(
                'rounded-full h-9 px-4 flex items-center gap-2',
                activeFilter === 'trending' 
                  ? 'bg-white text-black hover:bg-white/90 border-0' 
                  : 'bg-transparent border-border/50 text-foreground hover:bg-muted/30'
              )}
              aria-label="Filter by trending"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Trending</span>
            </Button>

            <Button
              variant={activeFilter === 'volume' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('volume')}
              className={cn(
                'rounded-full h-9 px-4 flex items-center gap-2',
                activeFilter === 'volume' 
                  ? 'bg-white text-black hover:bg-white/90 border-0' 
                  : 'bg-transparent border-border/50 text-foreground hover:bg-muted/30'
              )}
              aria-label="Filter by volume"
            >
              <Volume2 className="h-4 w-4" />
              <span>Volume</span>
            </Button>

            <Button
              variant={activeFilter === 'ending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('ending')}
              className={cn(
                'rounded-full h-9 px-4 flex items-center gap-2',
                activeFilter === 'ending' 
                  ? 'bg-white text-black hover:bg-white/90 border-0' 
                  : 'bg-transparent border-border/50 text-foreground hover:bg-muted/30'
              )}
              aria-label="Filter by ending soon"
            >
              <Clock className="h-4 w-4" />
              <span>Ending</span>
            </Button>

            {/* Dropdowns */}
            <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <SelectTrigger className="w-28 h-9 rounded-full bg-transparent border-border/50 text-foreground hover:bg-muted/30" aria-label="Filter by status">
                <SelectValue placeholder="Open" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tokenFilter} onValueChange={setTokenFilter}>
              <SelectTrigger className="w-36 h-9 rounded-full bg-transparent border-border/50 text-foreground hover:bg-muted/30" aria-label="Filter by token type">
                <SelectValue placeholder="All Tokens" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
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
