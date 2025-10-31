import { Market, Trade, WalletState, Settings } from '@/types/market';

const KEYS = {
  MARKETS: 'pm_markets',
  TRADES: 'pm_trades',
  WALLETS: 'pm_wallets',
  SETTINGS: 'pm_settings',
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

  getSettings: (): Settings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data
        ? JSON.parse(data)
        : { adminMode: false, allowlist: [], mappings: {} };
    } catch {
      return { adminMode: false, allowlist: [], mappings: {} };
    }
  },

  setSettings: (settings: Settings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  reset: () => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
