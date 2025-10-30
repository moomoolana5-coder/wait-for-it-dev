import { useState, useEffect } from 'react';
import { MarketsHeader } from '@/components/markets/MarketsHeader';
import { MarketsSidebar } from '@/components/markets/MarketsSidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet } from '@/components/ui/sheet';
import { CheckCircle2, XCircle, Activity } from 'lucide-react';
import { oracles } from '@/lib/oracles';

export default function Integrations() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [health, setHealth] = useState({ dex: false, cg: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      const result = await oracles.checkHealth();
      setHealth(result);
      setLoading(false);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <MarketsHeader />
      <div className="flex">
        <MarketsSidebar onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Integrations</h1>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 rounded-2xl border border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">DexScreener</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time DEX data
                    </p>
                  </div>
                  {loading ? (
                    <Activity className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : health.dex ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={health.dex ? 'default' : 'destructive'}>
                      {health.dex ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last check</span>
                    <span>Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Endpoint</span>
                    <span className="font-mono text-xs">api.dexscreener.com</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 rounded-2xl border border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">CoinGecko</h3>
                    <p className="text-sm text-muted-foreground">
                      Cryptocurrency data
                    </p>
                  </div>
                  {loading ? (
                    <Activity className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : health.cg ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={health.cg ? 'default' : 'destructive'}>
                      {health.cg ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last check</span>
                    <span>Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Endpoint</span>
                    <span className="font-mono text-xs">api.coingecko.com</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-card/50 rounded-2xl border border-border/50">
              <h3 className="font-semibold mb-4">About Integrations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Giga Markets uses external data providers to ensure accurate market
                resolutions. DexScreener provides real-time price data for DEX pairs,
                while CoinGecko supplies comprehensive cryptocurrency market data
                including prices and rankings. The system gracefully handles provider
                outages to maintain functionality.
              </p>
            </Card>
          </div>
        </main>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
