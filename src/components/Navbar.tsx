import { Wallet, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link } from "react-router-dom";
import projectLogo from "@/assets/project-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import TokenSearch from "./TokenSearch";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={projectLogo}
              alt="GIGACOCK Logo"
              className="h-8 w-8 md:h-10 md:w-10 rounded-lg"
            />
            <span className="text-lg md:text-xl font-bold text-foreground hidden sm:block">GIGACOCK</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 flex-1 justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Cryptocurrencies
              </Link>
              <Link to="/new-listings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                New Listings
              </Link>
              <Link to="/add-coin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Submit Coin
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <TokenSearch className="w-64" />

              {isConnected ? (
                <Button
                  onClick={() => disconnect()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-2">
            {isConnected ? (
              <Button 
                onClick={() => disconnect()}
                size="sm"
                className="bg-gradient-accent hover:opacity-90"
              >
                <Wallet className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleConnect}
                size="sm"
                className="bg-gradient-primary hover:opacity-90"
              >
                <Wallet className="h-4 w-4" />
              </Button>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  <TokenSearch onResultClick={() => setIsOpen(false)} />
                  
                  <Link 
                    to="/" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/new-listings" 
                    className="text-lg hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    New Listings
                  </Link>
                  <Link 
                    to="/add-coin" 
                    className="text-lg hover:text-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Add Coin
                  </Link>
                  <a 
                    href="#advertise" 
                    className="text-lg text-accent hover:text-accent/80 transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Advertise ✨
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
