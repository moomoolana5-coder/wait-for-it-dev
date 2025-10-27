import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTokenByAddress } from "@/hooks/useDexScreener";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TokenConverter from "@/components/TokenConverter";
import VoteButton from "@/components/VoteButton";
import TokenPriceHistory from "@/components/TokenPriceHistory";
import { FaTwitter, FaTelegram, FaGlobe, FaDiscord } from "react-icons/fa";

const TokenDetail = () => {
  const { address } = useParams<{ address: string }>();
  const { data: pairs, isLoading } = useTokenByAddress(address || "");

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
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="mb-6">
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

            {/* Main Info */}
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img 
                    src={mainPair.info?.imageUrl || "/placeholder.svg"} 
                    alt={mainPair.baseToken.name}
                    className="w-16 h-16 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-3xl">{mainPair.baseToken.name}</CardTitle>
                        <p className="text-muted-foreground">{mainPair.baseToken.symbol}</p>
                      </div>
                      <VoteButton tokenAddress={mainPair.baseToken.address} />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mainPair.info?.socials?.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {getSocialIcon(social.type)}
                        </a>
                      ))}
                      {mainPair.info?.websites?.[0] && (
                        <a
                          href={mainPair.info.websites[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <FaGlobe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold">${parseFloat(mainPair.priceUsd).toFixed(8)}</p>
                    <Badge variant={mainPair.priceChange.h24 >= 0 ? "default" : "destructive"} className="mt-2">
                      {mainPair.priceChange.h24 >= 0 ? "+" : ""}{mainPair.priceChange.h24.toFixed(2)}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="font-semibold">${mainPair.volume.h24.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Liquidity</p>
                      <p className="font-semibold">${mainPair.liquidity.usd.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Buys</p>
                      <p className="font-semibold text-green-500">{mainPair.txns.h24.buys}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Sells</p>
                      <p className="font-semibold text-red-500">{mainPair.txns.h24.sells}</p>
                    </div>
                  </div>

                  {mainPair.marketCap && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="font-semibold text-lg">${mainPair.marketCap.toLocaleString()}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                        {mainPair.baseToken.address}
                      </code>
                      <a
                        href={mainPair.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
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
