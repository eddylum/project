import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const HOSPITABLE_CLIENT_ID = Deno.env.get('HOSPITABLE_CLIENT_ID')
const HOSPITABLE_CLIENT_SECRET = Deno.env.get('HOSPITABLE_CLIENT_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, state } = await req.json()

    // Échanger le code contre un token
    const tokenResponse = await fetch('https://connect.hospitable.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: HOSPITABLE_CLIENT_ID,
        client_secret: HOSPITABLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.headers.get('origin')}/dashboard/sync/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error('Invalid token response')
    }

    // Initialiser le client Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    // Récupérer l'utilisateur depuis le state
    const { data: { user }, error: userError } = await supabase.auth.getUser(state)
    if (userError || !user) throw new Error('User not found')

    // Sauvegarder les tokens
    const { error: dbError } = await supabase
      .from('hospitable_connections')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})