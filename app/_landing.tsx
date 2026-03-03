import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { mockZones, mockAlerts } from '@/lib/mockData'
import { AlertTriangle, Map, ShieldCheck, Route, Bell, Users, Activity, Lock } from 'lucide-react'
import ZoneBadge from '@/components/ZoneBadge'

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

export default function LandingPage() {
  const redCount = mockZones.filter(z => z.status === 'red').length
  const greenCount = mockZones.filter(z => z.status === 'green').length
  const activeAlerts = mockAlerts.filter(a => !a.resolved).length

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <Navbar />

      {/* Emergency alert strip */}
      {activeAlerts > 0 && (
        <div className="bg-[#dc2626] text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium">
          <AlertTriangle size={13} />
          {activeAlerts} active alert{activeAlerts > 1 ? 's' : ''} right now — Main Gate A is at critical density
          <Link href="/map" className="underline ml-1 opacity-80 hover:opacity-100">View Map</Link>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 sm:py-28">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-5 h-5 rounded bg-[#dc2626] flex items-center justify-center shrink-0">
            <ShieldCheck size={11} color="white" />
          </span>
          <span className="text-xs uppercase tracking-widest text-[#888] font-medium">
            Stampede Avoidance System
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111] leading-tight max-w-2xl">
          Prevent stampedes before<br />
          <span className="text-[#dc2626]">they happen.</span>
        </h1>

        <p className="mt-5 text-lg text-[#555] max-w-xl leading-relaxed">
          Real-time crowd monitoring, GPS-based zone mapping and smart route guidance
          for festivals, temples, stadiums and large public events.
        </p>

        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/map"
            className="flex items-center gap-2 bg-[#111] text-white text-sm px-5 py-2.5 rounded font-medium hover:bg-[#333] transition-colors">
            <Map size={14} />
            View Live Map
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 bg-white border border-[#ddd] text-[#333] text-sm px-5 py-2.5 rounded font-medium hover:border-[#bbb] transition-colors">
            Login to Dashboard
          </Link>
        </div>

        {/* Live status row */}
        <div className="mt-10 flex flex-wrap items-center gap-4 pt-8 border-t border-[#e4e4e4]">
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
      </section>

      {/* Zone preview strip */}
      <section className="border-y border-[#e4e4e4] bg-white py-5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {mockZones.map(zone => (
              <div key={zone.id}
                className="flex items-center justify-between gap-6 border border-[#e4e4e4] rounded-lg px-4 py-3 min-w-[220px] shrink-0 bg-[#fafafa]">
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
