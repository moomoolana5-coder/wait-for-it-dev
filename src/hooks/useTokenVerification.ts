import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTokenVerification = (tokenAddress: string) => {
  return useQuery({
    queryKey: ['token-verification', tokenAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submitted_tokens')
        .select('verified')
        .eq('token_address', tokenAddress)
        .maybeSingle();

      if (error) {
        console.error('Error fetching verification status:', error);
        return false;
      }

      return data?.verified || false;
    },
    enabled: !!tokenAddress,
  });
};
