-- Add Stripe Connect account info to profiles
alter table public.profiles add column if not exists stripe_account_id text;
alter table public.profiles add column if not exists stripe_account_status text default 'pending';

-- Add indexes
create index if not exists idx_profiles_stripe_account_id on public.profiles(stripe_account_id);