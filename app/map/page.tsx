'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { AlertBanner } from '@/components/AlertBanner'
import ZoneBadge from '@/components/ZoneBadge'
import DynamicMap from '@/components/DynamicMap'
import { mockZones, mockAlerts, timeAgo } from '@/lib/mockData'
import { Layers, Search, X } from 'lucide-react'

export default function MapPage() {
  const [showAdmins, setShowAdmins] = useState(false)
  const [search, setSearch] = useState('')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [panelOpen, setPanelOpen] = useState(true)

  const activeAlerts = mockAlerts.filter(a => !a.resolved && !dismissedAlerts.includes(a.id))
  const filteredZones = mockZones.filter(z =>
    z.name.toLowerCase().includes(search.toLowerCase())
  )

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
          <DynamicMap zones={mockZones} height="100%" showAdmins={showAdmins} />

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
