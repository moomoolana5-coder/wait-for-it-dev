import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Database, Mail, Shield } from "lucide-react";

export default function AdminInstructions() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Admin Setup Guide
        </h1>

        <Alert className="mb-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Follow these steps to set up admin access and start verifying tokens.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Step 1: Create Admin Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                Create Admin Account
              </CardTitle>
              <CardDescription>First, you need to create an account on your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to <code className="bg-muted px-2 py-1 rounded">/auth</code> page</li>
                <li>Sign up with your admin email address</li>
                <li>Complete the registration process</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 2: Get Your User ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Find Your User ID
              </CardTitle>
              <CardDescription>You'll need your user ID to add admin privileges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">After logging in, open your browser's console and run:</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-xs">{`import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.auth.getUser();
console.log(data.user.id);`}</code>
              </pre>
              <p className="text-sm text-muted-foreground">Or check the Backend → Authentication → Users section</p>
            </CardContent>
          </Card>

          {/* Step 3: Add Admin Role */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                Add Admin Role to Database
              </CardTitle>
              <CardDescription>Execute SQL to grant admin privileges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Go to Backend → SQL Editor and run:</p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-xs">{`INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');`}</code>
                </pre>
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Replace <code className="bg-background px-1 py-0.5 rounded">YOUR_USER_ID_HERE</code> with the actual user ID from step 2
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Setup Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
                Configure Email Notifications
              </CardTitle>
              <CardDescription>Set up Resend for email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com</a></li>
                <li>Verify your email domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/domains</a></li>
                <li>Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/api-keys</a></li>
                <li>The <code className="bg-muted px-2 py-1 rounded">RESEND_API_KEY</code> secret is already configured</li>
              </ol>
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Update the "from" email in the edge function to use your verified domain
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 5: Access Admin Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">5</span>
                Access Admin Panel
              </CardTitle>
              <CardDescription>Start approving verification requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you've completed the steps above, visit <code className="bg-muted px-2 py-1 rounded">/admin/verification</code> to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>View all verification requests</li>
                <li>Check payment transactions on PulseChain scanner</li>
                <li>Approve or reject verification requests</li>
                <li>Add the gold verified badge to approved tokens</li>
              </ul>
            </CardContent>
          </Card>

          {/* How Verification Works */}
          <Card className="border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-yellow-500" />
                How Token Verification Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>User submits request:</strong> They fill out the verification form with token details and their transaction hash for $150 USDC payment</li>
                <li><strong>Email notification:</strong> You receive an email with all the details including a link to verify the transaction</li>
                <li><strong>Admin reviews:</strong> You check the transaction on PulseChain scanner to confirm payment</li>
                <li><strong>Approve/Reject:</strong> In the admin panel, you either approve (adds gold badge) or reject the request</li>
                <li><strong>Badge appears:</strong> Once approved, the gold verified checkmark appears next to the token in all listings</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
