import { Market } from '@/types/markets';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getChance } from '@/lib/amm';
import { format } from 'date-fns';

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const navigate = useNavigate();

  const chance = getChance(
    market.yesStake || 0,
    market.noStake || 0,
    market.aStake || 0,
    market.bStake || 0,
    market.type
  );

  const isDisabled = market.status !== 'OPEN';

  return (
    <Card
      className="overflow-hidden rounded-2xl bg-card/70 backdrop-blur-sm border border-border/50 hover:translate-y-[-4px] transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => navigate(`/giga-markets/market/${market.id}`)}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <img
          src={market.cover}
          alt={market.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-primary/90">
          {market.category}
        </Badge>
        <div className="absolute bottom-2 left-0 right-0 px-3">
          <Progress value={chance.percentage} className="h-1" />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
          {market.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>${market.poolUSD.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(market.closesAt), 'MMM d')}</span>
          </div>
          {market.trendingScore > 80 && (
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {market.outcomes.map((outcome) => {
            const isLeft = outcome.key === 'YES' || outcome.key === 'A';
            return (
              <Button
                key={outcome.key}
                variant={isLeft ? 'default' : 'secondary'}
                className={`flex-1 ${isLeft ? 'bg-teal-600 hover:bg-teal-700' : 'bg-pink-600 hover:bg-pink-700'}`}
                disabled={isDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/giga-markets/market/${market.id}?side=${outcome.key}`);
                }}
              >
                {outcome.label}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
