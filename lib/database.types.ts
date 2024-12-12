export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schedule_blocks: {
        Row: {
          id: number
          day_of_week: number
          phase: string
          activity: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          day_of_week: number
          phase: string
          activity: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          day_of_week?: number
          phase?: string
          activity?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      daily_scores: {
        Row: {
          id: number
          created_at: string
          date: string
          sleep_performance: number | null
          fast_until_noon: boolean | null
          minutes_read: number | null
          github_commits: number | null
          no_p: boolean | null
          no_youtube: boolean | null
          no_rap: boolean | null
          nidra: boolean | null
          total_score: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          date?: string
          sleep_performance?: number | null
          fast_until_noon?: boolean | null
          minutes_read?: number | null
          github_commits?: number | null
          no_p?: boolean | null
          no_youtube?: boolean | null
          no_rap?: boolean | null
          nidra?: boolean | null
          total_score?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          date?: string
          sleep_performance?: number | null
          fast_until_noon?: boolean | null
          minutes_read?: number | null
          github_commits?: number | null
          no_p?: boolean | null
          no_youtube?: boolean | null
          no_rap?: boolean | null
          nidra?: boolean | null
          total_score?: number | null
        }
      }
      quotes: {
        Row: {
          id: number
          quote: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: number
          quote: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          quote?: string
          title?: string | null
          created_at?: string
        }
      },
      journal_entries: {
        Row: {
          id: number
          date: string | null
          gratitude: string | null
          gifts: string | null
          strategy: string | null
          strategy_checks: Json | null
          best_day: string | null
          image_url: string | null
          workout_notes: string | null
          workout_category: string | null
          deep_flow_activity: string | null
          created_at: string
        }
        Insert: {
          id?: number
          date?: string | null
          gratitude?: string | null
          gifts?: string | null
          strategy?: string | null
          strategy_checks?: Json | null
          best_day?: string | null
          image_url?: string | null
          workout_notes?: string | null
          workout_category?: string | null
          deep_flow_activity?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          date?: string | null
          gratitude?: string | null
          gifts?: string | null
          strategy?: string | null
          strategy_checks?: Json | null
          best_day?: string | null
          image_url?: string | null
          workout_notes?: string | null
          workout_category?: string | null
          deep_flow_activity?: string | null
          created_at?: string
        }
      }
      // ... other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
