import { Card } from '@/components/ui/card';
import { useStakingData } from '@/hooks/useStakingData';
import { useGigacockPrice } from '@/hooks/useGigacockPrice';
import { formatUnits } from 'viem';
import { Loader2, TrendingUp, Wallet, Gift, Activity, DollarSign } from 'lucide-react';
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

  const { data: priceData, isLoading: isPriceLoading } = useGigacockPrice();

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
      title: 'GIGACOCK Price',
      value: priceData?.priceUsd ? `$${priceData.priceUsd.toFixed(6)}` : isPriceLoading ? '...' : 'N/A',
      suffix: priceData?.priceChange24h ? `${priceData.priceChange24h > 0 ? '+' : ''}${priceData.priceChange24h.toFixed(2)}%` : '',
      icon: DollarSign,
      color: priceData?.priceChange24h && priceData.priceChange24h > 0 ? 'text-green-500' : 'text-red-500',
    },
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPrice = stat.title === 'GIGACOCK Price';
        return (
          <Card key={stat.title} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">
                    {isPrice ? stat.value : parseFloat(stat.value).toFixed(stat.suffix === 'USDC' ? 2 : 4)}
                  </h3>
                  {!isPrice && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                </div>
                {isPrice && stat.suffix && (
                  <span className={`text-xs ${stat.color}`}>{stat.suffix}</span>
                )}
              </div>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
