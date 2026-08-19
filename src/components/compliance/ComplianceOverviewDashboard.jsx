import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { FileCheck, CheckCircle2, AlertTriangle, Activity, TrendingUp, Plus, Clock } from "lucide-react";
import { format, subDays } from "date-fns";

export default function ComplianceOverviewDashboard({ compliance, onStartNew }) {
  const totalRequirements = compliance.length;
  const implemented = compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length;
  const inProgress = compliance.filter(c => c.status === 'in_progress').length;
  const complianceRate = compliance.length > 0 ? Math.round((implemented / compliance.length) * 100) : 0;

  // Status distribution
  const statusData = [
    { name: 'Implemented', value: compliance.filter(c => c.status === 'implemented').length, color: '#10b981' },
    { name: 'Verified', value: compliance.filter(c => c.status === 'verified').length, color: '#06b6d4' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: compliance.filter(c => c.status === 'not_started').length, color: '#6b7280' },
    { name: 'Non-Compliant', value: compliance.filter(c => c.status === 'non_compliant').length, color: '#ef4444' }
  ];

  // Framework distribution
  const frameworkData = Object.entries(
    compliance.reduce((acc, c) => {
      acc[c.framework] = (acc[c.framework] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const total = compliance.filter(c => new Date(c.created_date) <= date).length;
      const compliant = compliance.filter(c => {
        const dateCheck = new Date(c.created_date) <= date;
        return dateCheck && (c.status === 'implemented' || c.status === 'verified');
      }).length;
      
      data.push({ date: dateStr, total, compliant });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Recent items
  const recentRequirements = compliance
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Compliance Overview</h2>
          <p className="text-sm text-slate-400">Framework requirements and implementation status</p>
        </div>
        <Button onClick={onStartNew} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <FileCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalRequirements}</div>
            </div>
            <div className="text-sm text-slate-400">Total Requirements</div>
            <div className="text-xs text-emerald-400 mt-1">{implemented} compliant</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white">{complianceRate}%</div>
            </div>
            <div className="text-sm text-slate-400">Compliance Rate</div>
            <div className="text-xs text-cyan-400 mt-1">Implementation status</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white">{inProgress}</div>
            </div>
            <div className="text-sm text-slate-400">In Progress</div>
            <div className="text-xs text-amber-400 mt-1">Active work</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Activity className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white">{frameworkData.length}</div>
            </div>
            <div className="text-sm text-slate-400">Frameworks</div>
            <div className="text-xs text-indigo-400 mt-1">Active frameworks</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Framework Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-400" />
              Requirements by Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={frameworkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            30-Day Compliance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total Requirements" />
              <Line type="monotone" dataKey="compliant" stroke="#10b981" strokeWidth={2} name="Compliant" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Requirements */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Recent Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRequirements.length === 0 ? (
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No requirements yet</p>
              </div>
            ) : (
              recentRequirements.map(req => {
                const statusColor = 
                  req.status === 'implemented' || req.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                  req.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                  req.status === 'non_compliant' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-slate-500/20 text-slate-400';
                
                return (
                  <div 
                    key={req.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-[#3a4558] transition-all"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white mb-1">{req.requirement}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="text-[10px] bg-indigo-500/10 text-indigo-400">
                          {req.framework}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(req.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${statusColor} capitalize text-[10px]`}>
                      {req.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}