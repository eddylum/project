-- Add contact fields to properties table
alter table public.properties 
add column if not exists contact_phone text,
add column if not exists contact_guide_url text;

-- Update RLS policies
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