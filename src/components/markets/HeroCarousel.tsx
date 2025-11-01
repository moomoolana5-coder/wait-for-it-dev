import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeroCarouselProps = {
  markets: Market[];
};

export const HeroCarousel = ({ markets }: HeroCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featuredMarkets = markets.slice(0, 5);

  useEffect(() => {
    if (isPaused || featuredMarkets.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMarkets.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, featuredMarkets.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? featuredMarkets.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMarkets.length);
  };

  if (featuredMarkets.length === 0) return null;

  const currentMarket = featuredMarkets[currentIndex];
  const yesStake = currentMarket.yesStake || 0;
  const noStake = currentMarket.noStake || 0;
  const totalStake = yesStake + noStake;
  const yesPercent = totalStake > 0 ? (yesStake / totalStake) * 100 : 50;
  const noPercent = totalStake > 0 ? (noStake / totalStake) * 100 : 50;

  return (
    <div 
      className="relative w-full h-[500px] rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{ 
          backgroundImage: `url(${currentMarket.cover})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="flex items-end justify-between gap-8">
          <div className="flex items-end gap-4 flex-1">
            {/* Market Icon */}
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 border-2 border-border/50">
              <span className="text-3xl">📊</span>
            </div>

            {/* Market Info */}
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                {currentMarket.title}
              </h2>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-sm border border-primary/30">
                    UP {yesPercent.toFixed(1)}%
                  </span>
                  <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground backdrop-blur-sm border border-secondary/30">
                    DOWN {noPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-[10px]">
                        U1
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-primary text-[10px]">
                        U2
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-white drop-shadow">+2.84k</span>
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-background/80 hover:bg-background backdrop-blur-sm"
                  onClick={() => navigate(`/market/${currentMarket.id}`)}
                >
                  <Target className="h-3 w-3 mr-1" />
                  Predict
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featuredMarkets.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === currentIndex 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/50 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  );
};
