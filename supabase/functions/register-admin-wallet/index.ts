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

    // Try to create user, or get existing if email already exists
    let userId: string;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${wallet_address.toLowerCase()}@wallet.giga`,
      email_confirm: true,
      user_metadata: {
        wallet_address: wallet_address.toLowerCase(),
      },
    });

    if (authError) {
      // If user already exists, fetch the existing user
      if (authError.message?.includes('already been registered')) {
        console.log('User already exists, fetching existing user');
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(
          u => u.email === `${wallet_address.toLowerCase()}@wallet.giga`
        );
        
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }
        
        userId = existingUser.id;
        console.log('Found existing user:', userId);
      } else {
        console.error('Error creating user:', authError);
        throw authError;
      }
    } else {
      userId = authData.user.id;
      console.log('Created new user:', userId);
    }

    // Register wallet address (ignore if already exists)
    const { error: walletError } = await supabase
      .from('wallet_addresses')
      .insert({
        wallet_address: wallet_address.toLowerCase(),
        user_id: userId,
      })
      .select()
      .single();

    if (walletError && !walletError.message?.includes('duplicate')) {
      console.error('Error inserting wallet:', walletError);
      throw walletError;
    }

    // If it's the admin wallet, assign admin role (ignore if already exists)
    if (wallet_address.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
        })
        .select()
        .single();

      if (roleError && !roleError.message?.includes('duplicate')) {
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