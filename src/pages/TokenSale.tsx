import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Wallet, Coins } from "lucide-react";

const TokenSale = () => {
  // Get or set presale end date (3 days from first visit)
  const getPresaleEndDate = () => {
    const stored = localStorage.getItem('presaleEndDate');
    if (stored) {
      return new Date(stored);
    }
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 3);
    localStorage.setItem('presaleEndDate', newEndDate.toISOString());
    return newEndDate;
  };

  const presaleEndDate = getPresaleEndDate();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = presaleEndDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/95 to-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              GIGACOCK Presale
            </h1>
            <p className="text-xl text-muted-foreground">
              Join the presale and be part of the future
            </p>
          </div>

          {/* Countdown Card */}
          <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur-xl animate-scale-in">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Presale Starts In</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-4 mb-2">
                    <div className="text-4xl md:text-5xl font-bold text-primary">
                      {timeLeft.days}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-4 mb-2">
                    <div className="text-4xl md:text-5xl font-bold text-primary">
                      {timeLeft.hours}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-4 mb-2">
                    <div className="text-4xl md:text-5xl font-bold text-primary">
                      {timeLeft.minutes}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-lg p-4 mb-2">
                    <div className="text-4xl md:text-5xl font-bold text-primary">
                      {timeLeft.seconds}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
                  disabled
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Presale Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Presale Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">Token Details</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Name:</span>
                    <span className="font-medium">GIGACOCK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supply:</span>
                    <span className="font-medium">1,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Presale Allocation:</span>
                    <span className="font-medium">50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                  <h3 className="text-xl font-bold">Presale Info</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">TBD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Purchase:</span>
                    <span className="font-medium">10 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hardcap:</span>
                    <span className="font-medium">$5,000 USDC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TokenSale;
