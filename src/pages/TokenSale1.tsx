import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { pulsechain } from "wagmi/chains";
import { toast } from "sonner";
import { Wallet, Settings, ShoppingCart, RefreshCw, Clock } from "lucide-react";

const TOKEN_ADDRESS = "0x818ec0672F65B634F94F234aC132678009064CdF" as const;
const PRESALE_ADDRESS = "0xf03324d4a2518f4279543068F2C4248F1f732d3F" as const;
const USDC_ADDRESS = "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07" as const;

// Set presale start time - 2 days from now
const PRESALE_START_TIME = new Date("2025-10-31T12:00:00Z").getTime();

const PRESALE_ABI = [
  { inputs: [], name: "hardcapTokens", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "priceTokensPerUSDC", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "soldTokens", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "isLive", outputs: [{ type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "_hardcap", type: "uint256" }], name: "setHardcapTokens", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_price", type: "uint256" }], name: "setPrice", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_isLive", type: "bool" }], name: "setLive", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "usdcAmount", type: "uint256" }], name: "buy", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

const TokenSale1 = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [ownerHardcap, setOwnerHardcap] = useState("");
  const [ownerPrice, setOwnerPrice] = useState("");
  const [buyerAmount, setBuyerAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: hardcapTokens, refetch: refetchHardcap } = useReadContract({
    address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "hardcapTokens",
  });

  const { data: priceTokensPerUSDC, refetch: refetchPrice } = useReadContract({
    address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "priceTokensPerUSDC",
  });

  const { data: soldTokens, refetch: refetchSold } = useReadContract({
    address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "soldTokens",
  });

  const { data: isLive, refetch: refetchLive } = useReadContract({
    address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "isLive",
  });

  const { data: owner } = useReadContract({
    address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "owner",
  });

  const { data: presaleTokenBalance } = useReadContract({
    address: TOKEN_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf", args: [PRESALE_ADDRESS],
  });

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "allowance",
    args: address ? [address, PRESALE_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  const { data: userUsdcBalance, refetch: refetchUserUsdc } = useReadContract({
    address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: userTokenBalance, refetch: refetchUserTokens } = useReadContract({
    address: TOKEN_ADDRESS, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetchHardcap(); refetchPrice(); refetchSold(); refetchLive(); refetchAllowance();
      refetchUserUsdc(); refetchUserTokens();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = PRESALE_START_TIME - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();
  const hardcapNum = hardcapTokens ? Number(formatUnits(hardcapTokens, 18)) : 0;
  const soldNum = soldTokens ? Number(formatUnits(soldTokens, 18)) : 0;
  const progressPercent = hardcapNum > 0 ? (soldNum / hardcapNum) * 100 : 0;
  const priceNum = priceTokensPerUSDC ? Number(formatUnits(priceTokensPerUSDC, 18)) : 0;
  const presaleBalanceNum = presaleTokenBalance ? Number(formatUnits(presaleTokenBalance, 18)) : 0;
  const buyerAmountNum = parseFloat(buyerAmount || "0");
  const isValidBuy = buyerAmountNum >= 1;
  const estimatedTokens = isValidBuy ? buyerAmountNum * priceNum : 0;
  const hasAllowance = usdcAllowance && usdcAllowance >= parseUnits(buyerAmount || "0", 6);
  const canBuy = isValidBuy && hasAllowance && !isApproving;
  const userUsdcNum = userUsdcBalance ? Number(formatUnits(userUsdcBalance, 6)) : 0;
  const userTokenNum = userTokenBalance ? Number(formatUnits(userTokenBalance, 18)) : 0;

  const handleSetHardcap = async () => {
    try {
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setHardcapTokens", args: [parseUnits(ownerHardcap, 18)], account: address!, chain: pulsechain });
      toast.success("Hardcap updated!");
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  const handleSetPrice = async () => {
    try {
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setPrice", args: [parseUnits(ownerPrice, 18)], account: address!, chain: pulsechain });
      toast.success("Price updated!");
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  const handleSetLive = async (live: boolean) => {
    try {
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setLive", args: [live], account: address!, chain: pulsechain });
      toast.success(`Presale ${live ? "activated" : "deactivated"}!`);
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  const handleApplyTargetSettings = async () => {
    try {
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setHardcapTokens", args: [parseUnits("500000", 18)], account: address!, chain: pulsechain });
      toast.success("Hardcap set to 500,000");
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setPrice", args: [parseUnits("100", 18)], account: address!, chain: pulsechain });
      toast.success("Price set to $0.01 per token");
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setLive", args: [true], account: address!, chain: pulsechain });
      toast.success("✅ Presale configuration complete!");
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  const handleApproveUSDC = async () => {
    if (!isValidBuy) return;
    setIsApproving(true);
    try {
      const hash = await writeContractAsync({ 
        address: USDC_ADDRESS, 
        abi: ERC20_ABI, 
        functionName: "approve", 
        args: [PRESALE_ADDRESS, parseUnits(buyerAmount, 6)], 
        account: address!, 
        chain: pulsechain 
      });
      toast.success("Approval submitted, waiting for confirmation...");
      // Wait a bit for the transaction to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));
      await refetchAllowance();
      toast.success("USDC approved!");
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    } finally {
      setIsApproving(false);
    }
  };

  const handleBuy = async () => {
    if (!canBuy || !confirm(`Confirm ${buyerAmount} USDC for ≈${estimatedTokens.toFixed(2)} tokens?`)) return;
    try {
      await writeContractAsync({ 
        address: PRESALE_ADDRESS, 
        abi: PRESALE_ABI, 
        functionName: "buy", 
        args: [parseUnits(buyerAmount, 6)], 
        account: address!, 
        chain: pulsechain 
      });
      toast.success("Purchase successful!");
      setBuyerAmount("");
      await refetchSold();
      await refetchAllowance();
      await refetchUserUsdc();
      await refetchUserTokens();
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/95 to-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">PulseChain Presale Console</h1>
          <p className="text-sm text-muted-foreground">Network: PulseChain (Chain ID: 369)</p>
        </div>

        <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Presale Starts In</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
                <div className="text-sm text-muted-foreground mt-1">Days</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-sm text-muted-foreground mt-1">Hours</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-sm text-muted-foreground mt-1">Minutes</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur">
                <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-sm text-muted-foreground mt-1">Seconds</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {presaleBalanceNum < 500000 && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10"><CardContent className="p-4">
            <p className="text-sm">⚠️ Top up presale contract with ≥500,000 tokens</p>
          </CardContent></Card>
        )}

        <div className="max-w-4xl mx-auto">
          {isOwner && (
            <Card className="border-accent/20 bg-card/50 backdrop-blur-xl mb-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Owner Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Hardcap (tokens)</Label><div className="flex gap-2 mt-1"><Input type="number" placeholder="500000" value={ownerHardcap} onChange={(e) => setOwnerHardcap(e.target.value)} /><Button onClick={handleSetHardcap}>Set</Button></div></div>
                <div><Label>Price (tokens/USDC)</Label><div className="flex gap-2 mt-1"><Input type="number" placeholder="100" value={ownerPrice} onChange={(e) => setOwnerPrice(e.target.value)} /><Button onClick={handleSetPrice}>Set</Button></div></div>
                <div className="flex gap-2"><Button onClick={() => handleSetLive(true)} className="flex-1">Set LIVE</Button><Button variant="secondary" onClick={() => handleSetLive(false)} className="flex-1">Set OFF</Button></div>
                <Button onClick={handleApplyTargetSettings} className="w-full bg-gradient-primary">Apply Target Settings</Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Presale Dashboard
                </CardTitle>
                <Badge variant={isLive ? "default" : "secondary"} className="text-sm px-4 py-1">
                  {isLive ? "🟢 LIVE" : "⚫ OFFLINE"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Presale Status</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">Hardcap</div>
                    <div className="text-2xl font-bold text-primary">{hardcapNum.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">tokens</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                    <div className="text-sm text-muted-foreground mb-1">Price</div>
                    <div className="text-2xl font-bold text-accent">{priceNum}</div>
                    <div className="text-xs text-muted-foreground mt-1">tokens per USDC</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{soldNum.toLocaleString()} / {hardcapNum.toLocaleString()} tokens</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sold</span>
                    <span className="font-semibold text-primary">{progressPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {isConnected && !isOwner && (
                <>
                  {/* Your Balances Section */}
                  <div className="pt-6 border-t border-border/50 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Wallet className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Your Balances</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background/80 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="text-sm text-muted-foreground mb-2">USDC Balance</div>
                        <div className="text-xl font-bold">{userUsdcNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-muted-foreground mt-1">USDC</div>
                      </div>
                      <div className="p-4 bg-background/80 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="text-sm text-muted-foreground mb-2">Tokens Owned</div>
                        <div className="text-xl font-bold text-primary">{userTokenNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-muted-foreground mt-1">Tokens</div>
                      </div>
                    </div>
                  </div>

                  {/* Buy Tokens Section */}
                  <div className="pt-6 border-t border-border/50 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Buy Tokens</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="usdc-amount" className="text-base">USDC Amount</Label>
                        <Input 
                          id="usdc-amount"
                          type="number" 
                          placeholder="Minimum $1" 
                          value={buyerAmount} 
                          onChange={(e) => setBuyerAmount(e.target.value)} 
                          className="mt-2 h-12 text-lg"
                        />
                        {buyerAmount && !isValidBuy && (
                          <p className="text-xs text-destructive mt-2">Minimum purchase is $1</p>
                        )}
                      </div>

                      {isValidBuy && (
                        <div className="p-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg border border-primary/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">You will receive</span>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">≈ {estimatedTokens.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">tokens</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button 
                          onClick={handleApproveUSDC} 
                          disabled={!isValidBuy || isApproving}
                          variant="outline"
                          className="h-12 text-base"
                        >
                          {isApproving ? "Approving..." : hasAllowance ? "✓ Approved" : "1. Approve USDC"}
                        </Button>
                        <Button 
                          onClick={handleBuy} 
                          disabled={!canBuy}
                          className="h-12 text-base bg-gradient-primary hover:opacity-90"
                        >
                          2. Buy Tokens
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isConnected && (
                <div className="pt-6 text-center">
                  <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground">Connect your wallet to view balances and participate in the presale</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TokenSale1;
