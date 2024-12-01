-- First drop existing policies to avoid conflicts
drop policy if exists "Allow public read access to properties" on properties;
drop policy if exists "Allow authenticated users to create properties" on properties;
drop policy if exists "Allow users to update their own properties" on properties;

-- Drop existing columns if they exist to ensure clean state
alter table public.properties 
drop column if exists contact_phone,
drop column if exists contact_guide_url;

-- Add columns with proper definitions
alter table public.properties 
add column contact_phone text default null,
add column contact_guide_url text default null;

-- Refresh the schema cache
notify pgrst, 'reload schema';

-- Create new policies
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

-- Grant necessary permissions
grant all on properties to authenticated;
grant select on properties to anon;