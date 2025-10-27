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
            {/* Token Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <img 
                    src={mainPair.info?.imageUrl || "/placeholder.svg"} 
                    alt={mainPair.baseToken.name}
                    className="w-24 h-24 rounded-full border-4 border-border mb-4"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <h1 className="text-2xl font-bold mb-1">{mainPair.baseToken.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{mainPair.baseToken.symbol}</p>
                  <VoteButton tokenAddress={mainPair.baseToken.address} />
                </div>

                {/* Price Info */}
                <div className="text-center mb-4 pb-4 border-b">
                  <p className="text-3xl font-bold mb-2">${parseFloat(mainPair.priceUsd).toFixed(8)}</p>
                  <Badge variant={mainPair.priceChange.h24 >= 0 ? "default" : "destructive"} className="text-sm">
                    {mainPair.priceChange.h24 >= 0 ? "+" : ""}{mainPair.priceChange.h24.toFixed(2)}% (24h)
                  </Badge>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap justify-center gap-2">
                  {mainPair.info?.websites?.[0] && (
                    <a
                      href={mainPair.info.websites[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                    >
                      <FaGlobe className="h-3 w-3" />
                      <span>Website</span>
                    </a>
                  )}
                  {mainPair.info?.socials?.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                    >
                      {getSocialIcon(social.type)}
                      <span className="capitalize">{social.type}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-lg font-bold">${mainPair.marketCap?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                  <p className="text-lg font-bold">${mainPair.volume.h24.toLocaleString()}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">Liquidity</p>
                  <p className="text-lg font-bold">${mainPair.liquidity.usd.toLocaleString()}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">FDV</p>
                  <p className="text-lg font-bold">${mainPair.fdv?.toLocaleString() || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Trading Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trading (24h)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Buys</p>
                  <p className="text-2xl font-bold text-green-500">{mainPair.txns.h24.buys}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">Sells</p>
                  <p className="text-2xl font-bold text-red-500">{mainPair.txns.h24.sells}</p>
                </div>
              </CardContent>
            </Card>

            {/* Token Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Address</p>
                  <div className="flex flex-col gap-2">
                    <code className="text-xs bg-muted px-2 py-2 rounded break-all">
                      {mainPair.baseToken.address}
                    </code>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAddress}
                        className="flex-1 text-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 text-xs"
                      >
                        <a
                          href={`https://scan.pulsechain.com/address/${mainPair.baseToken.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Explorer
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">DEX</p>
                  <p className="font-semibold capitalize">{mainPair.dexId}</p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Pair</p>
                  <a
                    href={mainPair.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold text-sm flex items-center gap-1"
                  >
                    View on DexScreener
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="font-semibold text-sm">
                    {new Date(mainPair.pairCreatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
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

          {/* Right Column - Converter & Price History */}
          <div className="space-y-6 order-3">
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
      </div>

      <Footer />
    </div>
  );
};

export default TokenDetail;
