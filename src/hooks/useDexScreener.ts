import { useQuery } from '@tanstack/react-query';

interface TokenInfo {
  imageUrl?: string;
  websites?: { url: string }[];
  socials?: { type: string; url: string }[];
}

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
  };
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: TokenInfo;
}

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Featured token addresses on PulseChain
export const FEATURED_TOKENS = [ 
  '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', 
  '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', 
  '0xc10A4Ed9b4042222d69ff0B374eddd47ed90fC1F', 
  '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d', 
  '0x94534EeEe131840b1c0F61847c572228bdfDDE93', 
  '0x14aED785b3F951Eb5aC98250E8f4f530A2F83177', 
  '0xa1077a294dde1b09bb078844df40758a5d0f9a27', 
  '0x4Eb7C1c05087f98Ae617d006F48914eE73fF8D2A', 
  '0x55C50875e890c7eE5621480baB02511C380E12C6', 
  '0xf598cB1D27Fb2c5C731F535AD6c1D0ec5EfE1320', 
  '0x1B71505D95Ab3e7234ed2239b8EC7aa65b94ae7B', 
  '0xe33a5AE21F93aceC5CfC0b7b0FDBB65A0f0Be5cC', 
  '0x8Da17Db850315A34532108f0f5458fc0401525f6', 
  '0xd6c31bA0754C4383A41c0e9DF042C62b5e918f6d', 
  '0xD34f5ADC24d8Cc55C1e832Bdf65fFfDF80D1314f',
  '0x709e07230860FE0543DCBC359Fdf1D1b5eD13305',
  '0x260e5dA7eF6E30e0A647d1aDF47628198DCb0709',
  '0xd73731bDA87C3464e76268c094D959c1B35b9bF1',
  '0x0392fBD58918E7ECBB2C68f4EBe4e2225C9a6468',
  '0xec4252e62C6dE3D655cA9Ce3AfC12E553ebBA274',
  '0x279d6564A78Cc9f126eC630e8a826DD55294f875',
  '0x080f7A005834c84240F25B2Df4AED8236bd57812',
  '0x873301F2B4B83FeaFF04121B68eC9231B29Ce0df',
  '0x9Ff4f187D1a41DCD05d6a80c060c6489C132e372',
  '0x35Cf97eC047F93660C27c21FdD846dEa72bc66D7',
  '0xF7bf2A938f971D7e4811A1170C43d651d21A0F81',
  '0xBFcfA52225Baa5feec5fbb54E6458957D53ddD94',
  '0xDDe9164E7E0DA7ae48b58F36B42c1c9f80e7245F',
  '0x435363A7C8C63057aAD5d9903c154b4d43E00093',
  '0x8cC6d99114Edd628249fAbc8a4d64F9A759a77Bf',
];


export const usePulseChainTokens = () => {
  return useQuery({
    queryKey: ['pulsechain-featured-tokens', FEATURED_TOKENS.length],
    queryFn: async () => {
      const addressesLower = FEATURED_TOKENS.map((a) => a.toLowerCase());
      const wanted = new Set(addressesLower);

      // 1) Try the /tokens endpoint for all addresses at once
      const r = await fetch(`${DEXSCREENER_API}/tokens/${addressesLower.join(',')}`);
      if (!r.ok) throw new Error('Failed to fetch tokens');
      const d = await r.json();
      const pairs: DexPair[] = (d.pairs || []) as DexPair[];

      // Pick best (highest liquidity) pair per requested address, accepting base OR quote match
      const bestByAddress = new Map<string, DexPair>();
      for (const p of pairs) {
        if (p.chainId !== 'pulsechain') continue;
        const base = p.baseToken.address.toLowerCase();
        const quote = p.quoteToken.address.toLowerCase();
        const matched = wanted.has(base) ? base : wanted.has(quote) ? quote : undefined;
        if (!matched) continue;
        const current = bestByAddress.get(matched);
        if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
          bestByAddress.set(matched, p);
        }
      }

      // 2) Fallback via /search for those still missing
      const missing = addressesLower.filter((addr) => !bestByAddress.has(addr));
      if (missing.length) {
        const searchResults = await Promise.all(
          missing.map(async (addr) => {
            try {
              const rs = await fetch(`${DEXSCREENER_API}/search?q=${addr}`);
              if (!rs.ok) return null;
              const ds = await rs.json();
              const found: DexPair[] = (ds.pairs || []).filter((p: DexPair) => p.chainId === 'pulsechain');
              // choose highest liquidity for this specific address (base or quote)
              let best: DexPair | null = null;
              for (const p of found) {
                const base = p.baseToken.address.toLowerCase();
                const quote = p.quoteToken.address.toLowerCase();
                if (base !== addr && quote !== addr) continue;
                if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
              }
              if (best) bestByAddress.set(addr, best);
              return null;
            } catch {
              return null;
            }
          })
        );
      }

      // Keep order same as FEATURED_TOKENS
      const ordered = addressesLower
        .map((addr) => bestByAddress.get(addr))
        .filter(Boolean) as DexPair[];

      console.log('Featured pairs (ordered):', ordered.map((p) => `${p.baseToken.symbol}/${p.quoteToken.symbol}`));
      return ordered;
    },
    refetchInterval: 30000,
    staleTime: 0,
  });
};

export const useSearchToken = (query: string) => {
  return useQuery({
    queryKey: ['search-token', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await fetch(`${DEXSCREENER_API}/search?q=${query}`);
      if (!response.ok) throw new Error('Failed to search tokens');
      const data = await response.json();
      return data.pairs?.filter((pair: DexPair) => pair.chainId === 'pulsechain') || [];
    },
    enabled: query.length >= 2,
  });
};

export const useTokenByAddress = (address: string) => {
  return useQuery({
    queryKey: ['token-address', address],
    queryFn: async () => {
      const response = await fetch(`${DEXSCREENER_API}/tokens/${address}`);
      if (!response.ok) throw new Error('Failed to fetch token');
      const data = await response.json();
      return data.pairs?.filter((pair: DexPair) => pair.chainId === 'pulsechain') || [];
    },
    enabled: !!address,
  });
};

export const useLatestPulsechainPairs = () => {
  return useQuery({
    queryKey: ['latest-pulsechain-pairs'],
    queryFn: async () => {
      const response = await fetch(`${DEXSCREENER_API}/search?q=pulsechain`);
      if (!response.ok) throw new Error('Failed to fetch latest pairs');
      const data = await response.json();
      const pairs: DexPair[] = (data.pairs || []).filter((pair: DexPair) => pair.chainId === 'pulsechain');
      return pairs.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt);
    },
    refetchInterval: 30000,
  });
};
