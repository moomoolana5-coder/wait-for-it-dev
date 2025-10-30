import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Coins, DollarSign, Plus } from 'lucide-react';
import { useWalletStore } from '@/stores/walletStore';
import { useNavigate } from 'react-router-dom';

export function MarketsHeader() {
  const { wallets, currentWallet } = useWalletStore();
  const wallet = wallets.find((w) => w.address === currentWallet);
  const navigate = useNavigate();

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Giga Markets
            </h1>
            <Badge variant="secondary" className="text-xs">
              BETA TEST
            </Badge>
          </div>

          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                className="pl-10 rounded-xl bg-background/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="gap-2 px-4 py-2 bg-primary/20">
              <Coins className="w-4 h-4" />
              {wallet?.points.toLocaleString() || 0} Points
            </Badge>

            <Badge className="gap-2 px-4 py-2 bg-muted" variant="secondary">
              <DollarSign className="w-4 h-4" />
              $0 USDC
            </Badge>

            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Deposit
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/auth')}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xs font-bold">
                {currentWallet[0].toUpperCase()}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
