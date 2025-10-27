import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TokenConverterProps {
  tokenSymbol: string;
  tokenName: string;
  priceUsd: number;
}

const TokenConverter = ({ tokenSymbol, tokenName, priceUsd }: TokenConverterProps) => {
  const [tokenAmount, setTokenAmount] = useState<string>("1");
  const [usdtAmount, setUsdtAmount] = useState<string>("");
  const [isTokenToUsdt, setIsTokenToUsdt] = useState(true);

  useEffect(() => {
    if (isTokenToUsdt) {
      const amount = parseFloat(tokenAmount) || 0;
      setUsdtAmount((amount * priceUsd).toFixed(2));
    } else {
      const amount = parseFloat(usdtAmount) || 0;
      setTokenAmount((amount / priceUsd).toFixed(8));
    }
  }, [tokenAmount, usdtAmount, priceUsd, isTokenToUsdt]);

  const handleTokenChange = (value: string) => {
    setTokenAmount(value);
    setIsTokenToUsdt(true);
  };

  const handleUsdtChange = (value: string) => {
    setUsdtAmount(value);
    setIsTokenToUsdt(false);
  };

  const handleSwap = () => {
    const temp = tokenAmount;
    setTokenAmount(usdtAmount);
    setUsdtAmount(temp);
    setIsTokenToUsdt(!isTokenToUsdt);
  };

  return (
    <Card className="sticky top-4 h-[240px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex-1 flex flex-col">
        <div className="space-y-1">
          <Label htmlFor="token-amount" className="text-xs">{tokenSymbol}</Label>
          <Input
            id="token-amount"
            type="number"
            placeholder="0.00"
            value={tokenAmount}
            onChange={(e) => handleTokenChange(e.target.value)}
            step="any"
            className="h-8 text-sm"
          />
        </div>

        <div className="flex justify-center py-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="rounded-full h-6 w-6"
          >
            <ArrowDownUp className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1">
          <Label htmlFor="usdt-amount" className="text-xs">USDT</Label>
          <Input
            id="usdt-amount"
            type="number"
            placeholder="0.00"
            value={usdtAmount}
            onChange={(e) => handleUsdtChange(e.target.value)}
            step="any"
            className="h-8 text-sm"
          />
        </div>

        <div className="pt-2 border-t text-[10px] text-muted-foreground mt-auto">
          <p>1 {tokenSymbol} = ${priceUsd.toFixed(8)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenConverter;
