'use client'

import { useState } from 'react'
import { AlertTriangle, X, Volume2 } from 'lucide-react'
import type { Alert } from '@/types'
import { timeAgo } from '@/lib/mockData'

const severityConfig = {
  critical: { bg: 'bg-[#dc2626]', text: 'text-white', border: 'border-[#b91c1c]' },
  high:     { bg: 'bg-[#ea580c]', text: 'text-white', border: 'border-[#c2410c]' },
  medium:   { bg: 'bg-[#d97706]', text: 'text-white', border: 'border-[#b45309]' },
  low:      { bg: 'bg-[#2563eb]', text: 'text-white', border: 'border-[#1d4ed8]' },
}

const typeLabel: Record<string, string> = {
  red_zone: 'RED ZONE',
  stampede_risk: 'STAMPEDE RISK',
  evacuation: 'EVACUATION',
  lost_child: 'LOST CHILD',
  medical_emergency: 'MEDICAL EMERGENCY',
}

interface Props {
  alert: Alert
  onDismiss?: (id: string) => void
}

export function AlertBanner({ alert, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const c = severityConfig[alert.severity]

  return (
    <div className={`${c.bg} ${c.border} border-b px-4 py-2.5 flex items-center gap-3`}>
      <Volume2 size={14} className={`${c.text} shrink-0 animate-pulse`} />
      <span className={`${c.text} text-xs font-bold uppercase tracking-widest shrink-0`}>
        {typeLabel[alert.type] ?? alert.type}
      </span>
      <span className={`${c.text} text-xs flex-1`}>{alert.message}</span>
      <span className={`${c.text} text-[10px] opacity-70 shrink-0`}>{timeAgo(alert.created_at)}</span>
      {onDismiss && (
        <button
          onClick={() => { setDismissed(true); onDismiss(alert.id) }}
          className={`${c.text} opacity-60 hover:opacity-100 transition-opacity ml-1 shrink-0`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

interface AlertItemProps {
  alert: Alert
  dark?: boolean
}

export function AlertItem({ alert, dark }: AlertItemProps) {
  const borderColor = {
    critical: 'border-l-[#dc2626]',
    high: 'border-l-[#ea580c]',
    medium: 'border-l-[#d97706]',
    low: 'border-l-[#2563eb]',
  }[alert.severity]

  const bgClass = dark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-white border-[#e4e4e4]'
  const textClass = dark ? 'text-[#ccc]' : 'text-[#333]'
  const mutedClass = dark ? 'text-[#666]' : 'text-[#888]'

  return (
    <div className={`flex items-start gap-3 border ${bgClass} border-l-2 ${borderColor} rounded p-3`}>
      <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${alert.severity === 'critical' ? 'text-[#dc2626]' : 'text-[#d97706]'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-white' : 'text-[#111]'}`}>
            {typeLabel[alert.type] ?? alert.type}
          </span>
          <span className={`text-[10px] shrink-0 ${mutedClass}`}>{timeAgo(alert.created_at)}</span>
        </div>
        <p className={`text-xs mt-0.5 ${textClass}`}>{alert.message}</p>
        <p className={`text-[10px] mt-1 ${mutedClass}`}>{alert.zone_name}</p>
      </div>
    </div>
  )
}
