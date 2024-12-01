export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          stripe_account_id: string | null
          stripe_account_status: 'pending' | 'active' | null
          updated_at: string | null
        }
        Insert: {
          id: string
          stripe_account_id?: string | null
          stripe_account_status?: 'pending' | 'active' | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          stripe_account_id?: string | null
          stripe_account_status?: 'pending' | 'active' | null
          updated_at?: string | null
        }
      }
    }
  }
} 