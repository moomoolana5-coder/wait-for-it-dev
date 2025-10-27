import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import gigacockLogo from "@/assets/gigacock-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12 mt-20">
      <div className="container mx-auto px-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <img 
            src={gigacockLogo} 
            alt="GIGACOCK Logo"
            className="h-16 w-16 rounded-xl"
          />
          <p className="text-sm text-muted-foreground text-center max-w-md">
            #1 Token Discovery Platform on PulseChain
          </p>
          
          {/* Social Media */}
          <div className="flex gap-4">
            <a 
              href="https://x.com/gigacock25464" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors"
              aria-label="Follow us on X (Twitter)"
            >
              <FaXTwitter className="h-5 w-5" />
            </a>
            <a 
              href="https://t.me/gigacock_cto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors"
              aria-label="Join our Telegram"
            >
              <FaTelegram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} GIGACOCK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
