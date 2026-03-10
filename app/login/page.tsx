'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Role = 'user' | 'admin' | 'superadmin'
type Mode = 'signin' | 'signup'

const roleConfig: Record<Role, { label: string; redirect: string; hint: string }> = {
  user:       { label: 'User',          redirect: '/map',        hint: 'For public event attendees'    },
  admin:      { label: 'Administrator', redirect: '/admin',      hint: 'For ground staff & volunteers' },
  superadmin: { label: 'Super Admin',   redirect: '/superadmin', hint: 'Control room authority only'   },
}

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('user')
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const resetForm = () => { setName(''); setEmail(''); setPassword(''); setError(''); setSuccess('') }

  const handleRoleChange = (r: Role) => {
    setRole(r)
    // Sign-up only available for users; switch back to sign-in for staff roles
    if (r !== 'user') setMode('signin')
    resetForm()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setLoading(false); setError(authError.message); return }

    // For admin/superadmin roles, verify the profile role matches
    if (role !== 'user' && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || (profile as { role: string }).role !== role) {
        await supabase.auth.signOut()
        setLoading(false)
        setError(`This account does not have ${roleConfig[role].label} access.`)
        return
      }
    }

    setLoading(false)
    router.push(roleConfig[role].redirect)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!name.trim() || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    })
    if (authError) { setLoading(false); setError(authError.message); return }

    if (data.user) {
      // Upsert in case the DB trigger already created the row
      await supabase.from('profiles').upsert(
        { id: data.user.id, name: name.trim(), email, role: 'user' } as any,
        { onConflict: 'id' }
      )
    }

    setLoading(false)
    setSuccess('Account created! Check your email to confirm, then sign in.')
    setMode('signin')
    setName('')
    setPassword('')
  }

  const isSignUp = mode === 'signup' && role === 'user'

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
          <h1 className="text-xl font-semibold text-[#111] mb-1">
            {isSignUp ? 'Create account' : 'Sign in'}
          </h1>
          <p className="text-sm text-[#888] mb-8">
            {isSignUp
              ? 'Register as a public attendee to view live crowd data.'
              : 'Choose your role and enter your credentials.'}
          </p>

          {/* Role tabs */}
          <div className="flex border-b border-[#e4e4e4] mb-6">
            {(Object.keys(roleConfig) as Role[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
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

          {success && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-xs rounded px-3 py-2.5 mb-5">
              <CheckCircle size={13} className="mt-0.5 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-[#ddd] rounded px-3 py-2.5 text-sm text-[#111] bg-white
                    placeholder:text-[#bbb] focus:outline-none focus:border-[#999] transition-colors"
                />
              </div>
            )}

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
              {isSignUp && (
                <p className="text-[11px] text-[#bbb] mt-1">Minimum 6 characters.</p>
              )}
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
              {loading
                ? (isSignUp ? 'Creating account…' : 'Signing in…')
                : (isSignUp ? 'Create account' : `Sign in as ${roleConfig[role].label}`)}
            </button>
          </form>

          {/* Toggle sign-in / sign-up — only for user role */}
          {role === 'user' && (
            <p className="text-xs text-center text-[#aaa] mt-5">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); resetForm() }}
                    className="text-[#dc2626] hover:underline font-medium"
                  >Sign in</button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); resetForm() }}
                    className="text-[#dc2626] hover:underline font-medium"
                  >Create one</button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
