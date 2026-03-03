import type { AdminProfile } from '@/types'
import { getPerformanceScore } from '@/lib/mockData'

interface Props { admins: AdminProfile[] }

export default function PerformanceTable({ admins }: Props) {
  const sorted = [...admins].sort((a, b) => getPerformanceScore(b) - getPerformanceScore(a))

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#222]">
        <h3 className="text-white text-sm font-semibold">Admin Performance</h3>
        <p className="text-[#555] text-xs mt-0.5">Ranked by performance score</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">#</th>
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">Name</th>
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">Zone</th>
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">Done</th>
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">Resp.</th>
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">Score</th>
              <th className="text-left px-4 py-2.5 text-[#444] font-medium uppercase tracking-wider text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const score = getPerformanceScore(a)
              const scoreColor = score >= 80 ? 'text-[#16a34a]' : score >= 50 ? 'text-[#d97706]' : 'text-[#dc2626]'
              return (
                <tr key={a.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3 text-[#444] font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-[#ccc] font-medium">{a.name}</p>
                    <p className="text-[#444] text-[10px]">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[#666]">{a.zone_name ?? '—'}</td>
                  <td className="px-4 py-3 text-[#888] font-mono">
                    {a.tasks_completed}/{a.tasks_assigned}
                  </td>
                  <td className="px-4 py-3 text-[#888] font-mono">{a.avg_response_seconds}s</td>
                  <td className={`px-4 py-3 font-mono font-semibold ${scoreColor}`}>{score}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      a.online ? 'bg-green-900/30 text-[#16a34a]' : 'bg-[#1e1e1e] text-[#444]'
                    }`}>
                      {a.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
