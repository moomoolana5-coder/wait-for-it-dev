export type OutcomeKey = 'YES' | 'NO' | 'A' | 'B';
export type MarketType = 'YES_NO' | 'A_VS_B';
export type ResolutionType = 'PRICE_GE' | 'RANK_A_VS_B' | 'MANUAL';
export type MarketStatus = 'OPEN' | 'CLOSED' | 'RESOLVED' | 'CANCELLED';
export type Category = 'Crypto' | 'Sports' | 'Politics' | 'Economy' | 'Gaming' | 'Culture' | 'Sentiment';

export type Market = {
  id: string;
  title: string;
  cover: string;
  category: Category;
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
  status: MarketStatus;
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

export type Settings = {
  adminMode: boolean;
  allowlist: string[];
  mappings: Record<string, { coingeckoId?: string; pair?: string }>;
};

export type Position = {
  marketId: string;
  side: OutcomeKey;
  shares: number;
  costBasis: number;
  claimed: boolean;
};
