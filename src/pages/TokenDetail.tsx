import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTokenByAddress } from "@/hooks/useDexScreener";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TokenConverter from "@/components/TokenConverter";
import VoteButton from "@/components/VoteButton";
import TokenVoteSection from "@/components/TokenVoteSection";
import TokenPriceHistory from "@/components/TokenPriceHistory";
import { FaTwitter, FaTelegram, FaGlobe, FaDiscord } from "react-icons/fa";
import { useState } from "react";
import { toast } from "sonner";

const TokenDetail = () => {
  const { address } = useParams<{ address: string }>();
  const { data: pairs, isLoading } = useTokenByAddress(address || "");
  const [copied, setCopied] = useState(false);

  const formatLargeNumber = (num: number | undefined) => {
    if (!num || num === 0) return 'N/A';
    
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Contract address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  const mainPair = pairs?.[0];
  
  if (!mainPair) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <p className="text-center text-muted-foreground">Token not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const getSocialIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('twitter') || lowerType === 'x') return <FaTwitter className="h-4 w-4" />;
    if (lowerType.includes('telegram')) return <FaTelegram className="h-4 w-4" />;
    if (lowerType.includes('discord')) return <FaDiscord className="h-4 w-4" />;
    return <FaGlobe className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr_350px] gap-6 items-start">
          {/* Left Column - Token Details */}
          <div className="space-y-6 order-2 xl:order-1">
            {/* Token Header with Complete Info */}
            <Card className="overflow-hidden">
              <CardContent className="p-3">
                {/* Compact Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                  <img 
                    src={mainPair.info?.imageUrl || "/placeholder.svg"} 
                    alt={mainPair.baseToken.name}
                    className="w-12 h-12 rounded-full border border-border"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-base font-bold truncate">{mainPair.baseToken.name}</h1>
                    <p className="text-xs text-muted-foreground">{mainPair.baseToken.symbol}</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mb-3 pb-3 border-b">
                  <p className="text-xl font-bold mb-1">${parseFloat(mainPair.priceUsd).toFixed(8)}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={mainPair.priceChange.h24 >= 0 ? "default" : "destructive"} className="text-xs">
                      {mainPair.priceChange.h24 >= 0 ? "+" : ""}{mainPair.priceChange.h24.toFixed(2)}% (24h)
                    </Badge>
                    <VoteButton tokenAddress={mainPair.baseToken.address} />
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b">
                  {mainPair.info?.websites?.[0] && (
                    <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                      <a
                        href={mainPair.info.websites[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {mainPair.info?.socials?.map((social, idx) => (
                    <Button key={idx} variant="ghost" size="sm" className="h-7 px-2" asChild>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon(social.type)}
                      </a>
                    </Button>
                  ))}
                </div>

                {/* Compact Stats Grid */}
                <div className="space-y-0 mb-3 pb-3 border-b">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Market Cap</p>
                      <p className="text-xs font-semibold">{formatLargeNumber(mainPair.marketCap)}</p>
                    </div>
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Volume 24h</p>
                      <p className="text-xs font-semibold">{formatLargeNumber(mainPair.volume.h24)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Liquidity</p>
                      <p className="text-xs font-semibold">{formatLargeNumber(mainPair.liquidity.usd)}</p>
                    </div>
                    <div className="bg-muted/50 rounded p-1.5">
                      <p className="text-[10px] text-muted-foreground mb-0.5">FDV</p>
                      <p className="text-xs font-semibold">{formatLargeNumber(mainPair.fdv)}</p>
                    </div>
                  </div>
                </div>

                {/* Trading Activity */}
                <div className="space-y-0 mb-3 pb-3 border-b">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[10px] text-muted-foreground">Buys (24h)</span>
                    <span className="text-xs font-semibold text-green-500">{mainPair.txns.h24.buys}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[10px] text-muted-foreground">Sells (24h)</span>
                    <span className="text-xs font-semibold text-red-500">{mainPair.txns.h24.sells}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[10px] text-muted-foreground">DEX</span>
                    <span className="text-xs font-semibold capitalize">{mainPair.dexId}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[10px] text-muted-foreground">Created</span>
                    <span className="text-xs font-semibold">
                      {new Date(mainPair.pairCreatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                  
                {/* Contract Section */}
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Contract</p>
                  <code className="text-[10px] bg-muted px-1.5 py-1 rounded block break-all mb-1.5">
                      {mainPair.baseToken.address}
                    </code>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="flex-1 h-7 text-[10px]"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 h-7 text-[10px]"
                    >
                      <a
                        href={`https://scan.pulsechain.com/address/${mainPair.baseToken.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 h-7 text-[10px]"
                    >
                      <a
                        href={mainPair.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Price Chart */}
          <div className="space-y-6 order-1 xl:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[480px] rounded-lg overflow-hidden">
                  <iframe
                    src={`https://dexscreener.com/pulsechain/${mainPair.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                    className="w-full h-full border-0"
                    title="DexScreener Chart"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Converter and Price History */}
          <div className="space-y-[60px] order-3">
            <TokenConverter 
              tokenSymbol={mainPair.baseToken.symbol}
              tokenName={mainPair.baseToken.name}
              priceUsd={parseFloat(mainPair.priceUsd)}
            />
            <TokenPriceHistory
              currentPrice={parseFloat(mainPair.priceUsd)}
              priceChange24h={mainPair.priceChange.h24}
              priceChange6h={mainPair.priceChange.h6}
              pairCreatedAt={mainPair.pairCreatedAt}
            />
          </div>
        </div>

        {/* Vote Section - Full Width Below */}
        <div className="mt-12">
          <TokenVoteSection tokenAddress={mainPair.baseToken.address} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TokenDetail;
