import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronLeft, Plus, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const tokenSchema = z.object({
  tokenAddress: z.string().trim().nonempty({ message: "Token address is required" }).max(100),
  tokenName: z.string().trim().nonempty({ message: "Token name is required" }).max(100),
  tokenSymbol: z.string().trim().nonempty({ message: "Token symbol is required" }).max(20),
  description: z.string().trim().max(500, { message: "Description must be less than 500 characters" }).optional(),
  websiteUrl: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal("")),
  telegramUrl: z.string().url({ message: "Invalid Telegram URL" }).optional().or(z.literal("")),
  twitterUrl: z.string().url({ message: "Invalid Twitter URL" }).optional().or(z.literal("")),
  transactionHash: z.string().trim().nonempty({ message: "Transaction hash is required" }).max(100),
});

const AddCoin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit a token.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tokenAddress: formData.get('tokenAddress') as string,
      tokenName: formData.get('tokenName') as string,
      tokenSymbol: formData.get('tokenSymbol') as string,
      description: formData.get('description') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      telegramUrl: formData.get('telegramUrl') as string,
      twitterUrl: formData.get('twitterUrl') as string,
      transactionHash: formData.get('transactionHash') as string,
    };

    try {
      const validated = tokenSchema.parse(data);
      let logoUrl = null;

      // Upload logo if file is selected
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${address}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('token-logos')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('token-logos')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('submitted_tokens')
        .insert([
          {
            user_id: address,
            token_address: validated.tokenAddress,
            token_name: validated.tokenName,
            token_symbol: validated.tokenSymbol,
            description: validated.description || null,
            website_url: validated.websiteUrl || null,
            telegram_url: validated.telegramUrl || null,
            twitter_url: validated.twitterUrl || null,
            logo_url: logoUrl,
            transaction_hash: validated.transactionHash,
          },
        ]);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-listing-notification', {
          body: {
            tokenName: validated.tokenName,
            tokenSymbol: validated.tokenSymbol,
            tokenAddress: validated.tokenAddress,
            transactionHash: validated.transactionHash,
            submitterAddress: address,
            websiteUrl: validated.websiteUrl,
            telegramUrl: validated.telegramUrl,
            twitterUrl: validated.twitterUrl,
          },
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the submission if email fails
      }

      toast({
        title: "Success!",
        description: "Your token has been submitted for review. Notification sent!",
      });

      e.currentTarget.reset();
      setLogoFile(null);
      setLogoPreview("");
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit token. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Plus className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-3xl">Add Your Token</CardTitle>
                <CardDescription>Submit your token to be listed on GIGACOCK</CardDescription>
              </div>
            </div>
            
            {/* Payment Requirements */}
            <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                💰 Listing Fee
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  To list your token on GIGACOCK platform, please send:
                </p>
                <div className="bg-background/50 p-3 rounded border border-border">
                  <p className="font-semibold text-accent">$100 worth of $GIGACOCK tokens</p>
                  <p className="text-xs text-muted-foreground mt-1">Payment Wallet:</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
                    0xd769A8183C7Fa2B5E351B051b727e496dAAcf5De
                  </code>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ After payment, enter the transaction hash in the form below
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Connect your wallet to submit a token</p>
                <Button onClick={() => connect({ connector: injected() })}>
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Connected Wallet</p>
                    <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => disconnect()}>
                    Disconnect
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tokenAddress">Token Address *</Label>
                  <Input 
                    id="tokenAddress" 
                    name="tokenAddress"
                    placeholder="0x..." 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenName">Token Name *</Label>
                    <Input 
                      id="tokenName" 
                      name="tokenName"
                      placeholder="e.g. Bitcoin" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenSymbol">Symbol *</Label>
                    <Input 
                      id="tokenSymbol" 
                      name="tokenSymbol"
                      placeholder="e.g. BTC" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Tell us about your token..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Token Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="logo" 
                      name="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Label 
                      htmlFor="logo"
                      className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {logoFile ? "Change Logo" : "Upload Logo"}
                    </Label>
                    {logoPreview && (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Max file size: 5MB</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input 
                    id="websiteUrl" 
                    name="websiteUrl"
                    type="url"
                    placeholder="https://yourproject.com" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telegramUrl">Telegram</Label>
                    <Input 
                      id="telegramUrl" 
                      name="telegramUrl"
                      type="url"
                      placeholder="https://t.me/..." 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">Twitter/X</Label>
                    <Input 
                      id="twitterUrl" 
                      name="twitterUrl"
                      type="url"
                      placeholder="https://x.com/..." 
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <Label htmlFor="transactionHash" className="flex items-center gap-2">
                    Transaction Hash *
                    <span className="text-xs text-muted-foreground font-normal">
                      (Payment confirmation)
                    </span>
                  </Label>
                  <Input 
                    id="transactionHash" 
                    name="transactionHash"
                    placeholder="0x..." 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the transaction hash after sending $100 worth of $GIGACOCK tokens
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Token"}
                </Button>
              </form>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default AddCoin;
