'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import TaskCard from '@/components/TaskCard'
import ZoneBadge from '@/components/ZoneBadge'
import { AlertItem } from '@/components/AlertBanner'
import StatCard from '@/components/StatCard'
import { mockZones, mockAlerts, mockAdmins, mockTasks, timeAgo } from '@/lib/mockData'
import { MessageSquare, PhoneCall } from 'lucide-react'

const myZone = mockZones.find(z => z.status === 'red')!
const nearbyAdmins = mockAdmins.slice(1, 4)
const myAlerts = mockAlerts.slice(0, 3)

type TaskTab = 'pending' | 'accepted' | 'completed'

export default function AdminPage() {
  const [taskTab, setTaskTab] = useState<TaskTab>('pending')
  const [report, setReport] = useState({ desc: '', severity: 'medium' })
  const [submitted, setSubmitted] = useState(false)


  const handleReport = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setReport({ desc: '', severity: 'medium' }) }, 2000)
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      <AdminSidebar
        role="admin"
        userName="Rajan Sharma"
        zoneName="Main Gate A"
      />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="h-14 border-b border-[#1f1f1f] flex items-center px-6 sticky top-0 bg-[#0d0d0d] z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-sm font-semibold">Admin Panel</h1>
            <span className="flex items-center gap-1.5 text-[10px] text-[#555]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="My Zone" value={myZone.name} sub={`${myZone.density_percent}% density`} accent="text-[#dc2626]" dark />
            <StatCard label="Tasks Pending" value={mockTasks.filter(t => t.status === 'pending').length} dark />
            <StatCard label="Tasks Done" value={mockTasks.filter(t => t.status === 'completed').length} accent="text-[#16a34a]" dark />
            <StatCard label="Active Alerts" value={myAlerts.length} accent="text-[#d97706]" dark />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
                <div className="px-4 pt-4 pb-0 border-b border-[#222]">
                  <h2 className="text-white text-sm font-semibold mb-3">Tasks</h2>
                  <div className="flex">
                    {(['pending', 'accepted', 'completed'] as TaskTab[]).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setTaskTab(tab)}
                        className={`px-4 py-2 text-xs border-b-2 capitalize transition-colors -mb-px
                          ${taskTab === tab
                            ? 'border-[#dc2626] text-white'
                            : 'border-transparent text-[#555] hover:text-[#999]'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {mockTasks
                    .filter(t => t.status === taskTab)
                    .map(task => <TaskCard key={task.id} task={task} />)}
                  {mockTasks.filter(t => t.status === taskTab).length === 0 && (
                    <p className="text-[#444] text-sm text-center py-8">No {taskTab} tasks</p>
                  )}
                </div>
              </div>

              {/* Zone overview */}
              <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
                <h2 className="text-white text-sm font-semibold mb-4">My Zone — {myZone.name}</h2>
                <div className="flex items-center gap-4 mb-3">
                  <ZoneBadge status={myZone.status} />
                  <span className="text-[#888] text-xs font-mono">{myZone.current_count} / {myZone.capacity} people</span>
                </div>
                <div className="h-2 rounded-full bg-[#222] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-[#dc2626] transition-all"
                    style={{ width: `${myZone.density_percent}%` }}
                  />
                </div>
                <p className="text-[#555] text-xs">Last updated: {timeAgo(myZone.updated_at)}</p>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Alerts */}
              <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
                <h2 className="text-white text-sm font-semibold mb-3">Incoming Alerts</h2>
                <div className="space-y-2">
                  {myAlerts.map(alert => <AlertItem key={alert.id} alert={alert} dark />)}
                </div>
              </div>

              {/* Nearby admins */}
              <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#222]">
                  <h2 className="text-white text-sm font-semibold">Nearby Admins</h2>
                </div>
                <div className="divide-y divide-[#1e1e1e]">
                  {nearbyAdmins.map(admin => (
                    <div key={admin.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-[#ccc] text-xs font-medium">{admin.name}</p>
                        <p className="text-[#555] text-[10px] mt-0.5">{admin.zone_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.online ? 'bg-[#16a34a]' : 'bg-[#444]'}`} />
                        <button className="p-1.5 text-[#555] hover:text-[#999] transition-colors">
                          <MessageSquare size={12} />
                        </button>
                        <button className="p-1.5 text-[#555] hover:text-[#999] transition-colors">
                          <PhoneCall size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident report */}
              <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
                <h2 className="text-white text-sm font-semibold mb-3">Submit Incident</h2>
                <form onSubmit={handleReport} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={report.desc}
                      onChange={e => setReport(r => ({ ...r, desc: e.target.value }))}
                      placeholder="Describe the incident…"
                      className="w-full bg-[#111] border border-[#333] rounded text-[#ccc] text-xs px-3 py-2 
                        placeholder:text-[#444] focus:outline-none focus:border-[#555] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
                      Severity
                    </label>
                    <select
                      value={report.severity}
                      onChange={e => setReport(r => ({ ...r, severity: e.target.value }))}
                      className="w-full bg-[#111] border border-[#333] rounded text-[#ccc] text-xs px-3 py-2 focus:outline-none focus:border-[#555]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={submitted}
                    className={`w-full py-2 rounded text-xs font-medium transition-colors
                      ${submitted ? 'bg-[#16a34a] text-white' : 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'}`}
                  >
                    {submitted ? 'Report Submitted' : 'Submit Report'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
