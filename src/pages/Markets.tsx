import { useState, useEffect } from 'react';
import { useMarketsStore } from '@/stores/marketsStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTradesStore } from '@/stores/tradesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { MarketsHeader } from '@/components/markets/MarketsHeader';
import { MarketsSidebar } from '@/components/markets/MarketsSidebar';
import { FilterBar } from '@/components/markets/FilterBar';
import { MarketGrid } from '@/components/markets/MarketGrid';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Markets() {
  const { markets, initialized, init: initMarkets } = useMarketsStore();
  const { init: initWallet } = useWalletStore();
  const { init: initTrades } = useTradesStore();
  const { init: initSettings, adminMode, setAdminMode, reset } = useSettingsStore();

  const [sortBy, setSortBy] = useState('trending');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initMarkets();
      initWallet();
      initTrades();
      initSettings();
    }
  }, [initialized]);

  const filteredMarkets = markets
    .filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'trending':
          return b.trendingScore - a.trendingScore;
        case 'volume':
          return b.poolUSD - a.poolUSD;
        case 'ending':
          return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
        case 'open':
          return a.status === 'OPEN' && b.status !== 'OPEN' ? -1 : 1;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <MarketsHeader />
      <div className="flex">
        <MarketsSidebar onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 p-6 space-y-6">
          <FilterBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            category={category}
            setCategory={setCategory}
            search={search}
            setSearch={setSearch}
          />
          <MarketGrid markets={filteredMarkets} />
        </main>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-mode">Enable Admin Mode</Label>
              <Switch
                id="admin-mode"
                checked={adminMode}
                onCheckedChange={setAdminMode}
              />
            </div>

            <Button variant="destructive" className="w-full" onClick={reset}>
              Reset Demo Data
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
