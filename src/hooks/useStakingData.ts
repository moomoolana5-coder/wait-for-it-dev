import { useReadContract, useAccount } from 'wagmi';
import { CONTRACTS, STAKING_ABI, ERC20_ABI } from '@/config/contracts';
import { formatUnits } from 'viem';

export const useStakingData = () => {
  const { address } = useAccount();

  // Read global staking data
  const { data: totalStaked } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
    query: { refetchInterval: 5000 },
  });

  const { data: rewardsPerSecond } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'rewardsPerSecond',
    query: { refetchInterval: 5000 },
  });

  const { data: rewardsEndTime } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'rewardsEndTime',
    query: { refetchInterval: 5000 },
  });

  const { data: owner } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'owner',
  });

  const { data: gigacockDecimals } = useReadContract({
    address: CONTRACTS.GIGACOCK,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  const { data: usdcDecimals } = useReadContract({
    address: CONTRACTS.USDC,
    abi: ERC20_ABI,
    functionName: 'decimals',
  });

  // User-specific data
  const { data: userInfo } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'users',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: pendingUSDC, refetch: refetchPending } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'pendingUSDC',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: gigacockBalance } = useReadContract({
    address: CONTRACTS.GIGACOCK,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: allowance } = useReadContract({
    address: CONTRACTS.GIGACOCK,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.STAKING] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const userStaked = (userInfo as [bigint, bigint] | undefined)?.[0] || 0n;
  const decimalsGiga = Number(gigacockDecimals || 18);
  const decimalsUsdc = Number(usdcDecimals || 6);

  // Calculate estimates
  const userShare =
    totalStaked && totalStaked > 0n && userStaked > 0n
      ? Number(formatUnits(userStaked, decimalsGiga)) / Number(formatUnits(totalStaked, decimalsGiga))
      : 0;

  const estHourlyUSDC = rewardsPerSecond
    ? userShare * Number(formatUnits(rewardsPerSecond, decimalsUsdc)) * 3600
    : 0;

  const estDailyUSDC = estHourlyUSDC * 24;

  // Program status
  const now = Math.floor(Date.now() / 1000);
  const isEpochMode = rewardsEndTime && rewardsEndTime > 0n && Number(rewardsEndTime) > now;
  const programStatus = isEpochMode ? 'Epoch' : 'Drip';
  const epochEndsAt = isEpochMode ? Number(rewardsEndTime) : null;

  const isOwner = address && owner ? address.toLowerCase() === (owner as string).toLowerCase() : false;

  return {
    // Raw data
    totalStaked: totalStaked || 0n,
    rewardsPerSecond: rewardsPerSecond || 0n,
    rewardsEndTime: rewardsEndTime || 0n,
    owner: owner as string | undefined,
    gigacockDecimals: decimalsGiga,
    usdcDecimals: decimalsUsdc,
    userStaked,
    pendingUSDC: (pendingUSDC as bigint) || 0n,
    gigacockBalance: (gigacockBalance as bigint) || 0n,
    allowance: (allowance as bigint) || 0n,
    
    // Computed
    userShare,
    estHourlyUSDC,
    estDailyUSDC,
    programStatus,
    epochEndsAt,
    isOwner,
    
    // Meta
    isLoading: false,
    refetch: refetchPending,
  };
};
