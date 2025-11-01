import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WplsPrice {
  price: number;
  priceChange24h: number;
  volume24h: number;
  timestamp: string;
}

export const useWplsPrice = () => {
  const [priceData, setPriceData] = useState<WplsPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('get-wpls-price');

      if (invokeError) {
        console.error('Error fetching WPLS price:', invokeError);
        setError(invokeError.message);
        return;
      }

      if (data) {
        setPriceData(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchPrice();

    // Then fetch every 10 seconds
    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  return { priceData, loading, error, refetch: fetchPrice };
};
