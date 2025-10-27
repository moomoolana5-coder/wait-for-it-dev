import { Wallet, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link } from "react-router-dom";
import gigacockLogo from "@/assets/gigacock-logo.png";
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
    <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img 
              src={gigacockLogo} 
              alt="GIGACOCK Logo"
              className="h-8 w-8 md:h-11 md:w-11 rounded-xl"
            />
            <span className="text-lg md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">GIGACOCK</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <TokenSearch className="w-72" />
            
            <Link to="/" className="text-foreground font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/gigacock" className="text-foreground hover:text-primary transition-colors">
              GIGACOCK
            </Link>
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors">
              Listing Form
            </a>
            <a href="#advertise" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Advertise ✨
            </a>
            
            {isConnected ? (
              <Button 
                onClick={() => disconnect()}
                className="bg-gradient-accent hover:opacity-90 shadow-lg shadow-accent/20"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            ) : (
              <Button 
                onClick={handleConnect}
                className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
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
                    to="/gigacock" 
                    className="text-lg hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    GIGACOCK
                  </Link>
                  <a 
                    href="https://forms.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg hover:text-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Listing Form
                  </a>
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
