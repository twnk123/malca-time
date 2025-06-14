-- Enable RLS and create policies for admin_restavracije table
ALTER TABLE public.admin_restavracije ENABLE ROW LEVEL SECURITY;

-- Admin can view their restaurant connection
CREATE POLICY "Admins can view their restaurant connection" 
ON public.admin_restavracije 
FOR SELECT 
USING (auth.uid() = admin_id);

-- Admin can create their restaurant connection (for setup)
CREATE POLICY "Admins can create their restaurant connection" 
ON public.admin_restavracije 
FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

-- Admin can update their restaurant connection
CREATE POLICY "Admins can update their restaurant connection" 
ON public.admin_restavracije 
FOR UPDATE 
USING (auth.uid() = admin_id);

-- Admin can delete their restaurant connection
CREATE POLICY "Admins can delete their restaurant connection" 
ON public.admin_restavracije 
FOR DELETE 
USING (auth.uid() = admin_id);