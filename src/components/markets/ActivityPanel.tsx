import { useState } from 'react';
import { Market } from '@/types/market';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTradesStore } from '@/stores/trades';
import { formatDate } from '@/lib/format';
import { Heart, MessageCircle, MoreVertical, Bold, Italic, Strikethrough } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityPanelProps = {
  market: Market;
};

// Mock comments data
const mockComments = [
  {
    id: '1',
    user: 'Ramboz',
    time: '35 minutes ago',
    content: 'IZI',
    likes: 0,
    avatar: '#ff6b9d'
  },
  {
    id: '2',
    user: '0xDFB9...0B57',
    time: '12 days ago',
    content: 'MtThongchai',
    likes: 0,
    avatar: '#4ecdc4'
  },
  {
    id: '3',
    user: '0x0E64...D92A',
    time: '12 days ago',
    content: 'need more liquidity please',
    likes: 0,
    avatar: '#ff6b9d'
  },
  {
    id: '4',
    user: 'Cryptoquest',
    time: '15 days ago',
    content: 'Easy $4500',
    likes: 0,
    avatar: '#45b7d1'
  }
];

export const ActivityPanel = ({ market }: ActivityPanelProps) => {
  const [opinion, setOpinion] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handlePostOpinion = () => {
    if (!opinion.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      user: '0x720a...1169',
      time: 'Just now',
      content: opinion,
      likes: 0,
      avatar: '#9b59b6'
    };
    
    setComments([newComment, ...comments]);
    setOpinion('');
  };

  return (
    <Card className="glass-card border-border/50 p-6 space-y-6">
      {/* Comment Input */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              U
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Share your opinion..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border/50 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{opinion.length}/500</span>
                <Button 
                  onClick={handlePostOpinion}
                  disabled={!opinion.trim()}
                  size="sm"
                >
                  Post opinion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No opinions yet</p>
            <p className="text-sm mt-2">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group">
              <Avatar className="h-10 w-10">
                <AvatarFallback style={{ backgroundColor: comment.avatar }}>
                  {comment.user.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.user}</span>
                  <span className="text-xs text-muted-foreground">· {comment.time}</span>
                </div>
                
                <p className="text-sm">{comment.content}</p>
                
                <div className="flex items-center gap-4 pt-2">
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-primary">
                    <Heart className="h-3.5 w-3.5" />
                    <span className="text-xs">{comment.likes}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-primary">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">Reply</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
