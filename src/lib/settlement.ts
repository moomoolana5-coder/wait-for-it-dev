import { Market, Trade, WalletState, OutcomeKey } from '@/types/markets';

export function distributeRewards(
  market: Market,
  trades: Trade[],
  wallets: WalletState[]
): {
  updatedWallets: WalletState[];
  claimRecords: any[];
} {
  if (!market.resolution) return { updatedWallets: wallets, claimRecords: [] };

  const winner = market.resolution.winner;
  const totalPool = market.poolUSD || 0;
  const winnerPool = totalPool * 0.8;
  const burnAmount = totalPool * 0.1;
  const treasuryAmount = totalPool * 0.1;

  // Get all winning trades
  const winningTrades = trades.filter(
    (t) => t.marketId === market.id && t.side === winner
  );

  const totalWinnerShares = winningTrades.reduce((sum, t) => sum + t.shares, 0);

  const claimRecords: any[] = [];
  const walletMap = new Map(wallets.map((w) => [w.address, { ...w }]));

  // Calculate payouts
  winningTrades.forEach((trade) => {
    const userShares = trade.shares;
    const payout = totalWinnerShares > 0 ? (userShares / totalWinnerShares) * winnerPool : 0;

    claimRecords.push({
      marketId: market.id,
      wallet: trade.wallet,
      shares: userShares,
      claimed: false,
      payout,
      costBasis: trade.amountPts,
    });
  });

  // Handle burn and treasury (just track, not actually remove)
  // In a real system, you'd track global supply

  return {
    updatedWallets: Array.from(walletMap.values()),
    claimRecords,
  };
}

export function processClaim(
  wallet: WalletState,
  claimRecord: any
): WalletState {
  const payout = claimRecord.payout || 0;
  const costBasis = claimRecord.costBasis || 0;
  const pnl = payout - costBasis;

  return {
    ...wallet,
    points: wallet.points + payout,
    pnlRealized: wallet.pnlRealized + pnl,
  };
}
