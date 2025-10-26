import Navbar from "@/components/Navbar";
import TokenListings from "@/components/TokenListings";
import TrendingCoins from "@/components/TrendingCoins";
import PromotedTable from "@/components/PromotedTable";
import FeaturedTokens from "@/components/FeaturedTokens";
import TopTokens from "@/components/TopTokens";
import TrendingTables from "@/components/TrendingTables";
import Footer from "@/components/Footer";
import MarketStats from "@/components/MarketStats";
import QuickStats from "@/components/QuickStats";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PulseChain Token Prices by Market Cap</h1>
          <p className="text-muted-foreground">
            Track the latest PulseChain token prices and market data in real-time
          </p>
        </div>

        <MarketStats />
        <QuickStats />
        
        <div className="space-y-16">
          <TrendingTables />
          <FeaturedTokens />
          <TopTokens />
          <TrendingCoins />
          <TokenListings />
        </div>
      </section>

      <PromotedTable />
      <Footer />
    </div>
  );
};

export default Index;
