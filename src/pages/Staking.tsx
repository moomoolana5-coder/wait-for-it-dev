import { ChainGuard } from '@/components/staking/ChainGuard';
import { StakingDashboard } from '@/components/staking/StakingDashboard';
import { StakeForm } from '@/components/staking/StakeForm';
import { AdminPanel } from '@/components/staking/AdminPanel';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Staking() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Giga Staking
          </h1>
          <p className="text-xl text-muted-foreground">
            Stake GIGACOCK, Earn USDC
          </p>
        </div>

        <ChainGuard>
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Dashboard Stats */}
            <StakingDashboard />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Stake/Unstake Form */}
              <StakeForm />

              {/* Admin Panel (only visible to owner) */}
              <AdminPanel />
            </div>
          </div>
        </ChainGuard>
      </main>

      <Footer />
    </div>
  );
}
