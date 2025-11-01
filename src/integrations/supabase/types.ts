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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      markets: {
        Row: {
          a_stake: number | null
          b_stake: number | null
          category: string
          closes_at: string
          cover: string | null
          created_at: string
          created_by: string | null
          id: string
          no_stake: number | null
          opens_at: string | null
          outcomes: Json
          pool_usd: number | null
          resolution_type: string
          resolves_at: string
          result: Json | null
          source: Json
          status: string
          title: string
          trending_score: number | null
          type: string
          updated_at: string | null
          yes_stake: number | null
        }
        Insert: {
          a_stake?: number | null
          b_stake?: number | null
          category: string
          closes_at: string
          cover?: string | null
          created_at?: string
          created_by?: string | null
          id: string
          no_stake?: number | null
          opens_at?: string | null
          outcomes: Json
          pool_usd?: number | null
          resolution_type: string
          resolves_at: string
          result?: Json | null
          source: Json
          status?: string
          title: string
          trending_score?: number | null
          type: string
          updated_at?: string | null
          yes_stake?: number | null
        }
        Update: {
          a_stake?: number | null
          b_stake?: number | null
          category?: string
          closes_at?: string
          cover?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          no_stake?: number | null
          opens_at?: string | null
          outcomes?: Json
          pool_usd?: number | null
          resolution_type?: string
          resolves_at?: string
          result?: Json | null
          source?: Json
          status?: string
          title?: string
          trending_score?: number | null
          type?: string
          updated_at?: string | null
          yes_stake?: number | null
        }
        Relationships: []
      }
      new_listing_tokens: {
        Row: {
          created_at: string
          id: string
          token_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          token_address: string
        }
        Update: {
          created_at?: string
          id?: string
          token_address?: string
        }
        Relationships: []
      }
      submitted_tokens: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          status: string | null
          telegram_url: string | null
          token_address: string
          token_name: string
          token_symbol: string
          transaction_hash: string
          twitter_url: string | null
          user_id: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          status?: string | null
          telegram_url?: string | null
          token_address: string
          token_name: string
          token_symbol: string
          transaction_hash: string
          twitter_url?: string | null
          user_id: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          status?: string | null
          telegram_url?: string | null
          token_address?: string
          token_name?: string
          token_symbol?: string
          transaction_hash?: string
          twitter_url?: string | null
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      token_votes: {
        Row: {
          created_at: string
          id: string
          token_address: string
          vote_type: string
          voter_ip: string
        }
        Insert: {
          created_at?: string
          id?: string
          token_address: string
          vote_type?: string
          voter_ip: string
        }
        Update: {
          created_at?: string
          id?: string
          token_address?: string
          vote_type?: string
          voter_ip?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount_pts: number
          id: string
          market_id: string
          price: number
          shares: number
          side: string
          ts: string
          user_id: string | null
          wallet: string
        }
        Insert: {
          amount_pts: number
          id: string
          market_id: string
          price: number
          shares: number
          side: string
          ts?: string
          user_id?: string | null
          wallet: string
        }
        Update: {
          amount_pts?: number
          id?: string
          market_id?: string
          price?: number
          shares?: number
          side?: string
          ts?: string
          user_id?: string | null
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
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
      verification_requests: {
        Row: {
          amount_usd: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          status: string | null
          token_address: string
          token_name: string
          token_symbol: string
          transaction_hash: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount_usd?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          status?: string | null
          token_address: string
          token_name: string
          token_symbol: string
          transaction_hash: string
          user_id: string
          wallet_address?: string
        }
        Update: {
          amount_usd?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          status?: string | null
          token_address?: string
          token_name?: string
          token_symbol?: string
          transaction_hash?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_addresses: {
        Row: {
          created_at: string | null
          id: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          created_at: string
          id: string
          last_faucet_claim: string | null
          pnl_realized: number
          points: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_faucet_claim?: string | null
          pnl_realized?: number
          points?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_faucet_claim?: string | null
          pnl_realized?: number
          points?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      token_vote_counts: {
        Row: {
          bearish_votes: number | null
          bullish_votes: number | null
          token_address: string | null
          total_votes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      wallet_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _wallet_address: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
