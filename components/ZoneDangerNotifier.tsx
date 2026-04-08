'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Bell, Volume2, X } from 'lucide-react'
import type { Zone } from '@/types'
import { supabase } from '@/lib/supabase'

const DENSITY_ALERT_THRESHOLD = 70
const ALERT_COOLDOWN_MS = 30_000

type Coords = { lat: number; lng: number }

interface DangerAlert {
  id: string
  zoneName: string
  density: number
}

interface ZoneDangerNotifierProps {
  zones: Zone[]
  userCoords?: Coords | null
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

export default function ZoneDangerNotifier({ zones, userCoords = null }: ZoneDangerNotifierProps) {
  const [assignedZoneId, setAssignedZoneId] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission)
  const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastAlertAtRef = useRef(0)
  const lastAlertZoneRef = useRef<string | null>(null)

  const playBeep = useCallback(() => {
    if (typeof window === 'undefined') return

    const audioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!audioContextCtor) return

    const ctx = audioContextRef.current ?? new audioContextCtor()
    audioContextRef.current = ctx

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const now = ctx.currentTime
    const pulse = (start: number, frequency: number) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.2)
    }

    pulse(now, 880)
    pulse(now + 0.24, 700)
  }, [])

  const loadAssignedZone = useCallback(async (userId: string | null) => {
    if (!userId) {
      setAssignedZoneId(null)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('zone_id')
      .eq('id', userId)
      .single()

    setAssignedZoneId((data as { zone_id: string | null } | null)?.zone_id ?? null)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      await loadAssignedZone(data.session?.user.id ?? null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadAssignedZone(session?.user.id ?? null)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [loadAssignedZone])

  useEffect(() => {
    if (permission !== 'default' || typeof Notification === 'undefined') return
    Notification.requestPermission().then(result => setPermission(result)).catch(() => {
      setPermission('denied')
    })
  }, [permission])

  const userZone = useMemo(() => {
    if (assignedZoneId) {
      return zones.find(zone => zone.id === assignedZoneId) ?? null
    }

    if (!userCoords) return null

    return zones
      .map(zone => ({ zone, meters: distanceMeters(userCoords.lat, userCoords.lng, zone.lat, zone.lng) }))
      .filter(item => item.meters <= item.zone.radius)
      .sort((a, b) => a.meters - b.meters)[0]?.zone ?? null
  }, [assignedZoneId, userCoords, zones])

  useEffect(() => {
    if (!userZone) return

    const isDangerState = userZone.status === 'red' && userZone.density_percent >= DENSITY_ALERT_THRESHOLD
    if (!isDangerState) {
      lastAlertZoneRef.current = null
      return
    }

    const now = Date.now()
    const inCooldown = lastAlertZoneRef.current === userZone.id && now - lastAlertAtRef.current < ALERT_COOLDOWN_MS
    if (inCooldown) return

    lastAlertAtRef.current = now
    lastAlertZoneRef.current = userZone.id

    playBeep()

    if (permission === 'granted' && typeof Notification !== 'undefined') {
      new Notification('High Crowd Density Alert', {
        body: `${userZone.name} is at ${Math.round(userZone.density_percent)}% density. Move to a safer route now.`,
        tag: `zone-danger-${userZone.id}`,
        renotify: true,
      })
    }
  }, [permission, playBeep, userZone])

  const activeAlert = useMemo<DangerAlert | null>(() => {
    if (!userZone) return null

    const isDangerState = userZone.status === 'red' && userZone.density_percent >= DENSITY_ALERT_THRESHOLD
    if (!isDangerState) return null

    const key = `${userZone.id}:${userZone.updated_at}`
    if (dismissedAlertKey === key) return null

    return {
      id: key,
      zoneName: userZone.name,
      density: Math.round(userZone.density_percent),
    }
  }, [dismissedAlertKey, userZone])

  if (!activeAlert) return null

  return (
    <div className="fixed right-4 bottom-4 z-50 w-[min(92vw,24rem)] rounded-lg border border-red-200 bg-white shadow-lg">
      <div className="flex items-start gap-3 p-3">
        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Red Zone Warning</p>
            <Bell size={12} className="text-red-600" />
            <Volume2 size={12} className="text-red-600" />
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-900">
            {activeAlert.zoneName} has crossed the safe limit ({activeAlert.density}%).
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Move away from this area immediately and follow the nearest safe route.
          </p>
        </div>
        <button
          onClick={() => setDismissedAlertKey(activeAlert.id)}
          className="text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Dismiss danger alert"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
