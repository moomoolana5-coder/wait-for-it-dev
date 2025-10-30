import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GigaMarkets = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            Giga Markets
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to Giga Markets - Your trading hub
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GigaMarkets;
