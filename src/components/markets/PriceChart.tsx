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
      {/* Time Range Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full">
          <TabsList className="bg-card/50">
            <TabsTrigger value="24H" className="text-xs px-3">24H</TabsTrigger>
            <TabsTrigger value="7D" className="text-xs px-3">7D</TabsTrigger>
            <TabsTrigger value="30D" className="text-xs px-3">30D</TabsTrigger>
            <TabsTrigger value="ALL" className="text-xs px-3">ALL</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative h-80 w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No chart data available
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Percentage Labels */}
            <div className="absolute right-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-2">
              <span>80.0%</span>
              <span>60.0%</span>
              <span>40.0%</span>
              <span>20.0%</span>
            </div>

            <svg className="w-full h-full pr-12" viewBox="0 0 800 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="yesGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="noGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="80" x2="800" y2="80" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              <line x1="0" y1="240" x2="800" y2="240" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              
              {/* YES Line (Primary - Green) */}
              <path
                d={chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 800;
                  const y = 320 - ((d.price - minPrice) / priceRange) * 200 - 60;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
              />
              
              {/* NO Line (Secondary - Pink) */}
              <path
                d={chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 800;
                  const y = 320 - (320 - ((d.price - minPrice) / priceRange) * 200 - 60);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="2.5"
              />
            </svg>

            {/* Date Labels */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
              {chartData.length > 0 && (
                <>
                  <span>{new Date(chartData[0].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(chartData[Math.floor(chartData.length / 4)].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(chartData[Math.floor(chartData.length / 2)].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(chartData[Math.floor(chartData.length * 3 / 4)].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(chartData[chartData.length - 1].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
