import { Market } from '@/types/market';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { ExternalLink } from 'lucide-react';

type RulesPanelProps = {
  market: Market;
};

export const RulesPanel = ({ market }: RulesPanelProps) => {
  const getResolutionSourceLink = () => {
    const { provider, baseId, pairAddress } = market.source;

    if (provider === 'COINGECKO' && baseId) {
      return `https://www.coingecko.com/en/coins/${baseId}`;
    } else if (provider === 'DEXSCREENER' && pairAddress) {
      return `https://dexscreener.com/pulsechain/${pairAddress}`;
    }

    return null;
  };

  const sourceLink = getResolutionSourceLink();

  return (
    <Card className="glass-card border-border/50 p-6">
      <h3 className="mb-4 text-lg font-semibold">Market Rules</h3>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="dates">
          <AccordionTrigger>Market Dates</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium">{formatDate(market.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market Closing</span>
              <span className="font-medium">{formatDate(market.closesAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolution Deadline</span>
              <span className="font-medium">{formatDate(market.resolvesAt)}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="criteria">
          <AccordionTrigger>Resolution Criteria</AccordionTrigger>
          <AccordionContent className="space-y-3 text-sm">
            {market.resolutionType === 'PRICE_GE' && (
              <>
                <p>
                  This market will resolve to <strong className="text-primary">YES</strong> if the
                  price is <strong>≥ ${market.source.threshold?.toLocaleString()}</strong> at the
                  resolution deadline.
                </p>
                <p>
                  Otherwise, it resolves to <strong className="text-secondary">NO</strong>.
                </p>
              </>
            )}

            {market.resolutionType === 'RANK_A_VS_B' && (
              <>
                <p>
                  This market compares the market cap ranks of{' '}
                  <strong className="text-primary">{market.outcomes[0].label}</strong> vs{' '}
                  <strong className="text-secondary">{market.outcomes[1].label}</strong> at the
                  snapshot date.
                </p>
                <p>The asset with the higher rank (lower number) wins.</p>
              </>
            )}

            {market.resolutionType === 'MANUAL' && (
              <p>
                This market will be resolved manually by the admin based on publicly verifiable
                information and announcements.
              </p>
            )}

            {sourceLink && (
              <a
                href={sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <span>Resolution Source</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cancellation">
          <AccordionTrigger>Cancellation & Invalidity</AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              This market may be cancelled and all positions refunded (at average entry price) if:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>The data source becomes unavailable or unreliable</li>
              <li>The asset is delisted from the oracle provider</li>
              <li>A snapshot cannot be taken due to technical issues</li>
              <li>There is a dispute about the resolution that cannot be resolved</li>
            </ul>
            <p className="mt-3 text-xs">
              Note: This is a demo. No real funds are at risk.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
