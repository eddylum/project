-- Drop existing table if it exists
drop table if exists public.saved_services;

-- Create saved_services table
create table public.saved_services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text not null,
  price decimal(10,2) not null,
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.saved_services enable row level security;

-- Create policies
create policy "Users can view their own saved services"
  on public.saved_services for select
  using (auth.uid() = user_id);

create policy "Users can create their own saved services"
  on public.saved_services for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved services"
  on public.saved_services for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved services"
  on public.saved_services for delete
  using (auth.uid() = user_id);

-- Create indexes
create index idx_saved_services_user_id on public.saved_services(user_id);
create index idx_saved_services_created_at on public.saved_services(created_at);

-- Create updated_at trigger
create trigger set_saved_services_updated_at
  before update on public.saved_services
  for each row
  execute function public.handle_updated_at();