import { useState } from 'react';
import { ThumbsUp, Loader2 } from 'lucide-react';
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
  const { voteCount, hasVoted, isLoading, vote } = useTokenVotes(tokenAddress);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0 });

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ a, b });
    return { a, b };
  };

  const handleVoteClick = () => {
    if (hasVoted) {
      toast({
        title: 'Already Voted',
        description: 'You have already voted for this token',
        variant: 'destructive',
      });
      return;
    }
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
      await vote(isCaptchaValid);
      toast({
        title: 'Vote Successful!',
        description: 'Thank you for your vote',
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
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{voteCount}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={hasVoted ? 'secondary' : 'ghost'}
        size="sm"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVoteClick(); }}
        disabled={hasVoted}
        className="gap-2 hover:bg-primary/10"
      >
        <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-current text-primary' : ''}`} />
        <span className="text-sm font-semibold">{voteCount}</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote for Token</DialogTitle>
            <DialogDescription>
              Please solve the captcha to confirm your vote
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
