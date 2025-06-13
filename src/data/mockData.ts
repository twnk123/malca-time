export interface Restavracija {
  id: string;
  naziv: string;
  opis: string;
  lokacija: string;
  slika: string;
  ocena: number;
  cas_dostave: string;
}

export interface Jed {
  id: string;
  naziv: string;
  opis: string;
  cena: number;
  kategorija: string;
  restavracija_id: string;
  na_voljo: boolean;
}

export interface Narocilo {
  id: string;
  uporabnik_id: string;
  restavracija_id: string;
  jedi: Array<{
    jed_id: string;
    naziv: string;
    kolicina: number;
    cena: number;
  }>;
  skupna_cena: number;
  stanje: 'novo' | 'sprejeto' | 'v_pripravi' | 'pripravljeno' | 'prevzeto';
  datum_narocila: string;
  ime_narocnika: string;
}

export const mockRestavracije: Restavracija[] = [
  {
    id: 'rest_1',
    naziv: 'Pizzeria Napoli',
    opis: 'Pristna italijanska kuhinja z najboljšimi pizzami v mestu',
    lokacija: 'Ljubljana Center',
    slika: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
    ocena: 4.5,
    cas_dostave: '30-45 min'
  },
  {
    id: 'rest_2',
    naziv: 'Gostilna Pri Marici',
    opis: 'Tradicionalna slovenska kuhinja z domačimi specialitetami',
    lokacija: 'Ljubljana Bežigrad',
    slika: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop',
    ocena: 4.8,
    cas_dostave: '25-40 min'
  },
  {
    id: 'rest_3',
    naziv: 'Sushi Zen',
    opis: 'Sveži sushi in japonske specialitete',
    lokacija: 'Ljubljana Vič',
    slika: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop',
    ocena: 4.3,
    cas_dostave: '40-55 min'
  }
];

export const mockJedi: Jed[] = [
  // Pizzeria Napoli
  {
    id: 'jed_1',
    naziv: 'Pizza Margherita',
    opis: 'Paradižnikova osnova, mozzarella, bazilika',
    cena: 12.50,
    kategorija: 'Glavne jedi',
    restavracija_id: 'rest_1',
    na_voljo: true
  },
  {
    id: 'jed_2',
    naziv: 'Pizza Quattro Stagioni',
    opis: 'Paradižnikova osnova, mozzarella, šunka, gobe, artičoke, olive',
    cena: 15.90,
    kategorija: 'Glavne jedi',
    restavracija_id: 'rest_1',
    na_voljo: true
  },
  {
    id: 'jed_3',
    naziv: 'Coca Cola 0.33l',
    opis: 'Osvežilna pijača',
    cena: 2.50,
    kategorija: 'Pijače',
    restavracija_id: 'rest_1',
    na_voljo: true
  },
  // Gostilna Pri Marici
  {
    id: 'jed_4',
    naziv: 'Goveja juha z nudlji',
    opis: 'Domača goveja juha z jajčnimi nudlji',
    cena: 3.80,
    kategorija: 'Juhe',
    restavracija_id: 'rest_2',
    na_voljo: true
  },
  {
    id: 'jed_5',
    naziv: 'Dunajski zrezek s krompirjem',
    opis: 'Telji zrezek v tempuri s pečenim krompirjem',
    cena: 14.50,
    kategorija: 'Glavne jedi',
    restavracija_id: 'rest_2',
    na_voljo: true
  },
  {
    id: 'jed_6',
    naziv: 'Domač sok iz črnega ribeza',
    opis: 'Sveže stisnjen sok iz domačih ribezov',
    cena: 3.20,
    kategorija: 'Pijače',
    restavracija_id: 'rest_2',
    na_voljo: true
  },
  // Sushi Zen
  {
    id: 'jed_7',
    naziv: 'Salmon Roll',
    opis: '8 kosov - losos, avokado, kumarica',
    cena: 8.90,
    kategorija: 'Sushi',
    restavracija_id: 'rest_3',
    na_voljo: true
  },
  {
    id: 'jed_8',
    naziv: 'Miso juha',
    opis: 'Tradicionalna japonska juha z miso pasto',
    cena: 4.50,
    kategorija: 'Juhe',
    restavracija_id: 'rest_3',
    na_voljo: true
  },
  {
    id: 'jed_9',
    naziv: 'Zeleni čaj',
    opis: 'Tradicionalni japonski zeleni čaj',
    cena: 2.80,
    kategorija: 'Pijače',
    restavracija_id: 'rest_3',
    na_voljo: true
  }
];

export const mockNarocila: Narocilo[] = [
  {
    id: 'nar_1',
    uporabnik_id: '2',
    restavracija_id: 'rest_1',
    jedi: [
      {
        jed_id: 'jed_1',
        naziv: 'Pizza Margherita',
        kolicina: 2,
        cena: 12.50
      },
      {
        jed_id: 'jed_3',
        naziv: 'Coca Cola 0.33l',
        kolicina: 2,
        cena: 2.50
      }
    ],
    skupna_cena: 30.00,
    stanje: 'novo',
    datum_narocila: '2024-01-15T12:30:00Z',
    ime_narocnika: 'Test Uporabnik'
  },
  {
    id: 'nar_2',
    uporabnik_id: '3',
    restavracija_id: 'rest_1',
    jedi: [
      {
        jed_id: 'jed_2',
        naziv: 'Pizza Quattro Stagioni',
        kolicina: 1,
        cena: 15.90
      }
    ],
    skupna_cena: 15.90,
    stanje: 'sprejeto',
    datum_narocila: '2024-01-15T13:15:00Z',
    ime_narocnika: 'Ana Novak'
  }
];