import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_WALLET = "0xd769A8183C7Fa2B5E351B051b727e496dAAcf5De";

export function VerificationRequestDialog({ open, onOpenChange }: VerificationRequestDialogProps) {
  const [tokenName, setTokenName] = useState("");
  const [tickerSymbol, setTickerSymbol] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(PAYMENT_WALLET);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenName || !tickerSymbol || !contractAddress || !transactionHash) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = crypto.randomUUID();
      
      const { error } = await supabase
        .from("verification_requests")
        .insert({
          token_address: contractAddress,
          token_name: tokenName,
          token_symbol: tickerSymbol,
          transaction_hash: transactionHash,
          wallet_address: PAYMENT_WALLET,
          amount_usd: 150,
          status: "pending",
          user_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Success! ✅",
        description: "Verification request submitted. We'll review your payment and verify your token.",
      });

      // Reset form
      setTokenName("");
      setTickerSymbol("");
      setContractAddress("");
      setTransactionHash("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting verification request:", error);
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Verify your token <CheckCircle className="w-6 h-6 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill out this form in order to have your token verification sent through fast track. 
            Forms are reviewed in the order that they are received.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="e.g., PulseChain Peacock"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
            <Input
              id="tickerSymbol"
              placeholder="e.g., PCOCK"
              value={tickerSymbol}
              onChange={(e) => setTickerSymbol(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractAddress">Contract Address</Label>
            <Input
              id="contractAddress"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionHash">Transaction Hash</Label>
            <Input
              id="transactionHash"
              placeholder="0x..."
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-base">
              Send <span className="text-2xl font-bold">$150</span> USDC payment to:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={PAYMENT_WALLET}
                readOnly
                className="bg-muted font-mono text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this address to send your USDC payment
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Verification Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
