import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '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'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://nlryvsswbbxdatxvpjni.supabase.co'
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scnl2c3N3YmJ4ZGF0eHZwam5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTkxNDgsImV4cCI6MjA0NzMzNTE0OH0.N0AAWZwkjdzU9zfRRnw0jo7Qm2Wb6GSb6Gv7nbpd37E'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

const defaultResponse = {
  totalRevenue: 0,
  monthlyRevenue: 0,
  totalTransactions: 0,
  recentPayments: [],
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { timeframe = 'month' } = await req.json()

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          ...defaultResponse,
          error: 'Authorization required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: { Authorization: authHeader }
      }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          ...defaultResponse,
          error: 'User not found'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_account_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_account_id) {
      return new Response(
        JSON.stringify(defaultResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    if (profile.stripe_account_status !== 'active') {
      return new Response(
        JSON.stringify({
          ...defaultResponse,
          message: 'Stripe account pending verification'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const now = new Date()
    let startDate = new Date()

    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    const balanceTransactions = await stripe.balanceTransactions.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
      },
      type: 'charge',
    }, {
      stripeAccount: profile.stripe_account_id,
    })

    const totalRevenue = balanceTransactions.data.reduce((sum, transaction) => 
      sum + transaction.net / 100, 0)

    const monthlyRevenue = balanceTransactions.data
      .filter(transaction => {
        const transactionDate = new Date(transaction.created * 1000)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return transactionDate >= monthAgo
      })
      .reduce((sum, transaction) => sum + transaction.net / 100, 0)

    const recentPayments = balanceTransactions.data.slice(0, 10).map(transaction => ({
      id: transaction.id,
      amount: transaction.net / 100,
      date: new Date(transaction.created * 1000).toISOString(),
      status: transaction.status,
      serviceName: transaction.description || 'Service',
    }))

    return new Response(
      JSON.stringify({
        totalRevenue,
        monthlyRevenue,
        totalTransactions: balanceTransactions.data.length,
        recentPayments,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-analytics:', error)
    
    return new Response(
      JSON.stringify({
        ...defaultResponse,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})