import { Market, Trade, Position, OutcomeKey } from '@/types/market';

export const calculatePositions = (
  marketId: string,
  wallet: string,
  trades: Trade[]
): Position[] => {
  const marketTrades = trades.filter(
    (t) => t.marketId === marketId && t.wallet === wallet
  );

  const positionMap = new Map<OutcomeKey, Position>();

  marketTrades.forEach((trade) => {
    const existing = positionMap.get(trade.side);
    if (existing) {
      existing.shares += trade.shares;
      existing.costBasis += trade.amountPts;
    } else {
      positionMap.set(trade.side, {
        marketId,
        side: trade.side,
        shares: trade.shares,
        costBasis: trade.amountPts,
        claimed: false,
      });
    }
  });

  return Array.from(positionMap.values());
};

export const calculatePayout = (
  market: Market,
  position: Position
): number => {
  if (!market.resolution || position.side !== market.resolution.winner) {
    return 0;
  }

  const totalPool = market.poolUSD;
  const winnerStake =
    market.type === 'YES_NO'
      ? position.side === 'YES'
        ? market.yesStake || 0
        : market.noStake || 0
      : position.side === 'A'
      ? market.aStake || 0
      : market.bStake || 0;

  if (winnerStake === 0) return 0;

  const winnerShare = position.shares / winnerStake;
  return winnerShare * totalPool * 0.8; // 80% to winners
};

export const distributeRewards = (
  market: Market,
  trades: Trade[]
): {
  payouts: Map<string, number>;
  burned: number;
  treasury: number;
} => {
  if (!market.resolution) {
    return { payouts: new Map(), burned: 0, treasury: 0 };
  }

  const totalPool = market.poolUSD;
  const winnerStake =
    market.type === 'YES_NO'
      ? market.resolution.winner === 'YES'
        ? market.yesStake || 0
        : market.noStake || 0
      : market.resolution.winner === 'A'
      ? market.aStake || 0
      : market.bStake || 0;

  const payouts = new Map<string, number>();
  const burned = totalPool * 0.1;
  const treasury = totalPool * 0.1;
  const winnerPool = totalPool * 0.8;

  if (winnerStake === 0) {
    return { payouts, burned, treasury };
  }

  // Group trades by wallet
  const walletPositions = new Map<string, number>();

  trades
    .filter(
      (t) =>
        t.marketId === market.id && t.side === market.resolution?.winner
    )
    .forEach((trade) => {
      const existing = walletPositions.get(trade.wallet) || 0;
      walletPositions.set(trade.wallet, existing + trade.shares);
    });

  // Calculate payouts
  walletPositions.forEach((shares, wallet) => {
    const payout = (shares / winnerStake) * winnerPool;
    payouts.set(wallet, payout);
  });

  return { payouts, burned, treasury };
};
