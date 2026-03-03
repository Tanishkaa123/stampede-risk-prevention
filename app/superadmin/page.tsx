'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import StatCard from '@/components/StatCard'
import ZoneBadge from '@/components/ZoneBadge'
import PerformanceTable from '@/components/PerformanceTable'
import BroadcastPanel from '@/components/BroadcastPanel'
import DynamicMap from '@/components/DynamicMap'
import { AlertItem } from '@/components/AlertBanner'
import { mockZones, mockAlerts, mockAdmins } from '@/lib/mockData'
import { Edit3, CheckCircle } from 'lucide-react'

type ZoneStatus = 'green' | 'yellow' | 'red'

interface ZoneEdit {
  status: ZoneStatus
  density: number
}

export default function SuperAdminPage() {
  const [zoneEdits, setZoneEdits] = useState<Record<string, ZoneEdit>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState(mockZones[0])

  const zones = mockZones.map(z => ({
    ...z,
    status: (zoneEdits[z.id]?.status ?? z.status),
    density_percent: zoneEdits[z.id]?.density ?? z.density_percent,
  }))

  const activeAlerts = mockAlerts.filter(a => !a.resolved)
  const onlineAdmins = mockAdmins.filter(a => a.online)

  const handleZoneSave = async (zoneId: string) => {
    setSaving(zoneId)
    await new Promise(r => setTimeout(r, 800))
    setSaving(null)
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      <AdminSidebar role="superadmin" userName="Super Admin" />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-6 sticky top-0 bg-[#0d0d0d] z-10">
          <h1 className="text-white text-sm font-semibold">Command Center</h1>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[#555]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
              {activeAlerts.length} active alerts
            </span>
            <span className="text-xs text-[#555]">{onlineAdmins.length} admins online</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Users Online"
              value="1,247"
              sub="across all zones"
              dark
            />
            <StatCard
              label="Admins Online"
              value={onlineAdmins.length}
              sub={`of ${mockAdmins.length} total`}
              accent="text-[#16a34a]"
              dark
            />
            <StatCard
              label="Red Zones"
              value={zones.filter(z => z.status === 'red').length}
              sub="require attention"
              accent="text-[#dc2626]"
              dark
            />
            <StatCard
              label="Active Alerts"
              value={activeAlerts.length}
              sub="unresolved"
              accent="text-[#d97706]"
              dark
            />
          </div>

          {/* Map + Zone manager */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden" style={{ height: '360px' }}>
                <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
                  <h2 className="text-white text-sm font-semibold">Control Map</h2>
                  <span className="text-[10px] text-[#555]">Click zone to manage</span>
                </div>
                <div style={{ height: 'calc(100% - 45px)' }}>
                  <DynamicMap zones={zones} showAdmins admins={mockAdmins} height="100%" />
                </div>
              </div>
            </div>

            {/* Zone editor */}
            <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222]">
                <h2 className="text-white text-sm font-semibold">Zone Management</h2>
              </div>
              <div className="p-0">
                {/* Zone selector */}
                <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                  {zones.map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left border-b border-[#1e1e1e] last:border-0 transition-colors
                        ${selectedZone.id === zone.id ? 'bg-[#1e1e1e]' : 'hover:bg-[#1a1a1a]'}`}
                    >
                      <span className="text-xs text-[#ccc]">{zone.name}</span>
                      <ZoneBadge status={zone.status} size="sm" />
                    </button>
                  ))}
                </div>

                {/* Edit panel for selected zone */}
                <div className="p-4 border-t border-[#222]">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit3 size={12} className="text-[#555]" />
                    <p className="text-[#888] text-xs font-medium">{selectedZone.name}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
                        Zone Status
                      </label>
                      <select
                        value={zoneEdits[selectedZone.id]?.status ?? selectedZone.status}
                        onChange={e => setZoneEdits(prev => ({
                          ...prev, [selectedZone.id]: {
                            ...prev[selectedZone.id],
                            status: e.target.value as ZoneStatus,
                            density: prev[selectedZone.id]?.density ?? selectedZone.density_percent,
                          }
                        }))}
                        className="w-full bg-[#111] border border-[#333] rounded text-[#ccc] text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
                      >
                        <option value="green">Green — Safe</option>
                        <option value="yellow">Yellow — Moderate</option>
                        <option value="red">Red — Danger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
                        Crowd Density: {zoneEdits[selectedZone.id]?.density ?? selectedZone.density_percent}%
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={zoneEdits[selectedZone.id]?.density ?? selectedZone.density_percent}
                        onChange={e => setZoneEdits(prev => ({
                          ...prev, [selectedZone.id]: {
                            ...prev[selectedZone.id],
                            status: prev[selectedZone.id]?.status ?? selectedZone.status,
                            density: Number(e.target.value),
                          }
                        }))}
                        className="w-full accent-[#dc2626]"
                      />
                    </div>

                    <button
                      onClick={() => handleZoneSave(selectedZone.id)}
                      disabled={saving === selectedZone.id}
                      className={`flex items-center justify-center gap-1.5 w-full py-2 rounded text-xs font-medium transition-colors
                        ${saving === selectedZone.id
                          ? 'bg-[#16a34a] text-white'
                          : 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'}`}
                    >
                      {saving === selectedZone.id ? (
                        <><CheckCircle size={12} /> Saved</>
                      ) : 'Update Zone'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast + Alerts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <BroadcastPanel />

            <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222]">
                <h2 className="text-white text-sm font-semibold">Active Alerts</h2>
                <p className="text-[#555] text-xs mt-0.5">{activeAlerts.length} unresolved</p>
              </div>
              <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '340px' }}>
                {activeAlerts.map(alert => <AlertItem key={alert.id} alert={alert} dark />)}
              </div>
            </div>
          </div>

          {/* Performance table */}
          <PerformanceTable admins={mockAdmins} />

          {/* Analytics quick view */}
          <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
            <h2 className="text-white text-sm font-semibold mb-4">Zone Density Overview</h2>
            <div className="space-y-3">
              {zones.map(zone => (
                <div key={zone.id} className="flex items-center gap-3">
                  <p className="text-[#888] text-xs w-32 shrink-0 truncate">{zone.name}</p>
                  <div className="flex-1 h-2 rounded-full bg-[#222] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        zone.status === 'red' ? 'bg-[#dc2626]' :
                        zone.status === 'yellow' ? 'bg-[#d97706]' : 'bg-[#16a34a]'}`}
                      style={{ width: `${zone.density_percent}%` }}
                    />
                  </div>
                  <span className="text-[#555] text-xs font-mono w-10 text-right shrink-0">{zone.density_percent}%</span>
                  <ZoneBadge status={zone.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Admins location overview */}
          <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222]">
              <h2 className="text-white text-sm font-semibold">Administrators</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {['Name', 'Zone', 'Status', 'GPS', 'Last Update'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockAdmins.map(admin => (
                    <tr key={admin.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-4 py-3 text-[#ccc] font-medium">{admin.name}</td>
                      <td className="px-4 py-3 text-[#666]">{admin.zone_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          admin.online ? 'bg-green-900/30 text-[#16a34a]' : 'bg-[#1e1e1e] text-[#444]'
                        }`}>
                          {admin.online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#555] font-mono text-[10px]">
                        {admin.gps_lat ? `${admin.gps_lat.toFixed(4)}, ${admin.gps_lng?.toFixed(4)}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-[#444]">just now</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
