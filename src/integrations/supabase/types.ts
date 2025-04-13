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
      compliance_scores: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          score: number
          store_visit_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          score: number
          store_visit_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          score?: number
          store_visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_scores_store_visit_id_fkey"
            columns: ["store_visit_id"]
            isOneToOne: false
            referencedRelation: "store_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      planograms: {
        Row: {
          created_at: string
          id: string
          image_url: string
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planograms_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      store_posms: {
        Row: {
          created_at: string
          id: string
          posm_type: Database["public"]["Enums"]["posm_type"]
          store_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          posm_type: Database["public"]["Enums"]["posm_type"]
          store_id: string
        }
        Update: {
          created_at?: string
          id?: string
          posm_type?: Database["public"]["Enums"]["posm_type"]
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_posms_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_visits: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          comments: string | null
          completed_at: string | null
          created_at: string
          id: string
          merchandiser_id: string
          scheduled_date: string
          store_id: string
          updated_at: string
          visit_order: number
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          merchandiser_id: string
          scheduled_date: string
          store_id: string
          updated_at?: string
          visit_order: number
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          merchandiser_id?: string
          scheduled_date?: string
          store_id?: string
          updated_at?: string
          visit_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_visits_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          created_at: string
          id: string
          instructions: string | null
          latitude: number
          longitude: number
          monthly_revenue: number | null
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          instructions?: string | null
          latitude: number
          longitude: number
          monthly_revenue?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          instructions?: string | null
          latitude?: number
          longitude?: number
          monthly_revenue?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_dashboard_counts: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_stores: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          created_at: string
          id: string
          instructions: string | null
          latitude: number
          longitude: number
          monthly_revenue: number | null
          name: string
          updated_at: string
        }[]
      }
      insert_store: {
        Args: {
          store_name: string
          store_address: string
          store_latitude: number
          store_longitude: number
          store_revenue: number
          store_instructions: string
        }
        Returns: boolean
      }
    }
    Enums: {
      posm_type: "COC" | "hangsell" | "standee"
      user_role: "admin" | "merchandiser"
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
      posm_type: ["COC", "hangsell", "standee"],
      user_role: ["admin", "merchandiser"],
    },
  },
} as const
