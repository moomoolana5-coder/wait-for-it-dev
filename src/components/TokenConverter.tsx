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
    <Card className="h-[240px] flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base font-semibold">Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col px-4 pb-4">
        <div className="space-y-1.5">
          <Label htmlFor="token-amount" className="text-xs font-medium text-muted-foreground">{tokenSymbol}</Label>
          <Input
            id="token-amount"
            type="number"
            placeholder="0.00"
            value={tokenAmount}
            onChange={(e) => handleTokenChange(e.target.value)}
            step="any"
            className="h-9 text-sm"
          />
        </div>

        <div className="flex justify-center -my-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="rounded-full h-7 w-7 hover:bg-accent"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="usdt-amount" className="text-xs font-medium text-muted-foreground">USDT</Label>
          <Input
            id="usdt-amount"
            type="number"
            placeholder="0.00"
            value={usdtAmount}
            onChange={(e) => handleUsdtChange(e.target.value)}
            step="any"
            className="h-9 text-sm"
          />
        </div>

        <div className="pt-2 mt-auto border-t text-[11px] text-muted-foreground">
          <p className="truncate">1 {tokenSymbol} = ${priceUsd.toFixed(8)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenConverter;
