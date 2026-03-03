import type { ZoneStatus } from '@/types'

interface Props {
  status: ZoneStatus
  size?: 'sm' | 'md'
}

const config: Record<ZoneStatus, { label: string; bg: string; dot: string; text: string }> = {
  green:  { label: 'Safe',     bg: 'bg-green-50',   dot: 'bg-[#16a34a]', text: 'text-[#15803d]' },
  yellow: { label: 'Moderate', bg: 'bg-yellow-50',  dot: 'bg-[#d97706]', text: 'text-[#b45309]' },
  red:    { label: 'Danger',   bg: 'bg-red-50',     dot: 'bg-[#dc2626]', text: 'text-[#b91c1c]' },
}

export default function ZoneBadge({ status, size = 'md' }: Props) {
  const c = config[status]
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded ${c.bg} ${c.text} ${textSize} ${padding} font-medium uppercase tracking-wider`}>
      <span className={`${dotSize} rounded-full ${c.dot} shrink-0`} />
      {c.label}
    </span>
  )
}
