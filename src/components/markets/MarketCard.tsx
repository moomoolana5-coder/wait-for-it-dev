import { Market } from '@/types/market';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getChance, getProgressValues } from '@/lib/amm';
import { formatUSD, formatPercent, formatTimeRemaining } from '@/lib/format';
import { Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type MarketCardProps = {
  market: Market;
};

export const MarketCard = ({ market }: MarketCardProps) => {
  const navigate = useNavigate();
  const chance = getChance(market);
  const progress = getProgressValues(market);

  const getStatusColor = () => {
    switch (market.status) {
      case 'OPEN':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CLOSED':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'RESOLVED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={() => navigate(`/market/${market.id}`)}
    >
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={market.cover}
          alt={market.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <Badge className={`absolute top-3 right-3 ${getStatusColor()}`}>
          {market.status}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {market.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTimeRemaining(market.closesAt)}
          </div>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {market.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {market.type === 'YES_NO' ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Yes</span>
                <span className="font-medium text-green-500">
                  {formatPercent((progress as any).yes)}
                </span>
              </div>
              <Progress value={(progress as any).yes * 100} className="h-2" />
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{market.outcomes[0].label}</span>
                <span className="font-medium">{formatPercent((progress as any).a)}</span>
              </div>
              <Progress value={(progress as any).a * 100} className="h-2" />
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-medium">{formatUSD(market.poolUSD)}</span>
            <span className="text-muted-foreground">Pool</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Chance: </span>
            <span className="font-semibold text-primary">
              {formatPercent(chance.value)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
