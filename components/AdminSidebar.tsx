'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertTriangle, Map, LayoutDashboard, ClipboardList,
  Users, FileText, Bell, LogOut, Radio
} from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/admin/alerts', label: 'Alerts', icon: Bell },
  { href: '/admin/contacts', label: 'Contacts', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
]

const superNav = [
  { href: '/superadmin', label: 'Overview', icon: LayoutDashboard },
  { href: '/superadmin/map', label: 'Control Map', icon: Map },
  { href: '/superadmin/admins', label: 'Administrators', icon: Users },
  { href: '/superadmin/broadcast', label: 'Broadcast', icon: Radio },
  { href: '/superadmin/alerts', label: 'Alerts', icon: Bell },
  { href: '/superadmin/reports', label: 'Reports', icon: FileText },
]

interface Props {
  role?: 'admin' | 'superadmin'
  userName?: string
  zoneName?: string
}

export default function AdminSidebar({ role = 'admin', userName = 'Admin', zoneName }: Props) {
  const pathname = usePathname()
  const navItems = role === 'superadmin' ? superNav : adminNav

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#111111] border-r border-[#1f1f1f] min-h-screen">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center gap-2 border-b border-[#1f1f1f]">
        <span className="w-6 h-6 rounded bg-[#dc2626] flex items-center justify-center">
          <AlertTriangle size={13} color="white" strokeWidth={2.5} />
        </span>
        <span className="text-white font-semibold text-sm tracking-tight">SAS</span>
        {role === 'superadmin' && (
          <span className="text-[10px] uppercase tracking-widest text-[#666] ml-1">Super</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors
                ${active
                  ? 'bg-[#1f1f1f] text-white'
                  : 'text-[#888] hover:text-[#ccc] hover:bg-[#1a1a1a]'
                }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[#1f1f1f]">
        <div className="px-2 py-2">
          <p className="text-white text-xs font-medium truncate">{userName}</p>
          {zoneName && <p className="text-[#555] text-[11px] truncate mt-0.5">{zoneName}</p>}
          <p className="text-[#444] text-[10px] uppercase tracking-widest mt-0.5">
            {role === 'superadmin' ? 'Super Admin' : 'Administrator'}
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#666] hover:text-[#aaa] transition-colors mt-1"
        >
          <LogOut size={12} />
          Sign out
        </Link>
      </div>
    </aside>
  )
}
