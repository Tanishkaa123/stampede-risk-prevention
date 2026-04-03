'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { mockZones, mockAlerts } from '@/lib/mockData'
import { AlertTriangle, Map, ShieldCheck, Route, Bell, Users, Activity, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import ZoneBadge from '@/components/ZoneBadge'
import { supabase } from '@/lib/supabase'
import { useLiveZones } from '@/lib/useLiveZones'
import type { Session } from '@supabase/supabase-js'

type Role = 'user' | 'admin' | 'superadmin'

const roleConfig: Record<Role, { label: string; redirect: string; hint: string }> = {
  user:       { label: 'User',          redirect: '/map',        hint: 'For public event attendees'    },
  admin:      { label: 'Administrator', redirect: '/admin',      hint: 'For ground staff & volunteers' },
  superadmin: { label: 'Super Admin',   redirect: '/superadmin', hint: 'Control room authority only'   },
}

const features = [
  {
    icon: Map,
    title: 'Live Crowd Map',
    desc: 'Real-time zone status across your entire event. Red, Yellow, Green — updated every 30 seconds.',
  },
  {
    icon: Route,
    title: 'Smart Route Guidance',
    desc: 'Routes scored by crowd density, distance and time. Users always see the safest path out.',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    desc: 'Emergency alerts reach every user immediately — no confirmation required. No tap needed.',
  },
  {
    icon: Users,
    title: 'Admin Coordination',
    desc: 'Ground admins receive tasks, report incidents and contact each other in real time.',
  },
  {
    icon: Activity,
    title: 'Performance Metrics',
    desc: 'Every admin is scored: response time, task accuracy, acceptance rate. Full accountability.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    desc: 'JWT auth, role-based access, GPS encryption and automatic data deletion after events.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Event begins',
    desc: 'Users open the website. GPS detects location. Crowd density is calculated per zone.',
  },
  {
    number: '02',
    title: 'System monitors',
    desc: 'Zones turn Red when density exceeds threshold. Alerts are broadcast. Admins are assigned.',
  },
  {
    number: '03',
    title: 'Crowd is managed',
    desc: 'Safe routes are recalculated. Admins act. People are redirected. Risk is prevented.',
  },
]

type Mode = 'signin' | 'signup'

export default function LandingPage() {
  const router = useRouter()
  const { zones: liveZones } = useLiveZones()
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role>('user')
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const resetForm = () => { setName(''); setEmail(''); setPassword(''); setLoginError(''); setSuccess('') }

  const handleRoleChange = (r: Role) => {
    setRole(r)
    if (r !== 'user') setMode('signin')
    resetForm()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(''); setSuccess('')
    if (!email || !password) { setLoginError('Please fill in all fields.'); return }
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setLoading(false); setLoginError(authError.message); return }

    if (role !== 'user' && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      if (!profile || (profile as { role: string }).role !== role) {
        await supabase.auth.signOut()
        setLoading(false)
        setLoginError(`This account does not have ${roleConfig[role].label} access.`)
        return
      }
    }

    setLoading(false)
    router.push(roleConfig[role].redirect)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(''); setSuccess('')
    if (!name.trim() || !email || !password) { setLoginError('Please fill in all fields.'); return }
    if (password.length < 6) { setLoginError('Password must be at least 6 characters.'); return }
    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    })
    if (authError) { setLoading(false); setLoginError(authError.message); return }

    // Profile row is auto-created by database trigger on signup.

    setLoading(false)
    setSuccess('Account created! Check your email to confirm, then sign in.')
    setMode('signin')
    setName('')
    setPassword('')
  }

  const isSignUp = mode === 'signup' && role === 'user'

  const zones = liveZones.length > 0 ? liveZones : mockZones
  const redCount = zones.filter(z => z.status === 'red').length
  const greenCount = zones.filter(z => z.status === 'green').length
  const activeAlerts = mockAlerts.filter(a => !a.resolved).length

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <Navbar />

      {/* Emergency alert strip */}
      {activeAlerts > 0 && (
        <div className="bg-[#dc2626] text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium">
          <AlertTriangle size={13} />
          {activeAlerts} active alert{activeAlerts > 1 ? 's' : ''} right now - Food Street is at critical density
          <Link href="/map" className="underline ml-1 opacity-80 hover:opacity-100">View Map</Link>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: hero text */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-5 h-5 rounded bg-[#dc2626] flex items-center justify-center shrink-0">
                <ShieldCheck size={11} color="white" />
              </span>
              <span className="text-xs uppercase tracking-widest text-[#888] font-medium">
                Stampede Avoidance System
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111] leading-tight">
              Prevent stampedes before<br />
              <span className="text-[#dc2626]">they happen.</span>
            </h1>

            <p className="mt-5 text-base text-[#555] leading-relaxed">
              Real-time crowd monitoring, GPS-based zone mapping and smart route guidance
              for festivals, temples, stadiums and large public events.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/map"
                className="flex items-center gap-2 bg-[#111] text-white text-sm px-5 py-2.5 rounded font-medium hover:bg-[#333] transition-colors">
                <Map size={14} />
                View Live Map
              </Link>
            </div>

            {/* Live status row */}
            <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-[#e4e4e4]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
                <span className="text-sm text-[#555]">
                  <span className="font-mono font-semibold text-[#111]">{redCount}</span> red zone{redCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                <span className="text-sm text-[#555]">
                  <span className="font-mono font-semibold text-[#111]">{greenCount}</span> safe zone{greenCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                <span className="text-sm text-[#555]">
                  <span className="font-mono font-semibold text-[#111]">{activeAlerts}</span> active alert{activeAlerts !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Right: inline login / register form — hidden when already logged in */}
          {session ? (
            <div className="bg-white border border-[#e4e4e4] rounded-xl p-7 shadow-sm flex flex-col items-center justify-center gap-5 text-center">
              <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                <ShieldCheck size={26} className="text-[#16a34a]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#111] mb-1">You&apos;re signed in</p>
                <p className="text-xs text-[#888]">{session.user.email}</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Link href="/map"
                  className="w-full flex items-center justify-center gap-2 bg-[#dc2626] text-white text-sm py-2.5 rounded font-medium hover:bg-[#b91c1c] transition-colors">
                  <Map size={14} />
                  Open Live Map
                </Link>
                <Link href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 bg-white border border-[#e4e4e4] text-[#333] text-sm py-2.5 rounded font-medium hover:border-[#bbb] transition-colors">
                  My Dashboard
                </Link>
              </div>
            </div>
          ) : (
          <div className="bg-white border border-[#e4e4e4] rounded-xl p-7 shadow-sm">
            <h2 className="text-lg font-semibold text-[#111] mb-1">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h2>
            <p className="text-xs text-[#888] mb-6">
              {isSignUp
                ? 'Register to view live crowd data near your location.'
                : 'Choose your role and enter your credentials.'}
            </p>

            {/* Role tabs */}
            <div className="flex border-b border-[#e4e4e4] mb-5">
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
            <p className="text-[11px] text-[#aaa] mb-4 -mt-2">{roleConfig[role].hint}</p>

            {success && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-xs rounded px-3 py-2.5 mb-4">
                <CheckCircle size={13} className="mt-0.5 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
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
                {isSignUp && <p className="text-[11px] text-[#bbb] mt-1">Minimum 6 characters.</p>}
              </div>

              {loginError && (
                <p className="text-xs text-[#dc2626] flex items-center gap-1.5">
                  <AlertTriangle size={11} /> {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#dc2626] text-white text-sm py-2.5 rounded font-medium
                  hover:bg-[#b91c1c] transition-colors disabled:opacity-60"
              >
                {loading
                  ? (isSignUp ? 'Creating account…' : 'Signing in…')
                  : (isSignUp ? 'Create account' : `Sign in as ${roleConfig[role].label}`)}
              </button>
            </form>

            {role === 'user' && (
              <p className="text-xs text-center text-[#aaa] mt-5">
                {isSignUp ? (
                  <>Already have an account?{' '}
                    <button onClick={() => { setMode('signin'); resetForm() }} className="text-[#dc2626] hover:underline font-medium">Sign in</button>
                  </>
                ) : (
                  <>Don&apos;t have an account?{' '}
                    <button onClick={() => { setMode('signup'); resetForm() }} className="text-[#dc2626] hover:underline font-medium">Create one</button>
                  </>
                )}
              </p>
            )}
          </div>
          )}

        </div>
      </section>

      {/* Zone preview strip */}
      <section className="border-y border-[#e4e4e4] bg-white py-5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {mockZones.map(zone => (
              <div key={zone.id}
                className="flex items-center justify-between gap-6 border border-[#e4e4e4] rounded-lg px-4 py-3 min-w-55 shrink-0 bg-[#fafafa]">
                <div>
                  <p className="text-xs font-medium text-[#111]">{zone.name}</p>
                  <p className="text-[10px] text-[#888] mt-0.5 font-mono">{zone.density_percent}% capacity</p>
                </div>
                <ZoneBadge status={zone.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-xs uppercase tracking-widest text-[#888] font-medium mb-10">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map(step => (
            <div key={step.number}>
              <span className="text-4xl font-bold text-[#ebebeb] font-mono">{step.number}</span>
              <h3 className="text-base font-semibold text-[#111] mt-3">{step.title}</h3>
              <p className="text-sm text-[#666] mt-1.5 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-[#e4e4e4] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xs uppercase tracking-widest text-[#888] font-medium mb-10">System Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e4e4e4]">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6">
                <Icon size={16} className="text-[#dc2626] mb-3" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-[#111]">{title}</h3>
                <p className="text-xs text-[#777] mt-1.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alert CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="border border-[#dc2626]/20 bg-red-50 rounded-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold text-[#111]">Emergency alerts — no confirmation needed.</h3>
            <p className="text-sm text-[#666] mt-1 max-w-md">
              When a zone turns critical, every user in that area receives an alert automatically.
              No tapping required. Loud sound. Full screen.
            </p>
          </div>
          <Link href="/map"
            className="bg-[#dc2626] text-white text-sm px-5 py-2.5 rounded font-medium hover:bg-[#b91c1c] transition-colors whitespace-nowrap shrink-0">
            View Zones
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e4] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#dc2626] flex items-center justify-center">
              <AlertTriangle size={10} color="white" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-[#111]">SAS</span>
            <span className="text-xs text-[#aaa]">Stampede Avoidance System</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login?role=user" className="text-xs text-[#888] hover:text-[#111] transition-colors">User Login</Link>
            <Link href="/login?role=admin" className="text-xs text-[#888] hover:text-[#111] transition-colors">Admin Login</Link>
            <Link href="/login?role=superadmin" className="text-xs text-[#888] hover:text-[#111] transition-colors">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
