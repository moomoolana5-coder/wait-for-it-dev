import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { wallet_address } = await req.json();

    if (!wallet_address) {
      throw new Error('wallet_address is required');
    }

    console.log('Registering/checking wallet:', wallet_address);

    // Admin wallet address
    const ADMIN_WALLET = '0x720a8ee141577dc8f3190417264bf91f59821169';
    
    // Check if wallet is already registered
    const { data: existingWallet } = await supabase
      .from('wallet_addresses')
      .select('*, user_roles(*)')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (existingWallet) {
      console.log('Wallet already exists:', existingWallet);
      
      // Check if it's admin wallet and has admin role
      if (wallet_address.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
        const hasAdminRole = existingWallet.user_roles?.some((r: any) => r.role === 'admin');
        
        return new Response(
          JSON.stringify({
            success: true,
            is_admin: hasAdminRole,
            message: hasAdminRole ? 'Admin wallet verified' : 'Wallet exists but not admin',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          is_admin: false,
          message: 'Wallet registered',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For new wallets, create anonymous user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${wallet_address.toLowerCase()}@wallet.giga`,
      email_confirm: true,
      user_metadata: {
        wallet_address: wallet_address.toLowerCase(),
      },
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    console.log('Created user:', authData.user.id);

    // Register wallet address
    const { error: walletError } = await supabase
      .from('wallet_addresses')
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        user_id: authData.user.id,
      });

    if (walletError) {
      console.error('Error inserting wallet:', walletError);
      throw walletError;
    }

    // If it's the admin wallet, assign admin role
    if (wallet_address.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin',
        });

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
        throw roleError;
      }

      console.log('Admin role assigned to wallet:', wallet_address);

      return new Response(
        JSON.stringify({
          success: true,
          is_admin: true,
          message: 'Admin wallet registered successfully',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        is_admin: false,
        message: 'Wallet registered successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});