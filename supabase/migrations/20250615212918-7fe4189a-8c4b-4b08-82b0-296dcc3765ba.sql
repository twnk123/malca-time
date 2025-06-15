-- Dodaj novo restavracijo "Restavracija Miška" brez časa zapiranja
INSERT INTO public.restavracije (naziv, opis, lokacija, kontakt, email, delovni_cas_od, delovni_cas_do) 
VALUES (
  'Restavracija Miška', 
  'Tradicionalna slovenska kuhinja z domačo atmosfero', 
  'Ljubljana, Prešernova 10', 
  '+386 1 987 6543', 
  'info@miska.si',
  '07:00:00',
  '23:59:59'
);