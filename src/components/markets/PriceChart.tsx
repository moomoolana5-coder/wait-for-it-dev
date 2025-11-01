import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Market } from '@/types/market';
import { OracleService } from '@/lib/oracles';
import { Loader2 } from 'lucide-react';

type TimeRange = '24H' | '7D' | '30D' | 'ALL';

type ChartDataPoint = {
  time: number;
  price: number;
};

type PriceChartProps = {
  market: Market;
};

export const PriceChart = ({ market }: PriceChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const daysMap: Record<TimeRange, number> = {
        '24H': 1,
        '7D': 7,
        '30D': 30,
        'ALL': 365,
      };
      
      const days = daysMap[timeRange];
      
      try {
        const candles = await OracleService.getCandles(
          market.source.provider,
          {
            pairAddress: market.source.pairAddress,
            baseId: market.source.baseId,
            days,
          }
        );
        
        if (candles.length > 0) {
          const data = candles.map(c => ({
            time: c.time * 1000,
            price: c.close,
          }));
          setChartData(data);
          setCurrentPrice(data[data.length - 1]?.price || null);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, market]);

  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice || 1;

  return (
    <Card className="glass-card border-border/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Price Chart</h3>
          {currentPrice && (
            <p className="text-2xl font-bold text-primary mt-1">
              ${currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              })}
            </p>
          )}
        </div>
        
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="24H">24H</TabsTrigger>
            <TabsTrigger value="7D">7D</TabsTrigger>
            <TabsTrigger value="30D">30D</TabsTrigger>
            <TabsTrigger value="ALL">ALL</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative h-64 w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No chart data available
          </div>
        ) : (
          <svg className="w-full h-full" viewBox="0 0 800 256" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Area Fill */}
            <path
              d={
                chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 800;
                  const y = 256 - ((d.price - minPrice) / priceRange) * 256;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ') +
                ` L 800 256 L 0 256 Z`
              }
              fill="url(#areaGradient)"
            />
            
            {/* Line */}
            <path
              d={chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 800;
                const y = 256 - ((d.price - minPrice) / priceRange) * 256;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
    </Card>
  );
};
