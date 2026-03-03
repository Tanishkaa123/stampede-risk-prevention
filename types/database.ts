export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'user' | 'admin' | 'superadmin'
          zone_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          online: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      zones: {
        Row: {
          id: string
          name: string
          status: 'green' | 'yellow' | 'red'
          density_percent: number
          capacity: number
          current_count: number
          lat: number
          lng: number
          radius: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['zones']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['zones']['Insert']>
      }
      alerts: {
        Row: {
          id: string
          type: string
          zone_id: string | null
          zone_name: string
          message: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          resolved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          instruction: string
          zone_id: string
          zone_name: string
          assigned_to: string
          assigned_by: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          created_at: string
          responded_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'responded_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      incidents: {
        Row: {
          id: string
          zone_id: string
          zone_name: string
          description: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          reported_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>
      }
      broadcasts: {
        Row: {
          id: string
          type: 'text' | 'audio' | 'video'
          content: string
          target: string
          sent_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['broadcasts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['broadcasts']['Insert']>
      }
    }
  }
}
