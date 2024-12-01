-- Ajout de la relation entre properties et profiles
alter table public.properties add column if not exists host_stripe_account_id text;

-- Mise à jour de la politique pour permettre la jointure avec profiles
create policy "Allow public read access to properties with profiles"
  on properties
  for select
  using (true);

-- Ajout d'un index pour optimiser les requêtes
create index if not exists idx_properties_host_stripe_account_id 
  on properties(host_stripe_account_id);

-- Mise à jour des propriétés existantes avec l'ID du compte Stripe
update properties p
set host_stripe_account_id = (
  select stripe_account_id 
  from profiles pr 
  where pr.id = p.user_id
);

-- Trigger pour maintenir la synchronisation
create or replace function sync_stripe_account_id()
returns trigger as $$
begin
  update properties
  set host_stripe_account_id = new.stripe_account_id
  where user_id = new.id;
  return new;
end;
$$ language plpgsql;

create trigger sync_stripe_account_after_update
  after update of stripe_account_id on profiles
  for each row
  execute function sync_stripe_account_id();