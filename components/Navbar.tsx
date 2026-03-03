'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, AlertTriangle, Map, LayoutDashboard, LogIn } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

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
          <Link href="/login"
            className="flex items-center gap-1.5 text-sm bg-[#dc2626] text-white px-3.5 py-1.5 rounded hover:bg-[#b91c1c] transition-colors font-medium">
            <LogIn size={13} />
            Login
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-1 text-[#555]" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-[#e4e4e4] bg-white px-4 py-3 flex flex-col gap-3">
          <Link href="/map" className="text-sm text-[#444] py-1" onClick={() => setOpen(false)}>Live Map</Link>
          <Link href="/dashboard" className="text-sm text-[#444] py-1" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/login"
            className="text-sm bg-[#dc2626] text-white px-3 py-2 rounded text-center font-medium"
            onClick={() => setOpen(false)}>
            Login
          </Link>
        </div>
      )}
    </nav>
  )
}
