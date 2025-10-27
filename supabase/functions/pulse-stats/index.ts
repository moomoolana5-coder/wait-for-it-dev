import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NetworkStat {
  value: number;
  prevValue: number;
  updatedAt: string;
  source: string;
}

interface StatsResponse {
  tx24h: NetworkStat;
  networkVolume24h: NetworkStat;
}

// Cache untuk menghindari terlalu banyak RPC calls
let cache: { data: StatsResponse | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 30000; // 30 detik

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Return cached data jika masih valid
    if (cache.data && (now - cache.timestamp) < CACHE_TTL_MS) {
      console.log('Returning cached PulseChain stats');
      return new Response(JSON.stringify(cache.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rpcUrl = Deno.env.get('PULSECHAIN_RPC_URL');
    if (!rpcUrl) {
      throw new Error('PULSECHAIN_RPC_URL not configured');
    }

    console.log('Fetching fresh PulseChain stats from RPC...');

    // Fungsi helper untuk RPC call
    const rpcCall = async (method: string, params: any[] = []) => {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.result;
    };

    // 1. Ambil latest block
    const latestBlockHex = await rpcCall('eth_blockNumber');
    const latestBlock = parseInt(latestBlockHex, 16);
    console.log(`Latest block: ${latestBlock}`);

    // 2. Estimasi block 24h yang lalu (asumsi ~3s per block untuk PulseChain)
    const blocksIn24h = Math.floor((24 * 60 * 60) / 3);
    const startBlock24h = latestBlock - blocksIn24h;
    const startBlock48h = latestBlock - (blocksIn24h * 2);

    console.log(`Block range 24h: ${startBlock24h} to ${latestBlock}`);
    console.log(`Block range prev 24h: ${startBlock48h} to ${startBlock24h}`);

    // 3. Sampling untuk efisiensi (setiap 100 blok)
    const sampleInterval = 100;
    const samples24h: number[] = [];
    const samplesPrev24h: number[] = [];

    // Sample untuk 24h terakhir
    for (let blockNum = startBlock24h; blockNum <= latestBlock; blockNum += sampleInterval) {
      try {
        const blockData = await rpcCall('eth_getBlockByNumber', [`0x${blockNum.toString(16)}`, false]);
        if (blockData?.transactions) {
          samples24h.push(blockData.transactions.length);
        }
      } catch (e) {
        console.error(`Error fetching block ${blockNum}:`, e);
      }
    }

    // Sample untuk prev 24h
    for (let blockNum = startBlock48h; blockNum < startBlock24h; blockNum += sampleInterval) {
      try {
        const blockData = await rpcCall('eth_getBlockByNumber', [`0x${blockNum.toString(16)}`, false]);
        if (blockData?.transactions) {
          samplesPrev24h.push(blockData.transactions.length);
        }
      } catch (e) {
        console.error(`Error fetching prev block ${blockNum}:`, e);
      }
    }

    // 4. Estimasi total transaksi
    const avgTxPerBlock24h = samples24h.reduce((a, b) => a + b, 0) / Math.max(samples24h.length, 1);
    const totalTx24h = Math.floor(avgTxPerBlock24h * blocksIn24h);

    const avgTxPerBlockPrev = samplesPrev24h.reduce((a, b) => a + b, 0) / Math.max(samplesPrev24h.length, 1);
    const totalTxPrev24h = Math.floor(avgTxPerBlockPrev * blocksIn24h);

    console.log(`Estimated total transactions 24h: ${totalTx24h}`);
    console.log(`Estimated total transactions prev 24h: ${totalTxPrev24h}`);

    // 5. Ambil harga PLS dari DexScreener (WPLS/USDC pair)
    let plsPrice = 0.000034; // fallback
    try {
      const priceRes = await fetch(
        'https://api.dexscreener.com/latest/dex/tokens/0xA1077a294dDE1B09bB078844df40758a5D0f9a27'
      );
      const priceData = await priceRes.json();
      const pulseChainPair = priceData.pairs?.find((p: any) => p.chainId === 'pulsechain');
      if (pulseChainPair?.priceUsd) {
        plsPrice = parseFloat(pulseChainPair.priceUsd);
        console.log(`PLS price: $${plsPrice}`);
      }
    } catch (e) {
      console.error('Error fetching PLS price:', e);
    }

    // 6. Estimasi network volume (approximation menggunakan DEX volume sebagai baseline)
    // Karena on-chain volume tracking yang akurat memerlukan full node indexing,
    // kita gunakan pendekatan hybrid: DEX volume + native transfer estimation
    let networkVolume24h = 0;
    let networkVolumePrev24h = 0;

    try {
      // Ambil DEX volume sebagai komponen utama
      const dexRes = await fetch('https://api.dexscreener.com/latest/dex/pairs/pulsechain');
      const dexData = await dexRes.json();
      const dexVolume = dexData.pairs
        ?.filter((p: any) => (p.volume?.h24 || 0) > 0)
        .reduce((sum: number, p: any) => sum + (p.volume?.h24 || 0), 0) || 0;
      
      const dexVolumePrev = dexData.pairs
        ?.filter((p: any) => (p.volume?.h6 || 0) > 0)
        .reduce((sum: number, p: any) => sum + (p.volume?.h6 || 0), 0) * 4 || 0;

      // Estimasi native transfers (20% dari tx adalah transfer dengan rata-rata 0.5 PLS)
      const nativeTransferEstimate = (totalTx24h * 0.2 * 0.5 * plsPrice);
      const nativeTransferEstimatePrev = (totalTxPrev24h * 0.2 * 0.5 * plsPrice);

      networkVolume24h = dexVolume + nativeTransferEstimate;
      networkVolumePrev24h = dexVolumePrev + nativeTransferEstimatePrev;

      console.log(`DEX volume 24h: $${dexVolume.toFixed(2)}`);
      console.log(`Native transfer estimate: $${nativeTransferEstimate.toFixed(2)}`);
      console.log(`Total network volume 24h: $${networkVolume24h.toFixed(2)}`);
    } catch (e) {
      console.error('Error calculating network volume:', e);
    }

    // 7. Prepare response
    const response: StatsResponse = {
      tx24h: {
        value: totalTx24h,
        prevValue: totalTxPrev24h,
        updatedAt: new Date().toISOString(),
        source: 'rpc+sampling',
      },
      networkVolume24h: {
        value: networkVolume24h,
        prevValue: networkVolumePrev24h,
        updatedAt: new Date().toISOString(),
        source: 'rpc+dex+estimate',
      },
    };

    // Update cache
    cache = { data: response, timestamp: now };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pulse-stats function:', error);
    
    // Return fallback dengan data 0
    const fallbackResponse: StatsResponse = {
      tx24h: {
        value: 0,
        prevValue: 0,
        updatedAt: new Date().toISOString(),
        source: 'fallback',
      },
      networkVolume24h: {
        value: 0,
        prevValue: 0,
        updatedAt: new Date().toISOString(),
        source: 'fallback',
      },
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200, // Still return 200 to prevent UI breaking
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
