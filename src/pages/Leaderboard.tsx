import { MarketsHeader } from '@/components/markets/MarketsHeader';
import { MarketsSidebar } from '@/components/markets/MarketsSidebar';
import { useWalletStore } from '@/stores/walletStore';
import { useTradesStore } from '@/stores/tradesStore';
import { useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Leaderboard() {
  const { wallets } = useWalletStore();
  const { trades } = useTradesStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const leaderboard = wallets
    .map((wallet) => {
      const userTrades = trades.filter((t) => t.wallet === wallet.address);
      const marketsTraded = new Set(userTrades.map((t) => t.marketId)).size;
      const winRate = 0; // Calculate based on resolved markets

      return {
        address: wallet.address,
        points: wallet.points,
        pnlRealized: wallet.pnlRealized,
        winRate,
        marketsTraded,
      };
    })
    .sort((a, b) => b.pnlRealized - a.pnlRealized);

  return (
    <div className="min-h-screen bg-[#0c0f14]">
      <MarketsHeader />
      <div className="flex">
        <MarketsSidebar onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

            <div className="bg-card/50 rounded-2xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Realized PnL</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">Markets Traded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, idx) => (
                    <TableRow key={entry.address}>
                      <TableCell className="font-medium">#{idx + 1}</TableCell>
                      <TableCell className="font-mono">
                        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.points.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          entry.pnlRealized >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {entry.pnlRealized >= 0 ? '+' : ''}
                        {entry.pnlRealized.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.winRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.marketsTraded}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
