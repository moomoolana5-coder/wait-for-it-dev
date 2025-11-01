import { create } from 'zustand';
import { Market } from '@/types/market';
import { supabase } from '@/integrations/supabase/client';
import { generateSeedMarkets } from '@/lib/seed';

type MarketsStore = {
  markets: Market[];
  initialized: boolean;
  loading: boolean;
  init: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  getMarket: (id: string) => Market | undefined;
  addMarket: (market: Market) => Promise<void>;
  updateMarket: (id: string, updates: Partial<Market>) => Promise<void>;
  deleteMarket: (id: string) => Promise<void>;
  incrementTrending: (id: string) => void;
};

export const useMarketsStore = create<MarketsStore>((set, get) => ({
  markets: [],
  initialized: false,
  loading: false,

  init: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      // Fetch markets from Supabase
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('trending_score', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // No markets in DB, seed with initial data
        console.log('No markets found, seeding database...');
        await get().syncToSupabase();
        return;
      }

      // Convert from Supabase format to app format
      const markets: Market[] = data.map((m: any) => ({
        id: m.id,
        title: m.title,
        cover: m.cover,
        category: m.category,
        type: m.type,
        outcomes: m.outcomes,
        resolutionType: m.resolution_type,
        source: m.source,
        createdAt: m.created_at,
        createdBy: m.created_by,
        closesAt: m.closes_at,
        resolvesAt: m.resolves_at,
        status: m.status,
        poolUSD: parseFloat(m.pool_usd || 0),
        yesStake: parseFloat(m.yes_stake || 0),
        noStake: parseFloat(m.no_stake || 0),
        aStake: parseFloat(m.a_stake || 0),
        bStake: parseFloat(m.b_stake || 0),
        trendingScore: m.trending_score,
        resolution: m.result,
      }));

      set({ markets, initialized: true, loading: false });
    } catch (error) {
      console.error('Error loading markets:', error);
      set({ loading: false });
    }
  },

  syncToSupabase: async () => {
    const seed = generateSeedMarkets();
    
    try {
      // Convert to Supabase format and insert
      const dbMarkets = seed.map(m => ({
        id: m.id,
        title: m.title,
        cover: m.cover,
        category: m.category,
        type: m.type,
        outcomes: m.outcomes,
        resolution_type: m.resolutionType,
        source: m.source,
        created_at: m.createdAt,
        created_by: '0x720a8ee141577dc8f3190417264bf91f59821169', // Admin wallet for seed data
        closes_at: m.closesAt,
        resolves_at: m.resolvesAt,
        status: m.status,
        pool_usd: m.poolUSD,
        yes_stake: m.yesStake,
        no_stake: m.noStake,
        a_stake: m.aStake,
        b_stake: m.bStake,
        trending_score: m.trendingScore,
        result: m.resolution,
      }));

      const { error } = await supabase
        .from('markets')
        .upsert(dbMarkets, { onConflict: 'id' });

      if (error) throw error;

      set({ markets: seed, initialized: true });
      console.log('Markets synced to Supabase successfully');
    } catch (error) {
      console.error('Error syncing markets:', error);
    }
  },

  getMarket: (id) => {
    return get().markets.find((m) => m.id === id);
  },

  addMarket: async (market) => {
    try {
      const dbMarket = {
        id: market.id,
        title: market.title,
        cover: market.cover,
        category: market.category,
        type: market.type,
        outcomes: market.outcomes,
        resolution_type: market.resolutionType,
        source: market.source,
        created_at: market.createdAt,
        created_by: market.createdBy || '0x720a8ee141577dc8f3190417264bf91f59821169',
        closes_at: market.closesAt,
        resolves_at: market.resolvesAt,
        status: market.status,
        pool_usd: market.poolUSD,
        yes_stake: market.yesStake,
        no_stake: market.noStake,
        a_stake: market.aStake,
        b_stake: market.bStake,
        trending_score: market.trendingScore,
        result: market.resolution,
      };

      const { error } = await supabase.from('markets').insert(dbMarket);
      if (error) throw error;

      const markets = [...get().markets, market];
      set({ markets });
    } catch (error) {
      console.error('Error adding market:', error);
      throw error;
    }
  },

  updateMarket: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.cover) dbUpdates.cover = updates.cover;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.closesAt) dbUpdates.closes_at = updates.closesAt;
      if (updates.resolvesAt) dbUpdates.resolves_at = updates.resolvesAt;
      if (updates.poolUSD !== undefined) dbUpdates.pool_usd = updates.poolUSD;
      if (updates.yesStake !== undefined) dbUpdates.yes_stake = updates.yesStake;
      if (updates.noStake !== undefined) dbUpdates.no_stake = updates.noStake;
      if (updates.aStake !== undefined) dbUpdates.a_stake = updates.aStake;
      if (updates.bStake !== undefined) dbUpdates.b_stake = updates.bStake;
      if (updates.trendingScore !== undefined) dbUpdates.trending_score = updates.trendingScore;
      if (updates.resolution) dbUpdates.result = updates.resolution;
      if (updates.source) dbUpdates.source = updates.source;
      if (updates.category) dbUpdates.category = updates.category;

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('markets')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      const markets = get().markets.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      set({ markets });
    } catch (error) {
      console.error('Error updating market:', error);
      throw error;
    }
  },

  deleteMarket: async (id) => {
    try {
      const { error } = await supabase.from('markets').delete().eq('id', id);
      if (error) throw error;

      const markets = get().markets.filter((m) => m.id !== id);
      set({ markets });
    } catch (error) {
      console.error('Error deleting market:', error);
      throw error;
    }
  },

  incrementTrending: (id) => {
    const markets = get().markets.map((m) =>
      m.id === id ? { ...m, trendingScore: m.trendingScore + 1 } : m
    );
    set({ markets });
    
    // Update in Supabase asynchronously
    supabase
      .from('markets')
      .update({ trending_score: markets.find(m => m.id === id)?.trendingScore })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating trending score:', error);
      });
  },
}));