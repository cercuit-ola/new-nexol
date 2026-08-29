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
      escrows: {
        Row: {
          amount: number
          counterparty_email: string
          created_at: string
          creator_email: string
          creator_id: string
          deadline: string | null
          description: string
          funding_tx_hash: string | null
          id: string
          network: string
          release_tx_hash: string | null
          status: Database["public"]["Enums"]["escrow_status"]
          title: string
          token: string
          updated_at: string
        }
        Insert: {
          amount: number
          counterparty_email: string
          created_at?: string
          creator_email: string
          creator_id: string
          deadline?: string | null
          description: string
          funding_tx_hash?: string | null
          id?: string
          network?: string
          release_tx_hash?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          title: string
          token?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          counterparty_email?: string
          created_at?: string
          creator_email?: string
          creator_id?: string
          deadline?: string | null
          description?: string
          funding_tx_hash?: string | null
          id?: string
          network?: string
          release_tx_hash?: string | null
          status?: Database["public"]["Enums"]["escrow_status"]
          title?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_schedules: {
        Row: {
          created_at: string
          id: string
          installment_amount: number
          installment_count: number
          interval_days: number
          name: string
          next_release_at: string
          recipient_email: string | null
          released_count: number
          starts_at: string
          status: Database["public"]["Enums"]["payment_schedule_status"]
          token: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          installment_amount: number
          installment_count: number
          interval_days: number
          name: string
          next_release_at: string
          recipient_email?: string | null
          released_count?: number
          starts_at: string
          status?: Database["public"]["Enums"]["payment_schedule_status"]
          token?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          status?: Database["public"]["Enums"]["payment_schedule_status"]
          updated_at?: string
        }
        Relationships: []
      }
      gift_card_redemptions: {
        Row: {
          actioned_at: string | null
          actioned_by: string | null
          brand: string
          card_code: string
          card_currency: string
          card_pin: string | null
          card_value: number
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          reference_number: string
          rejection_reason: string | null
          status: string
          submitted_at: string
          tx_hash: string | null
          usdt_payout: number
          user_email: string | null
          user_id: string
        }
        Insert: {
          actioned_at?: string | null
          actioned_by?: string | null
          brand: string
          card_code: string
          card_currency?: string
          card_pin?: string | null
          card_value: number
          commission_amount: number
          commission_rate?: number
          created_at?: string
          id?: string
          reference_number: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string
          tx_hash?: string | null
          usdt_payout: number
          user_email?: string | null
          user_id: string
        }
        Update: {
          actioned_at?: string | null
          actioned_by?: string | null
          brand?: string
          card_code?: string
          card_currency?: string
          card_pin?: string | null
          card_value?: number
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          reference_number?: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string
          tx_hash?: string | null
          usdt_payout?: number
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gift_card_submissions: {
        Row: {
          admin_notes: string | null
          card_amount: number
          card_code: string
          card_pin: string | null
          card_type: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          service_fee: number
          status: string
          updated_at: string
          usdc_payout: number
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          card_amount: number
          card_code: string
          card_pin?: string | null
          card_type: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_fee?: number
          status?: string
          updated_at?: string
          usdc_payout?: number
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          card_amount?: number
          card_code?: string
          card_pin?: string | null
          card_type?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_fee?: number
          status?: string
          updated_at?: string
          usdc_payout?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          usdc_balance: number
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          usdc_balance?: number
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          usdc_balance?: number
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      vault_deposits: {
        Row: {
          amount: number
          apy_rate: number
          created_at: string
          id: string
          lock_duration: string
          locked_at: string
          status: string
          unlock_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          apy_rate?: number
          created_at?: string
          id?: string
          lock_duration: string
          locked_at?: string
          status?: string
          unlock_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          apy_rate?: number
          created_at?: string
          id?: string
          lock_duration?: string
          locked_at?: string
          status?: string
          unlock_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      escrow_status: "draft" | "awaiting_funding" | "funded" | "work_submitted" | "released" | "disputed" | "cancelled"
      payment_schedule_status: "scheduled" | "active" | "completed" | "cancelled"
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
      app_role: ["admin", "user"],
    },
  },
} as const
