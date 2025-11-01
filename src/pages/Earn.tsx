import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useBetaTest } from '@/hooks/useBetaTest';
import { useWalletBetaStore } from '@/stores/walletBeta';
import { useEarningsStore } from '@/stores/earnings';
import { useReferralsStore } from '@/stores/referrals';
import { usePositionsStore } from '@/stores/positions';
import { formatPoints, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Copy, 
  Check,
  Wallet,
  History,
  Trophy
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import coinIcon from '@/assets/coin-icon.png';

export default function Earn() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useBetaTest();
  const { wallet, addPoints, claimFaucet, init: initWallet } = useWalletBetaStore();
  const { 
    earnings, 
    initialized: earningsInit,
    getTotalUnclaimed, 
    getTotalEarned,
    claimEarnings,
    init: initEarnings,
    subscribeToEarnings
  } = useEarningsStore();
  const { 
    referralCode, 
    stats,
    initialized: referralsInit,
    init: initReferrals,
    generateReferralCode,
    getReferralStats
  } = useReferralsStore();
  const { positions, initialized: positionsInit, init: initPositions } = usePositionsStore();

  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimingEarnings, setIsClaimingEarnings] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Initialize stores when user is available
  useEffect(() => {
    if (user?.id) {
      initWallet(user.id);
      
      if (!earningsInit) {
        initEarnings(user.id);
      }
      if (!referralsInit) {
        initReferrals(user.id);
      }
      if (!positionsInit) {
        initPositions(user.id);
      }
      
      const unsubEarnings = subscribeToEarnings(user.id);
      
      return () => {
        unsubEarnings();
      };
    }
  }, [user, earningsInit, referralsInit, positionsInit]);

  const handleClaimFaucet = async () => {
    if (!user) return;
    
    setIsClaiming(true);
    try {
      await claimFaucet(user.id);
      toast.success('Claimed 10,000 points!', {
        description: 'You can claim again in 24 hours'
      });
    } catch (error: any) {
      toast.error('Claim failed', {
        description: error.message
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimEarnings = async () => {
    if (!user) return;
    
    setIsClaimingEarnings(true);
    try {
      const amount = await claimEarnings(user.id);
      if (amount > 0) {
        await addPoints(user.id, amount);
        toast.success(`Claimed ${formatPoints(amount)}!`, {
          description: 'Earnings added to your balance'
        });
      }
    } catch (error: any) {
      toast.error('Claim failed', {
        description: error.message
      });
    } finally {
      setIsClaimingEarnings(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!user) return;
    
    try {
      await generateReferralCode(user.id, null);
      await getReferralStats(user.id);
      toast.success('Referral code generated!');
    } catch (error: any) {
      toast.error('Failed to generate code', {
        description: error.message
      });
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalUnclaimed = getTotalUnclaimed();
  const totalEarned = getTotalEarned();
  const activePositions = positions.filter(p => !p.claimed && p.shares > 0);

  // Show loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Earn Points</h1>
          <p className="text-muted-foreground">
            Multiple ways to earn and maximize your rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-5 w-5 text-primary" />
              <Badge variant="outline">Balance</Badge>
            </div>
            <p className="text-3xl font-bold">{formatPoints(wallet.points)}</p>
            <p className="text-sm text-muted-foreground mt-1">Available Points</p>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <Badge variant="outline">Profit/Loss</Badge>
            </div>
            <p className="text-3xl font-bold">{formatPoints(wallet.pnlRealized)}</p>
            <p className="text-sm text-muted-foreground mt-1">Realized P/L</p>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Gift className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="bg-primary/20 text-primary">Pending</Badge>
            </div>
            <p className="text-3xl font-bold text-primary">{formatPoints(totalUnclaimed)}</p>
            <p className="text-sm text-muted-foreground mt-1">Unclaimed Earnings</p>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <Badge variant="outline">Lifetime</Badge>
            </div>
            <p className="text-3xl font-bold">{formatPoints(totalEarned)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Earned</p>
          </Card>
        </div>

        <Tabs defaultValue="faucet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="faucet">Faucet</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Faucet Tab */}
          <TabsContent value="faucet" className="space-y-6">
            <Card className="glass-card p-8 max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                  <img 
                    src={coinIcon} 
                    alt="Coin" 
                    className="h-24 w-24 relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Daily Faucet</h2>
                  <p className="text-muted-foreground">
                    Claim 10,000 free points every 24 hours to start trading
                  </p>
                </div>

                {wallet.lastFaucetClaim && (
                  <div className="text-sm text-muted-foreground">
                    Last claimed: {formatDate(wallet.lastFaucetClaim)}
                  </div>
                )}

                <Button 
                  size="lg" 
                  onClick={handleClaimFaucet}
                  disabled={isClaiming}
                  className="w-full max-w-sm glow-yes"
                >
                  {isClaiming ? 'Claiming...' : 'Claim 10,000 Points'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referral Code */}
              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Your Referral Code</h3>
                </div>

                {referralCode ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={`${window.location.origin}/auth?ref=${referralCode}`}
                        className="glass-card"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyReferralLink}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium mb-2">Referral Rewards:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• You get: <span className="text-primary font-semibold">500 points</span> per referral</li>
                        <li>• They get: <span className="text-primary font-semibold">1,000 points</span> bonus</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Generate your unique referral code</p>
                    <Button onClick={handleGenerateCode}>
                      Generate Code
                    </Button>
                  </div>
                )}
              </Card>

              {/* Referral Stats */}
              <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Referral Stats</h3>
                </div>

                {stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                        <p className="text-sm text-muted-foreground">Total Referrals</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{formatPoints(stats.totalEarned)}</p>
                        <p className="text-sm text-muted-foreground">Earned</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">{formatPoints(stats.pendingEarnings)}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No referral activity yet
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Active Positions</h3>
                </div>
                {totalUnclaimed > 0 && (
                  <Button 
                    onClick={handleClaimEarnings}
                    disabled={isClaimingEarnings}
                    className="glow-yes"
                  >
                    {isClaimingEarnings ? 'Claiming...' : `Claim ${formatPoints(totalUnclaimed)}`}
                  </Button>
                )}
              </div>

              {activePositions.length > 0 ? (
                <div className="space-y-3">
                  {activePositions.map((position) => (
                    <div 
                      key={position.id}
                      className="p-4 bg-card/50 rounded-lg border border-border/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">Market: {position.marketId.substring(0, 20)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {position.shares.toFixed(2)} shares • {position.side}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPoints(position.costBasis)}</p>
                        <p className="text-sm text-muted-foreground">Cost Basis</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active positions yet</p>
                  <Button onClick={() => navigate('/giga-markets')}>
                    Start Trading
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <History className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Earnings History</h3>
              </div>

              {earnings.length > 0 ? (
                <div className="space-y-2">
                  {earnings.map((earning) => (
                    <div 
                      key={earning.id}
                      className="p-4 bg-card/50 rounded-lg border border-border/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{earning.earningType.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(earning.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          +{formatPoints(earning.amountPts)}
                        </p>
                        <Badge variant={earning.claimed ? "outline" : "default"} className="text-xs">
                          {earning.claimed ? 'Claimed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No earnings history yet
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
