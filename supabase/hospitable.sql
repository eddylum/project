-- Table pour stocker les informations de connexion Hospitable
create table if not exists public.hospitable_connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour optimiser les recherches
create index if not exists idx_hospitable_connections_user_id 
  on public.hospitable_connections(user_id);

-- Politiques de sécurité
alter table public.hospitable_connections enable row level security;

create policy "Users can view their own Hospitable connection"
  on public.hospitable_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Hospitable connection"
  on public.hospitable_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own Hospitable connection"
  on public.hospitable_connections for update
  using (auth.uid() = user_id);

-- Trigger pour updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_hospitable_connection_updated
  before update on public.hospitable_connections
  for each row
  execute procedure public.handle_updated_at();