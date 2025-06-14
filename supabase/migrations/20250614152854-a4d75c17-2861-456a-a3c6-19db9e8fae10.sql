-- Complete cleanup: Delete user from auth.users table and ensure clean state
-- First delete from auth.users (this will cascade to profili due to foreign key)
DELETE FROM auth.users WHERE email = 'sundotkulangot97@gmail.com';

-- Also clean up any remaining records in public tables
DO $$
DECLARE
    target_user_id uuid := 'ad57dc9d-e42e-4cf0-8db2-e339e350facb';
BEGIN
    -- Clean up any remaining records
    DELETE FROM public.ocene WHERE uporabnik_id IN (
        SELECT id FROM public.profili WHERE user_id = target_user_id
    );
    DELETE FROM public.postavke_narocila WHERE narocilo_id IN (
        SELECT id FROM public.narocila WHERE uporabnik_id IN (
            SELECT id FROM public.profili WHERE user_id = target_user_id
        )
    );
    DELETE FROM public.narocila WHERE uporabnik_id IN (
        SELECT id FROM public.profili WHERE user_id = target_user_id
    );
    DELETE FROM public.admin_restavracije WHERE admin_id = target_user_id;
    DELETE FROM public.profili WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Completed full cleanup for user ad57dc9d-e42e-4cf0-8db2-e339e350facb';
END $$;