interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: string   // e.g. 'text-[#dc2626]'
  dark?: boolean
}

export default function StatCard({ label, value, sub, accent, dark }: Props) {
  const bg = dark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-[#e4e4e4]'
  const labelClass = dark ? 'text-[#555]' : 'text-[#888]'
  const subClass = dark ? 'text-[#555]' : 'text-[#aaa]'
  const valueClass = accent ?? (dark ? 'text-white' : 'text-[#111]')

  return (
    <div className={`border rounded-lg p-4 ${bg}`}>
      <p className={`text-[10px] uppercase tracking-widest font-medium ${labelClass}`}>{label}</p>
      <p className={`text-3xl font-semibold mt-1 font-mono tabular-nums ${valueClass}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${subClass}`}>{sub}</p>}
    </div>
  )
}
