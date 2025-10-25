import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, Loader2, ChevronLeft } from "lucide-react";
import { useNewListings } from "@/hooks/useNewListings";
import TokenTable from "@/components/TokenTable";
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
        ) : tokens && tokens.length > 0 ? (
          <TokenTable tokens={tokens} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No new listings available
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default NewListings;
