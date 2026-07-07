import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  Shield,
  Activity,
  Building2,
  ClipboardCheck,
  Menu,
  X,
  Bell,
  User,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', icon: LayoutDashboard, path: '/' }],
  },
  {
    label: 'Risk & Compliance',
    items: [
      { name: 'Risk Register', icon: AlertTriangle, path: '/risks' },
      { name: 'Compliance Frameworks', icon: ShieldCheck, path: '/compliance' },
    ],
  },
  {
    label: 'Controls & Assurance',
    items: [
      { name: 'Controls Library', icon: Shield, path: '/controls' },
      { name: 'Incidents', icon: Activity, path: '/incidents' },
    ],
  },
  {
    label: 'Audit & Assurance',
    items: [{ name: 'Audit Suite', icon: ClipboardCheck, path: '/audits' }],
  },
  {
    label: 'Third Parties',
    items: [{ name: 'Vendor Risk', icon: Building2, path: '/vendors' }],
  },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1623]">
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#151d2e] border-b border-[#2a3548] z-50 flex items-center justify-between px-4 lg:pl-64">
        <div className="lg:hidden flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-400 hover:text-white h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#1a2332]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm truncate">Vindexion eGRC</span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="text-xs text-slate-500">Lite UI Prototype</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-white h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#1a2332] relative">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#151d2e] border-r border-[#2a3548] z-40 transform transition-transform duration-200 ease-in-out flex flex-col lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-[#2a3548] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
              Vindexion eGRC
            </h1>
            <p className="text-[9px] text-indigo-400/60 uppercase tracking-widest font-semibold">
              Enterprise Platform
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-[#1a2332] hover:text-white border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`p-1.5 rounded-md transition-colors ${
                          isActive ? 'bg-indigo-500/20' : 'bg-[#0f1623] group-hover:bg-[#1a2332]'
                        }`}
                      >
                        <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : ''}`} />
                      </div>
                      <span className="flex-1">{item.name}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a3548]">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Lite prototype &middot; mock data &middot; v0.1
          </p>
        </div>
      </aside>

      <main className="lg:ml-64 pt-14">
        <div className="min-h-[calc(100vh-56px)] p-4 sm:p-6 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
