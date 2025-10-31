import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TradeBox } from '@/components/markets/TradeBox';
import { RulesPanel } from '@/components/markets/RulesPanel';
import { ActivityPanel } from '@/components/markets/ActivityPanel';
import { HoldersPanel } from '@/components/markets/HoldersPanel';
import { TimelinePanel } from '@/components/markets/TimelinePanel';
import { useMarketsStore } from '@/stores/markets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { formatUSD, formatTimeRemaining } from '@/lib/format';

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMarket, incrementTrending, init, initialized } = useMarketsStore();
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  useEffect(() => {
    if (id) incrementTrending(id);
  }, [id, incrementTrending]);

  const market = id ? getMarket(id) : undefined;

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Market Not Found</h1>
            <Button onClick={() => navigate('/giga-markets')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = () => {
    switch (market.status) {
      case 'OPEN':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CLOSED':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'RESOLVED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/giga-markets')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Markets
          </Button>

          {/* Hero Image */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            <img
              src={market.cover}
              alt={market.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{market.category}</Badge>
                  <Badge className={getStatusColor()}>{market.status}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTimeRemaining(market.closesAt)}
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{market.title}</h1>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Pool</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold">{formatUSD(market.poolUSD)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Beta Notice */}
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              This platform is currently in <strong>beta testing phase</strong>. Please trade carefully and report any issues you encounter.
            </AlertDescription>
          </Alert>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="holders">Holders</TabsTrigger>
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6">
                  <ActivityPanel market={market} />
                </TabsContent>

                <TabsContent value="holders" className="mt-6">
                  <HoldersPanel market={market} />
                </TabsContent>

                <TabsContent value="rules" className="mt-6">
                  <RulesPanel market={market} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <TradeBox market={market} />
              <TimelinePanel market={market} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketDetail;
