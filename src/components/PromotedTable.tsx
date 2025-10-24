import { ArrowUp, ArrowDown, Loader2, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePulseChainTokens } from "@/hooks/useDexScreener";

const PromotedTable = () => {
  const { data: tokens, isLoading } = usePulseChainTokens();

  // Get top tokens by liquidity
  const promotedTokens = tokens
    ?.filter(token => token.liquidity.usd > 10000)
    .sort((a, b) => b.liquidity.usd - a.liquidity.usd)
    .slice(0, 20) || [];

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Top Tokens</h2>
          <p className="text-muted-foreground mt-1">Highest liquidity tokens on PulseChain</p>
        </div>
        <a href="#promote" className="text-accent hover:text-accent/80 transition-colors font-semibold flex items-center gap-2">
          PROMOTE YOUR COIN 
          <ArrowUp className="h-4 w-4" />
        </a>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">RANK</TableHead>
                <TableHead className="text-muted-foreground font-semibold">TOKEN</TableHead>
                <TableHead className="text-muted-foreground font-semibold">DEX</TableHead>
                <TableHead className="text-muted-foreground font-semibold">24H CHANGE</TableHead>
                <TableHead className="text-muted-foreground font-semibold">LIQUIDITY</TableHead>
                <TableHead className="text-muted-foreground font-semibold">PRICE</TableHead>
                <TableHead className="text-muted-foreground font-semibold">VOLUME 24H</TableHead>
                <TableHead className="text-muted-foreground font-semibold">LAUNCHED</TableHead>
                <TableHead className="text-muted-foreground font-semibold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotedTokens.map((token, index) => (
                <TableRow 
                  key={token.pairAddress}
                  className="border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {token.info?.imageUrl ? (
                        <img 
                          src={token.info.imageUrl} 
                          alt={token.baseToken.symbol}
                          className="w-10 h-10 rounded-full border border-border/30"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/40/6366f1/ffffff?text=${token.baseToken.symbol.charAt(0)}`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                          {token.baseToken.symbol.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{token.baseToken.name}</div>
                        <div className="text-sm text-muted-foreground">{token.baseToken.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                      {token.dexId.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 font-semibold ${token.priceChange.h24 >= 0 ? 'text-accent' : 'text-destructive'}`}>
                      {token.priceChange.h24 >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {Math.abs(token.priceChange.h24).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">${token.liquidity.usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="font-mono">${parseFloat(token.priceUsd).toFixed(8)}</TableCell>
                  <TableCell className="font-semibold">${token.volume.h24.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatTimeAgo(token.pairCreatedAt)}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://dexscreener.com/pulsechain/${token.pairAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};

export default PromotedTable;
