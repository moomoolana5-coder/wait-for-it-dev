import Navbar from "@/components/Navbar";
import TokenListings from "@/components/TokenListings";
import TrendingCoins from "@/components/TrendingCoins";
import PromotedTable from "@/components/PromotedTable";
import FeaturedTokens from "@/components/FeaturedTokens";
import TopTokens from "@/components/TopTokens";
import TrendingTables from "@/components/TrendingTables";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-12 space-y-16">
        <TrendingTables />
        <FeaturedTokens />
        <TopTokens />
        <TrendingCoins />
        <TokenListings />
      </section>

      <PromotedTable />
      <Footer />
    </div>
  );
};

export default Index;
