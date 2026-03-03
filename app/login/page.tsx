'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'

type Role = 'user' | 'admin' | 'superadmin'

const roleConfig: Record<Role, { label: string; redirect: string; hint: string }> = {
  user:       { label: 'User',        redirect: '/dashboard',  hint: 'For public event attendees'      },
  admin:      { label: 'Administrator', redirect: '/admin',    hint: 'For ground staff & volunteers'   },
  superadmin: { label: 'Super Admin', redirect: '/superadmin', hint: 'Control room authority only'     },
}

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    // Demo: simulate auth delay then redirect based on role
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    router.push(roleConfig[role].redirect)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-[#e4e4e4] bg-white flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-[#dc2626] flex items-center justify-center">
            <AlertTriangle size={12} color="white" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold text-[#111]">SAS</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-[#111] mb-1">Sign in</h1>
          <p className="text-sm text-[#888] mb-8">Choose your role and enter your credentials.</p>

          {/* Role tabs */}
          <div className="flex border-b border-[#e4e4e4] mb-6">
            {(Object.keys(roleConfig) as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 pb-2.5 text-xs font-medium border-b-2 transition-colors -mb-px
                  ${role === r
                    ? 'border-[#dc2626] text-[#111]'
                    : 'border-transparent text-[#888] hover:text-[#555]'}`}
              >
                {roleConfig[r].label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[#aaa] mb-5 -mt-3">{roleConfig[role].hint}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#ddd] rounded px-3 py-2.5 text-sm text-[#111] bg-white 
                  placeholder:text-[#bbb] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#555] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#ddd] rounded px-3 py-2.5 text-sm text-[#111] bg-white 
                    placeholder:text-[#bbb] focus:outline-none focus:border-[#999] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#888]"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#dc2626] flex items-center gap-1.5">
                <AlertTriangle size={11} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc2626] text-white text-sm py-2.5 rounded font-medium 
                hover:bg-[#b91c1c] transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? 'Signing in…' : `Sign in as ${roleConfig[role].label}`}
            </button>
          </form>

          <p className="text-xs text-center text-[#aaa] mt-5">
            <button className="hover:text-[#666] transition-colors">Forgot password?</button>
          </p>

          <div className="mt-8 pt-6 border-t border-[#e4e4e4]">
            <p className="text-[11px] text-[#bbb] text-center">
              Demo credentials: any email + any password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
