'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, MapPin } from 'lucide-react'
import type { AdminTask } from '@/types'
import { timeAgo } from '@/lib/mockData'

interface Props {
  task: AdminTask
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}

const statusConfig = {
  pending:   { label: 'Pending',   color: 'text-[#d97706]', bg: 'bg-yellow-900/20' },
  accepted:  { label: 'Accepted',  color: 'text-[#16a34a]', bg: 'bg-green-900/20'  },
  rejected:  { label: 'Rejected',  color: 'text-[#dc2626]', bg: 'bg-red-900/20'    },
  completed: { label: 'Completed', color: 'text-[#888]',    bg: 'bg-[#1e1e1e]'     },
}

export default function TaskCard({ task, onAccept, onReject }: Props) {
  const [localStatus, setLocalStatus] = useState(task.status)
  const sc = statusConfig[localStatus]

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-medium ${sc.color} ${sc.bg}`}>
              {sc.label}
            </span>
            <span className="flex items-center gap-1 text-[#555] text-[11px]">
              <MapPin size={10} />
              {task.zone_name}
            </span>
          </div>
          <p className="text-[#ccc] text-sm mt-2 leading-relaxed">{task.instruction}</p>
          <p className="flex items-center gap-1 text-[#444] text-[11px] mt-2">
            <Clock size={10} />
            {timeAgo(task.created_at)} · from Superadmin
          </p>
        </div>
      </div>

      {localStatus === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-[#222]">
          <button
            onClick={() => { setLocalStatus('accepted'); onAccept?.(task.id) }}
            className="flex items-center gap-1.5 text-xs bg-[#16a34a] text-white px-3 py-1.5 rounded hover:bg-[#15803d] transition-colors font-medium"
          >
            <CheckCircle size={12} />
            Accept
          </button>
          <button
            onClick={() => { setLocalStatus('rejected'); onReject?.(task.id) }}
            className="flex items-center gap-1.5 text-xs bg-[#1a1a1a] text-[#dc2626] border border-[#dc2626]/30 px-3 py-1.5 rounded hover:bg-[#dc2626]/10 transition-colors font-medium"
          >
            <XCircle size={12} />
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
