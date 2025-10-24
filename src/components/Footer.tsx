import { Send } from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold">G</span>
              </div>
              <div>
                <div className="font-bold text-xl">GIGACOCK</div>
                <div className="text-xs text-muted-foreground">#1 Token Discovery Platform</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Discover the newest and hottest tokens before they moon. Join the revolution.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <a href="#dyor" className="text-sm text-muted-foreground hover:text-primary transition-colors">DYOR</a>
              <a href="#disclaimer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Disclaimer</a>
              <a href="#terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</a>
              <a href="#privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Connect With Us</h3>
            <div className="flex gap-3">
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
            <p className="text-xs text-muted-foreground">
              Stay updated with the latest token listings and community news
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} GIGACOCK. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              Built with 💜 for the crypto community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
