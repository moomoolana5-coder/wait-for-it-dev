import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TokenPriceHistoryProps {
  currentPrice: number;
  priceChange24h: number;
  pairCreatedAt: number;
}

const TokenPriceHistory = ({ currentPrice, priceChange24h, pairCreatedAt }: TokenPriceHistoryProps) => {
  // Calculate 24h range
  const price24hAgo = currentPrice / (1 + priceChange24h / 100);
  const high24h = Math.max(currentPrice, price24hAgo);
  const low24h = Math.min(currentPrice, price24hAgo);

  // Calculate percentage changes for display
  const calculatePercentChange = (from: number, to: number) => {
    return ((to - from) / from) * 100;
  };

  // Format price with appropriate decimals
  const formatPrice = (price: number) => {
    if (price < 0.000001) return `$${price.toFixed(10)}`;
    if (price < 0.01) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(2)}`;
  };

  const pairAge = formatDistanceToNow(new Date(pairCreatedAt), { addSuffix: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 24h Range */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">24h Range</span>
          <span className="font-semibold text-right">
            {formatPrice(low24h)} – {formatPrice(high24h)}
          </span>
        </div>

        {/* All-Time High (using current as reference) */}
        <div className="py-3 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">All-Time High</span>
            <div className="text-right">
              <div className="font-semibold">{formatPrice(high24h)}</div>
              <div className="flex items-center justify-end gap-1 text-sm text-destructive">
                <ArrowDown className="h-3 w-3" />
                <span>{Math.abs(priceChange24h).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            (tracking since {pairAge} ago)
          </div>
        </div>

        {/* All-Time Low */}
        <div className="py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">All-Time Low</span>
            <div className="text-right">
              <div className="font-semibold">{formatPrice(low24h)}</div>
              <div className="flex items-center justify-end gap-1 text-sm text-green-500">
                <ArrowUp className="h-3 w-3" />
                <span>{Math.abs(priceChange24h).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            (tracking since {pairAge} ago)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenPriceHistory;
