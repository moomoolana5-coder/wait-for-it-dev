import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStakingData } from '@/hooks/useStakingData';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, STAKING_ABI, ERC20_ABI } from '@/config/contracts';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

export const StakeForm = () => {
  const {
    gigacockBalance,
    userStaked,
    pendingUSDC,
    allowance,
    gigacockDecimals,
    usdcDecimals,
    estHourlyUSDC,
    estDailyUSDC,
    refetch,
  } = useStakingData();

  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeDeposit, data: depositHash } = useWriteContract();
  const { writeContract: writeWithdraw, data: withdrawHash } = useWriteContract();
  const { writeContract: writeClaim, data: claimHash } = useWriteContract();
  const { writeContract: writeEmergency, data: emergencyHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawing } = useWaitForTransactionReceipt({ hash: withdrawHash });
  const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash });
  const { isLoading: isEmergencyWithdrawing } = useWaitForTransactionReceipt({ hash: emergencyHash });

  const needsApproval = stakeAmount && parseUnits(stakeAmount, gigacockDecimals) > (allowance || 0n);

  const handleApprove = async () => {
    try {
      const amount = parseUnits(stakeAmount, gigacockDecimals);
      writeApprove({
        address: CONTRACTS.GIGACOCK,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.STAKING, amount],
      } as any);
      toast.info('Approval transaction submitted');
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    }
  };

  const handleStake = async () => {
    try {
      const amount = parseUnits(stakeAmount, gigacockDecimals);
      writeDeposit({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'deposit',
        args: [amount],
      } as any);
      toast.info('Stake transaction submitted');
      setStakeAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Stake failed');
    }
  };

  const handleUnstake = async () => {
    try {
      const amount = parseUnits(unstakeAmount, gigacockDecimals);
      writeWithdraw({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'withdraw',
        args: [amount],
      } as any);
      toast.info('Unstake transaction submitted');
      setUnstakeAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Unstake failed');
    }
  };

  const handleClaim = async () => {
    try {
      writeClaim({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'claim',
      } as any);
      toast.info('Claim transaction submitted');
    } catch (error: any) {
      toast.error(error.message || 'Claim failed');
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!confirm('Emergency withdraw will forfeit all pending rewards. Continue?')) return;
    try {
      writeEmergency({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'emergencyWithdraw',
      } as any);
      toast.info('Emergency withdraw submitted');
    } catch (error: any) {
      toast.error(error.message || 'Emergency withdraw failed');
    }
  };

  return (
    <Card className="glass-card p-6">
      <Tabs defaultValue="stake">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="unstake">Unstake</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-muted-foreground">Amount to Stake</label>
              <span className="text-sm text-muted-foreground">
                Balance: {gigacockBalance ? formatUnits(gigacockBalance, gigacockDecimals) : '0'} GIGACOCK
              </span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={() =>
                setStakeAmount(gigacockBalance ? formatUnits(gigacockBalance, gigacockDecimals) : '0')
              }
            >
              Max
            </Button>
          </div>

          {needsApproval ? (
            <Button onClick={handleApprove} disabled={isApproving || !stakeAmount} className="w-full">
              {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve GIGACOCK
            </Button>
          ) : (
            <Button
              onClick={handleStake}
              disabled={isDepositing || !stakeAmount || parseUnits(stakeAmount || '0', gigacockDecimals) > (gigacockBalance || 0n)}
              className="w-full"
            >
              {isDepositing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Stake
            </Button>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Estimated Earnings</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hourly:</span>
              <span>{estHourlyUSDC.toFixed(4)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily:</span>
              <span>{estDailyUSDC.toFixed(4)} USDC</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unstake" className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-muted-foreground">Amount to Unstake</label>
              <span className="text-sm text-muted-foreground">
                Staked: {userStaked ? formatUnits(userStaked, gigacockDecimals) : '0'} GIGACOCK
              </span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={() => setUnstakeAmount(userStaked ? formatUnits(userStaked, gigacockDecimals) : '0')}
            >
              Max
            </Button>
          </div>

          <Button
            onClick={handleUnstake}
            disabled={isWithdrawing || !unstakeAmount || parseUnits(unstakeAmount || '0', gigacockDecimals) > (userStaked || 0n)}
            className="w-full"
          >
            {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Unstake
          </Button>

          <div className="space-y-2">
            <Button
              onClick={handleClaim}
              disabled={isClaiming || !pendingUSDC || pendingUSDC === 0n}
              variant="secondary"
              className="w-full"
            >
              {isClaiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Claim {pendingUSDC ? formatUnits(pendingUSDC, usdcDecimals) : '0'} USDC
            </Button>

            <Button
              onClick={handleEmergencyWithdraw}
              disabled={isEmergencyWithdrawing || !userStaked || userStaked === 0n}
              variant="destructive"
              className="w-full"
            >
              {isEmergencyWithdrawing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Emergency Withdraw
            </Button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              Emergency withdraw forfeits all pending rewards
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
