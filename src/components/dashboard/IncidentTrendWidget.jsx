import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function IncidentTrendWidget({ incidents }) {
  const safeIncidents = Array.isArray(incidents) ? incidents.filter(i => i) : [];
  
  const openIncidents = safeIncidents.filter(i => !['closed', 'remediated'].includes(i.status)).length;
  const criticalIncidents = safeIncidents.filter(i => i.severity === 'critical').length;
  const highIncidents = safeIncidents.filter(i => i.severity === 'high').length;
  const mediumIncidents = safeIncidents.filter(i => i.severity === 'medium').length;

  const monthlyData = safeIncidents.reduce((acc, i) => {
    const date = new Date(i.reported_date || i.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      count
    }));

  const lastMonth = trendData[trendData.length - 1]?.count || 0;
  const prevMonth = trendData[trendData.length - 2]?.count || 0;
  const trend = lastMonth > prevMonth ? 'up' : lastMonth < prevMonth ? 'down' : 'stable';
  const trendPercent = prevMonth > 0 ? Math.abs(Math.round(((lastMonth - prevMonth) / prevMonth) * 100)) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].payload.month}</p>
          <p className="text-xs text-rose-400">{payload[0].value} incidents</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-rose-400" />
          Incident Analytics
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">Security incident tracking and trends</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <p className="text-xs text-slate-400">Open</p>
              </div>
              <p className="text-2xl font-bold text-white">{openIncidents}</p>
              <p className="text-[10px] text-slate-500 mt-1">Active incidents</p>
            </div>
            <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                <p className="text-xs text-slate-400">Critical</p>
              </div>
              <p className="text-2xl font-bold text-rose-400">{criticalIncidents}</p>
              <p className="text-[10px] text-slate-500 mt-1">Highest severity</p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-[#0f1623] rounded-lg p-3 border border-[#2a3548]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">6-Month Trend</p>
                <p className="text-xs text-slate-400">Monthly incident volume and trajectory</p>
              </div>
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-rose-400" />
                    <span className="text-xs text-rose-400">+{trendPercent}%</span>
                  </>
                ) : trend === 'down' ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">-{trendPercent}%</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">Stable</span>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
                <Tooltip 
                  content={<CustomTooltip />}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#incidentGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">Severity Distribution</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-[#0f1623] border border-rose-500/20 rounded-lg p-2">
                <span className="text-xs text-slate-400">Critical</span>
                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                  {criticalIncidents}
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-[#0f1623] border border-amber-500/20 rounded-lg p-2">
                <span className="text-xs text-slate-400">High</span>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                  {highIncidents}
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-[#0f1623] border border-yellow-500/20 rounded-lg p-2">
                <span className="text-xs text-slate-400">Medium</span>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                  {mediumIncidents}
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-[#0f1623] border border-emerald-500/20 rounded-lg p-2">
                <span className="text-xs text-slate-400">Low</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  {safeIncidents.filter(i => i.severity === 'low').length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}