import { Market, Trade, WalletState } from '@/types/markets';

const KEYS = {
  MARKETS: 'pm_markets',
  TRADES: 'pm_trades',
  WALLETS: 'pm_wallets',
  SETTINGS: 'pm_settings',
  CLAIMS: 'pm_claims',
};

export const persist = {
  getMarkets: (): Market[] => {
    try {
      const data = localStorage.getItem(KEYS.MARKETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setMarkets: (markets: Market[]) => {
    localStorage.setItem(KEYS.MARKETS, JSON.stringify(markets));
  },

  getTrades: (): Trade[] => {
    try {
      const data = localStorage.getItem(KEYS.TRADES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setTrades: (trades: Trade[]) => {
    localStorage.setItem(KEYS.TRADES, JSON.stringify(trades));
  },

  getWallets: (): WalletState[] => {
    try {
      const data = localStorage.getItem(KEYS.WALLETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setWallets: (wallets: WalletState[]) => {
    localStorage.setItem(KEYS.WALLETS, JSON.stringify(wallets));
  },

  getSettings: (): any => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : { adminMode: false, allowlist: [], mappings: {} };
    } catch {
      return { adminMode: false, allowlist: [], mappings: {} };
    }
  },

  setSettings: (settings: any) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getClaims: (): any[] => {
    try {
      const data = localStorage.getItem(KEYS.CLAIMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setClaims: (claims: any[]) => {
    localStorage.setItem(KEYS.CLAIMS, JSON.stringify(claims));
  },

  resetAll: () => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
