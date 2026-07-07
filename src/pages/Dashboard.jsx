import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  FileWarning,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, StatCard, PageHeader } from '@/components/ui';
import {
  kpis,
  riskTrend,
  complianceTrend,
  riskHeatmap,
  recentActivity,
} from '@/data/mockData';

const heatColors = [
  'bg-emerald-500/20 text-emerald-300',
  'bg-emerald-500/30 text-emerald-200',
  'bg-amber-500/30 text-amber-200',
  'bg-orange-500/40 text-orange-200',
  'bg-red-500/50 text-red-100',
];

function heatCellClass(value, max) {
  const ratio = value / max;
  if (ratio === 0) return 'bg-[#0f1623] text-slate-600';
  if (ratio <= 0.2) return heatColors[0];
  if (ratio <= 0.4) return heatColors[1];
  if (ratio <= 0.6) return heatColors[2];
  if (ratio <= 0.8) return heatColors[3];
  return heatColors[4];
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400">{label}</p>
      <p className="text-white font-semibold">{payload[0].value}</p>
    </div>
  );
}

export default function Dashboard() {
  const maxHeat = Math.max(...riskHeatmap.flat());

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Enterprise risk & compliance posture at a glance" />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Risks" value={kpis.totalRisks} icon={AlertTriangle} accent="indigo" trend="+4 this week" trendUp={false} />
        <StatCard label="Critical Risks" value={kpis.criticalRisks} icon={ShieldAlert} accent="red" trend="+2 this week" trendUp={false} />
        <StatCard label="Compliance Score" value={`${kpis.complianceScore}%`} icon={ShieldCheck} accent="emerald" trend="+2pts" trendUp={true} />
        <StatCard label="Open Findings" value={kpis.openFindings} icon={FileWarning} accent="amber" trend="-3 this week" trendUp={true} />
        <StatCard label="Active Incidents" value={kpis.activeIncidents} icon={Activity} accent="red" trend="+1 today" trendUp={false} />
        <StatCard label="Controls Effective" value={`${kpis.controlsEffective}%`} icon={CheckCircle2} accent="emerald" trend="+1pt" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Compliance Trend" subtitle="Overall program score, last 7 months" icon={ShieldCheck} />
          <div className="px-5 pb-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5} dot={{ fill: '#818cf8', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk Score Trend" subtitle="Aggregate residual risk, last 7 months" icon={AlertTriangle} />
          <div className="px-5 pb-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[30, 70]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Risk Heat Map" subtitle="Likelihood vs. impact — number of risks per cell" icon={AlertTriangle} />
          <div className="px-5 pb-5">
            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-[10px] text-slate-500 py-1 pr-1">
                <span>High</span>
                <span>Likelihood</span>
                <span>Low</span>
              </div>
              <div className="flex-1 grid grid-rows-5 gap-1.5">
                {riskHeatmap.map((row, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1.5">
                    {row.map((value, j) => (
                      <div
                        key={j}
                        className={`aspect-square rounded-md flex items-center justify-center text-sm font-semibold ${heatCellClass(value, maxHeat)}`}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-1 mt-2 pl-6">
              {['Low', '', '', '', 'High'].map((label, i) => (
                <div key={i} className="flex-1 text-center text-[10px] text-slate-500">
                  {label}
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-1">Impact</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" icon={Activity} />
          <div className="px-5 pb-5 space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 leading-snug">{item.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
