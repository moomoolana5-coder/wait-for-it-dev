import { TrendingUp, Trophy, Flame, Clock, Star, Sparkles, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const TabNavigation = () => {
  const location = useLocation();

  const tabs = [
    { id: "all", label: "All", icon: Star, href: "/" },
    { id: "trending", label: "Trending", icon: TrendingUp, href: "#trending" },
    { id: "top-tokens", label: "Top Tokens", icon: Trophy, href: "#top-tokens" },
    { id: "gainers", label: "Top Gainers", icon: Flame, href: "#gainers" },
    { id: "highlights", label: "Highlights", icon: Sparkles, href: "#highlights" },
    { id: "trade-volume", label: "Trending by Trade Volume", icon: BarChart3, href: "#trade-volume" },
    { id: "new", label: "New Listings", icon: Clock, href: "#new" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/" && !location.hash;
    if (href.startsWith("#")) return location.hash === href;
    return location.pathname === href;
  };

  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            
            const TabContent = (
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap",
                  active
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            );

            if (tab.href.startsWith("#")) {
              return (
                <a key={tab.id} href={tab.href}>
                  {TabContent}
                </a>
              );
            }

            return (
              <Link key={tab.id} to={tab.href}>
                {TabContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
