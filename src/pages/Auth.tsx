import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBetaTest } from "@/hooks/useBetaTest";
import { z } from "zod";
import gigaLogo from "@/assets/giga-logo.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const nameSchema = z.string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(50, { message: "Name must be less than 50 characters" });

const Auth = () => {
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, createAccount } = useBetaTest();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/giga-markets');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      nameSchema.parse(displayName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return;
      }
    }

    setIsLoading(true);
    const { error } = await createAccount(displayName);
    setIsLoading(false);

    if (!error) {
      navigate('/giga-markets');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={gigaLogo} 
                alt="GIGACOCK Logo"
                className="h-16 w-16"
              />
            </div>
            <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
              Beta Test Access
            </CardTitle>
            <CardDescription>
              Enter your name to start testing Giga Markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  You'll get 10,000 points to start trading
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Start Beta Test"}
              </Button>

              <div className="text-center">
                <Link to="/">
                  <Button variant="ghost" type="button">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
