import { useState, useEffect } from 'react';
import { Market, OutcomeKey } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { calculateTrade } from '@/lib/amm';
import { formatPoints, formatPercent, formatUSD } from '@/lib/format';
import { useWalletStore } from '@/stores/wallet';
import { useMarketsStore } from '@/stores/markets';
import { useTradesStore } from '@/stores/trades';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type TradeBoxProps = {
  market: Market;
  defaultSide?: OutcomeKey;
};

export const TradeBox = ({ market, defaultSide }: TradeBoxProps) => {
  const { wallet, subtractPoints } = useWalletStore();
  const { updateMarket } = useMarketsStore();
  const { addTrade } = useTradesStore();

  const [side, setSide] = useState<OutcomeKey>(
    defaultSide || market.outcomes[0].key
  );
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (defaultSide) setSide(defaultSide);
  }, [defaultSide]);

  const amountNum = parseFloat(amount) || 0;
  const isMarketClosed = new Date() > new Date(market.closesAt);
  const canTrade = amountNum > 0 && amountNum <= wallet.points && market.status === 'OPEN' && !isMarketClosed;

  const calc = calculateTrade(market, side, amountNum);

  const handleTrade = () => {
    if (!canTrade) return;

    // Update wallet
    subtractPoints(amountNum);

    // Update market stakes
    const updates: Partial<Market> = {
      poolUSD: market.poolUSD + amountNum,
    };

    if (market.type === 'YES_NO') {
      if (side === 'YES') {
        updates.yesStake = (market.yesStake || 0) + amountNum;
      } else {
        updates.noStake = (market.noStake || 0) + amountNum;
      }
    } else {
      if (side === 'A') {
        updates.aStake = (market.aStake || 0) + amountNum;
      } else {
        updates.bStake = (market.bStake || 0) + amountNum;
      }
    }

    updateMarket(market.id, updates);

    // Add trade
    addTrade({
      id: `${market.id}-${Date.now()}-${Math.random()}`,
      marketId: market.id,
      wallet: wallet.address,
      side,
      amountPts: amountNum,
      price: calc.price,
      shares: calc.shares,
      ts: new Date().toISOString(),
    });

    toast({
      title: 'Trade executed',
      description: `Bought ${calc.shares.toFixed(2)} shares of ${side}`,
    });

    setAmount('');
  };

  const sideLabel = market.outcomes.find((o) => o.key === side)?.label || side;
  const isBullish = side === 'YES' || side === 'A';

  // Calculate probabilities
  const yesStake = market.yesStake || 0;
  const noStake = market.noStake || 0;
  const totalStake = yesStake + noStake;
  const yesPercent = totalStake > 0 ? (yesStake / totalStake) * 100 : 50;
  const noPercent = totalStake > 0 ? (noStake / totalStake) * 100 : 50;

  return (
    <Card className="sticky top-20 glass-card border-border/50 p-6 space-y-6">
      {/* Buy/Sell Tabs */}
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50">
          <TabsTrigger value="buy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Probability Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>{yesPercent.toFixed(0)}%</span>
          <span>{noPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden flex">
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

      <Separator />

      {/* Side Selection */}
      <div className="space-y-3">
        <Label>Pick a side</Label>
        <ToggleGroup
          type="single"
          value={side}
          onValueChange={(val) => {
            if (val) setSide(val as OutcomeKey);
          }}
          className="grid grid-cols-2 gap-3"
        >
          {market.outcomes.map((outcome) => {
            const isYes = outcome.key === 'YES' || outcome.key === 'A';
            const isSelected = side === outcome.key;
            
            return (
              <ToggleGroupItem
                key={outcome.key}
                value={outcome.key}
                className={cn(
                  'h-14 font-bold text-base transition-all border-2',
                  isSelected && isYes && 'bg-primary/20 text-primary border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
                  isSelected && !isYes && 'bg-secondary/20 text-secondary border-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.3)]',
                  !isSelected && 'border-border/50 hover:border-border bg-card/50 hover:bg-card'
                )}
              >
                {outcome.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Amount (Points)</Label>
          <span className="text-sm text-muted-foreground">
            Available: {formatPoints(wallet.points)}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="glass-card"
          />
          <Button
            variant="outline"
            onClick={() => setAmount(wallet.points.toString())}
          >
            Max
          </Button>
        </div>
      </div>

      <Separator />

      {/* Calculations */}
      {amountNum > 0 && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">{formatPercent(calc.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shares</span>
            <span className="font-medium">{calc.shares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg. price</span>
            <span className="font-medium">{formatPercent(calc.avgPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max profit</span>
            <span className="font-medium text-primary">
              +{formatPoints(calc.maxProfit)} pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max payout</span>
            <span className="font-medium">{formatPoints(calc.maxPayout)} pts</span>
          </div>
        </div>
      )}

      {/* Trade Button */}
      <Button
        size="lg"
        disabled={!canTrade}
        onClick={handleTrade}
        className={cn(
          'w-full gap-2 font-semibold',
          isBullish
            ? 'bg-primary hover:bg-primary/90 glow-yes'
            : 'bg-secondary hover:bg-secondary/90 glow-no'
        )}
      >
        {isBullish ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        )}
        Buy {sideLabel}
      </Button>

      {wallet.points === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          You need points to trade. <a href="/earn" className="text-primary hover:underline">Claim 10k points</a> from the faucet!
        </p>
      )}

      {isMarketClosed && market.status === 'OPEN' && (
        <p className="text-center text-sm text-muted-foreground">
          Market has closed for trading
        </p>
      )}

      {market.status !== 'OPEN' && (
        <p className="text-center text-sm text-muted-foreground">
          Market is {market.status.toLowerCase()}
        </p>
      )}

      {/* Beta Notice */}
      <div className="pt-4 border-t">
        <p className="text-xs text-center text-muted-foreground">
          ⚠️ Beta Testing Phase - Trade at your own risk
        </p>
      </div>
    </Card>
  );
};
