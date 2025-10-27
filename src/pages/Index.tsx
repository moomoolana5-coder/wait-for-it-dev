import Navbar from "@/components/Navbar";
import TokenListings from "@/components/TokenListings";
import TrendingCoins from "@/components/TrendingCoins";
import PromotedTable from "@/components/PromotedTable";
import FeaturedTokens from "@/components/FeaturedTokens";
import TopTokens from "@/components/TopTokens";
import TrendingTables from "@/components/TrendingTables";
import Footer from "@/components/Footer";
import TokenTicker from "@/components/TokenTicker";
import TabNavigation from "@/components/TabNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TokenTicker />
      
      <section className="container mx-auto px-4 py-12 space-y-16">
        <TrendingTables />
        <TabNavigation />
        <div id="trending">
          <FeaturedTokens />
        </div>
        <div id="top-tokens">
          <TopTokens />
        </div>
        <div id="gainers">
          <TrendingCoins />
        </div>
        <TokenListings />
      </section>

      <PromotedTable />
      <Footer />
    </div>
  );
};

export default Index;
