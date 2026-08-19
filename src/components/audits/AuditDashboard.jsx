import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle2, Activity, TrendingUp, Plus, Calendar, Brain, Gauge, BarChart3, FileCheck, Shield, Target, AlertCircle } from "lucide-react";
import { format, subDays, subMonths, differenceInDays } from "date-fns";
import { useState } from "react";

export default function AuditDashboard({ audits, findings, onAuditClick, onStartNew }) {
  const [timeRange, setTimeRange] = useState(30);
  
  const totalAudits = audits.length;
  const inProgress = audits.filter(a => a.status === 'in_progress').length;
  const completed = audits.filter(a => a.status === 'completed').length;
  const planned = audits.filter(a => a.status === 'planned').length;
  const followUp = audits.filter(a => a.status === 'follow_up').length;
  const totalFindings = findings.length;
  const criticalFindings = findings.filter(f => f.severity === 'critical').length;
  const highFindings = findings.filter(f => f.severity === 'high').length;
  const openFindings = findings.filter(f => f.status === 'open').length;
  const remediatedFindings = findings.filter(f => f.status === 'remediated' || f.status === 'closed').length;

  // Upcoming audits
  const upcoming = audits.filter(a => {
    if (!a.start_date) return false;
    const startDate = new Date(a.start_date);
    const daysUntil = differenceInDays(startDate, new Date());
    return daysUntil > 0 && daysUntil <= 30;
  }).length;

  // Status distribution
  const statusData = [
    { name: 'Planned', value: audits.filter(a => a.status === 'planned').length, color: '#6366f1' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Under Review', value: audits.filter(a => a.status === 'under_review').length, color: '#8b5cf6' },
    { name: 'Completed', value: completed, color: '#10b981' }
  ];

  // Type distribution
  const typeData = Object.entries(
    audits.reduce((acc, a) => {
      acc[a.audit_type] = (acc[a.audit_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').toUpperCase(), value }));

  // Findings severity distribution
  const findingsData = [
    { name: 'Critical', value: criticalFindings, color: '#ef4444' },
    { name: 'High', value: findings.filter(f => f.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: findings.filter(f => f.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: findings.filter(f => f.severity === 'low').length, color: '#10b981' }
  ];

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const dayAudits = audits.filter(audit => {
        const auditDate = new Date(audit.created_date);
        return format(auditDate, 'MMM d') === dateStr;
      });
      
      const dayFindings = findings.filter(finding => {
        const findingDate = new Date(finding.created_date);
        return format(findingDate, 'MMM d') === dateStr;
      });
      
      const total = dayAudits.length;
      const completed = dayAudits.filter(a => a.status === 'completed').length;
      const findingsCount = dayFindings.length;
      
      data.push({ date: dateStr, total, completed, findings: findingsCount });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Monthly comparison
  const monthlyData = (() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthAudits = audits.filter(audit => {
        const auditDate = new Date(audit.created_date);
        return auditDate >= monthStart && auditDate <= monthEnd;
      });
      
      const monthFindings = findings.filter(finding => {
        const findingDate = new Date(finding.created_date);
        return findingDate >= monthStart && findingDate <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        total: monthAudits.length,
        completed: monthAudits.filter(a => a.status === 'completed').length,
        findings: monthFindings.length
      });
    }
    return data;
  })();

  // Audit maturity radar
  const maturityData = [
    { 
      subject: 'Planning', 
      score: totalAudits > 0 ? (audits.filter(a => a.scope).length / totalAudits) * 100 : 0
    },
    { 
      subject: 'Execution', 
      score: totalAudits > 0 ? (inProgress / totalAudits) * 100 : 0
    },
    { 
      subject: 'Completion', 
      score: totalAudits > 0 ? (completed / totalAudits) * 100 : 0
    },
    { 
      subject: 'Findings Mgmt', 
      score: totalFindings > 0 ? (remediatedFindings / totalFindings) * 100 : 0
    },
    { 
      subject: 'Documentation', 
      score: totalAudits > 0 ? (audits.filter(a => a.report_url).length / totalAudits) * 100 : 0
    }
  ];

  // Recent audits
  const recentAudits = audits
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  // Upcoming audits in next 30 days
  const upcomingAudits = audits
    .filter(a => {
      if (!a.start_date) return false;
      const startDate = new Date(a.start_date);
      const daysUntil = differenceInDays(startDate, new Date());
      return daysUntil > 0 && daysUntil <= 30;
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* AI-Powered Header */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Brain className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Audit Program Intelligence
                  <Badge className="bg-violet-500/20 text-violet-400 text-[10px] border-violet-500/30">AI-POWERED</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time audit analytics and intelligent findings management</p>
              </div>
            </div>
            <Button onClick={onStartNew} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Plan Audit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <ClipboardCheck className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalAudits}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Audits</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{planned}</div>
            </div>
            <div className="text-xs text-slate-400">Planned</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Scheduled</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Activity className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{inProgress}</div>
            </div>
            <div className="text-xs text-slate-400">In Progress</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{completed}</div>
            </div>
            <div className="text-xs text-slate-400">Completed</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Finished</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalFindings}</div>
            </div>
            <div className="text-xs text-slate-400">Findings</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20 hover:border-red-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{criticalFindings}</div>
            </div>
            <div className="text-xs text-slate-400">Critical</div>
            <div className="text-[10px] text-red-400 mt-0.5">High priority</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Clock className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{openFindings}</div>
            </div>
            <div className="text-xs text-slate-400">Open</div>
            <div className="text-[10px] text-orange-400 mt-0.5">Pending</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <FileCheck className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{remediatedFindings}</div>
            </div>
            <div className="text-xs text-slate-400">Remediated</div>
            <div className="text-[10px] text-green-400 mt-0.5">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-violet-400" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[11px]">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Audit Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  cursor={{ fill: '#2a3548' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Findings Severity */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Findings Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={findingsData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {findingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {findingsData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[11px]">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              6-Month Audit Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="auditTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="auditCompletedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#auditTotalGrad)" name="Total" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#auditCompletedGrad)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Audit Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Audit Program Maturity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={maturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Maturity Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <Badge className="bg-violet-500/20 text-violet-400 text-xs">
                Overall: {(maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend with Time Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-400" />
              Audit & Findings Trend
            </CardTitle>
            <Tabs value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
              <TabsList className="h-7 bg-[#151d2e] border border-[#2a3548] p-0.5">
                <TabsTrigger value="30" className="h-6 text-[10px] px-2">30d</TabsTrigger>
                <TabsTrigger value="60" className="h-6 text-[10px] px-2">60d</TabsTrigger>
                <TabsTrigger value="90" className="h-6 text-[10px] px-2">90d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="auditTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="All Audits" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} dot={false} name="Completed" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="findings" stroke="#ef4444" strokeWidth={2} dot={false} name="Findings" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              Recent Audit Activity
            </CardTitle>
            <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
              Last {recentAudits.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAudits.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No audits yet</p>
                <p className="text-xs mt-1">Start your first audit</p>
              </div>
            ) : (
              recentAudits.map(audit => {
                const statusColor = 
                  audit.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  audit.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  audit.status === 'follow_up' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
                
                return (
                  <div 
                    key={audit.id}
                    onClick={() => onAuditClick?.(audit)}
                    className="group p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#1a2332] border border-[#2a3548] hover:border-violet-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-violet-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
                          {audit.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
                            {audit.type?.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-[10px] text-slate-500">
                            {format(new Date(audit.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 ${statusColor}`}>
                        {audit.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {audit.auditor && (
                      <span className="text-[10px] text-slate-500">Auditor: {audit.auditor}</span>
                    )}
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