'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import DynamicMap from '@/components/DynamicMap'
import { mockZones, mockAdmins } from '@/lib/mockData'
import ZoneBadge from '@/components/ZoneBadge'
import { ZoneStatus } from '@/types'

export default function SuperadminMapPage() {
  const [showAdmins, setShowAdmins] = useState(true)

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="superadmin" />
      <main className="flex-1 flex flex-col p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Live Control Map</h1>
            <p className="text-sm text-zinc-500 mt-1">Real-time crowd density across all zones</p>
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
          <DynamicMap zones={mockZones} admins={showAdmins ? mockAdmins : []} />
        </div>

        {/* Zone legend below map */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {mockZones.map(zone => (
            <div key={zone.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-zinc-400 font-medium truncate">{zone.name}</p>
                <ZoneBadge status={zone.status as ZoneStatus} size="sm" />
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
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
