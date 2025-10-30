import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  Award,
  Gift,
  Newspaper,
  Plug,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: BarChart3, label: 'Markets', path: '/giga-markets' },
  { icon: Award, label: 'Leaderboard', path: '/giga-markets/leaderboard' },
  { icon: Gift, label: 'Earn', path: '/giga-markets/earn' },
  { icon: Newspaper, label: 'News', path: '/giga-markets/news' },
  { icon: Plug, label: 'Integrations', path: '/giga-markets/integrations' },
];

const topics = [
  { name: 'Crypto', count: 24 },
  { name: 'Sports', count: 12 },
  { name: 'Politics', count: 8 },
  { name: 'Economy', count: 6 },
  { name: 'Gaming', count: 15 },
  { name: 'Culture', count: 9 },
  { name: 'Sentiment', count: 5 },
];

interface MarketsSidebarProps {
  onOpenSettings: () => void;
}

export function MarketsSidebar({ onOpenSettings }: MarketsSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm p-4 space-y-6">
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                isActive && 'bg-primary/10 text-primary'
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Topics
        </h3>
        <div className="space-y-1">
          {topics.map((topic) => (
            <Button
              key={topic.name}
              variant="ghost"
              className="w-full justify-between"
              size="sm"
            >
              <span>{topic.name}</span>
              <Badge variant="secondary" className="ml-auto">
                {topic.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        onClick={onOpenSettings}
      >
        <Settings className="w-4 h-4" />
        Settings
      </Button>
    </div>
  );
}
