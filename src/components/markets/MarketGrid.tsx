import { Market } from '@/types/markets';
import { MarketCard } from './MarketCard';

interface MarketGridProps {
  markets: Market[];
}

export function MarketGrid({ markets }: MarketGridProps) {
  if (markets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No markets found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
