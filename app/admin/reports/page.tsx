'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { mockZones, timeAgo } from '@/lib/mockData'
import { FileText, AlertTriangle } from 'lucide-react'

type Severity = 'low' | 'medium' | 'high' | 'critical'

interface IncidentReport {
  id: string
  zone: string
  description: string
  severity: Severity
  submittedAt: string
}

const seedReports: IncidentReport[] = [
  { id: '1', zone: 'Main Gate A',   description: 'Crowd surge near entrance, 3 people fell. Medical team alerted.',   severity: 'high',     submittedAt: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: '2', zone: 'Central Plaza', description: 'Minor scuffle resolved by security. No injuries reported.',          severity: 'low',      submittedAt: new Date(Date.now() - 80 * 60000).toISOString() },
  { id: '3', zone: 'East Corridor', description: 'Barricade section collapsed. Area temporarily closed for repair.',   severity: 'medium',   submittedAt: new Date(Date.now() - 3 * 3600000).toISOString() },
]

const severityConfig: Record<Severity, { label: string; border: string; text: string; bg: string }> = {
  critical: { label: 'Critical', border: 'border-red-700',    text: 'text-red-400',    bg: 'bg-red-950' },
  high:     { label: 'High',     border: 'border-orange-700', text: 'text-orange-400', bg: 'bg-orange-950' },
  medium:   { label: 'Medium',   border: 'border-yellow-700', text: 'text-yellow-400', bg: 'bg-yellow-950' },
  low:      { label: 'Low',      border: 'border-zinc-700',   text: 'text-zinc-400',   bg: 'bg-zinc-900' },
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>(seedReports)
  const [zone, setZone] = useState(mockZones[0].name)
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError('Please describe the incident.'); return }
    const report: IncidentReport = {
      id: Date.now().toString(),
      zone,
      description: description.trim(),
      severity,
      submittedAt: new Date().toISOString(),
    }
    setReports(prev => [report, ...prev])
    setDescription('')
    setSeverity('medium')
    setError('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="admin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Incident Reports</h1>
          <p className="text-sm text-zinc-500 mt-1">File reports and view past incidents in your zone</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Report form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-yellow-400" />
              <h2 className="text-base font-semibold text-white">File New Report</h2>
            </div>

            {submitted && (
              <div className="mb-4 px-4 py-2.5 bg-green-950 border border-green-800 rounded-md text-green-400 text-sm">
                Report submitted successfully.
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-950 border border-red-800 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Zone</label>
                <select
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white px-3 py-2 focus:outline-none focus:border-zinc-500"
                >
                  {mockZones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Severity</label>
                <div className="flex gap-2">
                  {(['low','medium','high','critical'] as Severity[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`flex-1 py-1.5 text-xs rounded-md border transition-colors capitalize ${
                        severity === s
                          ? `${severityConfig[s].bg} ${severityConfig[s].border} ${severityConfig[s].text}`
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what happened, number of people involved, actions taken…"
                  rows={5}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-600 px-3 py-2 resize-none focus:outline-none focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-md hover:bg-zinc-200 transition-colors"
              >
                Submit Report
              </button>
            </form>
          </div>

          {/* Reports list */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-zinc-400" />
              <h2 className="text-base font-semibold text-white">Recent Reports</h2>
              <span className="ml-auto text-xs text-zinc-600">{reports.length} total</span>
            </div>

            <div className="space-y-3">
              {reports.map(r => {
                const cfg = severityConfig[r.severity]
                return (
                  <div key={r.id} className={`border-l-2 ${cfg.border} bg-zinc-900 rounded-r-lg p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.bg} ${cfg.text} capitalize`}>
                        {r.severity}
                      </span>
                      <span className="text-xs text-zinc-500">{r.zone}</span>
                      <span className="ml-auto text-xs text-zinc-600">{timeAgo(r.submittedAt)}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{r.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
