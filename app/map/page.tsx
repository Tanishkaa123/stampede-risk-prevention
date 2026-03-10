'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AlertBanner } from '@/components/AlertBanner'
import ZoneBadge from '@/components/ZoneBadge'
import DynamicMap from '@/components/DynamicMap'
import { mockZones, mockAlerts, timeAgo } from '@/lib/mockData'
import { Layers, Search, X, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function MapPage() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [showAdmins, setShowAdmins] = useState(false)
  const [search, setSearch] = useState('')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [panelOpen, setPanelOpen] = useState(true)
  const [locationState, setLocationState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/login'); return }
      setAuthChecking(false)
    })
  }, [router])

  // Location — only after auth confirmed
  useEffect(() => {
    if (authChecking) return
    if (!navigator.geolocation) { setLocationState('denied'); return }
    setLocationState('requesting')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationState('granted')
      },
      () => setLocationState('denied'),
      { timeout: 10000 }
    )
  }, [authChecking])

  const nearbyZones = userCoords
    ? mockZones.filter(z => haversine(userCoords.lat, userCoords.lng, z.lat, z.lng) <= 10)
    : []

  const activeAlerts = mockAlerts.filter(a => !a.resolved && !dismissedAlerts.includes(a.id))
  const filteredZones = nearbyZones.filter(z =>
    z.name.toLowerCase().includes(search.toLowerCase())
  )

  // 1. Auth loading
  if (authChecking) {
    return (
      <div className="flex flex-col h-screen bg-[#f7f6f2]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#dc2626] border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  // 2. Waiting for permission prompt
  if (locationState === 'idle' || locationState === 'requesting') {
    return (
      <div className="flex flex-col h-screen bg-[#f7f6f2]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#dc2626] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-[#555]">Requesting your location…</p>
          <p className="text-xs text-[#aaa] max-w-xs">Allow location access in your browser to view nearby zones.</p>
        </div>
      </div>
    )
  }

  // 3. Location denied — hard block, no map
  if (locationState === 'denied') {
    return (
      <div className="flex flex-col h-screen bg-[#f7f6f2]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center">
            <MapPin size={28} className="text-[#dc2626]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#111] mb-1">Location access required</h2>
            <p className="text-sm text-[#666] max-w-sm leading-relaxed">
              This map only shows zones near you. Please allow location access in your browser and refresh.
            </p>
          </div>
          <div className="bg-[#f5f5f5] border border-[#e4e4e4] rounded-lg px-4 py-3 text-left max-w-xs w-full">
            <p className="text-[11px] font-semibold text-[#555] mb-1.5">How to enable:</p>
            <ol className="text-[11px] text-[#777] space-y-1 list-decimal list-inside">
              <li>Click the lock icon in your browser’s address bar</li>
              <li>Set <strong>Location</strong> to <strong>Allow</strong></li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#dc2626] text-white text-sm px-6 py-2.5 rounded font-medium hover:bg-[#b91c1c] transition-colors"
          >
            Refresh &amp; Try Again
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f6f2]">
      <Navbar />

      {/* Alert banners */}
      {activeAlerts.filter(a => a.severity === 'critical').slice(0, 1).map(alert => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={(id) => setDismissedAlerts(prev => [...prev, id])}
        />
      ))}

      {/* Top bar */}
      <div className="bg-white border-b border-[#e4e4e4] px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-[#111]">Live Crowd Map</h1>
          <span className="flex items-center gap-1 text-[10px] text-[#888]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
            Updated {timeAgo(mockZones[0].updated_at)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#888]">
            <span className="font-mono font-semibold text-[#dc2626]">{activeAlerts.length}</span> active alerts
          </span>
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="flex items-center gap-1.5 text-xs text-[#555] border border-[#e4e4e4] px-2.5 py-1.5 rounded hover:border-[#ccc] transition-colors"
          >
            <Layers size={12} />
            {panelOpen ? 'Hide' : 'Show'} Panel
          </button>
        </div>
      </div>

      {/* Map + Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <DynamicMap
            zones={nearbyZones}
            height="100%"
            showAdmins={showAdmins}
            center={userCoords ? [userCoords.lat, userCoords.lng] : undefined}
            userLocation={userCoords ? [userCoords.lat, userCoords.lng] : undefined}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 bg-white border border-[#e4e4e4] rounded-lg p-3 shadow-sm z-10">
            <p className="text-[9px] uppercase tracking-widest text-[#aaa] font-medium mb-2">Zone Legend</p>
            {[
              { color: '#dc2626', label: 'Danger', desc: '> 80% capacity' },
              { color: '#d97706', label: 'Moderate', desc: '50–80% capacity' },
              { color: '#16a34a', label: 'Safe', desc: '< 50% capacity' },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color, opacity: 0.8 }} />
                <span className="text-xs text-[#333] font-medium">{label}</span>
                <span className="text-[10px] text-[#aaa]">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        {panelOpen && (
          <div className="w-72 bg-white border-l border-[#e4e4e4] flex flex-col overflow-hidden shrink-0">
            {/* Search */}
            <div className="p-3 border-b border-[#e4e4e4]">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#bbb]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search zones…"
                  className="w-full pl-7 pr-7 py-1.5 text-xs border border-[#e4e4e4] rounded text-[#333] placeholder:text-[#ccc] focus:outline-none focus:border-[#bbb]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ccc]">
                    <X size={11} />
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdmins}
                  onChange={e => setShowAdmins(e.target.checked)}
                  className="w-3 h-3 accent-[#dc2626]"
                />
                <span className="text-xs text-[#666]">Show admin positions</span>
              </label>
            </div>

            {/* Zone list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredZones.map(zone => (
                <div key={zone.id} className="border border-[#e4e4e4] rounded-lg p-3 hover:border-[#ccc] transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#111]">{zone.name}</p>
                    <ZoneBadge status={zone.status} size="sm" />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#888]">Density</span>
                      <span className="text-[10px] font-mono font-semibold text-[#333]">{zone.density_percent}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#f0f0f0] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          zone.status === 'red' ? 'bg-[#dc2626]' :
                          zone.status === 'yellow' ? 'bg-[#d97706]' : 'bg-[#16a34a]'}`}
                        style={{ width: `${zone.density_percent}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#aaa] mt-1.5 font-mono">
                    {zone.current_count} / {zone.capacity} people
                  </p>
                </div>
              ))}
            </div>

            {/* Active alerts */}
            {activeAlerts.length > 0 && (
              <div className="border-t border-[#e4e4e4] p-3">
                <p className="text-[10px] uppercase tracking-widest text-[#aaa] font-medium mb-2">Active Alerts</p>
                <div className="space-y-1.5">
                  {activeAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                        alert.severity === 'critical' ? 'bg-[#dc2626]' : 'bg-[#d97706]'}`} />
                      <div>
                        <p className="text-[10px] font-medium text-[#333]">{alert.zone_name}</p>
                        <p className="text-[10px] text-[#aaa]">{timeAgo(alert.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
