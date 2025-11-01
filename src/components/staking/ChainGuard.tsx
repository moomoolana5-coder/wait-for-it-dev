import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { pulsechain } from 'wagmi/chains';

export const ChainGuard = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="glass-card p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to access the staking platform
          </p>
        </Card>
      </div>
    );
  }

  if (chainId !== pulsechain.id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="glass-card p-8 max-w-md text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-2xl font-bold">Wrong Network</h2>
          <p className="text-muted-foreground">
            Please switch to PulseChain Mainnet to use this staking platform
          </p>
          <Button
            onClick={() => switchChain({ chainId: pulsechain.id })}
            className="w-full"
          >
            Switch to PulseChain
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
