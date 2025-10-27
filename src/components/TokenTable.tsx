import { DexPair } from "@/hooks/useAllPlatformTokens";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import VoteButton from "./VoteButton";
import { VerifiedBadge } from "./VerifiedBadge";
import { useTokenVerification } from "@/hooks/useTokenVerification";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TokenTableProps {
  tokens: DexPair[];
  isLoading?: boolean;
}

const TokenTable = ({ tokens, isLoading }: TokenTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tokens found
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (!Number.isFinite(num)) return '—';
    if (num < 0.000001) return num.toExponential(2);
    if (num < 0.01) return `$${num.toFixed(6)}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Token</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="text-right">24h Volume</TableHead>
            <TableHead className="text-right">Liquidity</TableHead>
            <TableHead className="text-center">Vote</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token, index) => (
            <TokenRow key={token.pairAddress} token={token} index={index} formatNumber={formatNumber} formatPrice={formatPrice} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const TokenRow = ({ token, index, formatNumber, formatPrice }: { 
  token: DexPair; 
  index: number; 
  formatNumber: (num: number) => string;
  formatPrice: (price: string | number) => string;
}) => {
  const { data: isVerified } = useTokenVerification(token.baseToken.address);
  const priceChange = token.priceChange?.h24 || 0;
  const isPositive = priceChange >= 0;
  
  return (
    <TableRow className="border-border hover:bg-muted/50">
      <TableCell className="font-medium text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell>
        <Link
          to={`/token/${token.baseToken.address}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {token.info?.imageUrl ? (
            <img
              src={token.info.imageUrl}
              alt={token.baseToken.symbol}
              className="h-8 w-8 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-bold">
                {token.baseToken.symbol.slice(0, 2)}
              </span>
            </div>
          )}
          <div>
            <div className="font-semibold flex items-center gap-2">
              {token.baseToken.symbol}
              {isVerified && <VerifiedBadge className="w-4 h-4" />}
            </div>
            <div className="text-xs text-muted-foreground">
              {token.baseToken.name}
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono">
        {formatPrice(token.priceUsd)}
      </TableCell>
      <TableCell className="text-right">
        <div
          className={`flex items-center justify-end gap-1 font-medium ${
            isPositive ? 'text-accent' : 'text-destructive'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(priceChange).toFixed(2)}%
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatNumber(token.volume.h24)}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatNumber(token.liquidity.usd)}
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <VoteButton tokenAddress={token.baseToken.address} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TokenTable;
