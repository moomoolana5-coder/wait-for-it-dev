import { useAllPlatformTokens } from "@/hooks/useAllPlatformTokens";
import { useEffect, useRef } from "react";

const TokenTicker = () => {
  const { data: allTokens } = useAllPlatformTokens();
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickerRef.current || !allTokens || allTokens.length === 0) return;

    const tokenCount = allTokens.length;
    const duration = Math.max(30, tokenCount * 2);

    tickerRef.current.style.animationDuration = `${duration}s`;
  }, [allTokens]);

  if (!allTokens || allTokens.length === 0) return null;

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm overflow-hidden">
      <div className="ticker-container">
        <div ref={tickerRef} className="ticker-content">
          {[...allTokens, ...allTokens, ...allTokens].map((token, idx) => {
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
                  ${Number(token.priceUsd).toFixed(6)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Vol: ${(token.volume.h24 / 1000).toFixed(2)}K
                </span>
                <span
                  className={`text-sm font-medium ${
                    isPositive ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {isPositive ? '↗' : '↘'} {Math.abs(priceChange).toFixed(2)}%
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
