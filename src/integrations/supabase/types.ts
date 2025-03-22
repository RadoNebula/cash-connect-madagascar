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
      company_settings: {
        Row: {
          address: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          pin_hash: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone: string
          pin_hash?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          pin_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      receipt_settings: {
        Row: {
          footer_text: string | null
          id: string
          show_company_info: boolean | null
          show_contact: boolean | null
          show_logo: boolean | null
          updated_at: string
        }
        Insert: {
          footer_text?: string | null
          id: string
          show_company_info?: boolean | null
          show_contact?: boolean | null
          show_logo?: boolean | null
          updated_at?: string
        }
        Update: {
          footer_text?: string | null
          id?: string
          show_company_info?: boolean | null
          show_contact?: boolean | null
          show_logo?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      session_balances: {
        Row: {
          airtel_money: number
          cash: number
          created_at: string
          id: string
          is_active: boolean
          mvola: number
          orange_money: number
          user_id: string
        }
        Insert: {
          airtel_money?: number
          cash?: number
          created_at?: string
          id?: string
          is_active?: boolean
          mvola?: number
          orange_money?: number
          user_id: string
        }
        Update: {
          airtel_money?: number
          cash?: number
          created_at?: string
          id?: string
          is_active?: boolean
          mvola?: number
          orange_money?: number
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          date: string
          description: string | null
          fees: number
          id: string
          phone_number: string | null
          recipient_name: string | null
          recipient_phone: string | null
          service: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          date?: string
          description?: string | null
          fees?: number
          id?: string
          phone_number?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          service: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          date?: string
          description?: string | null
          fees?: number
          id?: string
          phone_number?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          service?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_accounts: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          pin_hash: string | null
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          pin_hash?: string | null
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          pin_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_account_credentials: {
        Args: {
          phone_param: string
          pin_param: string
        }
        Returns: string
      }
      check_user_credentials: {
        Args: {
          phone_param: string
          pin_param: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
