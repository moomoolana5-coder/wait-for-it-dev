import { create } from 'zustand';
import { WalletState } from '@/types/markets';
import { persist } from '@/lib/persist';

interface WalletStoreState {
  wallets: WalletState[];
  currentWallet: string;
  init: () => void;
  getWallet: (address: string) => WalletState;
  updateWallet: (address: string, updates: Partial<WalletState>) => void;
  setCurrentWallet: (address: string) => void;
  claimFaucet: (address: string) => boolean;
  canClaimFaucet: (address: string) => boolean;
}

const FAUCET_AMOUNT = 10000;
const FAUCET_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export const useWalletStore = create<WalletStoreState>((set, get) => ({
  wallets: [],
  currentWallet: 'guest',

  init: () => {
    const stored = persist.getWallets();
    if (stored.length === 0) {
      const guestWallet: WalletState = {
        address: 'guest',
        points: 10000,
        pnlRealized: 0,
        claimedFaucetAt: new Date().toISOString(),
      };
      persist.setWallets([guestWallet]);
      set({ wallets: [guestWallet] });
    } else {
      set({ wallets: stored });
    }
  },

  getWallet: (address) => {
    const wallet = get().wallets.find((w) => w.address === address);
    if (wallet) return wallet;

    // Create new wallet if not exists
    const newWallet: WalletState = {
      address,
      points: 0,
      pnlRealized: 0,
    };
    const wallets = [...get().wallets, newWallet];
    persist.setWallets(wallets);
    set({ wallets });
    return newWallet;
  },

  updateWallet: (address, updates) => {
    const wallets = get().wallets.map((w) =>
      w.address === address ? { ...w, ...updates } : w
    );
    persist.setWallets(wallets);
    set({ wallets });
  },

  setCurrentWallet: (address) => {
    set({ currentWallet: address });
  },

  claimFaucet: (address) => {
    if (!get().canClaimFaucet(address)) return false;

    const wallet = get().getWallet(address);
    get().updateWallet(address, {
      points: wallet.points + FAUCET_AMOUNT,
      claimedFaucetAt: new Date().toISOString(),
    });
    return true;
  },

  canClaimFaucet: (address) => {
    const wallet = get().getWallet(address);
    if (!wallet.claimedFaucetAt) return true;

    const lastClaim = new Date(wallet.claimedFaucetAt).getTime();
    const now = Date.now();
    return now - lastClaim >= FAUCET_COOLDOWN;
  },
}));
