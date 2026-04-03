'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Zone } from '@/types'
import { fetchZones } from './zones'

export function useLiveZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadZones = useCallback(async () => {
    try {
      const nextZones = await fetchZones()
      setZones(nextZones)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live zones.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadZones()

    const channel = supabase
      .channel('zones-live-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zones' },
        () => {
          void loadZones()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadZones])

  return { zones, loading, error, refreshZones: loadZones }
}
