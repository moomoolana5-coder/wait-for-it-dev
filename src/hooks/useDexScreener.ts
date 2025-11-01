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
  '0x818ec0672F65B634F94F234aC132678009064CdF', 
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
  '0xf6703DBff070F231eEd966D33B1B6D7eF5207d26',
  '0xB261Fa283aBf9CcE0b493B50b57cb654A490f339',
  '0x69e23263927Ae53E5FF3A898d082a83B7D6fB438',
  '0xebeCbffA46Eaee7CB3B3305cCE9283cf05CfD1BB',
  '0xFDe3255Fb043eA55F9D8635C5e7FF18770A6a810',
  '0x2401E09acE92C689570a802138D6213486407B24',
  '0x770CFA2FB975E7bCAEDDe234D92c3858C517Adca',
  '0x03b4652C8565BC8c257Fbd9fA935AAE41160fc4C',
  '0xCc78A0acDF847A2C1714D2A925bB4477df5d48a6',
  '0xbd63FA573A120013804e51B46C56F9b3e490f53C',
  '0xdF06aa2EF777D0B9701716d0C9aB500465f082ec',
  '0xA804b9E522A2D1645a19227514CFe856Ad8C2fbC',
  '0xA804b9E522A2D1645a19227514CFe856Ad8C2fbC',
  '0x456548A9B56eFBbD89Ca0309edd17a9E20b04018',
  '0xC70CF25DFCf5c5e9757002106C096ab72fab299E',
  '0x7b39712Ef45F7dcED2bBDF11F3D5046bA61dA719',
  '0x1C81b4358246d3088Ab4361aB755F3D8D4dd62d2',
  '0x483287DEd4F43552f201a103670853b5dc57D59d',
  '0xCA35638A3fdDD02fEC597D8c1681198C06b23F58',
  '0x52347C33Cf6Ca8D2cfb864AEc5aA0184C8fd4c9b',
  '0x0567CA0dE35606E9C260CC2358404B11DE21DB44',
  '0x000000000002625D361571e3771d402E10CF7ddB',
  '0xc2472877F596D5052883B93777325dD7F7d11c96',
  '0xeB52ac4D25067185f75bab4BcbfBaFA28c876A22',
  '0x675ac865aebcfc1d22f819ba0fe7a60bf17cb60d',
  '0x17dD9d7324827990ba7472131270563302F10009',
  '0x79BB3A0Ee435f957ce4f54eE8c3CFADc7278da0C',
  '0xecFc4b047659B5D9875D1e3243fe67400E0E47de',
  '0xD26Ac11FE213cb0916c63A70293f7b0Df91a2de4',
];


// Optimized version with batch loading for hundreds of tokens
export const usePulseChainTokens = () => {
  return useQuery({
    queryKey: ['pulsechain-featured-tokens', FEATURED_TOKENS.length],
    queryFn: async () => {
      const addressesLower = FEATURED_TOKENS.map((a) => a.toLowerCase());
      const wanted = new Set(addressesLower);
      const BATCH_SIZE = 20; // Process 20 tokens at a time
      const DELAY_MS = 500; // 500ms delay between batches

      const bestByAddress = new Map<string, DexPair>();

      // Split into batches to avoid rate limiting
      const batches: string[][] = [];
      for (let i = 0; i < addressesLower.length; i += BATCH_SIZE) {
        batches.push(addressesLower.slice(i, i + BATCH_SIZE));
      }

      console.log(`Loading ${addressesLower.length} tokens in ${batches.length} batches...`);

      // Process each batch with delay
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        try {
          // Add delay between batches (except first one)
          if (batchIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
          }

          const r = await fetch(`${DEXSCREENER_API}/tokens/${batch.join(',')}`);
          if (!r.ok) {
            console.warn(`Batch ${batchIndex + 1} failed: HTTP ${r.status}`);
            continue;
          }

          const d = await r.json();
          const pairs: DexPair[] = (d.pairs || []) as DexPair[];

          // Pick best pair per address in this batch (PulseX only)
          for (const p of pairs) {
            if (p.chainId !== 'pulsechain') continue;
            if (p.dexId !== 'pulsex') continue; // Only PulseX DEX
            const base = p.baseToken.address.toLowerCase();
            const quote = p.quoteToken.address.toLowerCase();
            const matched = wanted.has(base) ? base : undefined;
            if (!matched) continue;
            const current = bestByAddress.get(matched);
            if (!current || (p.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
              bestByAddress.set(matched, p);
            }
          }

          console.log(`Batch ${batchIndex + 1}/${batches.length} completed (${bestByAddress.size} tokens loaded)`);
        } catch (error) {
          console.error(`Error in batch ${batchIndex + 1}:`, error);
        }
      }

      // Fallback for missing tokens (in smaller batches)
      const missing = addressesLower.filter((addr) => !bestByAddress.has(addr));
      if (missing.length > 0) {
        console.log(`Fetching ${missing.length} missing tokens...`);
        
        // Process missing tokens in smaller groups
        for (let i = 0; i < missing.length; i++) {
          const addr = missing[i];
          
          try {
            // Add small delay to avoid rate limiting
            if (i > 0 && i % 5 === 0) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }

            const rs = await fetch(`${DEXSCREENER_API}/search?q=${addr}`);
            if (!rs.ok) continue;
            const ds = await rs.json();
            const found: DexPair[] = (ds.pairs || []).filter((p: DexPair) => 
              p.chainId === 'pulsechain' && p.dexId === 'pulsex' // Only PulseX DEX
            );
            
            let best: DexPair | null = null;
            for (const p of found) {
              const base = p.baseToken.address.toLowerCase();
              if (base !== addr) continue;
              if (!best || (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0)) best = p;
            }
            if (best) bestByAddress.set(addr, best);
          } catch (error) {
            console.warn(`Failed to fetch ${addr}:`, error);
          }
        }
      }

      // Keep order same as FEATURED_TOKENS
      const ordered = addressesLower
        .map((addr) => bestByAddress.get(addr))
        .filter(Boolean) as DexPair[];

      console.log(`✅ Loaded ${ordered.length}/${addressesLower.length} featured tokens`);
      return ordered;
    },
    refetchInterval: 60000, // Increased to 60s to reduce API load
    staleTime: 30000,
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
