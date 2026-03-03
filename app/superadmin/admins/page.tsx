'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import PerformanceTable from '@/components/PerformanceTable'
import { mockAdmins, mockZones } from '@/lib/mockData'
import { AdminProfile } from '@/types'
import { UserCheck, MapPin } from 'lucide-react'

export default function SuperadminAdminsPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>(mockAdmins)
  const [assignTarget, setAssignTarget] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState(mockZones[0].name)
  const [saved, setSaved] = useState<string[]>([])

  function saveAssignment(adminId: string) {
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, zone_name: selectedZone } : a))
    setSaved(prev => [...prev, adminId])
    setAssignTarget(null)
    setTimeout(() => setSaved(prev => prev.filter(id => id !== adminId)), 3000)
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="superadmin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Administrators</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage admins, view performance, and assign zones</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Admins</p>
            <p className="text-3xl font-mono font-semibold text-white">{admins.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Online Now</p>
            <p className="text-3xl font-mono font-semibold text-green-400">{admins.filter(a => a.online).length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Offline</p>
            <p className="text-3xl font-mono font-semibold text-zinc-500">{admins.filter(a => !a.online).length}</p>
          </div>
        </div>

        {/* Zone assignment panel */}
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Assign Zone</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {admins.map(admin => (
              <div key={admin.id} className="bg-zinc-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-semibold text-white">
                    {admin.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{admin.name}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-0.5">
                      <MapPin size={9} className="inline" /> {admin.zone_name ?? '—'}
                    </p>
                  </div>
                </div>
                {assignTarget === admin.id ? (
                  <div className="space-y-2">
                    <select
                      value={selectedZone}
                      onChange={e => setSelectedZone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded px-2 py-1 focus:outline-none"
                    >
                      {mockZones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                    <div className="flex gap-1">
                      <button onClick={() => saveAssignment(admin.id)} className="flex-1 text-xs py-1 bg-white text-black rounded font-medium">Save</button>
                      <button onClick={() => setAssignTarget(null)} className="flex-1 text-xs py-1 bg-zinc-700 text-zinc-300 rounded">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAssignTarget(admin.id)}
                    className="w-full text-xs py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                  >
                    {saved.includes(admin.id) ? '✓ Assigned' : 'Reassign'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance leaderboard */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Performance Leaderboard</h2>
          <PerformanceTable admins={admins} />
        </div>
      </main>
    </div>
  )
}
