-- Add foreign key constraints to priljubljene_jedi table
ALTER TABLE public.priljubljene_jedi 
ADD CONSTRAINT fk_priljubljene_jedi_uporabnik 
FOREIGN KEY (uporabnik_id) REFERENCES public.profili(id) ON DELETE CASCADE;

ALTER TABLE public.priljubljene_jedi 
ADD CONSTRAINT fk_priljubljene_jedi_jed 
FOREIGN KEY (jed_id) REFERENCES public.jedi(id) ON DELETE CASCADE;