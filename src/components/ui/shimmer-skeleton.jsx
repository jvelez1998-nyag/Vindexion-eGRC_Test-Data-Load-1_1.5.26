import { cn } from "@/lib/utils";

export function ShimmerCard({ className }) {
  return (
    <div className={cn("rounded-xl border border-[#2a3548] bg-[#1a2332] overflow-hidden", className)}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-700/30 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-700/30 rounded w-full animate-pulse" />
          <div className="h-3 bg-slate-700/30 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerTable({ rows = 5 }) {
  return (
    <div className="rounded-xl border border-[#2a3548] bg-[#1a2332] overflow-hidden">
      <div className="border-b border-[#2a3548] p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-slate-700/50 rounded w-24 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[#2a3548]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-3 bg-slate-700/30 rounded w-24 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShimmerChart({ height = "h-64" }) {
  return (
    <div className={cn("rounded-xl border border-[#2a3548] bg-[#1a2332] overflow-hidden", height)}>
      <div className="p-4 space-y-3 h-full">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-700/50 rounded w-32 animate-pulse" />
          <div className="h-4 bg-slate-700/50 rounded w-20 animate-pulse" />
        </div>
        <div className="flex-1 flex items-end gap-2 h-48">
          {[60, 80, 45, 90, 70, 55, 85, 65].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-700/30 rounded-t animate-pulse"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShimmerStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-[#2a3548] bg-[#1a2332] p-4">
          <div className="h-3 bg-slate-700/30 rounded w-20 mb-2 animate-pulse" />
          <div className="h-8 bg-slate-700/50 rounded w-16 mb-1 animate-pulse" />
          <div className="h-2 bg-slate-700/30 rounded w-12 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ShimmerList({ items = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[#2a3548] bg-[#1a2332] p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-700/50 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-700/50 rounded w-2/3 animate-pulse" />
              <div className="h-2 bg-slate-700/30 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerHeatmap() {
  return (
    <div className="rounded-xl border border-[#2a3548] bg-[#1a2332] p-4">
      <div className="h-4 bg-slate-700/50 rounded w-32 mb-4 animate-pulse" />
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-700/30 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}