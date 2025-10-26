import { useState } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTokenVotes } from '@/hooks/useTokenVotes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VoteButtonProps {
  tokenAddress: string;
}

const VoteButton = ({ tokenAddress }: VoteButtonProps) => {
  const { bullishCount, bearishCount, hasBullishVoted, hasBearishVoted, isLoading, vote } = useTokenVotes(tokenAddress);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0 });
  const [voteType, setVoteType] = useState<'bullish' | 'bearish'>('bullish');

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ a, b });
    return { a, b };
  };

  const handleVoteClick = (type: 'bullish' | 'bearish') => {
    if ((type === 'bullish' && hasBullishVoted) || (type === 'bearish' && hasBearishVoted)) {
      toast({
        title: 'Already Voted',
        description: `You have already voted ${type} for this token`,
        variant: 'destructive',
      });
      return;
    }
    setVoteType(type);
    generateCaptcha();
    setShowDialog(true);
  };

  const handleSubmitVote = async () => {
    const correctAnswer = captchaQuestion.a + captchaQuestion.b;
    const isCaptchaValid = parseInt(captchaAnswer) === correctAnswer;

    if (!isCaptchaValid) {
      toast({
        title: 'Invalid Captcha',
        description: 'Please solve the math problem correctly',
        variant: 'destructive',
      });
      return;
    }

    setIsVoting(true);
    try {
      await vote(isCaptchaValid, voteType);
      toast({
        title: 'Vote Successful!',
        description: `You voted ${voteType} for this token`,
      });
      setShowDialog(false);
      setCaptchaAnswer('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit vote',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled className="gap-1">
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={hasBullishVoted ? 'default' : 'outline'}
          size="sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVoteClick('bullish'); }}
          disabled={hasBullishVoted}
          className={`gap-1 ${hasBullishVoted ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-600'}`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-semibold">{bullishCount}</span>
        </Button>

        <Button
          variant={hasBearishVoted ? 'default' : 'outline'}
          size="sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVoteClick('bearish'); }}
          disabled={hasBearishVoted}
          className={`gap-1 ${hasBearishVoted ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-600'}`}
        >
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs font-semibold">{bearishCount}</span>
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote {voteType === 'bullish' ? 'Bullish' : 'Bearish'}</DialogTitle>
            <DialogDescription>
              Please solve the captcha to confirm your {voteType} vote
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Solve this math problem:</Label>
              <div className="text-2xl font-bold text-center p-4 bg-accent/10 rounded-lg">
                {captchaQuestion.a} + {captchaQuestion.b} = ?
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="captcha-answer">Your Answer:</Label>
              <Input
                id="captcha-answer"
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter the answer"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitVote();
                  }
                }}
              />
            </div>

            <Button 
              onClick={handleSubmitVote} 
              disabled={isVoting}
              className="w-full"
            >
              {isVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Vote'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoteButton;
