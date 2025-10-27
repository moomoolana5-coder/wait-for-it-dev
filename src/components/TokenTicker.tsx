import { useTickerTokens } from "@/hooks/useTickerTokens";

// Helpers to format numbers similar to Dexscreener
const formatCurrencyShort = (num?: number) => {
  if (!num || isNaN(num)) return "$0";
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (priceUsd?: string) => {
  const n = Number(priceUsd);
  if (!isFinite(n) || n <= 0) return "$0.00";
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(8)}`;
};

const TokenTicker = () => {
  const { data: allTokens } = useTickerTokens();

  if (!allTokens || allTokens.length === 0) return null;

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm overflow-hidden">
      <div className="ticker-container">
        <div className="ticker-content">
          {/* Duplicate tokens for seamless loop */}
          {[...allTokens, ...allTokens].map((token, idx) => {
            const priceChange = token.priceChange?.h24 || 0;
            const isPositive = priceChange >= 0;
            
            return (
              <div
                key={`${token.baseToken.address}-${idx}`}
                className="ticker-item flex items-center gap-2 px-6 py-2 whitespace-nowrap"
              >
                {token.info?.imageUrl && (
                  <img
                    src={token.info.imageUrl}
                    alt={token.baseToken.symbol}
                    className="h-5 w-5 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="font-semibold text-foreground">
                  {token.baseToken.symbol}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(token.priceUsd)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Vol: {formatCurrencyShort(token.volume?.h24 || 0)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isPositive ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {isPositive ? '↗' : '↘'} {Number.isFinite(priceChange) ? Math.abs(priceChange).toFixed(2) : '0.00'}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TokenTicker;
