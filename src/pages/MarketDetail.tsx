import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useMarketsStore } from '@/stores/marketsStore';
import { MarketsHeader } from '@/components/markets/MarketsHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TradeBox } from '@/components/markets/TradeBox';
import { ArrowLeft } from 'lucide-react';
import { getChance } from '@/lib/amm';
import { format } from 'date-fns';
import { OutcomeKey } from '@/types/markets';

export default function MarketDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getMarketById } = useMarketsStore();

  const market = getMarketById(id || '');
  const initialSide = searchParams.get('side') as OutcomeKey | undefined;

  if (!market) {
    return (
      <div className="min-h-screen bg-[#0c0f14]">
        <MarketsHeader />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Market not found</h1>
          <Button onClick={() => navigate('/giga-markets')}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const chance = getChance(
    market.yesStake || 0,
    market.noStake || 0,
    market.aStake || 0,
    market.bStake || 0,
    market.type
  );

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <MarketsHeader />
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/giga-markets')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{market.category}</Badge>
                <Badge variant="outline">{market.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{market.title}</h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div>
                  Pool: <span className="font-semibold text-foreground">${market.poolUSD.toLocaleString()}</span>
                </div>
                <div>
                  Closes: <span className="font-semibold text-foreground">{format(new Date(market.closesAt), 'PPP')}</span>
                </div>
                <div>
                  Current chance:{' '}
                  <span className="text-2xl font-bold text-primary">
                    {chance.percentage.toFixed(1)}% {chance.side}
                  </span>
                </div>
              </div>
            </div>

            <div className="aspect-video bg-card/50 rounded-2xl flex items-center justify-center text-muted-foreground border border-border/50">
              <div className="text-center">
                <p className="text-lg">Chart Component</p>
                <p className="text-sm">Lightweight Charts integration</p>
              </div>
            </div>

            <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
              <h2 className="text-xl font-semibold mb-4">Rules</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Market Dates</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Published: {format(new Date(market.createdAt), 'PPP')}</li>
                    <li>Market closes: {format(new Date(market.closesAt), 'PPP')}</li>
                    <li>Resolution: {format(new Date(market.resolvesAt), 'PPP')}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Resolution Criteria</h3>
                  <p className="text-muted-foreground">
                    {market.resolutionType === 'PRICE_GE' &&
                      `Price must be ≥ $${market.source.threshold?.toLocaleString()}`}
                    {market.resolutionType === 'RANK_A_VS_B' &&
                      `Compare market cap ranks on ${format(new Date(market.source.snapshotDateISO!), 'PPP')}`}
                    {market.resolutionType === 'MANUAL' &&
                      'Manual resolution by admin based on verifiable sources'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Resolution Source</h3>
                  <p className="text-muted-foreground">
                    {market.source.provider === 'COINGECKO' && 'CoinGecko API'}
                    {market.source.provider === 'DEXSCREENER' && 'DexScreener API'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <TradeBox market={market} initialSide={initialSide} />
          </div>
        </div>
      </div>
    </div>
  );
}
