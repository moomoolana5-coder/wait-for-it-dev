import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface TokenTableProps {
  tokens: Array<{
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    info?: {
      imageUrl?: string;
    };
    priceUsd?: string;
    priceChange?: {
      h24?: number;
    };
    volume?: {
      h24?: number;
    };
    liquidity?: {
      usd?: number;
    };
    pairAddress: string;
    pairCreatedAt?: number;
    chainId?: string;
  }>;
  showRank?: boolean;
}

const TokenTable = ({ tokens, showRank = true }: TokenTableProps) => {
  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return "$0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(num < 1 ? 8 : 2)}`;
  };

  const formatLaunched = (timestamp: number | undefined) => {
    if (!timestamp) return "Unknown";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {showRank && (
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                  Rank
                </th>
              )}
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                Token
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                DEX
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                24H Change
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                Liquidity
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                Price
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                Volume 24H
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase">
                Launched
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => {
              const priceChange = token.priceChange?.h24 ?? 0;
              const isPositive = priceChange >= 0;

              return (
                <tr
                  key={`${token.baseToken.address}-${token.pairAddress}`}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  {showRank && (
                    <td className="py-4 px-4">
                      <span className="text-lg font-semibold text-foreground">{index + 1}</span>
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <Link
                      to={`/token/${token.baseToken.address}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={token.info?.imageUrl || "/placeholder.svg"}
                        alt={token.baseToken.symbol}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div>
                        <div className="font-semibold text-foreground">{token.baseToken.name}</div>
                        <div className="text-sm text-muted-foreground">{token.baseToken.symbol}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      PULSEX
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`flex items-center gap-1 font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-foreground font-medium">
                      {formatCurrency(token.liquidity?.usd)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-foreground font-medium">
                      {formatCurrency(token.priceUsd)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-foreground font-medium">
                      {formatCurrency(token.volume?.h24)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-muted-foreground text-sm">
                      {formatLaunched(token.pairCreatedAt)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      to={`/token/${token.baseToken.address}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenTable;
