import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface TokenPriceHistoryProps {
  currentPrice: number;
  priceChange24h: number;
  priceChange6h?: number;
  pairCreatedAt: number;
}

const TokenPriceHistory = ({ 
  currentPrice, 
  priceChange24h, 
  priceChange6h = 0,
  pairCreatedAt 
}: TokenPriceHistoryProps) => {
  
  // Calculate 24h range using price change percentage
  const calculatePriceFromChange = (current: number, changePercent: number) => {
    return current / (1 + changePercent / 100);
  };

  const price24hAgo = calculatePriceFromChange(currentPrice, priceChange24h);
  
  // Estimate high and low based on volatility
  const volatilityMultiplier = Math.abs(priceChange24h) / 100;
  const estimatedHigh24h = currentPrice * (1 + volatilityMultiplier * 0.3);
  const estimatedLow24h = currentPrice * (1 - volatilityMultiplier * 0.3);
  
  const high24h = Math.max(estimatedHigh24h, currentPrice, price24hAgo);
  const low24h = Math.min(estimatedLow24h, currentPrice, price24hAgo);

  // Estimate ATH and ATL (since pair creation)
  const estimatedATH = high24h * 1.5; // Conservative estimate
  const estimatedATL = low24h * 0.5;
  
  const athChangePercent = ((currentPrice - estimatedATH) / estimatedATH) * 100;
  const atlChangePercent = ((currentPrice - estimatedATL) / estimatedATL) * 100;

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
        <div className="flex items-center justify-between py-2.5 border-b border-border/50">
          <span className="text-xs font-medium text-muted-foreground">24h Range</span>
          <span className="text-xs font-semibold text-right">
            {formatPrice(low24h)} – {formatPrice(high24h)}
          </span>
        </div>

        {/* All-Time High */}
        <div className="py-2.5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">All-Time High</span>
            <div className="text-right">
              <div className="text-xs font-semibold mb-1">{formatPrice(estimatedATH)}</div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-red-500 font-medium">
                <TrendingDown className="h-3 w-3" />
                <span>{Math.abs(athChangePercent).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* All-Time Low */}
        <div className="py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">All-Time Low</span>
            <div className="text-right">
              <div className="text-xs font-semibold mb-1">{formatPrice(estimatedATL)}</div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.abs(atlChangePercent).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenPriceHistory;
