-- Add contact fields to properties table if they don't exist
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_guide_url text;

-- Create saved_services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.saved_services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  icon text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.saved_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved services"
  ON public.saved_services FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved services"
  ON public.saved_services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved services"
  ON public.saved_services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved services"
  ON public.saved_services FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_services_user_id ON public.saved_services(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_services_created_at ON public.saved_services(created_at);

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for saved_services
DROP TRIGGER IF EXISTS set_saved_services_updated_at ON public.saved_services;
CREATE TRIGGER set_saved_services_updated_at
  BEFORE UPDATE ON public.saved_services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.saved_services TO authenticated;
GRANT SELECT ON public.saved_services TO anon;