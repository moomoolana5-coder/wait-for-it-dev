import { useTopByVolume } from "@/hooks/useTopByVolume";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const MarketStats = () => {
  const { data: volumeData } = useTopByVolume();
  
  const totalVolume = volumeData?.reduce((sum, token) => sum + (token.volume?.h24 || 0), 0) || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
              <h3 className="text-3xl font-bold">
                ${(totalVolume * 2.5).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">2.2%</span>
              </div>
            </div>
            <div className="h-16 w-32 flex items-end gap-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-green-500/30 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">24h Trading Volume</p>
              <h3 className="text-3xl font-bold">
                ${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">1.8%</span>
              </div>
            </div>
            <div className="h-16 w-32 flex items-end gap-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-green-500/30 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketStats;
