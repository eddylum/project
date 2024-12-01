-- Drop existing table if it exists to ensure clean state
drop table if exists public.contact_info;

-- Create the contact_info table with proper relationships
create table if not exists public.contact_info (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade,
  phone text,
  guide_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(property_id)
);

-- Index for performance
create index if not exists idx_contact_info_property_id 
  on public.contact_info(property_id);

-- Enable RLS
alter table public.contact_info enable row level security;

-- RLS policies
create policy "Users can view contact info"
  on public.contact_info for select
  using (true);

create policy "Users can manage their own contact info"
  on public.contact_info for all
  using (
    exists (
      select 1 from properties
      where properties.id = contact_info.property_id
      and properties.user_id = auth.uid()
    )
  );

-- Updated_at trigger
create or replace function public.handle_contact_info_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_contact_info_updated
  before update on public.contact_info
  for each row
  execute procedure public.handle_contact_info_updated();

-- Create foreign key relationship explicitly
alter table public.contact_info
  add constraint fk_contact_info_property
  foreign key (property_id)
  references public.properties(id)
  on delete cascade;

-- Grant necessary permissions
grant all on public.contact_info to authenticated;
grant select on public.contact_info to anon;

-- Update properties view to include contact info
create or replace view public.properties_with_contact as
select 
  p.*,
  c.phone as contact_phone,
  c.guide_url as contact_guide_url
from public.properties p
left join public.contact_info c on c.property_id = p.id;