-- Création de la table orders
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  property_id uuid references public.properties(id),
  services jsonb not null,
  total_amount decimal(10,2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  stripe_session_id text,
  guest_email text not null,
  guest_name text not null
);

-- Politiques de sécurité pour orders
create policy "Les utilisateurs peuvent voir leurs propres commandes"
  on orders
  for select
  using (auth.uid() = user_id);

create policy "Les invités peuvent créer des commandes"
  on orders
  for insert
  with check (true);

create policy "Les propriétaires peuvent mettre à jour leurs commandes"
  on orders
  for update
  using (auth.uid() = user_id);