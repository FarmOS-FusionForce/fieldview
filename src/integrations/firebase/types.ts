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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_configurations: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: Json | null
        }
        Relationships: []
      }
      crops: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          growing_period: string | null
          id: string
          is_default: boolean | null
          name: string
          profitability_rank: number | null
          season: string | null
          updated_at: string | null
          water_requirement: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          growing_period?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          profitability_rank?: number | null
          season?: string | null
          updated_at?: string | null
          water_requirement?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          growing_period?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          profitability_rank?: number | null
          season?: string | null
          updated_at?: string | null
          water_requirement?: string | null
        }
        Relationships: []
      }
      fields: {
        Row: {
          area_hectares: number | null
          created_at: string
          id: string
          location: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_hectares?: number | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_hectares?: number | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          created_at: string | null
          data: Json
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          farming_type: string | null
          id: string
          location_region: string | null
          observed_weather: string | null
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          farming_type?: string | null
          id?: string
          location_region?: string | null
          observed_weather?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          farming_type?: string | null
          id?: string
          location_region?: string | null
          observed_weather?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      robots: {
        Row: {
          battery_level: number | null
          created_at: string
          current_field_id: string | null
          current_task: string | null
          current_zone_id: string | null
          id: string
          last_seen_at: string | null
          model: string | null
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          current_field_id?: string | null
          current_task?: string | null
          current_zone_id?: string | null
          id?: string
          last_seen_at?: string | null
          model?: string | null
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          current_field_id?: string | null
          current_task?: string | null
          current_zone_id?: string | null
          id?: string
          last_seen_at?: string | null
          model?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "robots_current_field_id_fkey"
            columns: ["current_field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "robots_current_zone_id_fkey"
            columns: ["current_zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          created_at: string
          field_id: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          grass_growth_index: number | null
          humidity: number | null
          id: string
          recorded_at: string
          robot_id: string
          soil_moisture: number | null
          temperature: number | null
          wind_speed: number | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string
          field_id?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          grass_growth_index?: number | null
          humidity?: number | null
          id?: string
          recorded_at?: string
          robot_id: string
          soil_moisture?: number | null
          temperature?: number | null
          wind_speed?: number | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string
          field_id?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          grass_growth_index?: number | null
          humidity?: number | null
          id?: string
          recorded_at?: string
          robot_id?: string
          soil_moisture?: number | null
          temperature?: number | null
          wind_speed?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_robot_id_fkey"
            columns: ["robot_id"]
            isOneToOne: false
            referencedRelation: "robots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      weather_data: {
        Row: {
          ai_explanation: string | null
          created_at: string | null
          id: string
          location: string
          predictive_data: Json | null
          real_time_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          created_at?: string | null
          id?: string
          location: string
          predictive_data?: Json | null
          real_time_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          created_at?: string | null
          id?: string
          location?: string
          predictive_data?: Json | null
          real_time_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          area_hectares: number | null
          created_at: string
          field_id: string
          grass_type: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          area_hectares?: number | null
          created_at?: string
          field_id: string
          grass_type?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          area_hectares?: number | null
          created_at?: string
          field_id?: string
          grass_type?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      owns_field: { Args: { _field_id: string }; Returns: boolean }
      owns_robot: { Args: { _robot_id: string }; Returns: boolean }
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
