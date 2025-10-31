import { Market, OutcomeKey } from '@/types/market';

const EPSILON = 100; // Spread seed

export const computePrice = (
  market: Market,
  side: OutcomeKey
): number => {
  if (market.type === 'YES_NO') {
    const yesStake = market.yesStake || EPSILON;
    const noStake = market.noStake || EPSILON;
    const total = yesStake + noStake + 2 * EPSILON;
    
    return side === 'YES' 
      ? (EPSILON + yesStake) / total
      : (EPSILON + noStake) / total;
  } else {
    const aStake = market.aStake || EPSILON;
    const bStake = market.bStake || EPSILON;
    const total = aStake + bStake + 2 * EPSILON;
    
    return side === 'A'
      ? (EPSILON + aStake) / total
      : (EPSILON + bStake) / total;
  }
};

export const calculateTrade = (
  market: Market,
  side: OutcomeKey,
  amountPts: number
) => {
  const price = computePrice(market, side);
  const shares = amountPts / price;
  const maxProfit = shares * (1 - price);
  const maxPayout = shares;
  const avgPrice = price;

  return {
    price,
    shares,
    avgPrice,
    maxProfit,
    maxPayout,
  };
};

export const getChance = (market: Market): { side: OutcomeKey; value: number } => {
  if (market.type === 'YES_NO') {
    const yesPrice = computePrice(market, 'YES');
    const noPrice = computePrice(market, 'NO');
    return yesPrice >= noPrice
      ? { side: 'YES', value: yesPrice }
      : { side: 'NO', value: noPrice };
  } else {
    const aPrice = computePrice(market, 'A');
    const bPrice = computePrice(market, 'B');
    return aPrice >= bPrice
      ? { side: 'A', value: aPrice }
      : { side: 'B', value: bPrice };
  }
};

export const getProgressValues = (
  market: Market
): { yes: number; no: number } | { a: number; b: number } => {
  if (market.type === 'YES_NO') {
    const yesStake = market.yesStake || 0;
    const noStake = market.noStake || 0;
    const total = yesStake + noStake || 1;
    
    return {
      yes: yesStake / total,
      no: noStake / total,
    };
  } else {
    const aStake = market.aStake || 0;
    const bStake = market.bStake || 0;
    const total = aStake + bStake || 1;
    
    return {
      a: aStake / total,
      b: bStake / total,
    };
  }
};
