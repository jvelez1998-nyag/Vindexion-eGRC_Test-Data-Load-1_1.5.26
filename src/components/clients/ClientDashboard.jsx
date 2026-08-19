import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Users, AlertTriangle, Shield, Target, 
  Activity, BarChart3, Brain, CheckCircle2, XCircle
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, AreaChart, Area, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { useState } from "react";

export default function ClientDashboard({ clients, onClientClick, onAddNew }) {
  const [timeRange, setTimeRange] = useState(30);

  // Analytics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const atRiskClients = clients.filter(c => c.status === 'at_risk').length;
  const highRiskClients = clients.filter(c => c.risk_level === 'critical' || c.risk_level === 'high').length;
  const avgRiskScore = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + (c.risk_score || 0), 0) / clients.length)
    : 0;
  const avgComplianceScore = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / clients.length)
    : 0;
  const totalIncidents = clients.reduce((sum, c) => sum + (c.incident_count || 0), 0);
  const totalFindings = clients.reduce((sum, c) => sum + (c.finding_count || 0), 0);
  const criticalIssues = clients.reduce((sum, c) => sum + (c.critical_issues || 0), 0);

  // Client type distribution
  const typeData = Object.entries(
    clients.reduce((acc, c) => {
      acc[c.client_type] = (acc[c.client_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Risk level distribution
  const riskData = [
    { name: 'Low', value: clients.filter(c => c.risk_level === 'low').length, color: '#10b981' },
    { name: 'Medium', value: clients.filter(c => c.risk_level === 'medium').length, color: '#3b82f6' },
    { name: 'High', value: clients.filter(c => c.risk_level === 'high').length, color: '#f59e0b' },
    { name: 'Critical', value: clients.filter(c => c.risk_level === 'critical').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Active', value: activeClients, color: '#10b981' },
    { name: 'At Risk', value: atRiskClients, color: '#f59e0b' },
    { name: 'Prospect', value: clients.filter(c => c.status === 'prospect').length, color: '#3b82f6' },
    { name: 'Inactive', value: clients.filter(c => c.status === 'inactive').length, color: '#6b7280' },
    { name: 'Churned', value: clients.filter(c => c.status === 'churned').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Monthly trend
  const monthlyData = (() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthClients = clients.filter(client => {
        const onboardingDate = client.onboarding_date ? new Date(client.onboarding_date) : null;
        return onboardingDate && onboardingDate >= monthStart && onboardingDate <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        onboarded: monthClients.length,
        avgRisk: monthClients.length > 0 ? Math.round(monthClients.reduce((sum, c) => sum + (c.risk_score || 0), 0) / monthClients.length) : 0,
        avgCompliance: monthClients.length > 0 ? Math.round(monthClients.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / monthClients.length) : 0
      });
    }
    return data;
  })();

  // Maturity radar
  const maturityData = [
    { 
      subject: 'Compliance', 
      score: avgComplianceScore
    },
    { 
      subject: 'Controls', 
      score: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.control_maturity || 0), 0) / clients.length) : 0
    },
    { 
      subject: 'Security', 
      score: clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.security_posture || 0), 0) / clients.length) : 0
    },
    { 
      subject: 'Risk Mgmt', 
      score: 100 - avgRiskScore
    },
    { 
      subject: 'Incidents', 
      score: totalIncidents > 0 ? Math.max(0, 100 - (totalIncidents * 5)) : 100
    }
  ];

  // Top risk clients
  const topRiskClients = [...clients]
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* AI-Powered Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Brain className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Client Portfolio Intelligence
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px] border-cyan-500/30">AI-POWERED</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time client risk analytics and portfolio optimization</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{clients.length}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Clients</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeClients}</div>
            </div>
            <div className="text-xs text-slate-400">Active</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Healthy</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{atRiskClients}</div>
            </div>
            <div className="text-xs text-slate-400">At Risk</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Attention</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <XCircle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{highRiskClients}</div>
            </div>
            <div className="text-xs text-slate-400">High Risk</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Critical</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Target className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgRiskScore}</div>
            </div>
            <div className="text-xs text-slate-400">Avg Risk</div>
            <div className="text-[10px] text-indigo-400 mt-0.5">Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Shield className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgComplianceScore}</div>
            </div>
            <div className="text-xs text-slate-400">Compliance</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Average</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <AlertTriangle className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalIncidents}</div>
            </div>
            <div className="text-xs text-slate-400">Incidents</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20 hover:border-pink-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <BarChart3 className="h-4 w-4 text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-white">{criticalIssues}</div>
            </div>
            <div className="text-xs text-slate-400">Critical</div>
            <div className="text-[10px] text-pink-400 mt-0.5">Issues</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Clients Alert */}
      {topRiskClients.length > 0 && (
        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Clients Requiring Attention
              </CardTitle>
              <Badge className="bg-rose-500/20 text-rose-400 text-[10px]">
                {topRiskClients.length} clients
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRiskClients.map(client => (
                <div 
                  key={client.id} 
                  onClick={() => onClientClick?.(client)}
                  className="p-3 rounded-lg bg-gradient-to-br from-[#0f1623] to-[#151d2e] border border-[#2a3548] hover:border-rose-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{client.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/10 text-slate-400 border-slate-500/20">
                          {client.industry}
                        </Badge>
                        {client.risk_level && (
                          <Badge className={`text-[9px] h-4 px-1.5 ${
                            client.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            client.risk_level === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {client.risk_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-rose-500/20 text-rose-400 text-xs border-rose-500/30">
                      Risk: {client.risk_score || 0}
                    </Badge>
                  </div>
                  <Progress value={client.risk_score || 0} className="h-1.5 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Client Type Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Client Types
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
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Level Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-rose-400" />
              Risk Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {riskData.map((entry, index) => (
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
              {riskData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[11px]">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Status Overview
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
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              6-Month Client Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="avgRisk" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Avg Risk" />
                <Area type="monotone" dataKey="avgCompliance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#complianceGrad)" name="Avg Compliance" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Portfolio Maturity Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={maturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Maturity Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                Overall: {(maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}