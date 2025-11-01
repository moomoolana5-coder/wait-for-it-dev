import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWalletAdmin } from '@/hooks/useWalletAdmin';
import { useMarketsStore } from '@/stores/markets';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Shield, Plus, Edit, Trash2, Save, X, CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Market, Category } from '@/types/market';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading, walletAddress } = useWalletAdmin();
  const { markets, init, initialized, addMarket, updateMarket, deleteMarket } = useMarketsStore();
  
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  // Form state
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString();
  };

  const [formData, setFormData] = useState({
    title: '',
    cover: '',
    category: 'Crypto' as Category,
    threshold: 0,
    poolUSD: 10000,
    closesAt: getDefaultDateTime(),
    resolvesAt: getDefaultDateTime(),
    provider: 'DEXSCREENER' as 'DEXSCREENER' | 'COINGECKO',
    pairAddress: '',
    baseId: '',
  });

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      navigate('/giga-markets');
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleEdit = (market: Market) => {
    setEditingMarket(market);
    setFormData({
      title: market.title,
      cover: market.cover || '',
      category: market.category,
      threshold: market.source.threshold || 0,
      poolUSD: market.poolUSD || 10000,
      closesAt: market.closesAt,
      resolvesAt: market.resolvesAt,
      provider: market.source.provider,
      pairAddress: market.source.pairAddress || '',
      baseId: market.source.baseId || '',
    });
  };

  const handleCancel = () => {
    setEditingMarket(null);
    setIsCreating(false);
    setCoverFile(null);
    setFormData({
      title: '',
      cover: '',
      category: 'Crypto',
      threshold: 0,
      poolUSD: 10000,
      closesAt: getDefaultDateTime(),
      resolvesAt: getDefaultDateTime(),
      provider: 'DEXSCREENER',
      pairAddress: '',
      baseId: '',
    });
  };

  const uploadCoverImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('market-covers')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('market-covers')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.closesAt || !formData.resolvesAt) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      setUploadingCover(true);
      let coverUrl = formData.cover;

      // Upload cover image if file is selected
      if (coverFile) {
        coverUrl = await uploadCoverImage(coverFile);
      }

      if (editingMarket) {
        // Update existing market
        await updateMarket(editingMarket.id, {
          title: formData.title,
          cover: coverUrl,
          category: formData.category,
          closesAt: formData.closesAt,
          resolvesAt: formData.resolvesAt,
          poolUSD: formData.poolUSD,
          source: {
            ...editingMarket.source,
            threshold: formData.threshold,
            provider: formData.provider,
            pairAddress: formData.pairAddress || undefined,
            baseId: formData.baseId || undefined,
          },
        });

        toast({
          title: 'Market Updated',
          description: 'Market has been updated successfully',
        });
      } else {
        // Create new market
        const newMarket: Market = {
          id: `market-${Date.now()}`,
          title: formData.title,
          cover: coverUrl,
          category: formData.category,
          type: 'YES_NO',
          outcomes: [
            { key: 'YES', label: 'Yes' },
            { key: 'NO', label: 'No' },
          ],
          resolutionType: 'PRICE_GE',
          source: {
            provider: formData.provider,
            pairAddress: formData.pairAddress || undefined,
            baseId: formData.baseId || undefined,
            threshold: formData.threshold,
          },
          createdAt: new Date().toISOString(),
          createdBy: walletAddress || '0x720a8ee141577dc8f3190417264bf91f59821169',
          closesAt: formData.closesAt,
          resolvesAt: formData.resolvesAt,
          status: 'OPEN',
          poolUSD: formData.poolUSD,
          yesStake: formData.poolUSD / 2,
          noStake: formData.poolUSD / 2,
          trendingScore: 50,
        };

        await addMarket(newMarket);

        toast({
          title: 'Market Created',
          description: 'New market has been created successfully',
        });
      }

      handleCancel();
    } catch (error) {
      console.error('Error saving market:', error);
      toast({
        title: 'Error',
        description: 'Failed to save market',
        variant: 'destructive',
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDelete = async (marketId: string) => {
    if (!confirm('Are you sure you want to delete this market?')) return;

    try {
      await deleteMarket(marketId);
      toast({
        title: 'Market Deleted',
        description: 'Market has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting market:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete market',
        variant: 'destructive',
      });
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">Manage markets and platform settings</p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You are logged in as an administrator. Changes will affect all users.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="markets" className="space-y-6">
            <TabsList>
              <TabsTrigger value="markets">Markets Management</TabsTrigger>
              <TabsTrigger value="create">Create Market</TabsTrigger>
              <TabsTrigger value="presets">Duration Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="markets" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Existing Markets</h2>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Market
                </Button>
              </div>

              <div className="grid gap-4">
                {markets.map((market) => (
                  <Card key={market.id} className="glass-card border-border/50 p-6">
                    {editingMarket?.id === market.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cover Image</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setCoverFile(file);
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setFormData({ ...formData, cover: e.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {formData.cover && (
                              <img 
                                src={formData.cover} 
                                alt="Cover preview" 
                                className="w-full h-32 object-cover rounded"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(v) => setFormData({ ...formData, category: v as Category })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Crypto">Crypto</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Politics">Politics</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Threshold Price</Label>
                            <Input
                              type="number"
                              step="0.00000001"
                              value={formData.threshold}
                              onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Closes At</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.closesAt && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {formData.closesAt ? format(new Date(formData.closesAt), "PPP HH:mm") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="space-y-3">
                                  <Calendar
                                    mode="single"
                                    selected={formData.closesAt ? new Date(formData.closesAt) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        const currentDate = formData.closesAt ? new Date(formData.closesAt) : new Date();
                                        date.setHours(currentDate.getHours());
                                        date.setMinutes(currentDate.getMinutes());
                                        setFormData({ ...formData, closesAt: date.toISOString() });
                                      }
                                    }}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                  <div className="px-3 pb-3 flex gap-2 items-center border-t pt-3">
                                    <Label className="text-sm">Time:</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="23"
                                      placeholder="HH"
                                      className="w-16"
                                      value={formData.closesAt ? new Date(formData.closesAt).getHours() : ''}
                                      onChange={(e) => {
                                        const hours = parseInt(e.target.value) || 0;
                                        const date = formData.closesAt ? new Date(formData.closesAt) : new Date();
                                        date.setHours(hours);
                                        setFormData({ ...formData, closesAt: date.toISOString() });
                                      }}
                                    />
                                    <span>:</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="59"
                                      placeholder="MM"
                                      className="w-16"
                                      value={formData.closesAt ? new Date(formData.closesAt).getMinutes() : ''}
                                      onChange={(e) => {
                                        const minutes = parseInt(e.target.value) || 0;
                                        const date = formData.closesAt ? new Date(formData.closesAt) : new Date();
                                        date.setMinutes(minutes);
                                        setFormData({ ...formData, closesAt: date.toISOString() });
                                      }}
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Resolves At</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.resolvesAt && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {formData.resolvesAt ? format(new Date(formData.resolvesAt), "PPP HH:mm") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="space-y-3">
                                  <Calendar
                                    mode="single"
                                    selected={formData.resolvesAt ? new Date(formData.resolvesAt) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        const currentDate = formData.resolvesAt ? new Date(formData.resolvesAt) : new Date();
                                        date.setHours(currentDate.getHours());
                                        date.setMinutes(currentDate.getMinutes());
                                        setFormData({ ...formData, resolvesAt: date.toISOString() });
                                      }
                                    }}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                  <div className="px-3 pb-3 flex gap-2 items-center border-t pt-3">
                                    <Label className="text-sm">Time:</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="23"
                                      placeholder="HH"
                                      className="w-16"
                                      value={formData.resolvesAt ? new Date(formData.resolvesAt).getHours() : ''}
                                      onChange={(e) => {
                                        const hours = parseInt(e.target.value) || 0;
                                        const date = formData.resolvesAt ? new Date(formData.resolvesAt) : new Date();
                                        date.setHours(hours);
                                        setFormData({ ...formData, resolvesAt: date.toISOString() });
                                      }}
                                    />
                                    <span>:</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="59"
                                      placeholder="MM"
                                      className="w-16"
                                      value={formData.resolvesAt ? new Date(formData.resolvesAt).getMinutes() : ''}
                                      onChange={(e) => {
                                        const minutes = parseInt(e.target.value) || 0;
                                        const date = formData.resolvesAt ? new Date(formData.resolvesAt) : new Date();
                                        date.setMinutes(minutes);
                                        setFormData({ ...formData, resolvesAt: date.toISOString() });
                                      }}
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSave} disabled={uploadingCover}>
                            <Save className="h-4 w-4 mr-2" />
                            {uploadingCover ? 'Uploading...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{market.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Closes: {dayjs(market.closesAt).format('MMM D, YYYY HH:mm')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {market.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(market)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(market.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="create">
              <Card className="glass-card border-border/50 p-6">
                <h2 className="text-2xl font-semibold mb-6">Create New Market</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Market Question *</Label>
                      <Input
                        placeholder="e.g., BTC ≥ $100,000 by Dec 31?"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Cover Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCoverFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setFormData({ ...formData, cover: e.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {formData.cover && (
                        <img 
                          src={formData.cover} 
                          alt="Cover preview" 
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => setFormData({ ...formData, category: v as Category })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Crypto">Crypto</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Politics">Politics</SelectItem>
                          <SelectItem value="Economy">Economy</SelectItem>
                          <SelectItem value="Gaming">Gaming</SelectItem>
                          <SelectItem value="Culture">Culture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Provider *</Label>
                      <Select
                        value={formData.provider}
                        onValueChange={(v) => setFormData({ ...formData, provider: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEXSCREENER">DexScreener (PulseChain)</SelectItem>
                          <SelectItem value="COINGECKO">CoinGecko (Major Coins)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.provider === 'DEXSCREENER' ? (
                      <div className="space-y-2 col-span-2">
                        <Label>Token Address *</Label>
                        <Input
                          placeholder="0x..."
                          value={formData.pairAddress}
                          onChange={(e) => setFormData({ ...formData, pairAddress: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 col-span-2">
                        <Label>CoinGecko ID *</Label>
                        <Input
                          placeholder="e.g., bitcoin, ethereum"
                          value={formData.baseId}
                          onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Threshold Price (USD) *</Label>
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="0.0"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Pool (USD) *</Label>
                      <Input
                        type="number"
                        step="1000"
                        placeholder="10000"
                        value={formData.poolUSD}
                        onChange={(e) => setFormData({ ...formData, poolUSD: parseFloat(e.target.value) || 10000 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Trading Closes At *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.closesAt && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.closesAt ? format(new Date(formData.closesAt), "PPP HH:mm") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.closesAt ? new Date(formData.closesAt) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setFormData({ ...formData, closesAt: date.toISOString() });
                              }
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Market Resolves At *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.resolvesAt && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.resolvesAt ? format(new Date(formData.resolvesAt), "PPP HH:mm") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.resolvesAt ? new Date(formData.resolvesAt) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setFormData({ ...formData, resolvesAt: date.toISOString() });
                              }
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full" disabled={uploadingCover}>
                    <Plus className="h-4 w-4 mr-2" />
                    {uploadingCover ? 'Uploading...' : 'Create Market'}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <Card className="glass-card border-border/50 p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Event Duration Presets</h2>
                    <p className="text-muted-foreground">
                      Quick presets untuk mengatur durasi event dari sekarang. Berguna untuk testing.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select Market to Update:</h3>
                    <Select
                      value={editingMarket?.id || ''}
                      onValueChange={(id) => {
                        const market = markets.find((m) => m.id === id);
                        if (market) handleEdit(market);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a market" />
                      </SelectTrigger>
                      <SelectContent>
                        {markets.map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            {market.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {editingMarket && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{editingMarket.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Current closes at: {format(new Date(editingMarket.closesAt), "PPP HH:mm")}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant="outline"
                              onClick={async () => {
                                const newClosesAt = dayjs().add(30, 'second').toISOString();
                                const newResolvesAt = dayjs().add(1, 'minute').toISOString();
                                try {
                                  await updateMarket(editingMarket.id, {
                                    closesAt: newClosesAt,
                                    resolvesAt: newResolvesAt,
                                    status: 'OPEN',
                                  });
                                  toast({
                                    title: 'Duration Updated',
                                    description: 'Market will close in 30 seconds',
                                  });
                                  handleCancel();
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update duration',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              30 Seconds
                            </Button>

                            <Button
                              variant="outline"
                              onClick={async () => {
                                const newClosesAt = dayjs().add(1, 'minute').toISOString();
                                const newResolvesAt = dayjs().add(2, 'minute').toISOString();
                                try {
                                  await updateMarket(editingMarket.id, {
                                    closesAt: newClosesAt,
                                    resolvesAt: newResolvesAt,
                                    status: 'OPEN',
                                  });
                                  toast({
                                    title: 'Duration Updated',
                                    description: 'Market will close in 1 minute',
                                  });
                                  handleCancel();
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update duration',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              1 Minute
                            </Button>

                            <Button
                              variant="outline"
                              onClick={async () => {
                                const newClosesAt = dayjs().add(2, 'minute').toISOString();
                                const newResolvesAt = dayjs().add(3, 'minute').toISOString();
                                try {
                                  await updateMarket(editingMarket.id, {
                                    closesAt: newClosesAt,
                                    resolvesAt: newResolvesAt,
                                    status: 'OPEN',
                                  });
                                  toast({
                                    title: 'Duration Updated',
                                    description: 'Market will close in 2 minutes',
                                  });
                                  handleCancel();
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update duration',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              2 Minutes
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant="outline"
                              onClick={async () => {
                                const newClosesAt = dayjs().add(5, 'minute').toISOString();
                                const newResolvesAt = dayjs().add(6, 'minute').toISOString();
                                try {
                                  await updateMarket(editingMarket.id, {
                                    closesAt: newClosesAt,
                                    resolvesAt: newResolvesAt,
                                    status: 'OPEN',
                                  });
                                  toast({
                                    title: 'Duration Updated',
                                    description: 'Market will close in 5 minutes',
                                  });
                                  handleCancel();
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update duration',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              5 Minutes
                            </Button>

                            <Button
                              variant="outline"
                              onClick={async () => {
                                const newClosesAt = dayjs().add(30, 'minute').toISOString();
                                const newResolvesAt = dayjs().add(31, 'minute').toISOString();
                                try {
                                  await updateMarket(editingMarket.id, {
                                    closesAt: newClosesAt,
                                    resolvesAt: newResolvesAt,
                                    status: 'OPEN',
                                  });
                                  toast({
                                    title: 'Duration Updated',
                                    description: 'Market will close in 30 minutes',
                                  });
                                  handleCancel();
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update duration',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              30 Minutes
                            </Button>

                            <Button
                              variant="outline"
                              onClick={async () => {
                                const newClosesAt = dayjs().add(1, 'hour').toISOString();
                                const newResolvesAt = dayjs().add(1, 'hour').add(1, 'minute').toISOString();
                                try {
                                  await updateMarket(editingMarket.id, {
                                    closesAt: newClosesAt,
                                    resolvesAt: newResolvesAt,
                                    status: 'OPEN',
                                  });
                                  toast({
                                    title: 'Duration Updated',
                                    description: 'Market will close in 1 hour',
                                  });
                                  handleCancel();
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update duration',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              1 Hour
                            </Button>
                          </div>
                        </div>

                        <Alert>
                          <AlertDescription>
                            Preset akan mengatur closes_at dari waktu sekarang dan resolves_at 1 menit setelahnya. 
                            Status market akan diset ke OPEN.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminSettings;