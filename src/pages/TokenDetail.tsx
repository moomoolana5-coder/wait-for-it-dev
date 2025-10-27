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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Chart & Token Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={mainPair.info?.imageUrl || "/placeholder.svg"} 
                    alt={mainPair.baseToken.name}
                    className="w-20 h-20 rounded-full border-4 border-border"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h1 className="text-4xl font-bold mb-1">{mainPair.baseToken.name}</h1>
                        <p className="text-xl text-muted-foreground">{mainPair.baseToken.symbol}</p>
                      </div>
                      <VoteButton tokenAddress={mainPair.baseToken.address} />
                    </div>
                    
                    {/* Social Links */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {mainPair.info?.websites?.[0] && (
                        <a
                          href={mainPair.info.websites[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <FaGlobe className="h-4 w-4" />
                          <span className="text-sm">Website</span>
                        </a>
                      )}
                      {mainPair.info?.socials?.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          {getSocialIcon(social.type)}
                          <span className="text-sm capitalize">{social.type}</span>
                        </a>
                      ))}
                    </div>

                    {/* Price Info */}
                    <div className="space-y-2">
                      <p className="text-5xl font-bold">${parseFloat(mainPair.priceUsd).toFixed(8)}</p>
                      <Badge variant={mainPair.priceChange.h24 >= 0 ? "default" : "destructive"} className="text-base px-3 py-1">
                        {mainPair.priceChange.h24 >= 0 ? "+" : ""}{mainPair.priceChange.h24.toFixed(2)}% (24h)
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-xl font-bold">${mainPair.marketCap?.toLocaleString() || 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                  <p className="text-xl font-bold">${mainPair.volume.h24.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Liquidity</p>
                  <p className="text-xl font-bold">${mainPair.liquidity.usd.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">FDV</p>
                  <p className="text-xl font-bold">${mainPair.fdv?.toLocaleString() || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Trading Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Trading Activity (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Buys</p>
                    <p className="text-3xl font-bold text-green-500">{mainPair.txns.h24.buys}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Sells</p>
                    <p className="text-3xl font-bold text-red-500">{mainPair.txns.h24.sells}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[500px] rounded-lg overflow-hidden">
                  <iframe
                    src={`https://dexscreener.com/pulsechain/${mainPair.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                    className="w-full h-full border-0"
                    title="DexScreener Chart"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Token Information */}
            <Card>
              <CardHeader>
                <CardTitle>Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 overflow-x-auto">
                      {mainPair.baseToken.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0"
                    >
                      <a
                        href={`https://scan.pulsechain.com/address/${mainPair.baseToken.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">DEX</p>
                    <p className="font-semibold capitalize">{mainPair.dexId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pair Address</p>
                    <a
                      href={mainPair.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold text-sm"
                    >
                      View on DexScreener
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pair Created</p>
                  <p className="font-semibold">
                    {new Date(mainPair.pairCreatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Converter & Price History */}
          <div className="lg:col-span-1 space-y-6">
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
