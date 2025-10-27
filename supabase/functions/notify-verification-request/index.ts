import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationNotificationRequest {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  transactionHash: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      tokenName, 
      tokenSymbol, 
      tokenAddress, 
      transactionHash,
      adminEmail 
    }: VerificationNotificationRequest = await req.json();

    console.log("Sending verification notification email for:", tokenName);

    const emailResponse = await resend.emails.send({
      from: "GIGACOCK Verification <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Token Verification Request: ${tokenName} (${tokenSymbol})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            New Token Verification Request
          </h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Token Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Token Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${tokenName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Symbol:</td>
                <td style="padding: 8px 0; color: #1f2937;">${tokenSymbol}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Contract Address:</td>
                <td style="padding: 8px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${tokenAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Transaction Hash:</td>
                <td style="padding: 8px 0;">
                  <a href="https://scan.pulsechain.com/tx/${transactionHash}" 
                     style="color: #3b82f6; text-decoration: none; font-family: monospace; font-size: 11px;">
                    ${transactionHash.slice(0, 20)}...
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Payment Amount:</strong> $150 USDC
            </p>
          </div>

          <p style="color: #4b5563;">
            Please verify the payment transaction and approve the verification request in the admin panel.
          </p>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This is an automated notification from your GIGACOCK token verification system.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-verification-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
