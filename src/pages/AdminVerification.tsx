import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, X, ExternalLink } from "lucide-react";

interface VerificationRequest {
  id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  transaction_hash: string;
  wallet_address: string;
  amount_usd: number;
  status: string;
  created_at: string;
}

export default function AdminVerification() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchRequests();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
    setLoading(false);
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
      return;
    }

    setRequests(data || []);
  };

  const approveVerification = async (request: VerificationRequest) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update verification request status
      const { error: requestError } = await supabase
        .from("verification_requests")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq("id", request.id);

      if (requestError) throw requestError;

      // Update token verification status
      const { error: tokenError } = await supabase
        .from("submitted_tokens")
        .update({ verified: true })
        .eq("token_address", request.token_address);

      if (tokenError) throw tokenError;

      toast({
        title: "Success! ✅",
        description: `${request.token_name} has been verified`,
      });

      fetchRequests();
    } catch (error) {
      console.error("Error approving verification:", error);
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive",
      });
    }
  };

  const rejectVerification = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("verification_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request rejected",
        description: "Verification request has been rejected",
      });

      fetchRequests();
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Access denied. Admin privileges required.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Verification Requests</h1>

        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{request.token_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{request.token_symbol}</p>
                  </div>
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Contract Address:</p>
                  <p className="text-sm text-muted-foreground font-mono">{request.token_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Transaction Hash:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {request.transaction_hash}
                    </p>
                    <a
                      href={`https://scan.pulsechain.com/tx/${request.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount: ${request.amount_usd} USDC</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => approveVerification(request)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectVerification(request.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No verification requests yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
