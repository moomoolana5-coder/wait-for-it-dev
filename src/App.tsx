import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewListings from "./pages/NewListings";
import AddCoin from "./pages/AddCoin";
import Auth from "./pages/Auth";
import TokenDetail from "./pages/TokenDetail";
import Gigacock from "./pages/Gigacock";
import TokenSale from "./pages/TokenSale";
import TokenSale1 from "./pages/TokenSale1";
import GigaMarkets from "./pages/GigaMarkets";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import Leaderboard from "./pages/Leaderboard";
import Earn from "./pages/Earn";
import NewsPage from "./pages/NewsPage";
import Integrations from "./pages/Integrations";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new-listings" element={<NewListings />} />
            <Route path="/add-coin" element={<AddCoin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/token/:address" element={<TokenDetail />} />
            <Route path="/gigacock" element={<Gigacock />} />
            <Route path="/token-sale" element={<TokenSale />} />
            <Route path="/token-sale-1" element={<TokenSale1 />} />
            <Route path="/giga-markets" element={<Markets />} />
            <Route path="/giga-markets/market/:id" element={<MarketDetail />} />
            <Route path="/giga-markets/leaderboard" element={<Leaderboard />} />
            <Route path="/giga-markets/earn" element={<Earn />} />
            <Route path="/giga-markets/news" element={<NewsPage />} />
            <Route path="/giga-markets/integrations" element={<Integrations />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
