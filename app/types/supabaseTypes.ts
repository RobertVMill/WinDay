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
      bhags: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string
          id: number
          notes: string | null
          target_date: string | null
          vision_id: number
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string
          id?: never
          notes?: string | null
          target_date?: string | null
          vision_id: number
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string
          id?: never
          notes?: string | null
          target_date?: string | null
          vision_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bhags_vision_id_fkey"
            columns: ["vision_id"]
            isOneToOne: false
            referencedRelation: "north_star_vision"
            referencedColumns: ["id"]
          },
        ]
      }
      books_read: {
        Row: {
          completed_at: string
          created_at: string
          id: number
          notes: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: never
          notes?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: never
          notes?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_actions: {
        Row: {
          action: string
          created_at: string | null
          empire: string
          id: number
        }
        Insert: {
          action: string
          created_at?: string | null
          empire: string
          id?: never
        }
        Update: {
          action?: string
          created_at?: string | null
          empire?: string
          id?: never
        }
        Relationships: []
      }
      daily_scores: {
        Row: {
          created_at: string
          date: string
          fast_until_noon: boolean | null
          github_commits: number | null
          id: number
          minutes_read: number | null
          nidra: boolean | null
          no_p: boolean | null
          no_rap: boolean | null
          no_youtube: boolean | null
          sleep_performance: number | null
          total_score: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          fast_until_noon?: boolean | null
          github_commits?: number | null
          id?: never
          minutes_read?: number | null
          nidra?: boolean | null
          no_p?: boolean | null
          no_rap?: boolean | null
          no_youtube?: boolean | null
          sleep_performance?: number | null
          total_score?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          fast_until_noon?: boolean | null
          github_commits?: number | null
          id?: never
          minutes_read?: number | null
          nidra?: boolean | null
          no_p?: boolean | null
          no_rap?: boolean | null
          no_youtube?: boolean | null
          sleep_performance?: number | null
          total_score?: number | null
        }
        Relationships: []
      }
      diet_tracking: {
        Row: {
          clean_eating_score: number | null
          created_at: string
          date: string
          id: number
          notes: string | null
          user_id: string | null
        }
        Insert: {
          clean_eating_score?: number | null
          created_at?: string
          date?: string
          id?: never
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          clean_eating_score?: number | null
          created_at?: string
          date?: string
          id?: never
          notes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      empire_goals: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string | null
          empire: string
          id: number
          target_date: string | null
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string | null
          empire: string
          id?: never
          target_date?: string | null
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string | null
          empire?: string
          id?: never
          target_date?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          best_day: string | null
          created_at: string
          date: string | null
          deep_flow_activity: string | null
          gifts: string | null
          gratitude: string | null
          id: number
          image_url: string | null
          strategy: string | null
          strategy_checks: Json | null
          workout_category: string | null
          workout_notes: string | null
        }
        Insert: {
          best_day?: string | null
          created_at?: string
          date?: string | null
          deep_flow_activity?: string | null
          gifts?: string | null
          gratitude?: string | null
          id?: number
          image_url?: string | null
          strategy?: string | null
          strategy_checks?: Json | null
          workout_category?: string | null
          workout_notes?: string | null
        }
        Update: {
          best_day?: string | null
          created_at?: string
          date?: string | null
          deep_flow_activity?: string | null
          gifts?: string | null
          gratitude?: string | null
          id?: number
          image_url?: string | null
          strategy?: string | null
          strategy_checks?: Json | null
          workout_category?: string | null
          workout_notes?: string | null
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          created_at: string | null
          date: string
          distraction_count: number
          duration_minutes: number
          id: number
          interval_minutes: number | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          distraction_count?: number
          duration_minutes: number
          id?: number
          interval_minutes?: number | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          distraction_count?: number
          duration_minutes?: number
          id?: number
          interval_minutes?: number | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      milestone_completions: {
        Row: {
          completed_at: string
          created_at: string
          empire: string
          id: number
          milestone_name: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          empire: string
          id?: never
          milestone_name: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          empire?: string
          id?: never
          milestone_name?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          bhag_id: number
          completed: boolean | null
          content: string
          created_at: string
          id: number
          notes: string | null
          target_date: string | null
        }
        Insert: {
          bhag_id: number
          completed?: boolean | null
          content: string
          created_at?: string
          id?: never
          notes?: string | null
          target_date?: string | null
        }
        Update: {
          bhag_id?: number
          completed?: boolean | null
          content?: string
          created_at?: string
          id?: never
          notes?: string | null
          target_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_bhag_id_fkey"
            columns: ["bhag_id"]
            isOneToOne: false
            referencedRelation: "bhags"
            referencedColumns: ["id"]
          },
        ]
      }
      north_star_vision: {
        Row: {
          content: string
          created_at: string
          id: number
          is_active: boolean | null
          notes: string | null
          target_date: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: never
          is_active?: boolean | null
          notes?: string | null
          target_date?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          is_active?: boolean | null
          notes?: string | null
          target_date?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          id: number
          quote: string
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          quote: string
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          quote?: string
          title?: string | null
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          activity: string
          completed: boolean | null
          created_at: string
          day_of_week: number
          day_type: string
          focus_taps: number | null
          id: number
          meditation_duration: number | null
          notes: string | null
          phase: string
          updated_at: string
        }
        Insert: {
          activity: string
          completed?: boolean | null
          created_at?: string
          day_of_week: number
          day_type?: string
          focus_taps?: number | null
          id?: number
          meditation_duration?: number | null
          notes?: string | null
          phase: string
          updated_at?: string
        }
        Update: {
          activity?: string
          completed?: boolean | null
          created_at?: string
          day_of_week?: number
          day_type?: string
          focus_taps?: number | null
          id?: number
          meditation_duration?: number | null
          notes?: string | null
          phase?: string
          updated_at?: string
        }
        Relationships: []
      }
      scorecards: {
        Row: {
          created_at: string | null
          date: string
          energy_score: number | null
          id: number
          journal_entry_id: number | null
          mood_score: number | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          energy_score?: number | null
          id?: number
          journal_entry_id?: number | null
          mood_score?: number | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          energy_score?: number | null
          id?: number
          journal_entry_id?: number | null
          mood_score?: number | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scorecards_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      steps: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string
          id: number
          milestone_id: number
          notes: string | null
          target_date: string | null
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string
          id?: never
          milestone_id: number
          notes?: string | null
          target_date?: string | null
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string
          id?: never
          milestone_id?: number
          notes?: string | null
          target_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "steps_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          count: number | null
          created_at: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: never
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      week_templates: {
        Row: {
          created_at: string | null
          goal_id: number | null
          id: number
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: number | null
          id?: number
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: number | null
          id?: number
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "week_templates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "bhags"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      day_type: "standard_work" | "standard_vacation" | "random"
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
