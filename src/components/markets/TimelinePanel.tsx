import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDate } from '@/lib/format';
import { CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type TimelinePanelProps = {
  market: Market;
};

export const TimelinePanel = ({ market }: TimelinePanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const now = new Date();
  const createdDate = new Date(market.createdAt);
  const closesDate = new Date(market.closesAt);
  const resolvesDate = new Date(market.resolvesAt);

  const isPublished = now >= createdDate;
  const isClosed = now >= closesDate;
  const isResolved = market.status === 'RESOLVED';

  const timelineEvents = [
    {
      title: 'Market published',
      date: formatDate(market.createdAt),
      time: new Date(market.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: isPublished,
      icon: CheckCircle2,
      color: 'text-primary'
    },
    {
      title: 'Market closes',
      date: formatDate(market.closesAt),
      time: new Date(market.closesAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: isClosed,
      icon: isClosed ? CheckCircle2 : Circle,
      color: isClosed ? 'text-yellow-500' : 'text-muted-foreground',
      note: isClosed ? 'Only when an outcome is reached.' : null
    },
    {
      title: 'Resolution',
      date: formatDate(market.resolvesAt),
      time: new Date(market.resolvesAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: isResolved,
      icon: isResolved ? CheckCircle2 : Circle,
      color: isResolved ? 'text-primary' : 'text-muted-foreground',
      note: 'The outcome will be validated by the team within 24 hours of its occurrence.'
    }
  ];

  return (
    <Card className="glass-card border-border/50 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <ChevronDown 
            className={cn(
              "h-5 w-5 transition-transform",
              isOpen && "transform rotate-180"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border/50">
            <table className="w-full">
              <tbody>
                {timelineEvents.map((event, index) => (
                  <tr 
                    key={index}
                    className={cn(
                      "border-b border-border/30 last:border-0",
                      event.status && "bg-accent/20"
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <event.icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", event.color)} />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.date}, {event.time} GMT+7
                          </p>
                          {event.note && (
                            <p className="text-xs text-muted-foreground italic mt-1">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
