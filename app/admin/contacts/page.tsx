'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { mockAdmins } from '@/lib/mockData'
import { AdminProfile } from '@/types'
import { Phone, MessageSquare, MapPin, Radio } from 'lucide-react'

export default function AdminContactsPage() {
  const [admins] = useState<AdminProfile[]>(mockAdmins)
  const [msgTarget, setMsgTarget] = useState<string | null>(null)
  const [msgText, setMsgText] = useState('')
  const [sent, setSent] = useState<string[]>([])

  function sendMessage(id: string) {
    if (!msgText.trim()) return
    setSent(prev => [...prev, id])
    setMsgText('')
    setMsgTarget(null)
    setTimeout(() => setSent(prev => prev.filter(x => x !== id)), 3000)
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="admin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Nearby Contacts</h1>
          <p className="text-sm text-zinc-500 mt-1">Other administrators in the venue — message or call for coordination</p>
        </div>

        {/* Online banner */}
        <div className="flex items-center gap-2 mb-6 text-sm text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
          {admins.filter(a => a.online).length} online out of {admins.length} administrators
        </div>

        {/* Contacts grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {admins.map(admin => (
            <div key={admin.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-semibold text-sm select-none">
                    {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{admin.name}</p>
                    <p className="text-zinc-500 text-xs">{admin.zone_name ?? '—'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  admin.online ? 'bg-green-950 text-green-400 border border-green-900' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {admin.online ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
                <MapPin size={12} />
                <span>{admin.zone_name ?? '—'}</span>
                {admin.gps_lat && (
                  <><span className="ml-2 text-zinc-600">·</span>
                  <Radio size={12} className="ml-1" />
                  <span>~{(Math.abs(admin.gps_lat - 28.614) * 111).toFixed(1)} km</span></>
                )}
              </div>

              {/* Message box (open) */}
              {msgTarget === admin.id ? (
                <div className="mt-2">
                  <textarea
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    placeholder="Type a message…"
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-600 px-3 py-2 resize-none focus:outline-none focus:border-zinc-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => sendMessage(admin.id)}
                      className="flex-1 bg-white text-black text-xs font-medium py-1.5 rounded-md hover:bg-zinc-200 transition-colors"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => { setMsgTarget(null); setMsgText('') }}
                      className="flex-1 bg-zinc-800 text-zinc-400 text-xs py-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMsgTarget(admin.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 transition-colors"
                  >
                    {sent.includes(admin.id)
                      ? <span className="text-green-400">Sent ✓</span>
                      : <><MessageSquare size={13} /> Message</>
                    }
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 transition-colors">
                    <Phone size={13} /> Call
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
