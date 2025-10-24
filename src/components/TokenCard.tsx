import { ArrowUp, ArrowDown, ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import VoteButton from "./VoteButton";
import { FaTwitter, FaTelegram, FaDiscord } from "react-icons/fa";
import { Link } from "react-router-dom";

interface TokenCardProps {
  name: string;
  symbol: string;
  logo?: string;
  priceUsd: string;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  pairAddress: string;
  baseTokenAddress: string;
  socials?: { type: string; url: string }[];
  website?: string;
}

const TokenCard = ({
  name,
  symbol,
  logo,
  priceUsd,
  priceChange24h,
  volume24h,
  liquidity,
  pairAddress,
  baseTokenAddress,
  socials,
  website,
}: TokenCardProps) => {
  const isPositive = priceChange24h >= 0;
  
  const getSocialIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('twitter') || lowerType === 'x') {
      return <FaTwitter className="h-4 w-4" />;
    }
    if (lowerType.includes('telegram')) {
      return <FaTelegram className="h-4 w-4" />;
    }
    if (lowerType.includes('discord')) {
      return <FaDiscord className="h-4 w-4" />;
    }
    return null;
  };
  
  const getSocialLabel = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('twitter') || lowerType === 'x') return 'Twitter';
    if (lowerType.includes('telegram')) return 'Telegram';
    if (lowerType.includes('discord')) return 'Discord';
    return type;
  };
  
  return (
    <div className="group relative bg-gradient-card rounded-xl border border-border/50 p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <Link to={`/token/${baseTokenAddress}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {logo ? (
              <img 
                src={logo} 
                alt={symbol}
                className="w-12 h-12 rounded-full border border-border/30"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/48/6366f1/ffffff?text=${symbol.charAt(0)}`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                {symbol.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-sm text-muted-foreground">{symbol}</p>
            </div>
          </div>
        <div className="flex items-center gap-2">
          <VoteButton tokenAddress={baseTokenAddress} />
          <a 
            href={`https://dexscreener.com/pulsechain/${pairAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </a>
        </div>
      </div>
      </Link>

      {/* Social Media Links */}
      {(socials && socials.length > 0) || website ? (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-xs"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
          {socials?.map((social, index) => {
            const icon = getSocialIcon(social.type);
            if (!icon) return null;
            
            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-xs"
              >
                {icon}
                {getSocialLabel(social.type)}
              </a>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="font-semibold">${parseFloat(priceUsd).toFixed(8)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">24h Change</span>
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className={isPositive ? "bg-accent/20 text-accent border-accent/30" : ""}
          >
            {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {Math.abs(priceChange24h).toFixed(2)}%
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Volume 24h</span>
          <span className="font-medium">${volume24h.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Liquidity</span>
          <span className="font-medium">${liquidity.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
