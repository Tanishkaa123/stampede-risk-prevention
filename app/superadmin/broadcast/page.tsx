'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import BroadcastPanel from '@/components/BroadcastPanel'
import { timeAgo } from '@/lib/mockData'
import { Radio } from 'lucide-react'

interface BroadcastRecord {
  id: string
  type: 'text' | 'audio' | 'video'
  content: string
  target: string
  sentAt: string
}

const seedHistory: BroadcastRecord[] = [
  { id: '1', type: 'text',  content: 'All visitors — please avoid Main Gate A due to high density. Use West Exit as alternate.',  target: 'All Visitors',  sentAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: '2', type: 'text',  content: 'Admins assigned to Central Plaza — increase patrol frequency immediately.',                  target: 'Administrators', sentAt: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: '3', type: 'audio', content: '[Audio broadcast — Zone evacuation protocol initiated]',                                    target: 'All Visitors',  sentAt: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: '4', type: 'text',  content: 'Routine check: all zones nominal except Main Gate A. Monitor crowd movement.',             target: 'Administrators', sentAt: new Date(Date.now() - 3 * 3600000).toISOString() },
]

const typeIcon: Record<string, string> = { text: '💬', audio: '🎙️', video: '📹' }

export default function SuperadminBroadcastPage() {
  const [history, setHistory] = useState<BroadcastRecord[]>(seedHistory)

  function onBroadcastSent(type: string, content: string, target: string) {
    const record: BroadcastRecord = {
      id: Date.now().toString(),
      type: type as 'text' | 'audio' | 'video',
      content,
      target,
      sentAt: new Date().toISOString(),
    }
    setHistory(prev => [record, ...prev])
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      <AdminSidebar role="superadmin" />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Broadcast Center</h1>
          <p className="text-sm text-zinc-500 mt-1">Send messages, audio or video alerts to visitors and administrators</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Send panel */}
          <BroadcastPanel onSent={onBroadcastSent} />

          {/* History */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Radio size={15} className="text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">Broadcast History</h2>
              <span className="ml-auto text-xs text-zinc-600">{history.length} sent</span>
            </div>
            <div className="space-y-3">
              {history.map(b => (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{typeIcon[b.type]}</span>
                    <span className="text-xs text-zinc-400 font-medium capitalize">{b.type}</span>
                    <span className="text-xs text-zinc-600">→ {b.target}</span>
                    <span className="ml-auto text-xs text-zinc-600">{timeAgo(b.sentAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{b.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
