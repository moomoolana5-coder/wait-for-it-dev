import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStakingData } from '@/hooks/useStakingData';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, STAKING_ABI } from '@/config/contracts';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AdminPanel = () => {
  const { isOwner, usdcDecimals, rewardsPerSecond } = useStakingData();
  
  const [epochAmount, setEpochAmount] = useState('');
  const [epochDuration, setEpochDuration] = useState('');
  const [dripRate, setDripRate] = useState('');
  const [sweepTo, setSweepTo] = useState('');
  const [sweepAmount, setSweepAmount] = useState('');

  const { writeContract: writeFund, data: fundHash } = useWriteContract();
  const { writeContract: writeSetRPS, data: rpsHash } = useWriteContract();
  const { writeContract: writeSweep, data: sweepHash } = useWriteContract();

  const { isLoading: isFunding } = useWaitForTransactionReceipt({ hash: fundHash });
  const { isLoading: isSettingRPS } = useWaitForTransactionReceipt({ hash: rpsHash });
  const { isLoading: isSweeping } = useWaitForTransactionReceipt({ hash: sweepHash });

  if (!isOwner) {
    return null;
  }

  const handleFundEpoch = async () => {
    try {
      const amount = parseUnits(epochAmount, usdcDecimals);
      const duration = BigInt(epochDuration);
      writeFund({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'fund',
        args: [amount, duration],
      } as any);
      toast.info('Fund transaction submitted');
      setEpochAmount('');
      setEpochDuration('');
    } catch (error: any) {
      toast.error(error.message || 'Fund failed');
    }
  };

  const handleSetDrip = async () => {
    try {
      const rps = parseUnits(dripRate, usdcDecimals);
      writeSetRPS({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'setRewardsPerSecond',
        args: [rps],
      } as any);
      toast.info('Set rewards per second submitted');
      setDripRate('');
    } catch (error: any) {
      toast.error(error.message || 'Set RPS failed');
    }
  };

  const handleSweep = async () => {
    if (!confirm('Are you sure you want to sweep USDC from the contract?')) return;
    try {
      const amount = parseUnits(sweepAmount, usdcDecimals);
      writeSweep({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'sweepUSDC',
        args: [sweepTo as `0x${string}`, amount],
      } as any);
      toast.info('Sweep transaction submitted');
      setSweepTo('');
      setSweepAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Sweep failed');
    }
  };

  const computedRPS = epochAmount && epochDuration
    ? (parseFloat(epochAmount) / parseFloat(epochDuration)).toFixed(8)
    : '0';

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Admin Panel</h3>
      </div>

      <Tabs defaultValue="epoch">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="epoch">Epoch</TabsTrigger>
          <TabsTrigger value="drip">Drip</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
        </TabsList>

        <TabsContent value="epoch" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">USDC Amount</label>
            <Input
              type="number"
              placeholder="10000"
              value={epochAmount}
              onChange={(e) => setEpochAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Duration (seconds)</label>
            <Input
              type="number"
              placeholder="86400"
              value={epochDuration}
              onChange={(e) => setEpochDuration(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              1 day = 86400s, 7 days = 604800s
            </p>
          </div>

          {epochAmount && epochDuration && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm">
                Computed RPS: <span className="font-bold">{computedRPS}</span> USDC/sec
              </p>
            </div>
          )}

          <Button
            onClick={handleFundEpoch}
            disabled={isFunding || !epochAmount || !epochDuration}
            className="w-full"
          >
            {isFunding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Fund Epoch
          </Button>
        </TabsContent>

        <TabsContent value="drip" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Rewards Per Second (USDC)</label>
            <Input
              type="number"
              placeholder="0.001"
              value={dripRate}
              onChange={(e) => setDripRate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current: {rewardsPerSecond ? formatUnits(rewardsPerSecond, usdcDecimals) : '0'} USDC/sec
            </p>
          </div>

          <Button
            onClick={handleSetDrip}
            disabled={isSettingRPS || !dripRate}
            className="w-full"
          >
            {isSettingRPS ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Set Drip Rate
          </Button>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-200">
              Setting rewards per second switches to drip mode (no end time)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={sweepTo}
              onChange={(e) => setSweepTo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Amount (USDC)</label>
            <Input
              type="number"
              placeholder="100"
              value={sweepAmount}
              onChange={(e) => setSweepAmount(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSweep}
            disabled={isSweeping || !sweepTo || !sweepAmount}
            variant="destructive"
            className="w-full"
          >
            {isSweeping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sweep USDC
          </Button>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-200">
              Warning: Sweeping USDC will reduce available rewards
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
