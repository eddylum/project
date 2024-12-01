-- Drop existing policies
drop policy if exists "Allow public read access to properties" on properties;
drop policy if exists "Allow authenticated users to create properties" on properties;
drop policy if exists "Allow users to update their own properties" on properties;

-- Recreate columns with proper definitions
alter table public.properties 
drop column if exists contact_phone cascade,
drop column if exists contact_guide_url cascade;

alter table public.properties 
add column contact_phone text null,
add column contact_guide_url text null;

-- Refresh the schema cache
notify pgrst, 'reload schema';

-- Recreate policies
create policy "Allow public read access to properties"
on properties for select
using (true);

create policy "Allow authenticated users to create properties"
on properties for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Allow users to update their own properties"
on properties for update
to authenticated
using (auth.uid() = user_id);

-- Grant permissions
grant all on properties to authenticated;
grant select on properties to anon;

-- Create index for better performance
create index if not exists idx_properties_contact 
on properties(contact_phone, contact_guide_url);