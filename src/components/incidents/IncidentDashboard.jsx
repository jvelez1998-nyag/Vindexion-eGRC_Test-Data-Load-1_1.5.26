import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { AlertTriangle, Clock, CheckCircle2, Activity, TrendingUp, Plus, Zap, Shield, Target, Gauge, BarChart3, FileCheck, Brain, AlertOctagon } from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { useState } from "react";

export default function IncidentDashboard({ incidents, onIncidentClick, onStartNew }) {
  const [timeRange, setTimeRange] = useState(30);
  
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const highIncidents = incidents.filter(i => i.severity === 'high').length;
  const activeInvestigations = incidents.filter(i => i.status === 'investigating').length;
  const containedIncidents = incidents.filter(i => i.status === 'contained').length;
  const avgResponseTime = (() => {
    const withResponse = incidents.filter(i => i.detected_date && i.reported_date);
    if (withResponse.length === 0) return 0;
    const totalHours = withResponse.reduce((sum, i) => {
      const hours = (new Date(i.reported_date) - new Date(i.detected_date)) / (1000 * 60 * 60);
      return sum + Math.abs(hours);
    }, 0);
    return Math.round(totalHours / withResponse.length);
  })();
  const avgResolutionTime = (() => {
    const resolved = incidents.filter(i => i.resolution_date && i.occurred_date);
    if (resolved.length === 0) return 0;
    const totalDays = resolved.reduce((sum, i) => {
      const days = (new Date(i.resolution_date) - new Date(i.occurred_date)) / (1000 * 60 * 60 * 24);
      return sum + Math.abs(days);
    }, 0);
    return Math.round(totalDays / resolved.length);
  })();
  const regulatoryReportable = incidents.filter(i => i.regulatory_reportable).length;

  // Severity distribution
  const severityData = [
    { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: incidents.filter(i => i.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, color: '#10b981' }
  ];

  // Type distribution
  const typeData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Status distribution
  const statusData = Object.entries(
    incidents.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.replace(/_/g, ' ').toUpperCase(), 
    value 
  }));

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const dayIncidents = incidents.filter(inc => {
        const incDate = new Date(inc.occurred_date || inc.created_date);
        return format(incDate, 'MMM d') === dateStr;
      });
      
      const total = dayIncidents.length;
      const critical = dayIncidents.filter(i => i.severity === 'critical').length;
      const high = dayIncidents.filter(i => i.severity === 'high').length;
      
      data.push({ date: dateStr, total, critical, high });
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
      
      const monthIncidents = incidents.filter(inc => {
        const incDate = new Date(inc.occurred_date || inc.created_date);
        return incDate >= monthStart && incDate <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        total: monthIncidents.length,
        critical: monthIncidents.filter(i => i.severity === 'critical').length,
        resolved: monthIncidents.filter(i => i.status === 'closed' || i.status === 'remediated').length
      });
    }
    return data;
  })();

  // Incident maturity radar
  const maturityData = [
    { 
      subject: 'Detection', 
      score: incidents.filter(i => i.detected_date).length > 0 ? (incidents.filter(i => i.detected_date).length / totalIncidents) * 100 : 0
    },
    { 
      subject: 'Response', 
      score: incidents.filter(i => i.containment_actions).length > 0 ? (incidents.filter(i => i.containment_actions).length / totalIncidents) * 100 : 0
    },
    { 
      subject: 'Resolution', 
      score: incidents.filter(i => i.resolution_date).length > 0 ? (incidents.filter(i => i.resolution_date).length / totalIncidents) * 100 : 0
    },
    { 
      subject: 'Documentation', 
      score: incidents.filter(i => i.impact_assessment || i.root_cause).length > 0 ? (incidents.filter(i => i.impact_assessment || i.root_cause).length / totalIncidents) * 100 : 0
    },
    { 
      subject: 'Prevention', 
      score: incidents.filter(i => i.lessons_learned).length > 0 ? (incidents.filter(i => i.lessons_learned).length / totalIncidents) * 100 : 0
    }
  ];

  // Recent critical incidents
  const recentCritical = incidents
    .filter(i => i.severity === 'critical' || i.severity === 'high')
    .sort((a, b) => new Date(b.incident_date || b.created_date) - new Date(a.incident_date || a.created_date))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* AI-Powered Header */}
      <Card className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-red-500/10 border-rose-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30">
                <Brain className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Incident Management Intelligence
                  <Badge className="bg-rose-500/20 text-rose-400 text-[10px] border-rose-500/30">AI-POWERED</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time incident analytics and predictive response intelligence</p>
              </div>
            </div>
            <Button onClick={onStartNew} className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalIncidents}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Incidents</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{criticalIncidents}</div>
            </div>
            <div className="text-xs text-slate-400">Critical</div>
            <div className="text-[10px] text-orange-400 mt-0.5">Priority</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Target className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{highIncidents}</div>
            </div>
            <div className="text-xs text-slate-400">High</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Severity</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeInvestigations}</div>
            </div>
            <div className="text-xs text-slate-400">Active</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Investigating</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{containedIncidents}</div>
            </div>
            <div className="text-xs text-slate-400">Contained</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Secured</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgResponseTime}h</div>
            </div>
            <div className="text-xs text-slate-400">Response</div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Avg time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <FileCheck className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{regulatoryReportable}</div>
            </div>
            <div className="text-xs text-slate-400">Regulatory</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Reportable</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-rose-400" />
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {severityData.map((entry, index) => (
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
              {severityData.map((item, i) => (
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
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Top Incident Types
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
                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-400" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  cursor={{ fill: '#2a3548' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              6-Month Incident Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#totalGrad)" name="Total" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#resolvedGrad)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Response Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Response Maturity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={maturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Maturity Score" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <Badge className="bg-rose-500/20 text-rose-400 text-xs">
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
              <Activity className="h-4 w-4 text-rose-400" />
              Incident Trend Analysis
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
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
              <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2.5} dot={false} name="All Incidents" />
              <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2.5} dot={false} name="Critical" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} dot={false} name="High" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Critical Incidents */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              Recent High-Priority Incidents
            </CardTitle>
            <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
              Last {recentCritical.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentCritical.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No critical incidents</p>
                <p className="text-xs mt-1">System is secure</p>
              </div>
            ) : (
              recentCritical.map(incident => {
                const severityColor = incident.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                                     'bg-amber-500/20 text-amber-400 border-amber-500/30';
                
                return (
                  <div 
                    key={incident.id}
                    onClick={() => onIncidentClick?.(incident)}
                    className="group p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#1a2332] border border-[#2a3548] hover:border-rose-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-rose-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-rose-400 transition-colors">
                          {incident.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {format(new Date(incident.occurred_date || incident.created_date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/10 text-slate-400 border-slate-500/20">
                            {incident.incident_type?.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 ${severityColor}`}>
                        {incident.severity}
                      </Badge>
                    </div>
                    {incident.status && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                        {incident.status.replace(/_/g, ' ')}
                      </Badge>
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