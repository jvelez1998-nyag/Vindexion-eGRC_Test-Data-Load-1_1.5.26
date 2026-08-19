import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Shield, CheckCircle2, Clock } from "lucide-react";

export default function ComplianceTrendChart({ compliance }) {
  const safeCompliance = Array.isArray(compliance) ? compliance.filter(c => c) : [];
  
  const frameworkData = Object.entries(
    safeCompliance.reduce((acc, c) => {
      const fw = c.framework || 'Other';
      if (!acc[fw]) acc[fw] = { total: 0, compliant: 0 };
      acc[fw].total++;
      if (c.status === 'verified' || c.status === 'implemented') {
        acc[fw].compliant++;
      }
      return acc;
    }, {})
  ).map(([name, data]) => ({
    name,
    rate: data.total ? Math.round((data.compliant / data.total) * 100) : 0,
    total: data.total
  })).sort((a, b) => b.rate - a.rate);

  const statusCounts = {
    verified: safeCompliance.filter(c => c.status === 'verified').length,
    implemented: safeCompliance.filter(c => c.status === 'implemented').length,
    in_progress: safeCompliance.filter(c => c.status === 'in_progress').length,
    not_started: safeCompliance.filter(c => c.status === 'not_started').length
  };

  const overallRate = safeCompliance.length 
    ? Math.round((safeCompliance.filter(c => c.status === 'verified' || c.status === 'implemented').length / safeCompliance.length) * 100)
    : 0;

  const getBarColor = (rate) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 75) return '#3b82f6';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-xs text-emerald-400">{payload[0].value}% compliant</p>
          <p className="text-xs text-slate-400">{payload[0].payload.total} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          Compliance Performance
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">Framework compliance rates and status tracking</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Score Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Overall Compliance</p>
                  <p className="text-2xl font-bold text-white">{overallRate}%</p>
                </div>
              </div>
              <Badge className={
                overallRate >= 90 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                overallRate >= 75 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                overallRate >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }>
                {overallRate >= 75 ? 'On Track' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress 
              value={overallRate} 
              className={`h-2 ${
                overallRate >= 90 ? '[&>div]:bg-emerald-500' :
                overallRate >= 75 ? '[&>div]:bg-blue-500' :
                overallRate >= 60 ? '[&>div]:bg-amber-500' :
                '[&>div]:bg-rose-500'
              }`}
            />
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f1623] border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <p className="text-xs text-slate-400">Verified</p>
              </div>
              <p className="text-xl font-bold text-emerald-400">{statusCounts.verified}</p>
            </div>
            <div className="bg-[#0f1623] border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <p className="text-xs text-slate-400">Implemented</p>
              </div>
              <p className="text-xl font-bold text-blue-400">{statusCounts.implemented}</p>
            </div>
            <div className="bg-[#0f1623] border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <p className="text-xs text-slate-400">In Progress</p>
              </div>
              <p className="text-xl font-bold text-amber-400">{statusCounts.in_progress}</p>
            </div>
            <div className="bg-[#0f1623] border border-slate-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-400">Not Started</p>
              </div>
              <p className="text-xl font-bold text-slate-400">{statusCounts.not_started}</p>
            </div>
          </div>

          {/* Framework Chart */}
          {frameworkData.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-white mb-1">Compliance by Framework</p>
              <p className="text-xs text-slate-400 mb-3">Compliance rate across all regulatory frameworks</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={frameworkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11 }} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11 }} width={80} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {frameworkData.map((entry, index) => {
                      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#ef4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}