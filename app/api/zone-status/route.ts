import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getZoneStatusFromDensity } from '@/lib/zones'

type ZoneLookupRow = {
  id: string
  name: string
  status: 'green' | 'yellow' | 'red'
  density_percent: number
  updated_at: string
}

const PLACE_ALIAS_GROUPS: string[][] = [
  ['foodstreet', 'foodst', 'foodstreetvit'],
  ['cb', 'centralbuilding', 'centralblock'],
  ['ab1', 'ab01', 'ab-1', 'academicblock1'],
  ['ab2', 'ab02', 'ab-2', 'academicblock2'],
  ['rockplaza', 'rocksquare'],
]

function normalizePlaceName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function belongsToSameAliasGroup(a: string, b: string): boolean {
  return PLACE_ALIAS_GROUPS.some(group => group.includes(a) && group.includes(b))
}

function placeMatches(zoneName: string, requestedPlaceName: string): boolean {
  const zoneNorm = normalizePlaceName(zoneName)
  const reqNorm = normalizePlaceName(requestedPlaceName)

  if (!reqNorm) return false
  if (zoneNorm === reqNorm) return true
  if (belongsToSameAliasGroup(zoneNorm, reqNorm)) return true

  // Fuzzy fallback for small naming differences.
  return zoneNorm.includes(reqNorm) || reqNorm.includes(zoneNorm)
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const placeName =
    typeof payload === 'object' && payload !== null && 'placeName' in payload &&
    typeof payload.placeName === 'string'
      ? payload.placeName.trim()
      : ''

  if (!placeName) {
    return NextResponse.json(
      { error: 'placeName is required.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('zones')
    .select('id,name,status,density_percent,updated_at')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to query zones.', details: error.message },
      { status: 500 }
    )
  }

  const zones = (data ?? []) as ZoneLookupRow[]
  const zone = zones.find(z => placeMatches(z.name, placeName))

  if (!zone) {
    return NextResponse.json(
      {
        error: 'Place not found.',
        requestedPlace: placeName,
        availablePlaces: zones.map(z => z.name),
      },
      { status: 404 }
    )
  }

  const derivedStatus = getZoneStatusFromDensity(zone.density_percent)

  return NextResponse.json({
    placeName: zone.name,
    status: derivedStatus,
    densityPercent: zone.density_percent,
    updatedAt: zone.updated_at,
  })
}
