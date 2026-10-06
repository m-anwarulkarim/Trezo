export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_image: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_name: string | null
          id: string
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          advance: number
          alt_phone: string | null
          consignment_id: string | null
          courier_note: string | null
          courier_provider: string | null
          created_at: string
          customer_facing_id: string | null
          customer_name: string
          delivery_area: string | null
          delivery_charge: number
          delivery_status: string | null
          discount: number
          id: string
          is_courier_entered: boolean
          is_deleted: boolean
          is_printed: boolean
          last_status_changed_by: string | null
          note: string | null
          order_id: string
          phone: string
          pre_date: string | null
          print_note: boolean
          status: string
          subtotal: number
          total_amount: number
          tracking_code: string | null
          traffic_source: string | null
          updated_at: string
        }
        Insert: {
          address: string
          advance?: number
          alt_phone?: string | null
          consignment_id?: string | null
          courier_note?: string | null
          courier_provider?: string | null
          created_at?: string
          customer_facing_id?: string | null
          customer_name: string
          delivery_area?: string | null
          delivery_charge?: number
          delivery_status?: string | null
          discount?: number
          id?: string
          is_courier_entered?: boolean
          is_deleted?: boolean
          is_printed?: boolean
          last_status_changed_by?: string | null
          note?: string | null
          order_id: string
          phone: string
          pre_date?: string | null
          print_note?: boolean
          status?: string
          subtotal?: number
          total_amount?: number
          tracking_code?: string | null
          traffic_source?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          advance?: number
          alt_phone?: string | null
          consignment_id?: string | null
          courier_note?: string | null
          courier_provider?: string | null
          created_at?: string
          customer_facing_id?: string | null
          customer_name?: string
          delivery_area?: string | null
          delivery_charge?: number
          delivery_status?: string | null
          discount?: number
          id?: string
          is_courier_entered?: boolean
          is_deleted?: boolean
          is_printed?: boolean
          last_status_changed_by?: string | null
          note?: string | null
          order_id?: string
          phone?: string
          pre_date?: string | null
          print_note?: boolean
          status?: string
          subtotal?: number
          total_amount?: number
          tracking_code?: string | null
          traffic_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string
          currency: string | null
          event_id: string | null
          event_name: string
          id: string
          is_test: boolean
          order_id: string | null
          response: Json | null
          success: boolean
          value: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          event_id?: string | null
          event_name: string
          id?: string
          is_test?: boolean
          order_id?: string | null
          response?: Json | null
          success?: boolean
          value?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          event_id?: string | null
          event_name?: string
          id?: string
          is_test?: boolean
          order_id?: string | null
          response?: Json | null
          success?: boolean
          value?: number | null
        }
        Relationships: []
      }
      tracking_settings: {
        Row: {
          access_token: string | null
          capi_enabled: boolean
          id: boolean
          pixel_enabled: boolean
          pixel_id: string | null
          test_event_code: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          capi_enabled?: boolean
          id?: boolean
          pixel_enabled?: boolean
          pixel_id?: string | null
          test_event_code?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          capi_enabled?: boolean
          id?: boolean
          pixel_enabled?: boolean
          pixel_id?: string | null
          test_event_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      get_order_status_counts: {
        Args: { p_date_from?: string; p_search?: string; p_statuses: string[] }
        Returns: {
          cnt: number
          status: string
        }[]
      }
      get_public_pixel_settings: {
        Args: never
        Returns: {
          pixel_enabled: boolean
          pixel_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_order_staff: { Args: { _user_id: string }; Returns: boolean }
      order_exists: { Args: { _order_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
