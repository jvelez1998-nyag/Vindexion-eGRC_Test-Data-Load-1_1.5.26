// "Console" styled panel primitives — glossy bordered panels with header
// bars, inset content, and glow accents, inspired by an ops-dashboard
// reference. Scoped to the Audit Suite for now.

export function GlossPanel({ title, icon: Icon, subtitle, action, glow = false, children, className = '' }) {
  return (
    <div
      className={`relative rounded-xl border border-[#333f56] bg-gradient-to-b from-[#1b2333] to-[#131a27] shadow-[0_4px_20px_rgba(0,0,0,0.45)] overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {glow && (
        <>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-amber-400/70 shadow-[0_0_10px_3px_rgba(251,191,36,0.45)]" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-amber-400/70 shadow-[0_0_10px_3px_rgba(251,191,36,0.45)]" />
        </>
      )}
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#2a3548] bg-white/[0.02]">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(56,130,246,0.5)] shrink-0">
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">{title}</h3>
              {subtitle && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function GlossStat({ label, value, icon: Icon, trend, accent = 'sky' }) {
  const accents = {
    sky: 'from-sky-500 to-indigo-600 shadow-[0_0_10px_rgba(56,130,246,0.5)]',
    red: 'from-red-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.45)]',
    emerald: 'from-emerald-500 to-teal-600 shadow-[0_0_10px_rgba(16,185,129,0.45)]',
    amber: 'from-amber-500 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.45)]',
  };
  return (
    <div className="relative rounded-xl border border-[#333f56] bg-gradient-to-b from-[#1b2333] to-[#131a27] shadow-[0_4px_20px_rgba(0,0,0,0.45)] overflow-hidden p-4">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${accents[accent]} flex items-center justify-center shrink-0`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        {trend && <span className="text-[10px] font-medium text-slate-500">{trend}</span>}
      </div>
    </div>
  );
}

export function StatusRibbon({ title, icon: Icon, items }) {
  return (
    <div className="relative rounded-xl border border-[#333f56] bg-gradient-to-b from-[#1b2333] to-[#131a27] px-6 py-4 mb-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(56,130,246,0.55)] shrink-0">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pl-11 text-[10px] uppercase tracking-wider text-slate-400">
        {items.map((item, i) => (
          <span key={item.label} className="flex items-center gap-3">
            {i > 0 && <span className="text-slate-700">|</span>}
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shadow-[0_0_6px_1px_currentColor]`} />
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SegmentedTabs({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-[#2a3548] mb-6 overflow-x-auto scrollbar-thin">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors ${
            value === opt
              ? 'text-white border-sky-500'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
