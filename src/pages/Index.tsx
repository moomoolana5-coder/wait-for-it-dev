import Navbar from "@/components/Navbar";
import TokenListings from "@/components/TokenListings";
import TrendingTables from "@/components/TrendingTables";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, Sparkles, Star, Settings } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All", icon: TrendingUp },
    { id: "highlights", label: "Highlights", icon: Star },
    { id: "categories", label: "Categories", icon: Flame },
    { id: "ai", label: "AI Applications", icon: Sparkles },
    { id: "privacy", label: "Privacy", icon: Flame },
    { id: "derivatives", label: "Derivatives", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-8">
          <TrendingTables />
          <TokenListings />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
