-- Delete user from all tables where sundotkulangot97@gmail.com exists
-- First, get the user_id from profili table
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user_id for the email
    SELECT user_id INTO target_user_id 
    FROM public.profili 
    WHERE email = 'sundotkulangot97@gmail.com';
    
    -- Only proceed if user exists
    IF target_user_id IS NOT NULL THEN
        -- Delete from child tables first (to avoid foreign key constraints)
        DELETE FROM public.ocene WHERE uporabnik_id = target_user_id;
        DELETE FROM public.postavke_narocila WHERE narocilo_id IN (
            SELECT id FROM public.narocila WHERE uporabnik_id = target_user_id
        );
        DELETE FROM public.narocila WHERE uporabnik_id = target_user_id;
        DELETE FROM public.admin_restavracije WHERE admin_id = target_user_id;
        
        -- Delete from profili table
        DELETE FROM public.profili WHERE user_id = target_user_id;
        
        RAISE NOTICE 'Deleted user with email sundotkulangot97@gmail.com and user_id %', target_user_id;
    ELSE
        RAISE NOTICE 'No user found with email sundotkulangot97@gmail.com';
    END IF;
END $$;