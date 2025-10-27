import { ArrowUp, ArrowDown, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { compactNumber, formatUSD, calculatePercentChange, formatTime } from "@/lib/formatters";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface NetworkStatsBarProps {
  pollIntervalMs?: number;
}

const NetworkStatsBar = ({ pollIntervalMs = 30000 }: NetworkStatsBarProps) => {
  const { transactions, dexVolume, isLoading, isError, transactionHistory, volumeHistory } = useNetworkStats(pollIntervalMs);

  if (isError) {
    return (
      <div className="rounded-xl border border-border/50 bg-gradient-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Failed to load PulseChain stats.</p>
      </div>
    );
  }

  const renderStatCard = (
    title: string,
    icon: React.ReactNode,
    value: string,
    percentChange?: number,
    timestamp?: Date,
    chartData?: Array<{ value: number }>
  ) => (
    <Card className="rounded-xl border-border/50 bg-gradient-card shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold" aria-live="polite">
                {value}
              </div>
              {chartData && chartData.length > 0 && (
                <div className="w-32 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              {percentChange !== undefined && (
                <div className="flex items-center gap-1">
                  {percentChange >= 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-accent" />
                      <span className="text-accent font-medium">
                        +{percentChange.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3 w-3 text-destructive" />
                      <span className="text-destructive font-medium">
                        {percentChange.toFixed(2)}%
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground ml-1">vs prev 24h</span>
                </div>
              )}
              {timestamp && (
                <span className="text-muted-foreground">
                  Updated: {formatTime(timestamp)}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {renderStatCard(
        "Total Transactions 24h",
        <Activity className="h-4 w-4 text-primary" />,
        transactions ? compactNumber(transactions.value) : "0",
        undefined,
        undefined,
        transactionHistory
      )}
      {renderStatCard(
        "Total Volume 24h",
        <TrendingUp className="h-4 w-4 text-accent" />,
        dexVolume ? formatUSD(dexVolume.value) : "$0",
        undefined,
        undefined,
        volumeHistory
      )}
    </div>
  );
};

export default NetworkStatsBar;
