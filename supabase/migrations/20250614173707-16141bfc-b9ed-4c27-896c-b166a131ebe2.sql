-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true);

-- Create policies for food images bucket
CREATE POLICY "Food images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated users can upload food images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their food images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their food images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');

-- Create storage bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-logos', 'restaurant-logos', true);

-- Create policies for restaurant logos bucket
CREATE POLICY "Restaurant logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Authenticated users can upload restaurant logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update restaurant logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete restaurant logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'restaurant-logos' AND auth.role() = 'authenticated');

-- Add logo_url column to restavracije table
ALTER TABLE public.restavracije ADD COLUMN logo_url TEXT;

-- Create table for favorite foods
CREATE TABLE public.priljubljene_jedi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uporabnik_id UUID NOT NULL,
  jed_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(uporabnik_id, jed_id)
);

-- Enable RLS on priljubljene_jedi
ALTER TABLE public.priljubljene_jedi ENABLE ROW LEVEL SECURITY;

-- Create policies for priljubljene_jedi
CREATE POLICY "Users can view their own favorite foods" 
ON public.priljubljene_jedi 
FOR SELECT 
USING (auth.uid()::text = (SELECT user_id::text FROM public.profili WHERE id = uporabnik_id));

CREATE POLICY "Users can add their own favorite foods" 
ON public.priljubljene_jedi 
FOR INSERT 
WITH CHECK (auth.uid()::text = (SELECT user_id::text FROM public.profili WHERE id = uporabnik_id));

CREATE POLICY "Users can remove their own favorite foods" 
ON public.priljubljene_jedi 
FOR DELETE 
USING (auth.uid()::text = (SELECT user_id::text FROM public.profili WHERE id = uporabnik_id));

-- Create table for discounts
CREATE TABLE public.popusti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jed_id UUID NOT NULL,
  tip_popusta TEXT NOT NULL CHECK (tip_popusta IN ('procent', 'znesek')),
  vrednost NUMERIC NOT NULL CHECK (vrednost > 0),
  naziv TEXT,
  opis TEXT,
  aktiven BOOLEAN NOT NULL DEFAULT true,
  veljavnost_od TIMESTAMP WITH TIME ZONE,
  veljavnost_do TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on popusti
ALTER TABLE public.popusti ENABLE ROW LEVEL SECURITY;

-- Create policies for popusti (admins can manage, everyone can view active ones)
CREATE POLICY "Everyone can view active discounts" 
ON public.popusti 
FOR SELECT 
USING (aktiven = true AND (veljavnost_od IS NULL OR veljavnost_od <= now()) AND (veljavnost_do IS NULL OR veljavnost_do >= now()));

-- Add updated_at trigger for popusti
CREATE TRIGGER update_popusti_updated_at
BEFORE UPDATE ON public.popusti
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add logo column to jedi table for food images
ALTER TABLE public.jedi ADD COLUMN IF NOT EXISTS slika_url TEXT;