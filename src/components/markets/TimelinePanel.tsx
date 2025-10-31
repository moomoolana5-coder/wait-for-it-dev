import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimelinePanelProps = {
  market: Market;
};

export const TimelinePanel = ({ market }: TimelinePanelProps) => {
  const now = new Date();
  const createdDate = new Date(market.createdAt);
  const closesDate = new Date(market.closesAt);
  const resolvesDate = new Date(market.resolvesAt);

  const isPublished = now >= createdDate;
  const isClosed = now >= closesDate;
  const isResolved = market.status === 'RESOLVED';

  return (
    <Card className="glass-card border-border/50 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Timeline</h3>

      <div className="space-y-6">
        {/* Published */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-1",
              isPublished ? "bg-primary/20" : "bg-muted"
            )}>
              {isPublished ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            {!isResolved && <div className="w-px h-12 bg-border mt-2" />}
          </div>
          <div className="flex-1 pb-2">
            <p className="font-medium">Market published</p>
            <p className="text-sm text-muted-foreground">{formatDate(market.createdAt)}</p>
          </div>
        </div>

        {/* Closes */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-1",
              isClosed ? "bg-yellow-500/20" : "bg-muted"
            )}>
              {isClosed ? (
                <CheckCircle2 className="h-5 w-5 text-yellow-500" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            {!isResolved && <div className="w-px h-12 bg-border mt-2" />}
          </div>
          <div className="flex-1 pb-2">
            <p className="font-medium">Market closes</p>
            <p className="text-sm text-muted-foreground">{formatDate(market.closesAt)}</p>
          </div>
        </div>

        {/* Resolution */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "rounded-full p-1",
              isResolved ? "bg-blue-500/20" : "bg-muted"
            )}>
              {isResolved ? (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-medium">Resolution</p>
            <p className="text-sm text-muted-foreground">{formatDate(market.resolvesAt)}</p>
            {isResolved && market.resolution && (
              <p className="text-sm text-primary font-medium mt-1">
                Winner: {market.resolution.winner}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
