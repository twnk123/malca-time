-- ===== DRUGA MIGRACIJA: PERFORMANTNI INDEKSI =====

-- Indeksi za profili tabelo
CREATE INDEX idx_profili_email ON public.profili(email);
CREATE INDEX idx_profili_vloga ON public.profili(vloga);
CREATE INDEX idx_profili_user_id ON public.profili(user_id);

-- Indeksi za admin_restavracije
CREATE INDEX idx_admin_restavracije_admin_id ON public.admin_restavracije(admin_id);
CREATE INDEX idx_admin_restavracije_restavracija_id ON public.admin_restavracije(restavracija_id);

-- Indeksi za kategorije_menija
CREATE INDEX idx_kategorije_menija_restavracija_id ON public.kategorije_menija(restavracija_id);
CREATE INDEX idx_kategorije_menija_vrstni_red ON public.kategorije_menija(vrstni_red);

-- Indeksi za jedi
CREATE INDEX idx_jedi_restavracija_id ON public.jedi(restavracija_id);
CREATE INDEX idx_jedi_kategorija_id ON public.jedi(kategorija_id);
CREATE INDEX idx_jedi_na_voljo ON public.jedi(na_voljo);
CREATE INDEX idx_jedi_vrstni_red ON public.jedi(vrstni_red);

-- Indeksi za naročila
CREATE INDEX idx_narocila_uporabnik_id ON public.narocila(uporabnik_id);
CREATE INDEX idx_narocila_restavracija_id ON public.narocila(restavracija_id);
CREATE INDEX idx_narocila_status ON public.narocila(status);
CREATE INDEX idx_narocila_created_at ON public.narocila(created_at);
CREATE INDEX idx_narocila_cas_prevzema ON public.narocila(cas_prevzema);

-- Indeksi za postavke_narocila
CREATE INDEX idx_postavke_narocila_narocilo_id ON public.postavke_narocila(narocilo_id);
CREATE INDEX idx_postavke_narocila_jed_id ON public.postavke_narocila(jed_id);

-- Indeksi za ocene
CREATE INDEX idx_ocene_narocilo_id ON public.ocene(narocilo_id);
CREATE INDEX idx_ocene_uporabnik_id ON public.ocene(uporabnik_id);
CREATE INDEX idx_ocene_restavracija_id ON public.ocene(restavracija_id);
CREATE INDEX idx_ocene_ocena ON public.ocene(ocena);
CREATE INDEX idx_ocene_created_at ON public.ocene(created_at);