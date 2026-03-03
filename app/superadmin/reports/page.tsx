'use client'
import AdminSidebar from '@/components/AdminSidebar'
import { mockZones, timeAgo } from '@/lib/mockData'
import { FileText, TrendingUp } from 'lucide-react'

interface Incident {
  id: string
  zone: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  reportedBy: string
  submittedAt: string
}

const incidents: Incident[] = [
  { id: '1', zone: 'Main Gate A',   description: 'Crowd surge near entrance gates, temporary closure enforced. 3 minor injuries.',   severity: 'high',     reportedBy: 'Rajan Mehta',    submittedAt: new Date(Date.now() - 18 * 60000).toISOString()   },
  { id: '2', zone: 'Central Plaza', description: 'Two vendors blocking emergency access path — resolved after warning.',               severity: 'medium',   reportedBy: 'Priya Singh',   submittedAt: new Date(Date.now() - 55 * 60000).toISOString()   },
  { id: '3', zone: 'East Corridor', description: 'Barricade section collapsed on segment 3. Cordoned and repair underway.',            severity: 'medium',   reportedBy: 'Arun Kumar',    submittedAt: new Date(Date.now() - 2.5 * 3600000).toISOString() },
  { id: '4', zone: 'Food Court',    description: 'Stampede risk detected due to sudden rush at stall 7. Dispersed successfully.',    severity: 'high',     reportedBy: 'Divya Nair',    submittedAt: new Date(Date.now() - 4 * 3600000).toISOString()   },
  { id: '5', zone: 'West Exit',     description: 'Minor altercation between visitors. Security team intervened. No injuries.',        severity: 'low',      reportedBy: 'Rajan Mehta',    submittedAt: new Date(Date.now() - 6 * 3600000).toISOString()   },
  { id: '6', zone: 'Main Gate A',   description: 'Unattended bag — bomb squad cleared, turned out to be lost-and-found item.',       severity: 'critical', reportedBy: 'Arun Kumar',    submittedAt: new Date(Date.now() - 8 * 3600000).toISOString()   },
]

const severityConfig = {
  critical: { border: 'border-red-700',    text: 'text-red-400',    badge: 'bg-red-950 text-red-400',    bar: 'bg-red-500'    },
  high:     { border: 'border-orange-700', text: 'text-orange-400', badge: 'bg-orange-950 text-orange-400', bar: 'bg-orange-500' },
  medium:   { border: 'border-yellow-700', text: 'text-yellow-400', badge: 'bg-yellow-950 text-yellow-400', bar: 'bg-yellow-500' },
  low:      { border: 'border-zinc-700',   text: 'text-zinc-400',   badge: 'bg-zinc-800 text-zinc-400',  bar: 'bg-zinc-500'   },
}

export default function SuperadminReportsPage() {
  // Zone incident counts for analytics
  const zoneCounts = mockZones.map(zone => ({
    name: zone.name,
    count: incidents.filter(i => i.zone === zone.name).length,
    status: zone.status,
  }))
  const maxCount = Math.max(...zoneCounts.map(z => z.count), 1)

  // Severity breakdown
  const severityCount = {
    critical: incidents.filter(i => i.severity === 'critical').length,
    high:     incidents.filter(i => i.severity === 'high').length,
    medium:   incidents.filter(i => i.severity === 'medium').length,
    low:      incidents.filter(i => i.severity === 'low').length,
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="superadmin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Incident Reports</h1>
          <p className="text-sm text-zinc-500 mt-1">All reports filed by administrators across the venue</p>
        </div>

        {/* Analytics row */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Severity breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">Severity Breakdown</h2>
            </div>
            <div className="space-y-3">
              {(['critical','high','medium','low'] as const).map(sev => {
                const count = severityCount[sev]
                const pct = Math.round((count / incidents.length) * 100)
                return (
                  <div key={sev}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs capitalize ${severityConfig[sev].text}`}>{sev}</span>
                      <span className="text-xs text-zinc-600 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${severityConfig[sev].bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By zone */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Incidents by Zone</h2>
            <div className="space-y-3">
              {zoneCounts.map(z => (
                <div key={z.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 truncate">{z.name}</span>
                    <span className="text-xs text-zinc-600 font-mono">{z.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${z.status === 'red' ? 'bg-red-500' : z.status === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'}`}
                      style={{ width: `${(z.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full incident log */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={15} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Full Incident Log</h2>
            <span className="ml-auto text-xs text-zinc-600">{incidents.length} reports</span>
          </div>
          <div className="space-y-3">
            {incidents.map(incident => {
              const cfg = severityConfig[incident.severity]
              return (
                <div key={incident.id} className={`border-l-2 ${cfg.border} bg-zinc-900 rounded-r-lg p-4`}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${cfg.badge}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-zinc-500">{incident.zone}</span>
                    <span className="text-xs text-zinc-600">by {incident.reportedBy}</span>
                    <span className="ml-auto text-xs text-zinc-600">{timeAgo(incident.submittedAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{incident.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
