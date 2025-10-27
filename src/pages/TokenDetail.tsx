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
import TokenPriceHistory from "@/components/TokenPriceHistory";
import { FaTwitter, FaTelegram, FaGlobe, FaDiscord } from "react-icons/fa";
import { useState } from "react";
import { toast } from "sonner";

const TokenDetail = () => {
  const { address } = useParams<{ address: string }>();
  const { data: pairs, isLoading } = useTokenByAddress(address || "");
  const [copied, setCopied] = useState(false);

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
            <Card>
              <CardContent className="pt-4">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-4 pb-4 border-b">
                  <img 
                    src={mainPair.info?.imageUrl || "/placeholder.svg"} 
                    alt={mainPair.baseToken.name}
                    className="w-16 h-16 rounded-full border-2 border-border mb-2"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <h1 className="text-xl font-bold mb-1">{mainPair.baseToken.name}</h1>
                  <p className="text-sm text-muted-foreground mb-2">{mainPair.baseToken.symbol}</p>
                  
                  {/* Price Display */}
                  <div className="mb-2">
                    <p className="text-2xl font-bold mb-1">${parseFloat(mainPair.priceUsd).toFixed(8)}</p>
                    <Badge variant={mainPair.priceChange.h24 >= 0 ? "default" : "destructive"} className="text-xs">
                      {mainPair.priceChange.h24 >= 0 ? "+" : ""}{mainPair.priceChange.h24.toFixed(2)}% (24h)
                    </Badge>
                  </div>

                  <VoteButton tokenAddress={mainPair.baseToken.address} />
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-4 pb-4 border-b">
                  {mainPair.info?.websites?.[0] && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={mainPair.info.websites[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe className="h-3 w-3 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  {mainPair.info?.socials?.map((social, idx) => (
                    <Button key={idx} variant="outline" size="sm" asChild>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon(social.type)}
                        <span className="ml-2 capitalize">{social.type}</span>
                      </a>
                    </Button>
                  ))}
                </div>

                {/* Token Details Table */}
                <div className="space-y-0">
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">Market Cap</span>
                    <span className="text-xs font-semibold text-right">${mainPair.marketCap?.toLocaleString() || 'N/A'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">FDV</span>
                    <span className="text-xs font-semibold text-right">${mainPair.fdv?.toLocaleString() || 'N/A'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">24h Volume</span>
                    <span className="text-xs font-semibold text-right">${mainPair.volume.h24.toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">Liquidity</span>
                    <span className="text-xs font-semibold text-right">${mainPair.liquidity.usd.toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">24h Buys</span>
                    <span className="text-xs font-semibold text-right text-green-500">{mainPair.txns.h24.buys}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">24h Sells</span>
                    <span className="text-xs font-semibold text-right text-red-500">{mainPair.txns.h24.sells}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">DEX</span>
                    <span className="text-xs font-semibold text-right capitalize">{mainPair.dexId}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-xs text-muted-foreground">Pair Created</span>
                    <span className="text-xs font-semibold text-right">
                      {new Date(mainPair.pairCreatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Contract Address</p>
                    <code className="text-xs bg-muted px-2 py-1.5 rounded block break-all mb-1.5">
                      {mainPair.baseToken.address}
                    </code>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAddress}
                        className="w-full"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={`https://scan.pulsechain.com/address/${mainPair.baseToken.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Explorer
                        </a>
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full mt-1.5"
                    >
                      <a
                        href={mainPair.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View on DexScreener
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price History moved here */}
            <TokenPriceHistory
              currentPrice={parseFloat(mainPair.priceUsd)}
              priceChange24h={mainPair.priceChange.h24}
              priceChange6h={mainPair.priceChange.h6}
              pairCreatedAt={mainPair.pairCreatedAt}
            />
          </div>

          {/* Center Column - Price Chart */}
          <div className="space-y-6 order-1 xl:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[600px] rounded-lg overflow-hidden">
                  <iframe
                    src={`https://dexscreener.com/pulsechain/${mainPair.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                    className="w-full h-full border-0"
                    title="DexScreener Chart"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Converter Only */}
          <div className="space-y-6 order-3">
            <TokenConverter 
              tokenSymbol={mainPair.baseToken.symbol}
              tokenName={mainPair.baseToken.name}
              priceUsd={parseFloat(mainPair.priceUsd)}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TokenDetail;
