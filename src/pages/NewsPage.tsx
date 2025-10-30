import { useState } from 'react';
import { MarketsHeader } from '@/components/markets/MarketsHeader';
import { MarketsSidebar } from '@/components/markets/MarketsSidebar';
import { Card } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { ExternalLink } from 'lucide-react';

const PLACEHOLDER_NEWS = [
  {
    id: 1,
    title: 'Bitcoin Reaches New All-Time High',
    source: 'CoinDesk',
    time: '2 hours ago',
    url: '#',
  },
  {
    id: 2,
    title: 'Ethereum 2.0 Upgrade Complete',
    source: 'CoinTelegraph',
    time: '5 hours ago',
    url: '#',
  },
  {
    id: 3,
    title: 'DeFi TVL Surpasses $100B',
    source: 'DeFi Pulse',
    time: '1 day ago',
    url: '#',
  },
  {
    id: 4,
    title: 'Major Exchange Lists New Tokens',
    source: 'CryptoNews',
    time: '2 days ago',
    url: '#',
  },
];

export default function NewsPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <MarketsHeader />
      <div className="flex">
        <MarketsSidebar onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Crypto News</h1>

            <div className="space-y-4">
              {PLACEHOLDER_NEWS.map((news) => (
                <Card
                  key={news.id}
                  className="p-6 bg-card/50 rounded-2xl border border-border/50 hover:bg-card/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center text-muted-foreground text-sm py-8">
              News feed powered by external sources
            </div>
          </div>
        </main>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
