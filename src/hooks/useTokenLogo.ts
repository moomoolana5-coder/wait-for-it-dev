import { useQuery } from '@tanstack/react-query';

interface TokenLogoResult {
  logoUrl: string | null;
  tokenSymbol: string | null;
  tokenName: string | null;
}

export const useTokenLogo = (
  provider: 'DEXSCREENER' | 'COINGECKO',
  options: {
    pairAddress?: string;
    tokenAddress?: string;
    baseId?: string;
  }
) => {
  return useQuery<TokenLogoResult>({
    queryKey: ['token-logo', provider, options.pairAddress, options.tokenAddress, options.baseId],
    queryFn: async () => {
      try {
        if (provider === 'DEXSCREENER' && options.tokenAddress) {
          // Use token address endpoint
          const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${options.tokenAddress}`
          );
          const data = await response.json();
          
          // Get the first pair from PulseChain if available
          const pulsechainPair = data.pairs?.find((p: any) => p.chainId === 'pulsechain');
          
          if (pulsechainPair && pulsechainPair.info?.imageUrl) {
            return {
              logoUrl: pulsechainPair.info.imageUrl,
              tokenSymbol: pulsechainPair.baseToken?.symbol || null,
              tokenName: pulsechainPair.baseToken?.name || null,
            };
          }
        } else if (provider === 'DEXSCREENER' && options.pairAddress) {
          // Fallback to pair address
          const response = await fetch(
            `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${options.pairAddress}`
          );
          const data = await response.json();
          
          if (data.pair && data.pair.info?.imageUrl) {
            return {
              logoUrl: data.pair.info.imageUrl,
              tokenSymbol: data.pair.baseToken?.symbol || null,
              tokenName: data.pair.baseToken?.name || null,
            };
          }
        } else if (provider === 'COINGECKO' && options.baseId) {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${options.baseId}`
          );
          const data = await response.json();
          
          if (data.image?.large) {
            return {
              logoUrl: data.image.large,
              tokenSymbol: data.symbol?.toUpperCase() || null,
              tokenName: data.name || null,
            };
          }
        }
      } catch (error) {
        console.error('Error fetching token logo:', error);
      }
      
      return {
        logoUrl: null,
        tokenSymbol: null,
        tokenName: null,
      };
    },
    enabled: Boolean(
      (provider === 'DEXSCREENER' && (options.tokenAddress || options.pairAddress)) ||
      (provider === 'COINGECKO' && options.baseId)
    ),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
};
