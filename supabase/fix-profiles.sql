-- Supprimer les triggers existants
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_profiles_updated on public.profiles;

-- Supprimer les fonctions
drop function if exists public.handle_new_user();
drop function if exists public.handle_updated_at();

-- Supprimer la table
drop table if exists public.profiles;

-- Recréer la table profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  business_name text,
  stripe_account_id text,
  stripe_account_status text default 'pending'
);

-- Activer RLS
alter table public.profiles enable row level security;

-- Politiques de sécurité
create policy "Les utilisateurs peuvent voir leur propre profil"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent modifier leur propre profil"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Les utilisateurs peuvent insérer leur propre profil"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Trigger pour updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Trigger pour création automatique du profil
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Créer les profils pour les utilisateurs existants
insert into public.profiles (id)
select id from auth.users
where id not in (select id from public.profiles);