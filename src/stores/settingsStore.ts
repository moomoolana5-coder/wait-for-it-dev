import { create } from 'zustand';
import { persist } from '@/lib/persist';

interface SettingsState {
  adminMode: boolean;
  allowlist: string[];
  mappings: Record<string, { coingeckoId?: string; pair?: string }>;
  init: () => void;
  setAdminMode: (enabled: boolean) => void;
  addToAllowlist: (address: string) => void;
  removeFromAllowlist: (address: string) => void;
  updateMapping: (key: string, value: any) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  adminMode: false,
  allowlist: ['guest-admin'],
  mappings: {},

  init: () => {
    const stored = persist.getSettings();
    set(stored);
  },

  setAdminMode: (enabled) => {
    const settings = { ...get(), adminMode: enabled };
    persist.setSettings(settings);
    set({ adminMode: enabled });
  },

  addToAllowlist: (address) => {
    const allowlist = [...get().allowlist, address];
    const settings = { ...get(), allowlist };
    persist.setSettings(settings);
    set({ allowlist });
  },

  removeFromAllowlist: (address) => {
    const allowlist = get().allowlist.filter((a) => a !== address);
    const settings = { ...get(), allowlist };
    persist.setSettings(settings);
    set({ allowlist });
  },

  updateMapping: (key, value) => {
    const mappings = { ...get().mappings, [key]: value };
    const settings = { ...get(), mappings };
    persist.setSettings(settings);
    set({ mappings });
  },

  reset: () => {
    persist.resetAll();
    set({
      adminMode: false,
      allowlist: ['guest-admin'],
      mappings: {},
    });
  },
}));
