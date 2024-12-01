import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const STRIPE_SECRET_KEY = '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'
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payment_intent_id } = await req.json()

    if (!payment_intent_id) {
      throw new Error('Payment intent ID is required')
    }

    const paymentIntent = await stripe.paymentIntents.cancel(payment_intent_id)

    return new Response(
      JSON.stringify({ success: true, paymentIntent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})