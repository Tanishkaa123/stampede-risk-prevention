'use client'

import { useState } from 'react'
import { Send, Mic, Video, Users, MapPin, CheckCircle } from 'lucide-react'

type Tab = 'text' | 'audio' | 'video'

interface BroadcastPanelProps {
  onSent?: (type: string, content: string, target: string) => void
}

export default function BroadcastPanel({ onSent }: BroadcastPanelProps = {}) {
  const [tab, setTab] = useState<Tab>('text')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!message.trim()) return
    const targetLabel = target === 'all' ? 'All Visitors' : target === 'zone-red' ? 'Red Zones' : 'Administrators'
    onSent?.(tab, message.trim(), targetLabel)
    setSent(true)
    setTimeout(() => { setSent(false); setMessage('') }, 2500)
  }

  const tabs: { key: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'text', label: 'Text', icon: Send },
    { key: 'audio', label: 'Audio', icon: Mic },
    { key: 'video', label: 'Video', icon: Video },
  ]

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#222]">
        <h3 className="text-white text-sm font-semibold">Broadcast</h3>
        <p className="text-[#555] text-xs mt-0.5">Send message to users, zones, or admin groups</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs transition-colors border-b-2 -mb-px
              ${tab === key
                ? 'border-[#dc2626] text-white'
                : 'border-transparent text-[#555] hover:text-[#999]'}`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {/* Target */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
            Send To
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { val: 'all', label: 'All Users', icon: Users },
              { val: 'zone-red', label: 'Red Zones', icon: MapPin },
              { val: 'admins', label: 'All Admins', icon: Users },
            ].map(({ val, label, icon: Icon }) => (
              <button
                key={val}
                onClick={() => setTarget(val)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors
                  ${target === val
                    ? 'bg-[#dc2626] text-white border-[#dc2626]'
                    : 'text-[#888] border-[#333] hover:border-[#555]'}`}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'text' && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
              Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Type your emergency message..."
              className="w-full bg-[#111] border border-[#333] rounded text-[#ccc] text-sm px-3 py-2 
                placeholder:text-[#444] focus:outline-none focus:border-[#555] resize-none"
            />
          </div>
        )}

        {tab === 'audio' && (
          <div className="border border-[#333] rounded p-4 flex flex-col items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-[#dc2626] flex items-center justify-center hover:bg-[#b91c1c] transition-colors">
              <Mic size={20} color="white" />
            </button>
            <p className="text-[#555] text-xs">Hold to record audio message</p>
          </div>
        )}

        {tab === 'video' && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-1.5 font-medium">
              Video URL / Stream Link
            </label>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="https://stream.example.com/live"
              className="w-full bg-[#111] border border-[#333] rounded text-[#ccc] text-sm px-3 py-2 
                placeholder:text-[#444] focus:outline-none focus:border-[#555]"
            />
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sent}
          className={`flex items-center justify-center gap-2 w-full py-2 rounded text-sm font-medium transition-colors
            ${sent
              ? 'bg-[#16a34a] text-white'
              : 'bg-[#dc2626] text-white hover:bg-[#b91c1c]'}`}
        >
          {sent ? (
            <><CheckCircle size={14} /> Sent</>
          ) : (
            <><Send size={14} /> Broadcast Now</>
          )}
        </button>
      </div>
    </div>
  )
}
