-- Pobriši obstoječe podatke v pravilnem vrstnem redu (najprej child tabele)
DELETE FROM postavke_narocila;
DELETE FROM ocene;
DELETE FROM narocila;
DELETE FROM jedi;
DELETE FROM kategorije_menija;
DELETE FROM admin_restavracije;
DELETE FROM restavracije;
DELETE FROM profili;

-- Ustvari testno restavracijo
INSERT INTO restavracije (id, naziv, opis, lokacija, kontakt, email, delovni_cas_od, delovni_cas_do, aktivna) 
VALUES (
    uuid_generate_v4(),
    'Okusna miška',
    'Priljubljena restavracija s tradicijsko slovensko kuhinjo in sodobnim pridihom. Ponujamo sveže sestavine in domače specialitete.',
    'Ljubljana, Trubarjeva cesta 15',
    '+386 1 425 6789',
    'info@okusnomiska.si',
    '09:00:00',
    '22:00:00',
    true
);

-- Dodaj kategoriji menija
WITH restavracija_id AS (
    SELECT id FROM restavracije WHERE naziv = 'Okusna miška' LIMIT 1
)
INSERT INTO kategorije_menija (id, restavracija_id, naziv, opis, vrstni_red) 
VALUES 
    (uuid_generate_v4(), (SELECT id FROM restavracija_id), 'Glavne jedi', 'Naše glavne jedi iz svežih in kakovostnih sestavin', 1),
    (uuid_generate_v4(), (SELECT id FROM restavracija_id), 'Pijače', 'Osvežilne pijače, kava in čaji', 2);

-- Dodaj jedi
WITH 
restavracija_id AS (SELECT id FROM restavracije WHERE naziv = 'Okusna miška' LIMIT 1),
glavne_jedi_id AS (SELECT id FROM kategorije_menija WHERE naziv = 'Glavne jedi' LIMIT 1),
pijace_id AS (SELECT id FROM kategorije_menija WHERE naziv = 'Pijače' LIMIT 1)
INSERT INTO jedi (id, restavracija_id, kategorija_id, ime, opis, cena, na_voljo, vrstni_red)
VALUES 
    -- Glavne jedi
    (uuid_generate_v4(), (SELECT id FROM restavracija_id), (SELECT id FROM glavne_jedi_id), 'Dunajski zrezek', 'Hrustljav dunajski zrezek s krompirjevo solato in brusnicami', 14.50, true, 1),
    (uuid_generate_v4(), (SELECT id FROM restavracija_id), (SELECT id FROM glavne_jedi_id), 'Goveji golaž', 'Tradicionalni slovenski golaž z domačimi žličnjaki in kislim zelje', 12.80, true, 2),
    -- Pijače
    (uuid_generate_v4(), (SELECT id FROM restavracija_id), (SELECT id FROM pijace_id), 'Kava espresso', 'Sveže mleta kava iz kakovostnih zrn', 2.20, true, 1),
    (uuid_generate_v4(), (SELECT id FROM restavracija_id), (SELECT id FROM pijace_id), 'Coca Cola 0,33l', 'Osvežilna gazirana pijača', 2.80, true, 2);