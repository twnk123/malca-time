-- ===== PRVI DEL: ENUM TIPI =====
CREATE TYPE public.user_role AS ENUM ('uporabnik', 'admin_restavracije');
CREATE TYPE public.order_status AS ENUM ('novo', 'sprejeto', 'v_pripravi', 'pripravljeno', 'prevzeto');

-- ===== DRUGI DEL: GLAVNE TABELE =====

-- Tabela profili
CREATE TABLE public.profili (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    ime TEXT NOT NULL,
    priimek TEXT NOT NULL,
    telefon TEXT,
    vloga public.user_role NOT NULL DEFAULT 'uporabnik',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela restavracije
CREATE TABLE public.restavracije (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    naziv TEXT NOT NULL,
    opis TEXT,
    lokacija TEXT NOT NULL,
    kontakt TEXT,
    email TEXT,
    delovni_cas_od TIME NOT NULL DEFAULT '08:00:00',
    delovni_cas_do TIME NOT NULL DEFAULT '16:00:00',
    aktivna BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela admin_restavracije (many-to-many)
CREATE TABLE public.admin_restavracije (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES public.profili(id) ON DELETE CASCADE,
    restavracija_id UUID NOT NULL REFERENCES public.restavracije(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(admin_id, restavracija_id)
);

-- Tabela kategorije_menija
CREATE TABLE public.kategorije_menija (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restavracija_id UUID NOT NULL REFERENCES public.restavracije(id) ON DELETE CASCADE,
    naziv TEXT NOT NULL,
    opis TEXT,
    vrstni_red INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela jedi
CREATE TABLE public.jedi (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restavracija_id UUID NOT NULL REFERENCES public.restavracije(id) ON DELETE CASCADE,
    kategorija_id UUID NOT NULL REFERENCES public.kategorije_menija(id) ON DELETE CASCADE,
    ime TEXT NOT NULL,
    opis TEXT,
    cena DECIMAL(10,2) NOT NULL,
    na_voljo BOOLEAN NOT NULL DEFAULT true,
    slika_url TEXT,
    vrstni_red INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela narocila
CREATE TABLE public.narocila (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    uporabnik_id UUID NOT NULL REFERENCES public.profili(id) ON DELETE CASCADE,
    restavracija_id UUID NOT NULL REFERENCES public.restavracije(id) ON DELETE CASCADE,
    cas_prevzema TIMESTAMP WITH TIME ZONE NOT NULL,
    skupna_cena DECIMAL(10,2) NOT NULL,
    status public.order_status NOT NULL DEFAULT 'novo',
    opomba TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela postavke_narocila
CREATE TABLE public.postavke_narocila (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    narocilo_id UUID NOT NULL REFERENCES public.narocila(id) ON DELETE CASCADE,
    jed_id UUID NOT NULL REFERENCES public.jedi(id) ON DELETE CASCADE,
    kolicina INTEGER NOT NULL DEFAULT 1,
    cena_na_kos DECIMAL(10,2) NOT NULL,
    opomba TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela ocene
CREATE TABLE public.ocene (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    narocilo_id UUID NOT NULL REFERENCES public.narocila(id) ON DELETE CASCADE,
    uporabnik_id UUID NOT NULL REFERENCES public.profili(id) ON DELETE CASCADE,
    restavracija_id UUID NOT NULL REFERENCES public.restavracije(id) ON DELETE CASCADE,
    ocena INTEGER NOT NULL CHECK (ocena >= 1 AND ocena <= 5),
    komentar TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== TRETJI DEL: TRIGGER ZA AUTO-SYNC Z AUTH.USERS =====

-- Funkcija za ustvarjanje profila
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profili (user_id, email, ime, priimek, vloga)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'ime', 'Uporabnik'),
        COALESCE(NEW.raw_user_meta_data ->> 'priimek', ''),
        'uporabnik'::public.user_role
    );
    RETURN NEW;
END;
$$;

-- Trigger za avtomatsko ustvarjanje profila
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== ČETRTI DEL: FUNKCIJA ZA UPDATED_AT =====

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggerji za updated_at
CREATE TRIGGER update_profili_updated_at BEFORE UPDATE ON public.profili FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restavracije_updated_at BEFORE UPDATE ON public.restavracije FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kategorije_menija_updated_at BEFORE UPDATE ON public.kategorije_menija FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jedi_updated_at BEFORE UPDATE ON public.jedi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_narocila_updated_at BEFORE UPDATE ON public.narocila FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== PETI DEL: RLS POLITIKE =====

-- Omogočimo RLS za vse tabele
ALTER TABLE public.profili ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restavracije ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_restavracije ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategorije_menija ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jedi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narocila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postavke_narocila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocene ENABLE ROW LEVEL SECURITY;

-- Varnostne funkcije
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT vloga::text FROM public.profili WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Politike za profili
CREATE POLICY "Uporabniki lahko vidijo svoj profil ali če so admin" ON public.profili
    FOR SELECT USING (user_id = auth.uid() OR public.get_current_user_role() = 'admin_restavracije');

CREATE POLICY "Uporabniki lahko urejajo svoj profil" ON public.profili
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Sistem lahko vstavi profile" ON public.profili
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politike za restavracije, kategorije, jedi - javno branje
CREATE POLICY "Vsi lahko berejo restavracije" ON public.restavracije FOR SELECT USING (true);
CREATE POLICY "Vsi lahko berejo kategorije" ON public.kategorije_menija FOR SELECT USING (true);
CREATE POLICY "Vsi lahko berejo jedi" ON public.jedi FOR SELECT USING (true);

-- Politike za admin_restavracije
CREATE POLICY "Admini lahko vidijo svojo povezavo" ON public.admin_restavracije
    FOR SELECT USING (admin_id IN (SELECT id FROM public.profili WHERE user_id = auth.uid()));

-- Politike za naročila
CREATE POLICY "Uporabniki vidijo svoja naročila" ON public.narocila
    FOR SELECT USING (uporabnik_id IN (SELECT id FROM public.profili WHERE user_id = auth.uid()));

CREATE POLICY "Uporabniki lahko ustvarijo svoja naročila" ON public.narocila
    FOR INSERT WITH CHECK (uporabnik_id IN (SELECT id FROM public.profili WHERE user_id = auth.uid()));

CREATE POLICY "Uporabniki lahko urejajo svoja naročila" ON public.narocila
    FOR UPDATE USING (uporabnik_id IN (SELECT id FROM public.profili WHERE user_id = auth.uid()));

-- Politike za postavke naročila
CREATE POLICY "Uporabniki lahko dostopajo do postavk svojih naročil" ON public.postavke_narocila
    FOR SELECT USING (narocilo_id IN (
        SELECT id FROM public.narocila WHERE uporabnik_id IN (
            SELECT id FROM public.profili WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Uporabniki lahko dodajajo postavke v svoja naročila" ON public.postavke_narocila
    FOR INSERT WITH CHECK (narocilo_id IN (
        SELECT id FROM public.narocila WHERE uporabnik_id IN (
            SELECT id FROM public.profili WHERE user_id = auth.uid()
        )
    ));

-- Politike za ocene
CREATE POLICY "Vsi lahko berejo ocene" ON public.ocene FOR SELECT USING (true);

CREATE POLICY "Uporabniki lahko ocenijo svoja naročila" ON public.ocene
    FOR INSERT WITH CHECK (uporabnik_id IN (SELECT id FROM public.profili WHERE user_id = auth.uid()));

-- ===== ŠESTI DEL: TESTNI PODATKI =====

-- Vstavi testno restavracijo
INSERT INTO public.restavracije (id, naziv, opis, lokacija, kontakt, email) VALUES 
(gen_random_uuid(), 'Okusna hiša', 'Tradicijska slovenska kuhinja z modernnim pridihom', 'Ljubljana, Trubarjeva 15', '+386 1 234 5678', 'info@okusnohisa.si');

-- Pridobi ID restavracije za nadaljnje vstavljanje
WITH restavracija AS (
    SELECT id FROM public.restavracije WHERE naziv = 'Okusna hiša' LIMIT 1
),
kategorija_glavne AS (
    INSERT INTO public.kategorije_menija (restavracija_id, naziv, opis, vrstni_red)
    SELECT id, 'Glavne jedi', 'Naše glavne jedi iz svežih sestavin', 1
    FROM restavracija
    RETURNING id
),
kategorija_pijace AS (
    INSERT INTO public.kategorije_menija (restavracija_id, naziv, opis, vrstni_red)
    SELECT id, 'Pijače', 'Osvežilne pijače in kava', 2
    FROM restavracija
    RETURNING id
)
INSERT INTO public.jedi (restavracija_id, kategorija_id, ime, opis, cena, vrstni_red)
SELECT 
    r.id,
    kg.id,
    'Dunajski zrezek',
    'Hrustljav dunajski zrezek s krompirjevo solato',
    12.50,
    1
FROM restavracija r, kategorija_glavne kg
UNION ALL
SELECT 
    r.id,
    kg.id,
    'Goveji golaž',
    'Tradicionalni slovenski golaž z domačimi žličnjaki',
    11.80,
    2
FROM restavracija r, kategorija_glavne kg
UNION ALL
SELECT 
    r.id,
    kp.id,
    'Kava',
    'Sveže mleta kava',
    2.50,
    1
FROM restavracija r, kategorija_pijace kp;