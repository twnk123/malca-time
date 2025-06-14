-- Drop existing policies for food-images bucket
DROP POLICY IF EXISTS "Food images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete food images" ON storage.objects;

-- Create new policies for food-images bucket that allow public access
CREATE POLICY "Food images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'food-images');

CREATE POLICY "Anyone can upload food images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'food-images');

CREATE POLICY "Anyone can update food images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'food-images');

CREATE POLICY "Anyone can delete food images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'food-images');