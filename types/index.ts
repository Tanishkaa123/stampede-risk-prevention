export type UserRole = 'user' | 'admin' | 'superadmin'
export type ZoneStatus = 'green' | 'yellow' | 'red'
export type AlertType =
  | 'red_zone'
  | 'stampede_risk'
  | 'evacuation'
  | 'lost_child'
  | 'medical_emergency'
export type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

export interface Zone {
  id: string
  name: string
  status: ZoneStatus
  density_percent: number
  capacity: number
  current_count: number
  lat: number
  lng: number
  radius: number
  updated_at: string
}

export interface Alert {
  id: string
  type: AlertType
  zone_id: string
  zone_name: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  resolved: boolean
}

export interface AdminTask {
  id: string
  instruction: string
  zone_id: string
  zone_name: string
  assigned_to: string
  assigned_by: string
  status: TaskStatus
  created_at: string
  responded_at: string | null
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  role: UserRole
  zone_id: string | null
  zone_name: string | null
  gps_lat: number | null
  gps_lng: number | null
  online: boolean
  tasks_assigned: number
  tasks_completed: number
  tasks_rejected: number
  avg_response_seconds: number
}

export interface Route {
  id: string
  name: string
  from_zone: string
  to_zone: string
  distance_km: number
  time_minutes: number
  crowd_score: number
  route_score: number
  safe: boolean
}

export interface Broadcast {
  id: string
  type: 'text' | 'audio' | 'video'
  content: string
  target: 'all' | string
  sent_by: string
  created_at: string
}

export interface IncidentReport {
  id: string
  zone_id: string
  zone_name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  reported_by: string
  created_at: string
}
