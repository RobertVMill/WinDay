// types/database.ts
export interface JournalEntry {
    id: string
    created_at: string
    row_id?: string
    date?: string
    thank_you_god_for?: string
    naturally_gifted_at?: string
    core_values?: string
    mighty_purpose?: string
    days_left_with_mom?: string
    strategy?: string
    perfect_day?: string
    little_thing_to_improve?: string
    quote_of_day?: string
    plan_for_day?: string
    success_is?: string
    last_day_photo?: string
    location?: string
    user_id: string
    updated_at?: string
  }
  
  export interface Profile {
    user_id: string
    first_name?: string
    last_name?: string
    email?: string
    updated_at?: string
    created_at: string
  }