import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OracleService } from '@/lib/oracles';
import { CheckCircle2, XCircle, Activity, Clock, Info } from 'lucide-react';

type ServiceStatus = {
  name: string;
  provider: 'DEXSCREENER' | 'COINGECKO';
  description: string;
  status: 'online' | 'offline' | 'checking';
  latency: number | null;
  lastCheck: string;
};

const Integrations = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'DexScreener',
      provider: 'DEXSCREENER',
      description: 'Provides real-time price data for PLSX, WPLS, HEX, INC on PulseChain',
      status: 'checking',
      latency: null,
      lastCheck: new Date().toISOString(),
    },
    {
      name: 'CoinGecko',
      provider: 'COINGECKO',
      description: 'Provides price data for BTC, ETH, SOL, BNB',
      status: 'checking',
      latency: null,
      lastCheck: new Date().toISOString(),
    },
  ]);

  const checkServiceHealth = async (service: ServiceStatus) => {
    const startTime = Date.now();
    
    try {
      let result;
      if (service.provider === 'DEXSCREENER') {
        // Test with PLSX pair
        result = await OracleService.getDexScreenerPrice('0x95B303987A60C71504D99Aa1b13B4DA07b0790ab');
      } else {
        // Test with Bitcoin
        result = await OracleService.getCoinGeckoPrice('bitcoin');
      }
      
      const latency = Date.now() - startTime;
      
      return {
        ...service,
        status: result ? 'online' : 'offline',
        latency: result ? latency : null,
        lastCheck: new Date().toISOString(),
      } as ServiceStatus;
    } catch {
      return {
        ...service,
        status: 'offline',
        latency: null,
        lastCheck: new Date().toISOString(),
      } as ServiceStatus;
    }
  };

  useEffect(() => {
    const checkAll = async () => {
      const results = await Promise.all(
        services.map(service => checkServiceHealth(service))
      );
      setServices(results);
    };

    checkAll();
    
    // Check every 30 seconds
    const interval = setInterval(checkAll, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLatency = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatLastCheck = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              API Integrations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time status monitoring for external data providers
            </p>
          </div>

          {/* Info Banner */}
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-500">
              <strong>No API Keys Required</strong> – Uses public APIs. If degraded, app continues with Points-only trading.
            </AlertDescription>
          </Alert>

          {/* Service Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card key={service.name} className="glass-card border-border/50 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  
                  {service.status === 'online' && (
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
                  )}
                  {service.status === 'offline' && (
                    <XCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                  )}
                  {service.status === 'checking' && (
                    <Activity className="h-6 w-6 text-muted-foreground animate-pulse flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={service.status === 'online' ? 'default' : 'destructive'}
                      className={
                        service.status === 'online'
                          ? 'bg-success/20 text-success border-success/30'
                          : service.status === 'offline'
                          ? 'bg-destructive/20 text-destructive border-destructive/30'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Latency</span>
                    <span className={`text-sm font-medium ${
                      service.latency && service.latency < 500 ? 'text-success' :
                      service.latency && service.latency < 2000 ? 'text-yellow-500' :
                      'text-destructive'
                    }`}>
                      {formatLatency(service.latency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Check
                    </span>
                    <span className="text-sm font-medium">
                      {formatLastCheck(service.lastCheck)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Endpoint:</strong> {service.provider === 'DEXSCREENER' ? 'api.dexscreener.com' : 'api.coingecko.com'}</p>
                    <p><strong>Type:</strong> Public API (No authentication)</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Overall Status */}
          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Overall Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Total Services</span>
                <span className="font-bold">{services.length}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Online</span>
                <span className="font-bold text-success">
                  {services.filter(s => s.status === 'online').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Offline</span>
                <span className="font-bold text-destructive">
                  {services.filter(s => s.status === 'offline').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Average Latency</span>
                <span className="font-bold">
                  {formatLatency(
                    services
                      .filter(s => s.latency !== null)
                      .reduce((sum, s) => sum + (s.latency || 0), 0) /
                      services.filter(s => s.latency !== null).length || null
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">About API Integrations</h3>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Giga Markets uses public APIs to fetch real-time price data for prediction market resolution. 
                These integrations enable automatic price checks and market settlements.
              </p>
              
              <div className="space-y-2">
                <p className="font-medium text-foreground">Supported Assets:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>PulseChain tokens (PLSX, WPLS, HEX, INC) via DexScreener</li>
                  <li>Major cryptocurrencies (BTC, ETH, SOL, BNB) via CoinGecko</li>
                </ul>
              </div>
              
              <p>
                All APIs are public and require no authentication. If an API is temporarily unavailable, 
                the app continues to function with Points-based trading while price data is unavailable.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Integrations;
