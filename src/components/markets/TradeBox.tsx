import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Market, OutcomeKey } from '@/types/markets';
import { useMarketsStore } from '@/stores/marketsStore';
import { useWalletStore } from '@/stores/walletStore';
import { computePrice, calculateTrade } from '@/lib/amm';
import { toast } from 'sonner';

interface TradeBoxProps {
  market: Market;
  initialSide?: OutcomeKey;
}

export function TradeBox({ market, initialSide }: TradeBoxProps) {
  const [side, setSide] = useState<OutcomeKey>(initialSide || market.outcomes[0].key);
  const [amount, setAmount] = useState('');
  const { executeTrade } = useMarketsStore();
  const { wallets, currentWallet } = useWalletStore();

  const wallet = wallets.find((w) => w.address === currentWallet);
  const availablePoints = wallet?.points || 0;

  const amountNum = parseFloat(amount) || 0;
  const price = computePrice(
    side,
    market.yesStake || 0,
    market.noStake || 0,
    market.aStake || 0,
    market.bStake || 0,
    market.type
  );

  const trade = calculateTrade(amountNum, price);

  const handleTrade = () => {
    if (amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > availablePoints) {
      toast.error('Insufficient points');
      return;
    }

    if (market.status !== 'OPEN') {
      toast.error('Market is not open');
      return;
    }

    executeTrade(market.id, side, amountNum, currentWallet);
    toast.success(`Bought ${trade.shares.toFixed(2)} shares of ${side}`);
    setAmount('');
  };

  const isDisabled = market.status !== 'OPEN' || amountNum <= 0 || amountNum > availablePoints;

  return (
    <Card className="p-6 space-y-4 bg-card/70 backdrop-blur-sm rounded-2xl">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Pick a side</Label>
        <ToggleGroup
          type="single"
          value={side}
          onValueChange={(v) => v && setSide(v as OutcomeKey)}
          className="grid grid-cols-2 gap-2"
        >
          {market.outcomes.map((outcome, idx) => (
            <ToggleGroupItem
              key={outcome.key}
              value={outcome.key}
              className={`py-3 ${
                idx === 0
                  ? 'data-[state=on]:bg-teal-600 data-[state=on]:text-white'
                  : 'data-[state=on]:bg-pink-600 data-[state=on]:text-white'
              }`}
            >
              {outcome.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="amount">Amount (Points)</Label>
          <span className="text-sm text-muted-foreground">
            Available: {availablePoints.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => setAmount(availablePoints.toString())}
          >
            Max
          </Button>
        </div>
      </div>

      {amountNum > 0 && (
        <div className="space-y-2 text-sm border-t border-border/50 pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">${price.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shares</span>
            <span className="font-medium">{trade.shares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg. price</span>
            <span className="font-medium">${trade.avgPrice.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span>Max profit</span>
            <span className="font-semibold">{trade.maxProfit.toFixed(0)} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max payout</span>
            <span className="font-medium">{trade.maxPayout.toFixed(2)} pts</span>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleTrade}
        disabled={isDisabled}
      >
        Buy {side}
      </Button>
    </Card>
  );
}
