-- Odstrani novo restavracijo "Restavracija Miška"
DELETE FROM public.restavracije WHERE naziv = 'Restavracija Miška';

-- Spremeni uro zapiranja za "Okusna hiša" na 4:00 zjutraj
UPDATE public.restavracije 
SET delovni_cas_do = '04:00:00'
WHERE naziv = 'Okusna hiša';