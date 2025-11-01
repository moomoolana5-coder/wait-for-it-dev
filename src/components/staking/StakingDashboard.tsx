import { Card } from '@/components/ui/card';
import { useStakingData } from '@/hooks/useStakingData';
import { formatUnits } from 'viem';
import { Loader2, TrendingUp, Wallet, Gift, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export const StakingDashboard = () => {
  const {
    userStaked,
    pendingUSDC,
    totalStaked,
    programStatus,
    epochEndsAt,
    gigacockDecimals,
    usdcDecimals,
    isLoading,
  } = useStakingData();

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!epochEndsAt) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = epochEndsAt - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [epochEndsAt]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Your Staked',
      value: userStaked ? formatUnits(userStaked, gigacockDecimals) : '0',
      suffix: 'GIGACOCK',
      icon: Wallet,
      color: 'text-blue-500',
    },
    {
      title: 'Your Pending',
      value: pendingUSDC ? formatUnits(pendingUSDC, usdcDecimals) : '0',
      suffix: 'USDC',
      icon: Gift,
      color: 'text-green-500',
    },
    {
      title: 'Total Staked',
      value: totalStaked ? formatUnits(totalStaked, gigacockDecimals) : '0',
      suffix: 'GIGACOCK',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
    {
      title: 'Program Status',
      value: programStatus,
      suffix: epochEndsAt && timeLeft ? `(${timeLeft})` : '',
      icon: Activity,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">
                    {parseFloat(stat.value).toFixed(stat.suffix === 'USDC' ? 2 : 4)}
                  </h3>
                  <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                </div>
              </div>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
