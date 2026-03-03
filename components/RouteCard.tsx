import { Clock, Footprints, Users, ArrowRight } from 'lucide-react'
import type { Route } from '@/types'

interface Props { route: Route; recommended?: boolean }

export default function RouteCard({ route, recommended }: Props) {
  const safeColor = route.safe ? 'text-[#16a34a]' : 'text-[#dc2626]'
  const safeBg = route.safe ? 'bg-green-50 border-[#bbf7d0]' : 'bg-red-50 border-[#fecaca]'
  const safeLabel = route.safe ? 'Safe' : 'Risky'

  return (
    <div className={`border rounded-lg p-4 relative ${recommended ? 'border-[#16a34a]' : 'border-[#e4e4e4]'} bg-white`}>
      {recommended && (
        <span className="absolute -top-px left-4 text-[9px] uppercase tracking-widest bg-[#16a34a] text-white px-2 py-0.5 rounded-b font-medium">
          Recommended
        </span>
      )}
      <div className="flex items-start justify-between gap-3 mt-1">
        <div>
          <p className="font-medium text-sm text-[#111]">{route.name}</p>
          <p className="text-xs text-[#888] mt-0.5 flex items-center gap-1">
            {route.from_zone}
            <ArrowRight size={10} />
            {route.to_zone}
          </p>
        </div>
        <span className={`text-[10px] font-medium uppercase tracking-wide border rounded px-2 py-1 ${safeBg} ${safeColor}`}>
          {safeLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-[#555]">
          <Clock size={12} className="text-[#888]" />
          {route.time_minutes} min
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#555]">
          <Footprints size={12} className="text-[#888]" />
          {route.distance_km} km
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#555]">
          <Users size={12} className="text-[#888]" />
          Crowd {route.crowd_score}%
        </div>
      </div>

      {/* Crowd bar */}
      <div className="mt-3 h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${route.crowd_score >= 70 ? 'bg-[#dc2626]' : route.crowd_score >= 50 ? 'bg-[#d97706]' : 'bg-[#16a34a]'}`}
          style={{ width: `${route.crowd_score}%` }}
        />
      </div>
    </div>
  )
}
