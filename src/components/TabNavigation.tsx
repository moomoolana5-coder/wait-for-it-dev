import { useNavigate, useSearchParams } from "react-router-dom";
import { TrendingUp, Trophy, Flame, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TabNavigation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'all';

  const tabs = [
    { id: "all", label: "All", icon: Star },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "top-tokens", label: "Top Tokens", icon: Trophy },
    { id: "gainers", label: "Top Gainers", icon: Flame },
    { id: "new", label: "New Listings", icon: Clock },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'all') {
      navigate('/');
    } else {
      navigate(`/?tab=${tabId}`);
    }
  };

  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap",
                  active
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
