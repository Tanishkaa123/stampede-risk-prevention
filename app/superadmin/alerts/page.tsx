'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { AlertItem } from '@/components/AlertBanner'
import { mockAlerts, mockZones } from '@/lib/mockData'
import { Alert } from '@/types'
import { PlusCircle } from 'lucide-react'

type Severity = 'low' | 'medium' | 'high' | 'critical'
type AlertType = 'red_zone' | 'stampede_risk' | 'evacuation' | 'lost_child' | 'medical_emergency'

export default function SuperadminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [showForm, setShowForm] = useState(false)
  const [showResolved, setShowResolved] = useState(false)

  // New alert form
  const [type, setType] = useState<AlertType>('stampede_risk')
  const [zoneName, setZoneName] = useState(mockZones[0].name)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<Severity>('high')
  const [formError, setFormError] = useState('')

  function createAlert(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) { setFormError('Message is required.'); return }
    const a: Alert = {
      id: Date.now().toString(),
      type,
      zone_id: '',
      zone_name: zoneName,
      message: message.trim(),
      severity,
      resolved: false,
      created_at: new Date().toISOString(),
    }
    setAlerts(prev => [a, ...prev])
    setMessage('')
    setFormError('')
    setShowForm(false)
  }

  function resolve(id: string) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a))
  }

  function deleteAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const visible = showResolved ? alerts : alerts.filter(a => !a.resolved)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...visible].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const severityColours: Record<Severity, string> = {
    critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-zinc-400'
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="superadmin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Alert Management</h1>
            <p className="text-sm text-zinc-500 mt-1">Create, monitor and resolve system-wide alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} className="accent-red-600" />
              Show resolved
            </label>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <PlusCircle size={15} />
              New Alert
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-8 bg-zinc-900 border border-red-900 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Create Alert</h2>
            {formError && <p className="text-xs text-red-400 mb-3">{formError}</p>}
            <form onSubmit={createAlert} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Alert Type</label>
                <select value={type} onChange={e => setType(e.target.value as AlertType)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white px-3 py-2 focus:outline-none">
                  <option value="red_zone">Red Zone</option>
                  <option value="stampede_risk">Stampede Risk</option>
                  <option value="evacuation">Evacuation</option>
                  <option value="lost_child">Lost Child</option>
                  <option value="medical_emergency">Medical Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Zone</label>
                <select value={zoneName} onChange={e => setZoneName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white px-3 py-2 focus:outline-none">
                  {mockZones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Severity</label>
                <div className="flex gap-2">
                  {(['low','medium','high','critical'] as Severity[]).map(s => (
                    <button key={s} type="button" onClick={() => setSeverity(s)}
                      className={`flex-1 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                        severity === s ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
                <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Alert message…"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-600 px-3 py-2 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-md transition-colors">
                  Broadcast Alert
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 text-zinc-400 text-sm py-2 rounded-md hover:bg-zinc-700 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary */}
        <div className="flex gap-3 mb-6">
          {(['critical','high','medium','low'] as Severity[]).map(sev => (
            <div key={sev} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex-1 text-center">
              <p className={`text-2xl font-mono font-semibold ${severityColours[sev]}`}>
                {alerts.filter(a => a.severity === sev && !a.resolved).length}
              </p>
              <p className="text-xs text-zinc-500 capitalize mt-0.5">{sev}</p>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-16 text-zinc-600">No {showResolved ? '' : 'active '}alerts</div>
          ) : sorted.map(alert => (
            <div key={alert.id} className="relative">
              <AlertItem alert={alert} dark />
              <div className="absolute top-3 right-3 flex gap-2">
                {!alert.resolved && (
                  <button onClick={() => resolve(alert.id)}
                    className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 transition-colors">
                    Resolve
                  </button>
                )}
                <button onClick={() => deleteAlert(alert.id)}
                  className="text-xs px-3 py-1 bg-zinc-800 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded-md border border-zinc-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
