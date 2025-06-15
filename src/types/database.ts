// Database types za MalcaTime aplikacijo
// Generirano na podlagi Supabase schema

export type UserRole = 'uporabnik' | 'admin_restavracije';
export type OrderStatus = 'novo' | 'sprejeto' | 'v_pripravi' | 'pripravljeno' | 'prevzeto';

export interface Database {
  public: {
    Tables: {
      profili: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          ime: string;
          priimek: string;
          telefon: string | null;
          vloga: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          ime: string;
          priimek: string;
          telefon?: string | null;
          vloga?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          ime?: string;
          priimek?: string;
          telefon?: string | null;
          vloga?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      restavracije: {
        Row: {
          id: string;
          naziv: string;
          opis: string | null;
          lokacija: string;
          kontakt: string | null;
          email: string | null;
          delovni_cas_od: string;
          delovni_cas_do: string;
          logo_url: string | null;
          aktivna: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          naziv: string;
          opis?: string | null;
          lokacija: string;
          kontakt?: string | null;
          email?: string | null;
          delovni_cas_od?: string;
          delovni_cas_do?: string;
          logo_url?: string | null;
          aktivna?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          naziv?: string;
          opis?: string | null;
          lokacija?: string;
          kontakt?: string | null;
          email?: string | null;
          delovni_cas_od?: string;
          delovni_cas_do?: string;
          logo_url?: string | null;
          aktivna?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_restavracije: {
        Row: {
          id: string;
          admin_id: string;
          restavracija_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          restavracija_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          restavracija_id?: string;
          created_at?: string;
        };
      };
      kategorije_menija: {
        Row: {
          id: string;
          restavracija_id: string;
          naziv: string;
          opis: string | null;
          vrstni_red: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restavracija_id: string;
          naziv: string;
          opis?: string | null;
          vrstni_red?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restavracija_id?: string;
          naziv?: string;
          opis?: string | null;
          vrstni_red?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      jedi: {
        Row: {
          id: string;
          restavracija_id: string;
          kategorija_id: string;
          ime: string;
          opis: string | null;
          cena: number;
          na_voljo: boolean;
          slika_url: string | null;
          vrstni_red: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restavracija_id: string;
          kategorija_id: string;
          ime: string;
          opis?: string | null;
          cena: number;
          na_voljo?: boolean;
          slika_url?: string | null;
          vrstni_red?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restavracija_id?: string;
          kategorija_id?: string;
          ime?: string;
          opis?: string | null;
          cena?: number;
          na_voljo?: boolean;
          slika_url?: string | null;
          vrstni_red?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      narocila: {
        Row: {
          id: string;
          uporabnik_id: string;
          restavracija_id: string;
          cas_prevzema: string;
          skupna_cena: number;
          status: OrderStatus;
          opomba: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          uporabnik_id: string;
          restavracija_id: string;
          cas_prevzema: string;
          skupna_cena: number;
          status?: OrderStatus;
          opomba?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          uporabnik_id?: string;
          restavracija_id?: string;
          cas_prevzema?: string;
          skupna_cena?: number;
          status?: OrderStatus;
          opomba?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      postavke_narocila: {
        Row: {
          id: string;
          narocilo_id: string;
          jed_id: string;
          kolicina: number;
          cena_na_kos: number;
          opomba: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          narocilo_id: string;
          jed_id: string;
          kolicina?: number;
          cena_na_kos: number;
          opomba?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          narocilo_id?: string;
          jed_id?: string;
          kolicina?: number;
          cena_na_kos?: number;
          opomba?: string | null;
          created_at?: string;
        };
      };
      ocene: {
        Row: {
          id: string;
          narocilo_id: string;
          uporabnik_id: string;
          restavracija_id: string;
          ocena: number;
          komentar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          narocilo_id: string;
          uporabnik_id: string;
          restavracija_id: string;
          ocena: number;
          komentar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          narocilo_id?: string;
          uporabnik_id?: string;
          restavracija_id?: string;
          ocena?: number;
          komentar?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      update_updated_at_column: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types za lažjo uporabo
export type Profil = Database['public']['Tables']['profili']['Row'];
export type Restavracija = Database['public']['Tables']['restavracije']['Row'];
export type AdminRestavracije = Database['public']['Tables']['admin_restavracije']['Row'];
export type KategorijaMenija = Database['public']['Tables']['kategorije_menija']['Row'];
export type Jed = Database['public']['Tables']['jedi']['Row'];
export type Narocilo = Database['public']['Tables']['narocila']['Row'];
export type PostavkaNarocila = Database['public']['Tables']['postavke_narocila']['Row'];
export type Ocena = Database['public']['Tables']['ocene']['Row'];

// Insert types
export type ProfilInsert = Database['public']['Tables']['profili']['Insert'];
export type RestaurantInsert = Database['public']['Tables']['restavracije']['Insert'];
export type KategorijaMenijaInsert = Database['public']['Tables']['kategorije_menija']['Insert'];
export type JedInsert = Database['public']['Tables']['jedi']['Insert'];
export type NarociloInsert = Database['public']['Tables']['narocila']['Insert'];
export type PostavkaNarocilaInsert = Database['public']['Tables']['postavke_narocila']['Insert'];
export type OcenaInsert = Database['public']['Tables']['ocene']['Insert'];

// Update types
export type ProfilUpdate = Database['public']['Tables']['profili']['Update'];
export type RestaurantUpdate = Database['public']['Tables']['restavracije']['Update'];
export type KategorijaMenijaUpdate = Database['public']['Tables']['kategorije_menija']['Update'];
export type JedUpdate = Database['public']['Tables']['jedi']['Update'];
export type NarociloUpdate = Database['public']['Tables']['narocila']['Update'];
export type PostavkaNarocilaUpdate = Database['public']['Tables']['postavke_narocila']['Update'];
export type OcenaUpdate = Database['public']['Tables']['ocene']['Update'];