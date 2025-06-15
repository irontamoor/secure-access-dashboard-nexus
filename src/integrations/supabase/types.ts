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
      access_logs: {
        Row: {
          access_type: string
          card_number: string | null
          controller_id: string | null
          door_id: string | null
          id: string
          ip_address: unknown | null
          notes: string | null
          pin_used: string | null
          swipe_type: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          access_type: string
          card_number?: string | null
          controller_id?: string | null
          door_id?: string | null
          id?: string
          ip_address?: unknown | null
          notes?: string | null
          pin_used?: string | null
          swipe_type?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          access_type?: string
          card_number?: string | null
          controller_id?: string | null
          door_id?: string | null
          id?: string
          ip_address?: unknown | null
          notes?: string | null
          pin_used?: string | null
          swipe_type?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_controller_id_fkey"
            columns: ["controller_id"]
            isOneToOne: false
            referencedRelation: "controller_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_door_id_fkey"
            columns: ["door_id"]
            isOneToOne: false
            referencedRelation: "doors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      controller_api_keys: {
        Row: {
          api_key: string
          controller_name: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          api_key: string
          controller_name: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          api_key?: string
          controller_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      door_group_members: {
        Row: {
          door_id: string
          group_id: string
          id: string
        }
        Insert: {
          door_id: string
          group_id: string
          id?: string
        }
        Update: {
          door_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "door_group_members_door_id_fkey"
            columns: ["door_id"]
            isOneToOne: false
            referencedRelation: "doors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "door_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "door_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      door_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      door_permissions: {
        Row: {
          access_granted: boolean
          all_doors: boolean
          door_group_id: string | null
          door_id: string | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          access_granted?: boolean
          all_doors?: boolean
          door_group_id?: string | null
          door_id?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean
          all_doors?: boolean
          door_group_id?: string | null
          door_id?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "door_permissions_door_group_id_fkey"
            columns: ["door_group_id"]
            isOneToOne: false
            referencedRelation: "door_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "door_permissions_door_id_fkey"
            columns: ["door_id"]
            isOneToOne: false
            referencedRelation: "doors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "door_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "door_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      doors: {
        Row: {
          access_count: number | null
          created_at: string
          disabled: boolean
          id: string
          ip_address: unknown | null
          last_access: string | null
          location: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          disabled?: boolean
          id?: string
          ip_address?: unknown | null
          last_access?: string | null
          location: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          disabled?: boolean
          id?: string
          ip_address?: unknown | null
          last_access?: string | null
          location?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ldap_sync_log: {
        Row: {
          error_details: string | null
          errors_count: number | null
          id: string
          sync_completed_at: string | null
          sync_started_at: string
          sync_status: string
          users_synced: number | null
        }
        Insert: {
          error_details?: string | null
          errors_count?: number | null
          id?: string
          sync_completed_at?: string | null
          sync_started_at?: string
          sync_status?: string
          users_synced?: number | null
        }
        Update: {
          error_details?: string | null
          errors_count?: number | null
          id?: string
          sync_completed_at?: string | null
          sync_started_at?: string
          sync_status?: string
          users_synced?: number | null
        }
        Relationships: []
      }
      sent_emails: {
        Row: {
          body: string | null
          error_message: string | null
          id: string
          meta: Json | null
          sent_at: string
          smtp_log_id: string | null
          status: string
          subject: string
          to_email: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          error_message?: string | null
          id?: string
          meta?: Json | null
          sent_at?: string
          smtp_log_id?: string | null
          status: string
          subject: string
          to_email: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          error_message?: string | null
          id?: string
          meta?: Json | null
          sent_at?: string
          smtp_log_id?: string | null
          status?: string
          subject?: string
          to_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_smtp_log_id_fkey"
            columns: ["smtp_log_id"]
            isOneToOne: false
            referencedRelation: "smtp_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      smtp_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          status: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          status?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          status?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smtp_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          card_number: string
          created_at: string
          disabled: boolean
          email: string
          id: string
          last_access: string | null
          last_door_entry: string | null
          last_entry_time: string | null
          ldap_dn: string | null
          name: string
          pin: string
          pin_disabled: boolean
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          card_number: string
          created_at?: string
          disabled?: boolean
          email: string
          id?: string
          last_access?: string | null
          last_door_entry?: string | null
          last_entry_time?: string | null
          ldap_dn?: string | null
          name: string
          pin: string
          pin_disabled?: boolean
          role: string
          updated_at?: string
          username: string
        }
        Update: {
          card_number?: string
          created_at?: string
          disabled?: boolean
          email?: string
          id?: string
          last_access?: string | null
          last_door_entry?: string | null
          last_entry_time?: string | null
          ldap_dn?: string | null
          name?: string
          pin?: string
          pin_disabled?: boolean
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_last_door_entry_fkey"
            columns: ["last_door_entry"]
            isOneToOne: false
            referencedRelation: "doors"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
