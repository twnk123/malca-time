-- Enable RLS on restavracije table if not already enabled
ALTER TABLE public.restavracije ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view their restaurant" ON public.restavracije;
DROP POLICY IF EXISTS "Admins can update their restaurant" ON public.restavracije;
DROP POLICY IF EXISTS "Public can view active restaurants" ON public.restavracije;

-- Create policy for admins to view their restaurant
CREATE POLICY "Admins can view their restaurant"
ON public.restavracije
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT restavracija_id 
    FROM admin_restavracije 
    WHERE admin_id = auth.uid()
  )
);

-- Create policy for admins to update their restaurant
CREATE POLICY "Admins can update their restaurant"
ON public.restavracije
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT restavracija_id 
    FROM admin_restavracije 
    WHERE admin_id = auth.uid()
  )
);

-- Create policy for public to view active restaurants
CREATE POLICY "Public can view active restaurants"
ON public.restavracije
FOR SELECT
TO anon, authenticated
USING (aktivna = true);