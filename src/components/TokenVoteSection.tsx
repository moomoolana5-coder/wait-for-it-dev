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
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl">Vote Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Bullish Button */}
            <div className="space-y-3">
              <Button
                variant={hasVoted ? 'secondary' : 'default'}
                size="lg"
                onClick={() => handleVoteClick('bullish')}
                disabled={hasVoted || isLoading}
                className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <TrendingUp className="h-6 w-6" />
                  )}
                  <span className="text-lg font-bold">Bullish</span>
                </div>
                <div className="text-3xl font-black">{Math.floor(voteCount * 0.6)}</div>
              </Button>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">
                  {voteCount > 0 ? '60%' : '0%'}
                </div>
              </div>
            </div>

            {/* Bearish Button */}
            <div className="space-y-3">
              <Button
                variant={hasVoted ? 'secondary' : 'default'}
                size="lg"
                onClick={() => handleVoteClick('bearish')}
                disabled={hasVoted || isLoading}
                className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span className="text-lg font-bold">Bearish</span>
                </div>
                <div className="text-3xl font-black">{Math.floor(voteCount * 0.4)}</div>
              </Button>
              <div className="text-center">
                <div className="text-sm font-semibold text-red-600">
                  {voteCount > 0 ? '40%' : '0%'}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: voteCount > 0 ? '60%' : '50%' }}
              />
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                style={{ width: voteCount > 0 ? '40%' : '50%' }}
              />
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Total Votes:</span>
              <span className="text-lg font-bold">{voteCount}</span>
            </div>
          </div>

          {hasVoted && (
            <div className="mt-4 p-3 bg-accent/20 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                ✓ You have already voted for this token
              </p>
            </div>
          )}
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
