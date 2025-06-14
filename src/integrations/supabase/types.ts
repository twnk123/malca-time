export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            referencedColumns: ["id"]
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
          lokacija?: string
          naziv?: string
          opis?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
