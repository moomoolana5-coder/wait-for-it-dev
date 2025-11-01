import { Wallet, Menu, Shield, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link, useLocation } from "react-router-dom";
import gigacockLogo from "@/assets/gigacock-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import TokenSearch from "./TokenSearch";
import { useWalletAdmin } from "@/hooks/useWalletAdmin";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useWalletAdmin();
  const { user, signOut } = useAuth();
  const isGigaMarketsRoute = location.pathname === '/giga-markets' || location.pathname.startsWith('/market/');

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
            <Link to="/giga-markets" className="text-foreground hover:text-primary transition-colors">
              Giga Markets
            </Link>
            <Link to="/token-sale-1" className="text-foreground hover:text-primary transition-colors">
              Token Sale 1
            </Link>
            {isAdmin && (
              <Link to="/admin/settings" className="text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors">
              Listing Form
            </a>
            <a href="#advertise" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Advertise ✨
            </a>
            
            {/* Show Auth button for Giga Markets, otherwise show Web3 Wallet */}
            {isGigaMarketsRoute ? (
              user ? (
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  className="border-primary/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )
            ) : (
              isConnected ? (
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
              )
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
                    to="/giga-markets" 
                    className="text-lg hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Giga Markets
                  </Link>
                  <Link 
                    to="/token-sale-1" 
                    className="text-lg hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Token Sale 1
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin/settings" 
                      className="text-lg text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-5 w-5" />
                      Admin Settings
                    </Link>
                  )}
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
