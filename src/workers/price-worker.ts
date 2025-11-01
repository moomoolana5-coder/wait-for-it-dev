type WatchItem = {
  key: string;
  kind: 'DEX' | 'CG';
  contract?: string;
  coingeckoId?: string;
  interval: number;
};

type PriceTick = {
  type: 'PRICE_TICK';
  payload: {
    key: string;
    price: number;
    ts: number;
  };
};

let watchlist = new Map<string, WatchItem>();
let timers = new Map<string, number>();
let retryCount = new Map<string, number>();

const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000];

async function fetchDexPrice(contract: string): Promise<number> {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contract}`);
  if (!res.ok) throw new Error('DEX fetch failed');
  const data = await res.json();
  if (!data.pairs || data.pairs.length === 0) throw new Error('No pairs found');
  
  // Pick pair with highest liquidity
  const topPair = data.pairs.reduce((a: any, b: any) => 
    (parseFloat(a.liquidity?.usd || '0') > parseFloat(b.liquidity?.usd || '0')) ? a : b
  );
  
  return parseFloat(topPair.priceUsd || '0');
}

async function fetchCGPrice(id: string): Promise<number> {
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
  if (!res.ok) throw new Error('CG fetch failed');
  const data = await res.json();
  return data[id]?.usd || 0;
}

async function tick(item: WatchItem) {
  try {
    const now = Date.now();
    let price: number;
    
    if (item.kind === 'DEX' && item.contract) {
      price = await fetchDexPrice(item.contract);
    } else if (item.kind === 'CG' && item.coingeckoId) {
      price = await fetchCGPrice(item.coingeckoId);
    } else {
      throw new Error('Invalid watch item');
    }
    
    // Reset retry count on success
    retryCount.set(item.key, 0);
    
    const msg: PriceTick = {
      type: 'PRICE_TICK',
      payload: { key: item.key, price, ts: now }
    };
    
    (self as any).postMessage(msg);
  } catch (error) {
    const tries = (retryCount.get(item.key) || 0) + 1;
    retryCount.set(item.key, tries);
    
    if (tries < MAX_RETRIES) {
      const delay = RETRY_DELAYS[tries - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      setTimeout(() => tick(item), delay);
    } else {
      console.error(`Max retries reached for ${item.key}`);
      retryCount.set(item.key, 0);
    }
  }
}

function startWatching(item: WatchItem) {
  // Clear existing timer
  const existingTimer = timers.get(item.key);
  if (existingTimer) {
    clearInterval(existingTimer);
  }
  
  // Initial tick
  tick(item);
  
  // Schedule recurring ticks
  const timer = setInterval(() => tick(item), item.interval) as any;
  timers.set(item.key, timer);
}

function stopWatching(key: string) {
  const timer = timers.get(key);
  if (timer) {
    clearInterval(timer);
    timers.delete(key);
  }
  retryCount.delete(key);
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  if (type === 'WATCH_SET') {
    const newWatchlist: WatchItem[] = payload;
    
    // Stop watching items not in new list
    for (const key of watchlist.keys()) {
      if (!newWatchlist.find(item => item.key === key)) {
        stopWatching(key);
        watchlist.delete(key);
      }
    }
    
    // Start watching new items
    for (const item of newWatchlist) {
      const existing = watchlist.get(item.key);
      if (!existing || existing.interval !== item.interval) {
        watchlist.set(item.key, item);
        startWatching(item);
      }
    }
  } else if (type === 'WATCH_STOP') {
    for (const key of watchlist.keys()) {
      stopWatching(key);
    }
    watchlist.clear();
  }
};
