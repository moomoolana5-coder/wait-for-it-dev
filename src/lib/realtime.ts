export type RealtimeEvent = 
  | { type: 'TRADE'; payload: { marketId: string } }
  | { type: 'MARKET_CREATE'; payload: { marketId: string } }
  | { type: 'RESOLVE'; payload: { marketId: string; winner: string } }
  | { type: 'FAUCET'; payload: { walletId: string } }
  | { type: 'PRICE_UPDATE'; payload: { marketId: string; price: number } };

export interface RealtimeBus {
  publish(event: RealtimeEvent): void;
  subscribe(callback: (event: RealtimeEvent) => void): () => void;
  close(): void;
}

class BroadcastChannelBus implements RealtimeBus {
  private channel: BroadcastChannel;
  private listeners: Set<(event: RealtimeEvent) => void>;

  constructor(channelName: string) {
    this.channel = new BroadcastChannel(channelName);
    this.listeners = new Set();
    
    this.channel.onmessage = (event) => {
      this.listeners.forEach(listener => listener(event.data));
    };
  }

  publish(event: RealtimeEvent): void {
    this.channel.postMessage(event);
  }

  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  close(): void {
    this.channel.close();
    this.listeners.clear();
  }
}

class LocalStorageBus implements RealtimeBus {
  private key: string;
  private listeners: Set<(event: RealtimeEvent) => void>;

  constructor(key: string) {
    this.key = key;
    this.listeners = new Set();
    
    window.addEventListener('storage', this.handleStorage);
  }

  private handleStorage = (e: StorageEvent) => {
    if (e.key === this.key && e.newValue) {
      try {
        const event = JSON.parse(e.newValue);
        this.listeners.forEach(listener => listener(event));
      } catch {}
    }
  };

  publish(event: RealtimeEvent): void {
    localStorage.setItem(this.key, JSON.stringify(event));
    localStorage.removeItem(this.key); // Trigger storage event
  }

  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  close(): void {
    window.removeEventListener('storage', this.handleStorage);
    this.listeners.clear();
  }
}

export function createRealtimeBus(name: string): RealtimeBus {
  // Use BroadcastChannel if available, fallback to localStorage
  if (typeof BroadcastChannel !== 'undefined') {
    return new BroadcastChannelBus(name);
  }
  return new LocalStorageBus(`rt_${name}`);
}
