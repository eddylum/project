-- Politiques pour la table properties
create policy "Allow public read access to properties"
  on properties
  for select
  to anon
  using (true);

create policy "Allow authenticated users to create properties"
  on properties
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow users to update their own properties"
  on properties
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Politiques pour la table services
create policy "Allow public read access to services"
  on services
  for select
  to anon
  using (true);

create policy "Allow authenticated users to manage their services"
  on services
  for all
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = services.property_id
      and properties.user_id = auth.uid()
    )
  );