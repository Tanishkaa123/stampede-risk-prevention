'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, AlertTriangle, Map, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e4e4e4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-[#111]">
          <span className="w-6 h-6 rounded bg-[#dc2626] flex items-center justify-center">
            <AlertTriangle size={13} color="white" strokeWidth={2.5} />
          </span>
          <span>SAS</span>
          <span className="hidden sm:inline text-[#888] font-normal text-sm">Stampede Avoidance</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {session ? (
            <>
              <Link href="/map"
                className="flex items-center gap-1.5 text-sm text-[#444] hover:text-[#111] transition-colors">
                <Map size={14} />
                Live Map
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-1.5 text-sm text-[#444] hover:text-[#111] transition-colors">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <span className="flex items-center gap-1.5 text-xs text-[#888] border border-[#e4e4e4] px-2.5 py-1.5 rounded">
                <User size={12} />
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-[#555] border border-[#e4e4e4] px-3.5 py-1.5 rounded hover:border-[#dc2626] hover:text-[#dc2626] transition-colors font-medium">
                <LogOut size={13} />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login"
              className="flex items-center gap-1.5 text-sm bg-[#dc2626] text-white px-3.5 py-1.5 rounded hover:bg-[#b91c1c] transition-colors font-medium">
              <LogIn size={13} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-1 text-[#555]" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-[#e4e4e4] bg-white px-4 py-3 flex flex-col gap-3">
          {session ? (
            <>
              <Link href="/map" className="text-sm text-[#444] py-1" onClick={() => setOpen(false)}>Live Map</Link>
              <Link href="/dashboard" className="text-sm text-[#444] py-1" onClick={() => setOpen(false)}>Dashboard</Link>
              <p className="text-xs text-[#aaa] py-1 truncate">{session.user.email}</p>
              <button
                onClick={() => { setOpen(false); handleLogout() }}
                className="text-sm text-[#dc2626] border border-[#dc2626] px-3 py-2 rounded text-center font-medium">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login"
              className="text-sm bg-[#dc2626] text-white px-3 py-2 rounded text-center font-medium"
              onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
