import type { Zone, ZoneStatus } from '@/types'
import type { Database } from '@/types/database'
import { supabase } from './supabase'

const RED_DENSITY_THRESHOLD = 70

type ZoneRow = Database['public']['Tables']['zones']['Row']

export function clampDensity(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function getZoneStatusFromDensity(density: number): ZoneStatus {
  return clampDensity(density) >= RED_DENSITY_THRESHOLD ? 'red' : 'green'
}

export function normalizeZone(zone: ZoneRow): Zone {
  const density = clampDensity(zone.density_percent)
  const status = getZoneStatusFromDensity(density)
  const currentCount = Math.round((density / 100) * zone.capacity)

  return {
    ...zone,
    density_percent: density,
    status,
    current_count: currentCount,
  }
}

export async function fetchZones(): Promise<Zone[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  const rows = (data ?? []) as ZoneRow[]
  return rows.map(normalizeZone)
}

export async function updateZoneDensity(zone: Zone, nextDensity: number): Promise<void> {
  const density = clampDensity(nextDensity)
  const status = getZoneStatusFromDensity(density)
  const currentCount = Math.round((density / 100) * zone.capacity)
  const updates: Database['public']['Tables']['zones']['Update'] = {
    density_percent: density,
    status,
    current_count: currentCount,
  }

  const { error } = await supabase
    .from('zones')
    .update(updates as never)
    .eq('id', zone.id)

  if (error) throw error
}
