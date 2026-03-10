'use client'

import { useRequireAuth } from '@/lib/useRequireAuth'
import Navbar from '@/components/Navbar'
import ZoneBadge from '@/components/ZoneBadge'
import { AlertItem } from '@/components/AlertBanner'
import RouteCard from '@/components/RouteCard'
import { mockZones, mockAlerts, mockRoutes } from '@/lib/mockData'
import { MapPin, Navigation, RefreshCw } from 'lucide-react'
import Link from 'next/link'

// Simulate user is in the highest-risk zone
const userZone = mockZones.find(z => z.status === 'red') ?? mockZones[0]
const nearbyAlerts = mockAlerts.filter(a => !a.resolved).slice(0, 4)

export default function DashboardPage() {
  const checking = useRequireAuth()
  if (checking) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#dc2626] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <Navbar />

      {/* Status banner */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b
        ${userZone.status === 'red'
          ? 'bg-red-50 border-[#fecaca]'
          : userZone.status === 'yellow'
          ? 'bg-yellow-50 border-[#fde68a]'
          : 'bg-green-50 border-[#bbf7d0]'}`}>
        <MapPin size={14} className={userZone.status === 'red' ? 'text-[#dc2626]' : 'text-[#888]'} />
        <span className="text-sm font-medium text-[#111]">
          Your area: <strong>{userZone.name}</strong>
        </span>
        <ZoneBadge status={userZone.status} size="sm" />
        {userZone.status === 'red' && (
          <span className="text-xs text-[#dc2626] font-medium ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
            Avoid this zone immediately
          </span>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* My location */}
            <section className="bg-white border border-[#e4e4e4] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#111]">My Location</h2>
                <button className="flex items-center gap-1 text-[10px] text-[#888] hover:text-[#555] transition-colors">
                  <RefreshCw size={10} />
                  Refresh GPS
                </button>
              </div>

              <div className="flex items-center gap-4 p-3 bg-[#fafafa] border border-[#e8e8e8] rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
                  <Navigation size={18} className="text-[#555]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#111]">{userZone.name}</p>
                  <p className="text-xs text-[#888] mt-0.5 font-mono">
                    {userZone.density_percent}% capacity · {userZone.current_count} people
                  </p>
                </div>
                <ZoneBadge status={userZone.status} />
              </div>

              {/* Density bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#888]">Current density</span>
                  <span className="text-[11px] font-mono font-semibold text-[#333]">{userZone.density_percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#f0f0f0] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      userZone.status === 'red' ? 'bg-[#dc2626]' :
                      userZone.status === 'yellow' ? 'bg-[#d97706]' : 'bg-[#16a34a]'}`}
                    style={{ width: `${userZone.density_percent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-[#ccc]">0%</span>
                  <span className="text-[9px] text-[#ccc]">50%</span>
                  <span className="text-[9px] text-[#ccc]">100%</span>
                </div>
              </div>
            </section>

            {/* Safe routes */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#111]">Safe Exit Routes</h2>
                <Link href="/map" className="text-xs text-[#dc2626] hover:text-[#b91c1c] transition-colors">
                  View on map
                </Link>
              </div>
              <div className="space-y-3">
                {mockRoutes.map((route, i) => (
                  <RouteCard key={route.id} route={route} recommended={i === 0} />
                ))}
              </div>
            </section>

            {/* All zones */}
            <section>
              <h2 className="text-sm font-semibold text-[#111] mb-3">All Zones</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {mockZones.map(zone => (
                  <div key={zone.id} className="bg-white border border-[#e4e4e4] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#111]">{zone.name}</p>
                      <ZoneBadge status={zone.status} size="sm" />
                    </div>
                    <div className="h-1 rounded-full bg-[#f0f0f0] overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full ${
                          zone.status === 'red' ? 'bg-[#dc2626]' :
                          zone.status === 'yellow' ? 'bg-[#d97706]' : 'bg-[#16a34a]'}`}
                        style={{ width: `${zone.density_percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#aaa] font-mono">{zone.density_percent}% · {zone.current_count}/{zone.capacity}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Alerts */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#111]">Active Alerts</h2>
                <span className="text-[10px] font-mono bg-[#dc2626] text-white rounded-full px-1.5 py-0.5">
                  {nearbyAlerts.length}
                </span>
              </div>
              <div className="space-y-2">
                {nearbyAlerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </section>

            {/* Quick actions */}
            <section className="bg-white border border-[#e4e4e4] rounded-lg p-4">
              <h2 className="text-xs font-semibold text-[#111] mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left text-xs text-[#333] border border-[#e4e4e4] rounded px-3 py-2 hover:border-[#ccc] transition-colors">
                  Report suspicious crowd activity
                </button>
                <button className="w-full text-left text-xs text-[#333] border border-[#e4e4e4] rounded px-3 py-2 hover:border-[#ccc] transition-colors">
                  Find nearest medical point
                </button>
                <button className="w-full text-left text-xs text-[#dc2626] border border-[#dc2626]/20 rounded px-3 py-2 hover:bg-red-50 transition-colors font-medium">
                  Emergency SOS
                </button>
              </div>
            </section>

            {/* Tip */}
            <section className="border border-[#e4e4e4] rounded-lg p-4 bg-[#fefefe]">
              <p className="text-[10px] uppercase tracking-widest text-[#aaa] font-medium mb-2">Safety Tip</p>
              <p className="text-xs text-[#666] leading-relaxed">
                If you see a red zone ahead, do not enter. Use the East Corridor or West Exit as alternate routes.
                Stay calm and walk, do not run.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
