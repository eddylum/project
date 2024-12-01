-- Drop existing contact_info table and related objects
drop view if exists public.properties_with_contact;
drop table if exists public.contact_info;

-- Add contact fields directly to properties table
alter table public.properties 
add column if not exists contact_phone text,
add column if not exists contact_guide_url text;

-- Migrate any existing data if needed
-- This is safe to run even if the contact_info table doesn't exist
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'contact_info') then
    update properties p
    set 
      contact_phone = c.phone,
      contact_guide_url = c.guide_url
    from contact_info c
    where c.property_id = p.id;
  end if;
end$$;

-- Update RLS policies to include new fields
create or replace policy "Allow public read access to properties"
  on properties
  for select
  using (true);

create or replace policy "Allow authenticated users to create properties"
  on properties
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace policy "Allow users to update their own properties"
  on properties
  for update
  to authenticated
  using (auth.uid() = user_id);