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

// Top tokens by volume on PulseChain
const TOP_PULSECHAIN_TOKENS = [
  '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39', // HEX
  '0x95b303987a60c71504d99aa1b13b4da07b0790ab', // PLSX
  '0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d', // INC
  '0x0cb6f5a34ad42ec934882a05265a7d5f59b51a2f', // USDL
  '0xc10a4ed9b4042222d69ff0b374eddd47ed90fc1f', // PCOCK
  '0x94534eeee131840b1c0f61847c572228bdfdde93', // pTGC
  '0x6b0280da12f0977f1cc19861e73682c27ad8ab84', // WETH
  '0xefd766ccb38eaf1dfd701853bfce31359239f305', // DAI
];

export const useTopByVolume = () => {
  return useQuery({
    queryKey: ['top-by-volume'],
    queryFn: async () => {
      const tokenAddresses = TOP_PULSECHAIN_TOKENS.join(',');
      const response = await fetch(`${DEXSCREENER_API}/tokens/${tokenAddresses}`);
      if (!response.ok) throw new Error('Failed to fetch tokens');
      const data = await response.json();
      
      const pulsechainPairs: DexPair[] = [];
      
      if (data.pairs) {
        const tokenBestPairs = new Map<string, DexPair>();
        
        data.pairs.forEach((pair: DexPair) => {
          if (pair.chainId === 'pulsechain' && pair.liquidity?.usd > 1000) {
            const tokenAddress = pair.baseToken.address.toLowerCase();
            const existing = tokenBestPairs.get(tokenAddress);
            
            if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
              tokenBestPairs.set(tokenAddress, pair);
            }
          }
        });
        
        pulsechainPairs.push(...tokenBestPairs.values());
      }
      
      const sorted = pulsechainPairs.sort((a, b) => b.volume.h24 - a.volume.h24);
      
      return sorted.slice(0, 3);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};
