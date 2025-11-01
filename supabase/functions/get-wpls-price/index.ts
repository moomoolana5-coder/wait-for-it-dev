import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DexScreenerResponse {
  pairs?: Array<{
    priceUsd: string;
    priceChange?: {
      h24?: number;
    };
    volume?: {
      h24?: number;
    };
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching WPLS price from DexScreener...');
    
    // WPLS pair address on PulseChain (replace with actual pair address)
    const pairAddress = '0x6753560538ECa67617A9Ce605178F788bE7E524E'; // WPLS/DAI pair on PulseX
    
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pairAddress}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data: DexScreenerResponse = await response.json();
    console.log('DexScreener response:', JSON.stringify(data, null, 2));

    if (!data.pairs || data.pairs.length === 0) {
      throw new Error('No pairs found');
    }

    const pair = data.pairs[0];
    const price = parseFloat(pair.priceUsd);
    const priceChange24h = pair.priceChange?.h24 || 0;
    const volume24h = pair.volume?.h24 || 0;

    const result = {
      price,
      priceChange24h,
      volume24h,
      timestamp: new Date().toISOString(),
    };

    console.log('WPLS price data:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching WPLS price:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        price: 0,
        priceChange24h: 0,
        volume24h: 0,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with error in body for graceful degradation
      }
    );
  }
});
