import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface TokenPriceHistoryProps {
  currentPrice: number;
  priceChange24h: number;
  priceChange6h?: number;
  priceChange1h?: number;
  pairCreatedAt: number;
}

const TokenPriceHistory = ({ 
  currentPrice, 
  priceChange24h, 
  priceChange6h = 0,
  priceChange1h = 0,
  pairCreatedAt 
}: TokenPriceHistoryProps) => {
  
  // Calculate historical prices from percentage changes
  const calculatePriceFromChange = (current: number, changePercent: number) => {
    return current / (1 + changePercent / 100);
  };

  const price24hAgo = calculatePriceFromChange(currentPrice, priceChange24h);
  const price6hAgo = calculatePriceFromChange(currentPrice, priceChange6h);
  const price1hAgo = calculatePriceFromChange(currentPrice, priceChange1h);
  
  // Calculate actual 24h range
  const high24h = Math.max(currentPrice, price24hAgo);
  const low24h = Math.min(currentPrice, price24hAgo);
  
  // Calculate 6h range
  const high6h = Math.max(currentPrice, price6hAgo);
  const low6h = Math.min(currentPrice, price6hAgo);
  
  // Calculate 1h range
  const high1h = Math.max(currentPrice, price1hAgo);
  const low1h = Math.min(currentPrice, price1hAgo);

  // Format price with appropriate decimals
  const formatPrice = (price: number) => {
    if (price < 0.000001) return `$${price.toFixed(10)}`;
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  const calculateTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `(almost ${years} ${years === 1 ? 'year' : 'years'})`;
    if (months > 0) return `(over ${months} ${months === 1 ? 'month' : 'months'})`;
    if (days > 0) return `(${days} ${days === 1 ? 'day' : 'days'} ago)`;
    return '(today)';
  };

  return (
    <Card className="bg-card/50 backdrop-blur h-[240px] flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base font-semibold">Price History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 flex-1 px-4 pb-4">
        {/* 24h Range */}
        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <span className="text-xs font-medium text-muted-foreground">24h Range</span>
          <div className="text-right">
            <div className="text-xs font-semibold">
              {formatPrice(low24h)} – {formatPrice(high24h)}
            </div>
            <div className={`text-[10px] font-medium mt-1 ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* 6h Range */}
        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <span className="text-xs font-medium text-muted-foreground">6h Range</span>
          <div className="text-right">
            <div className="text-xs font-semibold">
              {formatPrice(low6h)} – {formatPrice(high6h)}
            </div>
            <div className={`text-[10px] font-medium mt-1 ${priceChange6h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange6h >= 0 ? '+' : ''}{priceChange6h.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* 1h Range */}
        <div className="flex items-center justify-between py-3">
          <span className="text-xs font-medium text-muted-foreground">1h Range</span>
          <div className="text-right">
            <div className="text-xs font-semibold">
              {formatPrice(low1h)} – {formatPrice(high1h)}
            </div>
            <div className={`text-[10px] font-medium mt-1 ${priceChange1h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange1h >= 0 ? '+' : ''}{priceChange1h.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenPriceHistory;
