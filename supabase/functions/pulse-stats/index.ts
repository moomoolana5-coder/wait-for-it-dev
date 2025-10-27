import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NetworkStat {
  value: number;
  prevValue: number | null;
  updatedAt: string;
  source: string;
}

interface StatsResponse {
  tx24h: NetworkStat;
  networkVolume24h: NetworkStat;
}

interface DebugInfo {
  latestBlock?: number;
  startBlock24h?: number;
  startBlock48h?: number;
  totalBlocks24h?: number;
  sampleRate?: number;
  rpcCalls?: number;
  providers?: string[];
  errors?: string[];
  plsPrice?: number;
}

let cache: { data: StatsResponse | null; timestamp: number } = { data: null, timestamp: 0 };
let debugInfo: DebugInfo = {};
const CACHE_TTL_MS = 30000; // 30 detik
const SAMPLE_INTERVAL = 100; // Sample every 100 blocks

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // Health check endpoint
  if (url.pathname.endsWith('/health')) {
    const rpcUrl = Deno.env.get('PULSECHAIN_RPC_URL');
    const health = {
      rpcOk: !!rpcUrl,
      env: rpcUrl ? ['PULSECHAIN_RPC_URL: OK'] : ['PULSECHAIN_RPC_URL: MISSING'],
      timestamp: new Date().toISOString(),
    };
    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Debug endpoint
  if (url.pathname.endsWith('/debug')) {
    return new Response(JSON.stringify({ ...debugInfo, cache: { age: Date.now() - cache.timestamp, hasData: !!cache.data } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const now = Date.now();
    debugInfo = { errors: [], providers: [], rpcCalls: 0 };
    
    if (cache.data && (now - cache.timestamp) < CACHE_TTL_MS) {
      console.log('Returning cached PulseChain stats');
      return new Response(JSON.stringify(cache.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rpcUrl = Deno.env.get('PULSECHAIN_RPC_URL');
    if (!rpcUrl) {
      debugInfo.errors?.push('PULSECHAIN_RPC_URL not configured');
      throw new Error('PULSECHAIN_RPC_URL not configured');
    }

    console.log('Fetching fresh PulseChain stats from RPC...');

    const rpcCall = async (method: string, params: any[] = []) => {
      debugInfo.rpcCalls = (debugInfo.rpcCalls || 0) + 1;
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.result;
    };

    const latestBlockHex = await rpcCall('eth_blockNumber');
    const latestBlock = parseInt(latestBlockHex, 16);
    console.log(`Latest block: ${latestBlock}`);
    debugInfo.latestBlock = latestBlock;

    const blocksIn24h = Math.floor((24 * 60 * 60) / 3);
    const startBlock24h = Math.max(0, latestBlock - blocksIn24h);
    const startBlock48h = Math.max(0, latestBlock - (blocksIn24h * 2));
    
    debugInfo.startBlock24h = startBlock24h;
    debugInfo.startBlock48h = startBlock48h;
    debugInfo.totalBlocks24h = blocksIn24h;
    debugInfo.sampleRate = SAMPLE_INTERVAL;

    console.log(`Block range 24h: ${startBlock24h} to ${latestBlock}`);
    console.log(`Block range prev 24h: ${startBlock48h} to ${startBlock24h}`);

    const samples24h: number[] = [];
    const samplesPrev24h: number[] = [];
    let nativeTransferValue24h = 0;
    let nativeTransferValuePrev = 0;

    // Sample 24h terakhir
    for (let blockNum = startBlock24h; blockNum <= latestBlock; blockNum += SAMPLE_INTERVAL) {
      try {
        const blockData = await rpcCall('eth_getBlockByNumber', [`0x${blockNum.toString(16)}`, true]);
        if (blockData?.transactions) {
          samples24h.push(blockData.transactions.length);
          
          // Sum native PLS transfers
          for (const tx of blockData.transactions) {
            if (tx.value && tx.value !== '0x0') {
              const valueWei = BigInt(tx.value);
              const valueEth = Number(valueWei) / 1e18;
              nativeTransferValue24h += valueEth;
            }
          }
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error(`Error fetching block ${blockNum}:`, e);
        debugInfo.errors?.push(`Block ${blockNum}: ${errorMsg}`);
      }
    }

    // Sample prev 24h
    for (let blockNum = startBlock48h; blockNum < startBlock24h; blockNum += SAMPLE_INTERVAL) {
      try {
        const blockData = await rpcCall('eth_getBlockByNumber', [`0x${blockNum.toString(16)}`, true]);
        if (blockData?.transactions) {
          samplesPrev24h.push(blockData.transactions.length);
          
          for (const tx of blockData.transactions) {
            if (tx.value && tx.value !== '0x0') {
              const valueWei = BigInt(tx.value);
              const valueEth = Number(valueWei) / 1e18;
              nativeTransferValuePrev += valueEth;
            }
          }
        }
      } catch (e) {
        console.error(`Error fetching prev block ${blockNum}:`, e);
      }
    }

    // Extrapolate sampled data to full 24h
    const samplingFactor = SAMPLE_INTERVAL;
    nativeTransferValue24h *= samplingFactor;
    nativeTransferValuePrev *= samplingFactor;

    const avgTxPerBlock24h = samples24h.reduce((a, b) => a + b, 0) / Math.max(samples24h.length, 1);
    const totalTx24h = Math.floor(avgTxPerBlock24h * blocksIn24h);

    const avgTxPerBlockPrev = samplesPrev24h.reduce((a, b) => a + b, 0) / Math.max(samplesPrev24h.length, 1);
    const totalTxPrev24h = Math.floor(avgTxPerBlockPrev * blocksIn24h);

    console.log(`Sampled ${samples24h.length} blocks for 24h`);
    console.log(`Avg tx per block: ${avgTxPerBlock24h.toFixed(2)}`);
    console.log(`Estimated total transactions 24h: ${totalTx24h}`);
    console.log(`Native PLS transfer value 24h: ${nativeTransferValue24h.toFixed(2)} PLS`);

    let plsPrice = 0.000034;
    debugInfo.providers?.push('DexScreener for PLS price');
    
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
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('Error fetching PLS price:', e);
      debugInfo.errors?.push(`PLS price fetch: ${errorMsg}`);
    }
    
    debugInfo.plsPrice = plsPrice;

    let networkVolume24h = 0;
    let networkVolumePrev24h = 0;
    debugInfo.providers?.push('DexScreener for DEX volume');

    try {
      const dexRes = await fetch('https://api.dexscreener.com/latest/dex/pairs/pulsechain');
      const dexData = await dexRes.json();
      const dexVolume = dexData.pairs
        ?.filter((p: any) => (p.volume?.h24 || 0) > 0)
        .reduce((sum: number, p: any) => sum + (p.volume?.h24 || 0), 0) || 0;
      
      const dexVolumePrev = dexData.pairs
        ?.filter((p: any) => (p.volume?.h6 || 0) > 0)
        .reduce((sum: number, p: any) => sum + (p.volume?.h6 || 0), 0) * 4 || 0;

      const nativeTransferUSD = nativeTransferValue24h * plsPrice;
      const nativeTransferUSDPrev = nativeTransferValuePrev * plsPrice;

      networkVolume24h = dexVolume + nativeTransferUSD;
      networkVolumePrev24h = dexVolumePrev + nativeTransferUSDPrev;

      console.log(`DEX volume 24h: $${dexVolume.toFixed(2)}`);
      console.log(`Native transfer volume (sampled): ${nativeTransferValue24h.toFixed(2)} PLS = $${nativeTransferUSD.toFixed(2)}`);
      console.log(`Total network volume 24h: $${networkVolume24h.toFixed(2)}`);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('Error calculating network volume:', e);
      debugInfo.errors?.push(`Network volume calc: ${errorMsg}`);
    }

    const response: StatsResponse = {
      tx24h: {
        value: totalTx24h,
        prevValue: totalTxPrev24h > 0 ? totalTxPrev24h : null,
        updatedAt: new Date().toISOString(),
        source: 'rpc+sampling',
      },
      networkVolume24h: {
        value: networkVolume24h,
        prevValue: networkVolumePrev24h > 0 ? networkVolumePrev24h : null,
        updatedAt: new Date().toISOString(),
        source: 'approx',
      },
    };

    cache = { data: response, timestamp: now };
    console.log('Stats computed successfully:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error in pulse-stats function:', error);
    debugInfo.errors?.push(`Main error: ${errorMsg}`);
    
    const fallbackResponse: StatsResponse = {
      tx24h: {
        value: 0,
        prevValue: null,
        updatedAt: new Date().toISOString(),
        source: 'error-fallback',
      },
      networkVolume24h: {
        value: 0,
        prevValue: null,
        updatedAt: new Date().toISOString(),
        source: 'error-fallback',
      },
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
