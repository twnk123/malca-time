export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_restavracije: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          restavracija_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          restavracija_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          restavracija_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_restavracije_restavracija_id_fkey"
            columns: ["restavracija_id"]
            isOneToOne: false
            referencedRelation: "restavracije"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      jedi: {
        Row: {
          cena: number
          created_at: string
          id: string
          ime: string
          kategorija_id: string
          na_voljo: boolean
          opis: string | null
          restavracija_id: string
          slika_url: string | null
          updated_at: string
          vrstni_red: number
        }
        Insert: {
          cena: number
          created_at?: string
          id?: string
          ime: string
          kategorija_id: string
          na_voljo?: boolean
          opis?: string | null
          restavracija_id: string
          slika_url?: string | null
          updated_at?: string
          vrstni_red?: number
        }
        Update: {
          cena?: number
          created_at?: string
          id?: string
          ime?: string
          kategorija_id?: string
          na_voljo?: boolean
          opis?: string | null
          restavracija_id?: string
          slika_url?: string | null
          updated_at?: string
          vrstni_red?: number
        }
        Relationships: [
          {
            foreignKeyName: "jedi_kategorija_id_fkey"
            columns: ["kategorija_id"]
            isOneToOne: false
            referencedRelation: "kategorije_menija"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jedi_restavracija_id_fkey"
            columns: ["restavracija_id"]
            isOneToOne: false
            referencedRelation: "restavracije"
            referencedColumns: ["id"]
          },
        ]
      }
      kategorije_menija: {
        Row: {
          created_at: string
          id: string
          naziv: string
          opis: string | null
          restavracija_id: string
          updated_at: string
          vrstni_red: number
        }
        Insert: {
          created_at?: string
          id?: string
          naziv: string
          opis?: string | null
          restavracija_id: string
          updated_at?: string
          vrstni_red?: number
        }
        Update: {
          created_at?: string
          id?: string
          naziv?: string
          opis?: string | null
          restavracija_id?: string
          updated_at?: string
          vrstni_red?: number
        }
        Relationships: [
          {
            foreignKeyName: "kategorije_menija_restavracija_id_fkey"
            columns: ["restavracija_id"]
            isOneToOne: false
            referencedRelation: "restavracije"
            referencedColumns: ["id"]
          },
        ]
      }
      narocila: {
        Row: {
          cas_prevzema: string
          created_at: string
          id: string
          opomba: string | null
          restavracija_id: string
          skupna_cena: number
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          uporabnik_id: string
        }
        Insert: {
          cas_prevzema: string
          created_at?: string
          id?: string
          opomba?: string | null
          restavracija_id: string
          skupna_cena: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          uporabnik_id: string
        }
        Update: {
          cas_prevzema?: string
          created_at?: string
          id?: string
          opomba?: string | null
          restavracija_id?: string
          skupna_cena?: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          uporabnik_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "narocila_restavracija_id_fkey"
            columns: ["restavracija_id"]
            isOneToOne: false
            referencedRelation: "restavracije"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narocila_uporabnik_id_fkey"
            columns: ["uporabnik_id"]
            isOneToOne: false
            referencedRelation: "profili"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ocene: {
        Row: {
          created_at: string
          id: string
          komentar: string | null
          narocilo_id: string
          ocena: number
          restavracija_id: string
          uporabnik_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          komentar?: string | null
          narocilo_id: string
          ocena: number
          restavracija_id: string
          uporabnik_id: string
        }
        Update: {
          created_at?: string
          id?: string
          komentar?: string | null
          narocilo_id?: string
          ocena?: number
          restavracija_id?: string
          uporabnik_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocene_narocilo_id_fkey"
            columns: ["narocilo_id"]
            isOneToOne: false
            referencedRelation: "narocila"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocene_restavracija_id_fkey"
            columns: ["restavracija_id"]
            isOneToOne: false
            referencedRelation: "restavracije"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocene_uporabnik_id_fkey"
            columns: ["uporabnik_id"]
            isOneToOne: false
            referencedRelation: "profili"
            referencedColumns: ["id"]
          },
        ]
      }
      popusti: {
        Row: {
          aktiven: boolean
          created_at: string
          id: string
          jed_id: string
          naziv: string | null
          opis: string | null
          tip_popusta: string
          updated_at: string
          veljavnost_do: string | null
          veljavnost_od: string | null
          vrednost: number
        }
        Insert: {
          aktiven?: boolean
          created_at?: string
          id?: string
          jed_id: string
          naziv?: string | null
          opis?: string | null
          tip_popusta: string
          updated_at?: string
          veljavnost_do?: string | null
          veljavnost_od?: string | null
          vrednost: number
        }
        Update: {
          aktiven?: boolean
          created_at?: string
          id?: string
          jed_id?: string
          naziv?: string | null
          opis?: string | null
          tip_popusta?: string
          updated_at?: string
          veljavnost_do?: string | null
          veljavnost_od?: string | null
          vrednost?: number
        }
        Relationships: []
      }
      postavke_narocila: {
        Row: {
          cena_na_kos: number
          created_at: string
          id: string
          jed_id: string
          kolicina: number
          narocilo_id: string
          opomba: string | null
        }
        Insert: {
          cena_na_kos: number
          created_at?: string
          id?: string
          jed_id: string
          kolicina?: number
          narocilo_id: string
          opomba?: string | null
        }
        Update: {
          cena_na_kos?: number
          created_at?: string
          id?: string
          jed_id?: string
          kolicina?: number
          narocilo_id?: string
          opomba?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postavke_narocila_jed_id_fkey"
            columns: ["jed_id"]
            isOneToOne: false
            referencedRelation: "jedi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postavke_narocila_narocilo_id_fkey"
            columns: ["narocilo_id"]
            isOneToOne: false
            referencedRelation: "narocila"
            referencedColumns: ["id"]
          },
        ]
      }
      priljubljene_jedi: {
        Row: {
          created_at: string
          id: string
          jed_id: string
          uporabnik_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jed_id: string
          uporabnik_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jed_id?: string
          uporabnik_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_priljubljene_jedi_jed"
            columns: ["jed_id"]
            isOneToOne: false
            referencedRelation: "jedi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_priljubljene_jedi_uporabnik"
            columns: ["uporabnik_id"]
            isOneToOne: false
            referencedRelation: "profili"
            referencedColumns: ["id"]
          },
        ]
      }
      profili: {
        Row: {
          created_at: string
          email: string
          id: string
          ime: string
          priimek: string
          telefon: string | null
          updated_at: string
          user_id: string
          vloga: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ime: string
          priimek: string
          telefon?: string | null
          updated_at?: string
          user_id: string
          vloga?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ime?: string
          priimek?: string
          telefon?: string | null
          updated_at?: string
          user_id?: string
          vloga?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      restavracije: {
        Row: {
          aktivna: boolean
          created_at: string
          delovni_cas_do: string
          delovni_cas_od: string
          email: string | null
          id: string
          kontakt: string | null
          logo_url: string | null
          lokacija: string
          naziv: string
          opis: string | null
          updated_at: string
        }
        Insert: {
          aktivna?: boolean
          created_at?: string
          delovni_cas_do?: string
          delovni_cas_od?: string
          email?: string | null
          id?: string
          kontakt?: string | null
          logo_url?: string | null
          lokacija: string
          naziv: string
          opis?: string | null
          updated_at?: string
        }
        Update: {
          aktivna?: boolean
          created_at?: string
          delovni_cas_do?: string
          delovni_cas_od?: string
          email?: string | null
          id?: string
          kontakt?: string | null
          logo_url?: string | null
          lokacija?: string
          naziv?: string
          opis?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_audit: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_failed_login_attempts: {
        Args: { p_email: string; p_ip_address: unknown }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_data: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      record_failed_login_attempt: {
        Args: { p_email: string; p_ip_address: unknown; p_user_agent?: string }
        Returns: undefined
      }
    }
    Enums: {
      order_status:
        | "novo"
        | "sprejeto"
        | "v_pripravi"
        | "pripravljeno"
        | "prevzeto"
      user_role: "uporabnik" | "admin_restavracije"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "novo",
        "sprejeto",
        "v_pripravi",
        "pripravljeno",
        "prevzeto",
      ],
      user_role: ["uporabnik", "admin_restavracije"],
    },
  },
} as const
