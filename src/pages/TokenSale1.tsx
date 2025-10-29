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
import { Wallet, Settings, ShoppingCart, RefreshCw } from "lucide-react";

const TOKEN_ADDRESS = "0xFb639C16B40ED8595d27D1E4a44C4DCaE78f2dB4" as const;
const PRESALE_ADDRESS = "0x7FEbA131C382F45e363d1d900DA3fA98223CE91a" as const;
const USDC_ADDRESS = "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07" as const;

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

  useEffect(() => {
    const interval = setInterval(() => {
      refetchHardcap(); refetchPrice(); refetchSold(); refetchLive(); refetchAllowance();
    }, 10000);
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
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setHardcapTokens", args: [parseUnits("50000", 18)], account: address!, chain: pulsechain });
      toast.success("Hardcap set");
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setPrice", args: [parseUnits("10", 18)], account: address!, chain: pulsechain });
      toast.success("Price set");
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "setLive", args: [true], account: address!, chain: pulsechain });
      toast.success("✅ Config OK!");
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  const handleApproveUSDC = async () => {
    try {
      await writeContractAsync({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [PRESALE_ADDRESS, parseUnits(buyerAmount, 6)], account: address!, chain: pulsechain });
      toast.success("USDC approved!");
    } catch (error: any) {
      toast.error(error?.message || "Failed");
    }
  };

  const handleBuy = async () => {
    if (!isValidBuy || !confirm(`Confirm ${buyerAmount} USDC for ≈${estimatedTokens.toFixed(2)} tokens?`)) return;
    try {
      await writeContractAsync({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: "buy", args: [parseUnits(buyerAmount, 6)], account: address!, chain: pulsechain });
      toast.success("Purchase successful!");
      setBuyerAmount("");
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

        {presaleBalanceNum < 50000 && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10"><CardContent className="p-4">
            <p className="text-sm">⚠️ Top up presale with ≥50,000 tokens</p>
          </CardContent></Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5" />Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Hardcap</span>
                  <span>{hardcapNum.toLocaleString()} tokens</span>
                </div>
                <Progress value={progressPercent} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Sold: {soldNum.toLocaleString()}</span>
                  <span>{progressPercent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Price</span><span>{priceNum} tokens / 1 USDC</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Status</span><Badge variant={isLive ? "default" : "secondary"}>{isLive ? "LIVE" : "OFF"}</Badge></div>
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-accent/20 bg-card/50 backdrop-blur-xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Owner Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Hardcap (tokens)</Label><div className="flex gap-2 mt-1"><Input type="number" placeholder="50000" value={ownerHardcap} onChange={(e) => setOwnerHardcap(e.target.value)} /><Button onClick={handleSetHardcap}>Set</Button></div></div>
                <div><Label>Price (tokens/USDC)</Label><div className="flex gap-2 mt-1"><Input type="number" placeholder="10" value={ownerPrice} onChange={(e) => setOwnerPrice(e.target.value)} /><Button onClick={handleSetPrice}>Set</Button></div></div>
                <div className="flex gap-2"><Button onClick={() => handleSetLive(true)} className="flex-1">Set LIVE</Button><Button variant="secondary" onClick={() => handleSetLive(false)} className="flex-1">Set OFF</Button></div>
                <Button onClick={handleApplyTargetSettings} className="w-full bg-gradient-primary">Apply Target Settings</Button>
              </CardContent>
            </Card>
          )}

          {isConnected && !isOwner && (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Buy Tokens</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>USDC Amount (min $1)</Label><Input type="number" placeholder="1" value={buyerAmount} onChange={(e) => setBuyerAmount(e.target.value)} className="mt-1" />
                {buyerAmount && !isValidBuy && <p className="text-xs text-destructive mt-1">Minimum $1</p>}</div>
                {isValidBuy && <div className="p-3 bg-primary/10 rounded-lg"><p className="text-sm">≈ <span className="font-bold">{estimatedTokens.toFixed(2)}</span> tokens</p></div>}
                <Button onClick={handleApproveUSDC} disabled={!isValidBuy} className="w-full" variant="outline">1. Approve USDC</Button>
                <Button onClick={handleBuy} disabled={!isValidBuy} className="w-full bg-gradient-primary">2. Buy</Button>
              </CardContent>
            </Card>
          )}

          {!isConnected && <Card className="border-primary/20 bg-card/50 backdrop-blur-xl"><CardContent className="p-8 text-center"><Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p>Connect wallet to participate</p></CardContent></Card>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TokenSale1;
