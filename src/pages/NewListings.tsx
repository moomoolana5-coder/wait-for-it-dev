import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, Loader2, ChevronLeft } from "lucide-react";
import { useNewListings } from "@/hooks/useNewListings";
import TokenCard from "@/components/TokenCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NewListings = () => {
  const { data: tokens, isLoading } = useNewListings();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">New Listings</h1>
              <p className="text-muted-foreground">Recently launched tokens on gigacock</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens?.map((token) => (
              <TokenCard
                key={token.pairAddress}
                name={token.baseToken.name}
                symbol={token.baseToken.symbol}
                logo={token.info?.imageUrl}
                priceUsd={token.priceUsd}
                priceChange24h={token.priceChange.h24}
                volume24h={token.volume.h24}
                liquidity={token.liquidity.usd}
                pairAddress={token.pairAddress}
                baseTokenAddress={token.baseToken.address}
                socials={token.info?.socials}
                website={token.info?.websites?.[0]?.url}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default NewListings;
