'use client'

import { useRequireAuth } from '@/lib/useRequireAuth'

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const checking = useRequireAuth('superadmin')

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#dc2626] border-t-transparent animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
