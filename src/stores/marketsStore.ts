import { create } from 'zustand';
import { Market, Trade, OutcomeKey } from '@/types/markets';
import { persist } from '@/lib/persist';
import { SEED_MARKETS } from '@/lib/seedMarkets';
import { computePrice } from '@/lib/amm';
import { distributeRewards } from '@/lib/settlement';
import { useWalletStore } from './walletStore';
import { useTradesStore } from './tradesStore';

interface MarketsState {
  markets: Market[];
  initialized: boolean;
  init: () => void;
  addMarket: (market: Market) => void;
  updateMarket: (id: string, updates: Partial<Market>) => void;
  deleteMarket: (id: string) => void;
  executeTrade: (marketId: string, side: OutcomeKey, amountPts: number, wallet: string) => void;
  resolveMarket: (marketId: string, winner: OutcomeKey, valueAtResolution?: number, reason?: string) => void;
  getMarketById: (id: string) => Market | undefined;
}

export const useMarketsStore = create<MarketsState>((set, get) => ({
  markets: [],
  initialized: false,

  init: () => {
    const stored = persist.getMarkets();
    if (stored.length === 0) {
      persist.setMarkets(SEED_MARKETS);
      set({ markets: SEED_MARKETS, initialized: true });
    } else {
      set({ markets: stored, initialized: true });
    }
  },

  addMarket: (market) => {
    const markets = [...get().markets, market];
    persist.setMarkets(markets);
    set({ markets });
  },

  updateMarket: (id, updates) => {
    const markets = get().markets.map((m) => (m.id === id ? { ...m, ...updates } : m));
    persist.setMarkets(markets);
    set({ markets });
  },

  deleteMarket: (id) => {
    const markets = get().markets.filter((m) => m.id !== id);
    persist.setMarkets(markets);
    set({ markets });
  },

  executeTrade: (marketId, side, amountPts, wallet) => {
    const market = get().markets.find((m) => m.id === marketId);
    if (!market || market.status !== 'OPEN') return;

    const walletStore = useWalletStore.getState();
    const walletState = walletStore.getWallet(wallet);
    if (walletState.points < amountPts) return;

    const yesStake = market.yesStake || 0;
    const noStake = market.noStake || 0;
    const aStake = market.aStake || 0;
    const bStake = market.bStake || 0;

    const price = computePrice(side, yesStake, noStake, aStake, bStake, market.type);
    const shares = amountPts / price;

    // Update stakes
    const updates: Partial<Market> = {
      poolUSD: market.poolUSD + amountPts,
    };

    if (market.type === 'YES_NO') {
      if (side === 'YES') {
        updates.yesStake = yesStake + amountPts;
      } else {
        updates.noStake = noStake + amountPts;
      }
    } else {
      if (side === 'A') {
        updates.aStake = aStake + amountPts;
      } else {
        updates.bStake = bStake + amountPts;
      }
    }

    get().updateMarket(marketId, updates);

    // Deduct points
    walletStore.updateWallet(wallet, {
      points: walletState.points - amountPts,
    });

    // Record trade
    const tradesStore = useTradesStore.getState();
    tradesStore.addTrade({
      id: `trade-${Date.now()}-${Math.random()}`,
      marketId,
      wallet,
      side,
      amountPts,
      price,
      shares,
      ts: new Date().toISOString(),
    });
  },

  resolveMarket: (marketId, winner, valueAtResolution, reason) => {
    const market = get().markets.find((m) => m.id === marketId);
    if (!market) return;

    const updates: Partial<Market> = {
      status: 'RESOLVED',
      resolution: {
        winner,
        valueAtResolution,
        reason,
      },
    };

    get().updateMarket(marketId, updates);

    // Distribute rewards
    const tradesStore = useTradesStore.getState();
    const walletStore = useWalletStore.getState();
    const trades = tradesStore.getTrades();
    const wallets = walletStore.wallets;

    const { claimRecords } = distributeRewards({ ...market, ...updates } as Market, trades, wallets);

    // Store claim records
    const existingClaims = persist.getClaims();
    persist.setClaims([...existingClaims, ...claimRecords]);
  },

  getMarketById: (id) => {
    return get().markets.find((m) => m.id === id);
  },
}));
