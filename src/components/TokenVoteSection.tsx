import { useState } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface TokenVoteSectionProps {
  tokenAddress: string;
}

const TokenVoteSection = ({ tokenAddress }: TokenVoteSectionProps) => {
  const { voteCount, hasVoted, isLoading, vote } = useTokenVotes(tokenAddress);
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
    if (hasVoted) {
      toast({
        title: 'Already Voted',
        description: 'You have already voted for this token',
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
      await vote(isCaptchaValid);
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vote Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={hasVoted ? 'secondary' : 'default'}
              size="lg"
              onClick={() => handleVoteClick('bullish')}
              disabled={hasVoted || isLoading}
              className="flex-1 flex-col gap-2 h-auto py-4 bg-green-500 hover:bg-green-600 text-white"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )}
                <span className="font-semibold">Bullish</span>
              </div>
              <span className="text-2xl font-bold">{Math.floor(voteCount * 0.6)}</span>
              <span className="text-xs opacity-90">votes</span>
            </Button>
            
            <Button
              variant={hasVoted ? 'secondary' : 'default'}
              size="lg"
              onClick={() => handleVoteClick('bearish')}
              disabled={hasVoted || isLoading}
              className="flex-1 flex-col gap-2 h-auto py-4 bg-red-500 hover:bg-red-600 text-white"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="font-semibold">Bearish</span>
              </div>
              <span className="text-2xl font-bold">{Math.floor(voteCount * 0.4)}</span>
              <span className="text-xs opacity-90">votes</span>
            </Button>
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Total Votes: <span className="font-semibold">{voteCount}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote {voteType === 'bullish' ? 'Bullish' : 'Bearish'}</DialogTitle>
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

export default TokenVoteSection;
