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
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-amount">{tokenSymbol}</Label>
          <Input
            id="token-amount"
            type="number"
            placeholder="0.00"
            value={tokenAmount}
            onChange={(e) => handleTokenChange(e.target.value)}
            step="any"
          />
          <p className="text-xs text-muted-foreground">{tokenName}</p>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="rounded-full"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="usdt-amount">USDT</Label>
          <Input
            id="usdt-amount"
            type="number"
            placeholder="0.00"
            value={usdtAmount}
            onChange={(e) => handleUsdtChange(e.target.value)}
            step="any"
          />
          <p className="text-xs text-muted-foreground">Tether USD</p>
        </div>

        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>1 {tokenSymbol} = ${priceUsd.toFixed(8)} USDT</p>
          <p>1 USDT = {(1 / priceUsd).toFixed(8)} {tokenSymbol}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenConverter;
