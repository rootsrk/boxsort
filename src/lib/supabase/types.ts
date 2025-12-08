export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          owner_id: string
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          invite_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          invite_code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'households_owner_id_fkey'
            columns: ['owner_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      users: {
        Row: {
          id: string
          household_id: string | null
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          household_id?: string | null
          display_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_household_id_fkey'
            columns: ['household_id']
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      boxes: {
        Row: {
          id: string
          household_id: string
          funky_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          funky_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          funky_name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'boxes_household_id_fkey'
            columns: ['household_id']
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      items: {
        Row: {
          id: string
          box_id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          box_id: string
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          box_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'items_box_id_fkey'
            columns: ['box_id']
            referencedRelation: 'boxes'
            referencedColumns: ['id']
          }
        ]
      }
      types: {
        Row: {
          id: string
          household_id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'types_household_id_fkey'
            columns: ['household_id']
            referencedRelation: 'households'
            referencedColumns: ['id']
          }
        ]
      }
      item_types: {
        Row: {
          item_id: string
          type_id: string
          created_at: string
        }
        Insert: {
          item_id: string
          type_id: string
          created_at?: string
        }
        Update: {
          item_id?: string
          type_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'item_types_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'item_types_type_id_fkey'
            columns: ['type_id']
            referencedRelation: 'types'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_items: {
        Args: {
          search_query: string
        }
        Returns: {
          item_id: string
          item_name: string
          item_description: string | null
          item_image_url: string | null
          box_id: string
          box_funky_name: string
          types: Json
        }[]
      }
      regenerate_invite_code: {
        Args: {
          household_uuid: string
        }
        Returns: string
      }
      join_household: {
        Args: {
          code: string
        }
        Returns: string
      }
      create_household_for_user: {
        Args: {
          user_id: string
          household_name: string
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

// Convenience types
export type Household = Database['public']['Tables']['households']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Box = Database['public']['Tables']['boxes']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Type = Database['public']['Tables']['types']['Row']
export type ItemType = Database['public']['Tables']['item_types']['Row']

export type BoxWithItems = Box & { items: Item[]; item_count: number }
export type SearchResult = Database['public']['Functions']['search_items']['Returns'][number]

// Extended types with relationships
export type ItemWithTypes = Item & { types: Type[] }
export type UserWithAvatar = User & { avatar_url: string | null }
