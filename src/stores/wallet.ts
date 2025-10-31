import { create } from 'zustand';
import { WalletState } from '@/types/market';
import { persist } from '@/lib/persist';
import dayjs from 'dayjs';

type WalletStore = {
  wallet: WalletState;
  init: () => void;
  addPoints: (amount: number) => void;
  subtractPoints: (amount: number) => void;
  addPnL: (amount: number) => void;
  claimFaucet: () => boolean;
  canClaimFaucet: () => boolean;
  getTimeUntilNextClaim: () => number;
};

const GUEST_ADDRESS = 'guest-demo-wallet';
const FAUCET_AMOUNT = 10000;
const FAUCET_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallet: {
    address: GUEST_ADDRESS,
    points: 0,
    pnlRealized: 0,
  },

  init: () => {
    const wallets = persist.getWallets();
    const existing = wallets.find((w) => w.address === GUEST_ADDRESS);

    if (existing) {
      set({ wallet: existing });
    } else {
      const newWallet: WalletState = {
        address: GUEST_ADDRESS,
        points: 0,
        pnlRealized: 0,
      };
      persist.setWallets([...wallets, newWallet]);
      set({ wallet: newWallet });
    }
  },

  addPoints: (amount) => {
    const wallet = { ...get().wallet, points: get().wallet.points + amount };
    const wallets = persist.getWallets().map((w) =>
      w.address === wallet.address ? wallet : w
    );
    persist.setWallets(wallets);
    set({ wallet });
  },

  subtractPoints: (amount) => {
    const wallet = { ...get().wallet, points: get().wallet.points - amount };
    const wallets = persist.getWallets().map((w) =>
      w.address === wallet.address ? wallet : w
    );
    persist.setWallets(wallets);
    set({ wallet });
  },

  addPnL: (amount) => {
    const wallet = {
      ...get().wallet,
      pnlRealized: get().wallet.pnlRealized + amount,
    };
    const wallets = persist.getWallets().map((w) =>
      w.address === wallet.address ? wallet : w
    );
    persist.setWallets(wallets);
    set({ wallet });
  },

  claimFaucet: () => {
    if (!get().canClaimFaucet()) return false;

    const wallet = {
      ...get().wallet,
      points: get().wallet.points + FAUCET_AMOUNT,
      claimedFaucetAt: new Date().toISOString(),
    };
    const wallets = persist.getWallets().map((w) =>
      w.address === wallet.address ? wallet : w
    );
    persist.setWallets(wallets);
    set({ wallet });
    return true;
  },

  canClaimFaucet: () => {
    const { claimedFaucetAt } = get().wallet;
    if (!claimedFaucetAt) return true;

    const lastClaim = dayjs(claimedFaucetAt);
    const now = dayjs();
    return now.diff(lastClaim) >= FAUCET_COOLDOWN;
  },

  getTimeUntilNextClaim: () => {
    const { claimedFaucetAt } = get().wallet;
    if (!claimedFaucetAt) return 0;

    const lastClaim = dayjs(claimedFaucetAt);
    const nextClaim = lastClaim.add(FAUCET_COOLDOWN, 'millisecond');
    const now = dayjs();
    const diff = nextClaim.diff(now);
    return Math.max(0, diff);
  },
}));
