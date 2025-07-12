import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database schema
export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string
          page_content: string[]
          cover_image_url: string | null
          amazon_book_url: string | null
          submitted_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          author: string
          page_content: string[]
          cover_image_url?: string | null
          amazon_book_url?: string | null
          submitted_by?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          page_content?: string[]
          cover_image_url?: string | null
          amazon_book_url?: string | null
          submitted_by?: string
        }
      }
    }
  }
}

// Type the supabase client with our database schema
export type SupabaseClient = typeof supabase
