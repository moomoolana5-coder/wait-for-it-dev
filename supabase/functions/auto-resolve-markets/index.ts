import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DexScreenerResponse {
  pairs?: Array<{
    priceUsd: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting auto-resolve markets check...');

    // Get all OPEN or CLOSED markets that need resolution
    const now = new Date().toISOString();
    const { data: markets, error: fetchError } = await supabase
      .from('markets')
      .select('*')
      .in('status', ['OPEN', 'CLOSED'])
      .lte('closes_at', now);

    if (fetchError) {
      console.error('Error fetching markets:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${markets?.length || 0} markets to check for resolution`);

    const resolvedMarkets = [];

    for (const market of markets || []) {
      try {
        console.log(`Processing market: ${market.id} - ${market.title}`);
        
        // First, close the market if it's still OPEN
        if (market.status === 'OPEN') {
          const { error: closeError } = await supabase
            .from('markets')
            .update({ status: 'CLOSED' })
            .eq('id', market.id);

          if (closeError) {
            console.error(`Error closing market ${market.id}:`, closeError);
            continue;
          }
          console.log(`Market ${market.id} closed`);
        }

        // Check if it's time to resolve
        const resolvesAt = new Date(market.resolves_at);
        if (resolvesAt > new Date()) {
          console.log(`Market ${market.id} not yet ready for resolution`);
          continue;
        }

        // Get current price based on resolution type
        let currentPrice = 0;
        const source = market.source as any;

        if (market.resolution_type === 'PRICE_GE' && source.provider === 'DEXSCREENER') {
          // Fetch current price from DexScreener
          const pairAddress = source.pairAddress;
          if (!pairAddress) {
            console.error(`No pair address for market ${market.id}`);
            continue;
          }

          const response = await fetch(
            `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pairAddress}`
          );

          if (!response.ok) {
            console.error(`DexScreener API error for ${market.id}: ${response.status}`);
            continue;
          }

          const data: DexScreenerResponse = await response.json();
          if (!data.pairs || data.pairs.length === 0) {
            console.error(`No pairs found for market ${market.id}`);
            continue;
          }

          currentPrice = parseFloat(data.pairs[0].priceUsd);
          console.log(`Current price for ${market.id}: $${currentPrice}`);
        }

        // Determine winner based on threshold
        const threshold = source.threshold || 0;
        const winner = currentPrice >= threshold ? 'YES' : 'NO';

        console.log(`Market ${market.id}: Price ${currentPrice} vs Threshold ${threshold} = Winner: ${winner}`);

        // Update market with resolution
        const { error: updateError } = await supabase
          .from('markets')
          .update({
            status: 'RESOLVED',
            result: {
              winner,
              valueAtResolution: currentPrice,
              reason: `Price at resolution: $${currentPrice.toFixed(6)}. Threshold: $${threshold.toFixed(6)}`,
            },
          })
          .eq('id', market.id);

        if (updateError) {
          console.error(`Error resolving market ${market.id}:`, updateError);
          continue;
        }

        console.log(`✅ Market ${market.id} resolved with winner: ${winner}`);
        resolvedMarkets.push({
          id: market.id,
          title: market.title,
          winner,
          price: currentPrice,
          threshold,
        });

      } catch (error) {
        console.error(`Error processing market ${market.id}:`, error);
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      marketsChecked: markets?.length || 0,
      marketsResolved: resolvedMarkets.length,
      resolved: resolvedMarkets,
    };

    console.log('Auto-resolve completed:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in auto-resolve:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
