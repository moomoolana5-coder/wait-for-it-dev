import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatUSD } from '@/lib/format';
import { Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type MarketCardProps = {
  market: Market;
};

export const MarketCard = ({ market }: MarketCardProps) => {
  const navigate = useNavigate();
  
  const yesStake = market.yesStake || 0;
  const noStake = market.noStake || 0;
  const totalStake = yesStake + noStake;
  const yesPercent = totalStake > 0 ? (yesStake / totalStake) * 100 : 50;
  const noPercent = totalStake > 0 ? (noStake / totalStake) * 100 : 50;

  const outcome1 = market.outcomes[0];
  const outcome2 = market.outcomes[1];

  return (
    <Card
      className="glass-card border-border/50 overflow-hidden group hover:border-primary/50 transition-all cursor-pointer"
      onClick={() => navigate(`/market/${market.id}`)}
    >
      {/* Market Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={market.cover}
          alt={market.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
          {market.title}
        </h3>

        {/* Probability Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{yesPercent.toFixed(0)}%</span>
            <span>{noPercent.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden flex">
            <div 
              className="bg-primary transition-all"
              style={{ width: `${yesPercent}%` }}
            />
            <div 
              className="bg-secondary transition-all"
              style={{ width: `${noPercent}%` }}
            />
          </div>
        </div>

        {/* Outcome Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className={cn(
              "h-auto py-3 font-semibold border-2 hover:scale-105 transition-transform",
              "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            )}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/market/${market.id}`);
            }}
          >
            {outcome1?.label || 'YES'}
          </Button>
          <Button
            variant="outline"
            className={cn(
              "h-auto py-3 font-semibold border-2 hover:scale-105 transition-transform",
              "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20"
            )}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/market/${market.id}`);
            }}
          >
            {outcome2?.label || 'NO'}
          </Button>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <Avatar className="h-5 w-5 border-2 border-background">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-[8px]">
                  U1
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-5 w-5 border-2 border-background">
                <AvatarFallback className="bg-gradient-to-br from-secondary to-primary text-[8px]">
                  U2
                </AvatarFallback>
              </Avatar>
            </div>
            <span>+292</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-primary">💎</span>
            <span className="font-medium">{formatUSD(market.poolUSD)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Feb 17</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
