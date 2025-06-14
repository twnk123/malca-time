-- Create storage bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-logos', 'restaurant-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for restaurant logos bucket
DROP POLICY IF EXISTS "Restaurant logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload restaurant logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update restaurant logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete restaurant logos" ON storage.objects;

CREATE POLICY "Restaurant logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Anyone can upload restaurant logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'restaurant-logos');

CREATE POLICY "Anyone can update restaurant logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Anyone can delete restaurant logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'restaurant-logos');