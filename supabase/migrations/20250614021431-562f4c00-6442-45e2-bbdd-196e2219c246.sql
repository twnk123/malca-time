-- Fix admin_restavracije connection to use user_id instead of profili.id
-- and update role for existing admin

-- First, drop the old foreign key if it exists
ALTER TABLE public.admin_restavracije DROP CONSTRAINT IF EXISTS admin_restavracije_admin_id_fkey;

-- Update the admin_restavracije table to use user_id directly
UPDATE public.admin_restavracije 
SET admin_id = (
  SELECT user_id 
  FROM public.profili 
  WHERE profili.id = admin_restavracije.admin_id
);

-- Update the user role to admin_restavracije
UPDATE public.profili 
SET vloga = 'admin_restavracije' 
WHERE user_id = (
  SELECT admin_id 
  FROM public.admin_restavracije 
  WHERE admin_id IS NOT NULL
  LIMIT 1
);

-- Add a comment to clarify the structure
COMMENT ON COLUMN public.admin_restavracije.admin_id IS 'References auth.users.id (user_id from profili table)';