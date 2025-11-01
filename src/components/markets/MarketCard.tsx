import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatUSD } from '@/lib/format';
import { Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTokenLogo } from '@/hooks/useTokenLogo';

type MarketCardProps = {
  market: Market;
};

export const MarketCard = ({ market }: MarketCardProps) => {
  const navigate = useNavigate();
  
  const { data: tokenLogo } = useTokenLogo(market.source.provider, {
    tokenAddress: market.source.tokenAddress,
    pairAddress: market.source.pairAddress,
    baseId: market.source.baseId,
  });
  
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
      <div className="relative h-40 overflow-hidden bg-gray-900">
        {/* Token Logo - Large and Centered */}
        {tokenLogo?.logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <img
                src={tokenLogo.logoUrl}
                alt={tokenLogo.tokenSymbol || 'Token'}
                className="h-24 w-24 object-contain drop-shadow-2xl transition-transform group-hover:scale-110"
              />
              {tokenLogo.tokenSymbol && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
                  <span className="text-xs font-bold">{tokenLogo.tokenSymbol}</span>
                </div>
              )}
            </div>
          </div>
        )}
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
            className={cn(
              "h-auto py-3 font-semibold hover:scale-105 transition-transform",
              "bg-green-600 hover:bg-green-700 text-white"
            )}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/market/${market.id}`);
            }}
          >
            {outcome1?.label || 'YES'}
          </Button>
          <Button
            className={cn(
              "h-auto py-3 font-semibold hover:scale-105 transition-transform",
              "bg-red-600 hover:bg-red-700 text-white"
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
