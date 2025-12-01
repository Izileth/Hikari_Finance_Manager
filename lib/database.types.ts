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
      accounts: {
        Row: {
          color: string | null
          created_at: string | null
          currency: string
          id: number
          initial_balance: number
          name: string
          profile_id: number
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          currency?: string
          id?: number
          initial_balance?: number
          name: string
          profile_id: number
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          currency?: string
          id?: number
          initial_balance?: number
          name?: string
          profile_id?: number
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category_id: number
          created_at: string | null
          id: number
          month: number
          profile_id: number
          updated_at: string | null
          year: number
        }
        Insert: {
          amount: number
          category_id: number
          created_at?: string | null
          id?: number
          month: number
          profile_id: number
          updated_at?: string | null
          year: number
        }
        Update: {
          amount?: number
          category_id?: number
          created_at?: string | null
          id?: number
          month?: number
          profile_id?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          privacy_level: Database["public"]["Enums"]["post_privacy_level"]
          profile_id: number
          post_type: Database["public"]["Enums"]["feed_post_type"]
          shared_data: Json | null
          source_budget_id: number | null
          source_transaction_id: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          privacy_level?: Database["public"]["Enums"]["post_privacy_level"]
          profile_id: number
          post_type?: Database["public"]["Enums"]["feed_post_type"]
          shared_data?: Json | null
          source_budget_id?: number | null
          source_transaction_id?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          privacy_level?: Database["public"]["Enums"]["post_privacy_level"]
          profile_id?: number
          post_type?: Database["public"]["Enums"]["feed_post_type"]
          shared_data?: Json | null
          source_budget_id?: number | null
          source_transaction_id?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_source_budget_id_fkey"
            columns: ["source_budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_source_transaction_id_fkey"
            columns: ["source_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string | null
          follower_id: number
          following_id: number
        }
        Insert: {
          created_at?: string | null
          follower_id: number
          following_id: number
        }
        Update: {
          created_at?: string | null
          follower_id?: number
          following_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: number
          parent_comment_id: number | null
          post_id: number
          profile_id: number
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          parent_comment_id?: number | null
          post_id: number
          profile_id: number
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          parent_comment_id?: number | null
          post_id?: number
          profile_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: number
          post_id: number
          profile_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          post_id: number
          profile_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          post_id?: number
          profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: number
          is_public: boolean
          name: string
          nickname: string | null
          preferences: Json | null
          role: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id?: number
          is_public?: boolean
          name: string
          nickname?: string | null
          preferences?: Json | null
          role?: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: number
          is_public?: boolean
          name?: string
          nickname?: string | null
          preferences?: Json | null
          role?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon_name: string | null
          id: number
          name: string
          parent_category_id: number | null
          profile_id: number
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon_name?: string | null
          id?: number
          name: string
          parent_category_id?: number | null
          profile_id: number
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon_name?: string | null
          id?: number
          name?: string
          parent_category_id?: number | null
          profile_id?: number
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_categories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: number
          amount: number
          category_id: number | null
          created_at: string | null
          description: string
          id: number
          notes: string | null
          profile_id: number
          transaction_date: string
          transfer_group_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: number
          amount: number
          category_id?: number | null
          created_at?: string | null
          description: string
          id?: number
          notes?: string | null
          profile_id: number
          transaction_date: string
          transfer_group_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: number
          amount?: number
          category_id?: number | null
          created_at?: string | null
          description?: string
          id?: number
          notes?: string | null
          profile_id?: number
          transaction_date?: string
          transfer_group_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      slugify: {
        Args: {
          text_to_slug: string
        }
        Returns: string
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      account_type:
        | "checking"
        | "savings"
        | "credit_card"
        | "investment"
        | "cash"
      feed_post_type:
        | "manual"
        | "achievement"
        | "metric_snapshot"
        | "transaction_share"
      post_privacy_level: "public" | "followers_only" | "private"
      transaction_type: "income" | "expense"
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
