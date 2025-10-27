import { useState } from "react";
import { useTickerTokens } from "@/hooks/useTickerTokens";
import { Skeleton } from "@/components/ui/skeleton";

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

interface TokenTickerProps {
  maxItems?: number;
  pollingIntervalMs?: number;
  scrollSpeedPxPerSec?: number;
  minItemsToClone?: number;
  sortByLiquidity?: boolean;
}

const TokenTicker = ({
  maxItems = 200,
  pollingIntervalMs = 45000,
  scrollSpeedPxPerSec = 80,
  minItemsToClone = 4,
  sortByLiquidity = true,
}: TokenTickerProps) => {
  const [isPaused, setIsPaused] = useState(false);
  
  const { data: allTokens, isLoading, isError } = useTickerTokens({
    maxItems,
    pollingIntervalMs,
    sortByLiquidity,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="border-b border-border bg-background/95 backdrop-blur-sm overflow-hidden py-2">
        <div className="flex items-center gap-6 px-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error or empty state
  if (isError || !allTokens || allTokens.length === 0) {
    return (
      <div className="border-b border-border bg-background/95 backdrop-blur-sm overflow-hidden py-2 px-6">
        <p className="text-sm text-muted-foreground">
          {isError ? "Failed to load ticker data" : "No tokens available"}
        </p>
      </div>
    );
  }

  // Determine if we need to clone items for seamless loop
  const shouldClone = allTokens.length < minItemsToClone ? 3 : 2;
  const displayTokens = Array.from({ length: shouldClone }, () => allTokens).flat();

  // Calculate animation duration based on scroll speed
  const itemWidth = 280; // approximate width per item in px
  const totalWidth = allTokens.length * itemWidth;
  const duration = totalWidth / scrollSpeedPxPerSec;

  return (
    <div 
      className="border-b border-border bg-background/95 backdrop-blur-sm overflow-hidden"
      aria-label="Live cryptocurrency ticker"
    >
      <div 
        className="ticker-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="ticker-content"
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {displayTokens.map((token, idx) => {
            const priceChange = token.priceChange?.h24 || 0;
            const isPositive = priceChange >= 0;
            
            return (
              <div
                key={`${token.pairAddress}-${idx}`}
                className="ticker-item flex items-center gap-2 px-6 py-2 whitespace-nowrap"
              >
                {token.info?.imageUrl && (
                  <img
                    src={token.info.imageUrl}
                    alt={token.baseToken.symbol}
                    className="h-5 w-5 rounded-full flex-shrink-0"
                    loading="lazy"
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
