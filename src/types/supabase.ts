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
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'superadmin' | 'admin' | 'client'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'superadmin' | 'admin' | 'client'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'superadmin' | 'admin' | 'client'
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          website: string
          admin_id: string
          consent_settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          website: string
          admin_id: string
          consent_settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string
          admin_id?: string
          consent_settings?: Json
          created_at?: string
        }
      }
      branding_settings: {
        Row: {
          id: string
          user_id: string
          logo: string | null
          header_color: string
          link_color: string
          button_color: string
          button_text_color: string
          powered_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          logo?: string | null
          header_color: string
          link_color: string
          button_color: string
          button_text_color: string
          powered_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          logo?: string | null
          header_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          powered_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          price: number
          interval: string
          features: string[]
          client_limit: number
          visitor_limit: number
          is_popular: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          interval: string
          features: string[]
          client_limit: number
          visitor_limit: number
          is_popular?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          interval?: string
          features?: string[]
          client_limit?: number
          visitor_limit?: number
          is_popular?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      consent_logs: {
        Row: {
          id: string
          client_id: string
          visitor_id: string
          ip_address: string
          country: string | null
          consent_given: boolean
          categories: Json
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          visitor_id: string
          ip_address: string
          country?: string | null
          consent_given: boolean
          categories: Json
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          visitor_id?: string
          ip_address?: string
          country?: string | null
          consent_given?: boolean
          categories?: Json
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: Json | null
          ip_address: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details?: Json | null
          ip_address: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: Json | null
          ip_address?: string
          user_agent?: string | null
          created_at?: string
        }
      }
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
