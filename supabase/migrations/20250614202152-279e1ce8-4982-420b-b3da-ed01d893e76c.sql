-- First drop the existing constraint
ALTER TABLE public.narocila DROP CONSTRAINT IF EXISTS narocila_uporabnik_id_fkey;

-- Clean up invalid orders that reference profile IDs instead of user IDs
DELETE FROM public.narocila 
WHERE uporabnik_id NOT IN (SELECT user_id FROM public.profili);

-- Add the correct foreign key constraint
ALTER TABLE public.narocila 
ADD CONSTRAINT narocila_uporabnik_id_fkey 
FOREIGN KEY (uporabnik_id) REFERENCES public.profili(user_id) ON DELETE CASCADE;