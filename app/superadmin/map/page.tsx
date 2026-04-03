'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import DynamicMap from '@/components/DynamicMap'
import { mockAdmins } from '@/lib/mockData'
import ZoneBadge from '@/components/ZoneBadge'
import { Minus, Plus } from 'lucide-react'
import { useLiveZones } from '@/lib/useLiveZones'
import { clampDensity, updateZoneDensity } from '@/lib/zones'

export default function SuperadminMapPage() {
  const { zones, loading, error } = useLiveZones()
  const [showAdmins, setShowAdmins] = useState(true)
  const [savingZoneId, setSavingZoneId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState('')

  const adjustDensity = async (zoneId: string, delta: number) => {
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return

    setSavingZoneId(zoneId)
    setUpdateError('')
    try {
      await updateZoneDensity(zone, clampDensity(zone.density_percent + delta))
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update zone density.')
    } finally {
      setSavingZoneId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="superadmin" />
      <main className="flex-1 flex flex-col p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Live Control Map</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {loading ? 'Loading live zones...' : `Real-time crowd density across ${zones.length} zones`}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showAdmins}
              onChange={e => setShowAdmins(e.target.checked)}
              className="accent-red-600"
            />
            Show admin locations
          </label>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-125 rounded-lg overflow-hidden border border-zinc-800">
          {zones.length > 0 ? (
            <DynamicMap zones={zones} admins={showAdmins ? mockAdmins : []} />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">
              {loading ? 'Loading map…' : 'No zones found in the database.'}
            </div>
          )}
        </div>

        {(error || updateError) && (
          <div className="mt-4 bg-red-950/40 border border-red-900 rounded-lg px-4 py-3 text-xs text-red-300">
            {error || updateError}
          </div>
        )}

        {/* Zone legend below map */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {zones.map(zone => (
            <div key={zone.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-zinc-400 font-medium truncate">{zone.name}</p>
                <ZoneBadge status={zone.status} size="sm" />
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    zone.status === 'red' ? 'bg-red-500' : zone.status === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${zone.density_percent}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-1 font-mono">{zone.density_percent}% · {zone.current_count} people</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustDensity(zone.id, -5)}
                  disabled={savingZoneId === zone.id}
                  className="h-7 w-7 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center"
                >
                  <Minus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => adjustDensity(zone.id, 5)}
                  disabled={savingZoneId === zone.id}
                  className="h-7 w-7 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center"
                >
                  <Plus size={12} />
                </button>
                <span className="text-[10px] text-zinc-500">{savingZoneId === zone.id ? 'Saving...' : 'Adjust ±5%'}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
