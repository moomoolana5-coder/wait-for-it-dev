export type OutcomeKey = 'YES' | 'NO' | 'A' | 'B';
export type MarketType = 'YES_NO' | 'A_VS_B';
export type ResolutionType = 'PRICE_GE' | 'RANK_A_VS_B' | 'MANUAL';

export type Market = {
  id: string;
  title: string;
  cover: string;
  category: 'Crypto' | 'Sports' | 'Politics' | 'Economy' | 'Gaming' | 'Culture' | 'Sentiment';
  type: MarketType;
  outcomes: { key: OutcomeKey; label: string }[];
  resolutionType: ResolutionType;
  source: {
    provider: 'DEXSCREENER' | 'COINGECKO';
    baseId?: string;
    pairAddress?: string;
    threshold?: number;
    aId?: string;
    bId?: string;
    snapshotDateISO?: string;
  };
  createdAt: string;
  closesAt: string;
  resolvesAt: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
  poolUSD: number;
  yesStake?: number;
  noStake?: number;
  aStake?: number;
  bStake?: number;
  resolution?: {
    winner: OutcomeKey;
    valueAtResolution?: number;
    reason?: string;
  };
  trendingScore: number;
};

export type Trade = {
  id: string;
  marketId: string;
  wallet: string;
  side: OutcomeKey;
  amountPts: number;
  price: number;
  shares: number;
  ts: string;
};

export type WalletState = {
  address: string;
  points: number;
  pnlRealized: number;
  claimedFaucetAt?: string;
};

export type ClaimRecord = {
  marketId: string;
  wallet: string;
  shares: number;
  claimed: boolean;
  payout?: number;
};
