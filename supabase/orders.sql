-- Ajouter la colonne arrival_date à la table orders
alter table public.orders 
add column if not exists arrival_date date not null;