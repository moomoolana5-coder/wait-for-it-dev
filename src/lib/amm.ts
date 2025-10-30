import { OutcomeKey } from '@/types/markets';

const EPSILON = 100;

export function computePrice(
  side: OutcomeKey,
  yesStake: number,
  noStake: number,
  aStake: number,
  bStake: number,
  type: 'YES_NO' | 'A_VS_B'
): number {
  if (type === 'YES_NO') {
    const total = 2 * EPSILON + yesStake + noStake;
    if (side === 'YES') {
      return (EPSILON + yesStake) / total;
    } else {
      return (EPSILON + noStake) / total;
    }
  } else {
    const total = 2 * EPSILON + aStake + bStake;
    if (side === 'A') {
      return (EPSILON + aStake) / total;
    } else {
      return (EPSILON + bStake) / total;
    }
  }
}

export function calculateTrade(
  amountPts: number,
  price: number
): {
  shares: number;
  avgPrice: number;
  maxProfit: number;
  maxPayout: number;
} {
  const shares = amountPts / price;
  const avgPrice = price;
  const maxProfit = shares * (1 - price);
  const maxPayout = shares;

  return {
    shares,
    avgPrice,
    maxProfit,
    maxPayout,
  };
}

export function getChance(
  yesStake: number,
  noStake: number,
  aStake: number,
  bStake: number,
  type: 'YES_NO' | 'A_VS_B'
): { side: OutcomeKey; percentage: number } {
  if (type === 'YES_NO') {
    const pYes = computePrice('YES', yesStake, noStake, 0, 0, 'YES_NO');
    const pNo = computePrice('NO', yesStake, noStake, 0, 0, 'YES_NO');
    return pYes > pNo
      ? { side: 'YES', percentage: pYes * 100 }
      : { side: 'NO', percentage: pNo * 100 };
  } else {
    const pA = computePrice('A', 0, 0, aStake, bStake, 'A_VS_B');
    const pB = computePrice('B', 0, 0, aStake, bStake, 'A_VS_B');
    return pA > pB
      ? { side: 'A', percentage: pA * 100 }
      : { side: 'B', percentage: pB * 100 };
  }
}
