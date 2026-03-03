'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { AlertItem } from '@/components/AlertBanner'
import { mockAlerts } from '@/lib/mockData'
import { Alert } from '@/types'

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [showResolved, setShowResolved] = useState(false)

  const visible = showResolved ? alerts : alerts.filter(a => !a.resolved)

  function resolve(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a))
  }

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...visible].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="admin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Zone Alerts</h1>
            <p className="text-sm text-zinc-500 mt-1">Active alerts in your assigned zone</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={e => setShowResolved(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 accent-red-600"
            />
            Show resolved
          </label>
        </div>

        {/* Active count banner */}
        {!showResolved && alerts.filter(a => !a.resolved).length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-green-400 font-medium">All clear — no active alerts</p>
            <p className="text-sm text-zinc-600 mt-1">Your zone is currently safe</p>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div className="flex gap-3 mb-6">
              {(['critical','high','medium','low'] as const).map(sev => {
                const count = alerts.filter(a => a.severity === sev && !a.resolved).length
                const colours = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-zinc-400' }
                return (
                  <div key={sev} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex-1 text-center">
                    <p className={`text-2xl font-mono font-semibold ${colours[sev]}`}>{count}</p>
                    <p className="text-xs text-zinc-500 capitalize mt-0.5">{sev}</p>
                  </div>
                )
              })}
            </div>

            {/* Alert list */}
            <div className="space-y-3">
              {sorted.map(alert => (
                <div key={alert.id} className="relative">
                  <AlertItem alert={alert} dark />
                  {!alert.resolved && (
                    <button
                      onClick={() => resolve(alert.id)}
                      className="absolute top-3 right-3 text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  {alert.resolved && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-md">
                      Resolved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
