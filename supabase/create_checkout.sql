-- Enable HTTP extension
create extension if not exists http with schema extensions;

-- Create the function
create or replace function public.create_checkout(
  services jsonb,
  property_id uuid,
  success_url text,
  cancel_url text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  stripe_response jsonb;
  line_items jsonb = '[]'::jsonb;
  service jsonb;
begin
  -- Construct line items array
  for service in select * from jsonb_array_elements(services)
  loop
    line_items = line_items || jsonb_build_object(
      'price_data', jsonb_build_object(
        'currency', 'eur',
        'product_data', jsonb_build_object(
          'name', service->>'name',
          'description', service->>'description'
        ),
        'unit_amount', (service->>'price')::numeric * 100
      ),
      'quantity', 1
    );
  end loop;

  -- Make request to Stripe
  select content::jsonb into stripe_response
  from http((
    'POST',
    'https://api.stripe.com/v1/checkout/sessions',
    ARRAY[
      ('Authorization', 'Bearer sk_test_51QLmr4C08T73wXPwvsBSFL7DBiFgU1NR9PZNTE8faUjQ8yEGTwdUboloTNS0lTIJ527kMb2Jb0hgsGNG0nr6uUOc003f8Lnwou'),
      ('Content-Type', 'application/x-www-form-urlencoded')
    ],
    'payment_method_types[]=card&mode=payment&success_url=' || 
    urlencode(success_url) || 
    '&cancel_url=' || 
    urlencode(cancel_url) ||
    '&line_items=' || 
    urlencode(line_items::text) ||
    '&metadata[property_id]=' || 
    property_id ||
    '&metadata[service_ids]=' || 
    (
      select string_agg(service->>'id', ',')
      from jsonb_array_elements(services) service
    )
  ));

  return stripe_response;
end;
$$;