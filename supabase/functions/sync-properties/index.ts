import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const HOSPITABLE_API_URL = 'https://connect.hospitable.com/api/v1'
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
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    
    // Récupérer l'utilisateur
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not found')

    // Récupérer le token Hospitable
    const { data: connection, error: connectionError } = await supabase
      .from('hospitable_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      throw new Error('Hospitable connection not found')
    }

    // Récupérer les propriétés depuis Hospitable
    const propertiesResponse = await fetch(`${HOSPITABLE_API_URL}/customers/${user.id}/listings`, {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Connect-Version': '2024-03-17',
      },
    })

    const properties = await propertiesResponse.json()

    // Synchroniser les propriétés
    for (const property of properties.data) {
      await supabase
        .from('properties')
        .upsert({
          user_id: user.id,
          name: property.public_name,
          address: `${property.address.street}, ${property.address.city}`,
          image_url: property.picture,
          hospitable_id: property.id,
          hospitable_platform_id: property.platform_id,
        })
    }

    return new Response(
      JSON.stringify({ success: true, count: properties.data.length }),
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