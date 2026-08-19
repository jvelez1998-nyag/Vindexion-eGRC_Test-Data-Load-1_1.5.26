import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Shield, CheckCircle2, Clock, Target, Activity, AlertCircle, Brain, Plus, Gauge, BarChart3, FileCheck, Zap } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { format, subDays, subMonths } from "date-fns";
import { useState } from "react";
import InteractiveRiskCharts from "./InteractiveRiskCharts";

export default function RiskManagementDashboard({ risks, controls, onStartNew, onViewRisk }) {
  controls = controls || [];
  const [timeRange, setTimeRange] = useState(30);
  
  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => (r.likelihood || 0) >= 4 && (r.impact || 0) >= 4).length;
  const highRisks = risks.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 15 && ((r.likelihood || 0) * (r.impact || 0)) < 20).length;
  const mediumRisks = risks.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 6 && ((r.likelihood || 0) * (r.impact || 0)) < 15).length;
  const mitigatedRisks = risks.filter(r => r.status === 'mitigating' || r.status === 'closed').length;
  const openRisks = risks.filter(r => r.status === 'identified' || r.status === 'assessing').length;
  const avgRiskScore = risks.length > 0 ? Math.round(risks.reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / risks.length) : 0;
  const withMitigationPlan = risks.filter(r => r.mitigation_plan).length;
  const exceedsAppetite = risks.filter(r => r.risk_appetite === 'exceeds').length;
  const avgLikelihood = risks.length > 0 ? (risks.reduce((sum, r) => sum + (r.likelihood || 0), 0) / risks.length).toFixed(1) : 0;
  const avgImpact = risks.length > 0 ? (risks.reduce((sum, r) => sum + (r.impact || 0), 0) / risks.length).toFixed(1) : 0;

  const severityData = [
    { name: 'Critical', value: criticalRisks, color: '#ef4444' },
    { name: 'High', value: highRisks, color: '#f59e0b' },
    { name: 'Medium', value: risks.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 6 && ((r.likelihood || 0) * (r.impact || 0)) < 15).length, color: '#eab308' },
    { name: 'Low', value: risks.filter(r => ((r.likelihood || 0) * (r.impact || 0)) < 6).length, color: '#10b981' }
  ].filter(d => d.value > 0);

  const categoryData = Object.entries(
    risks.reduce((acc, r) => {
      const cat = r.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })).slice(0, 8);

  const statusData = [
    { name: 'Open', value: risks.filter(r => r.status === 'open' || r.status === 'identified').length, color: '#ef4444' },
    { name: 'Assessing', value: risks.filter(r => r.status === 'assessing').length, color: '#f59e0b' },
    { name: 'In Progress', value: risks.filter(r => r.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Mitigating', value: risks.filter(r => r.status === 'mitigating').length, color: '#8b5cf6' },
    { name: 'Monitoring', value: risks.filter(r => r.status === 'monitoring').length, color: '#10b981' },
    { name: 'Accepted', value: risks.filter(r => r.status === 'accepted').length, color: '#0ea5e9' },
    { name: 'Closed', value: risks.filter(r => r.status === 'closed').length, color: '#64748b' }
  ].filter(d => d.value > 0);

  const topRisks = risks
    .map(r => ({ ...r, score: (r.likelihood || 0) * (r.impact || 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const dayRisks = risks.filter(r => {
        const riskDate = new Date(r.created_date);
        return format(riskDate, 'MMM d') === dateStr;
      });
      
      const total = dayRisks.length;
      const critical = dayRisks.filter(r => (r.likelihood || 0) >= 4 && (r.impact || 0) >= 4).length;
      const high = dayRisks.filter(r => ((r.likelihood || 0) * (r.impact || 0)) >= 15 && ((r.likelihood || 0) * (r.impact || 0)) < 20).length;
      
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
      
      const monthRisks = risks.filter(r => {
        const riskDate = new Date(r.created_date);
        return riskDate >= monthStart && riskDate <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        total: monthRisks.length,
        critical: monthRisks.filter(r => (r.likelihood || 0) >= 4 && (r.impact || 0) >= 4).length,
        mitigated: monthRisks.filter(r => r.status === 'mitigating' || r.status === 'closed').length
      });
    }
    return data;
  })();

  // Risk management maturity radar
  const maturityData = [
    { 
      subject: 'Identification', 
      score: totalRisks > 0 ? Math.min(100, (totalRisks / 50) * 100) : 0
    },
    { 
      subject: 'Assessment', 
      score: risks.filter(r => r.likelihood && r.impact).length > 0 ? (risks.filter(r => r.likelihood && r.impact).length / totalRisks) * 100 : 0
    },
    { 
      subject: 'Mitigation', 
      score: totalRisks > 0 ? (withMitigationPlan / totalRisks) * 100 : 0
    },
    { 
      subject: 'Monitoring', 
      score: risks.filter(r => r.status === 'monitoring').length > 0 ? (risks.filter(r => r.status === 'monitoring').length / totalRisks) * 100 : 0
    },
    { 
      subject: 'Controls', 
      score: risks.filter(r => r.linked_controls && r.linked_controls.length > 0).length > 0 ? (risks.filter(r => r.linked_controls && r.linked_controls.length > 0).length / totalRisks) * 100 : 0
    }
  ];

  return (
    <div className="space-y-5">
      {/* AI-Powered Header */}
      <Card className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 border-rose-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30">
                <Brain className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Risk Management Intelligence
                  <Badge className="bg-rose-500/20 text-rose-400 text-[10px] border-rose-500/30">AI-POWERED</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time risk analytics and predictive threat intelligence</p>
              </div>
            </div>
            <Button onClick={onStartNew} className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 shadow-lg shadow-rose-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Identify Risk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalRisks}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Risks</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Zap className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{criticalRisks}</div>
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
              <div className="text-2xl font-bold text-white">{highRisks}</div>
            </div>
            <div className="text-xs text-slate-400">High</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Severity</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Activity className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{mediumRisks}</div>
            </div>
            <div className="text-xs text-slate-400">Medium</div>
            <div className="text-[10px] text-yellow-400 mt-0.5">Level</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{mitigatedRisks}</div>
            </div>
            <div className="text-xs text-slate-400">Mitigated</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Controlled</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgRiskScore}</div>
            </div>
            <div className="text-xs text-slate-400">Avg Score</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Out of 25</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Shield className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{withMitigationPlan}</div>
            </div>
            <div className="text-xs text-slate-400">Planned</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Mitigation</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20 hover:border-pink-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <AlertCircle className="h-4 w-4 text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-white">{exceedsAppetite}</div>
            </div>
            <div className="text-xs text-slate-400">Exceeds</div>
            <div className="text-[10px] text-pink-400 mt-0.5">Appetite</div>
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

        {/* Status Overview */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
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

        {/* Top Categories */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData.slice(0, 5)} layout="vertical">
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
                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
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
              6-Month Risk Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="riskTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="riskMitigatedGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#riskTotalGrad)" name="Total" />
                <Area type="monotone" dataKey="mitigated" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#riskMitigatedGrad)" name="Mitigated" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Management Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Risk Management Maturity
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
              Risk Trend Analysis
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
                <linearGradient id="riskTrendGradient" x1="0" y1="0" x2="0" y2="1">
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
              <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2.5} dot={false} name="All Risks" />
              <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2.5} dot={false} name="Critical" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} dot={false} name="High" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Interactive Advanced Charts */}
      <InteractiveRiskCharts risks={risks} controls={controls} />

      {/* Top Critical Risks */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              Top Critical Risks
            </CardTitle>
            <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
              Top {topRisks.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topRisks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No critical risks</p>
                <p className="text-xs mt-1">Portfolio is well-managed</p>
              </div>
            ) : (
              topRisks.map(risk => {
                const scoreColor = risk.score >= 20 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                                   risk.score >= 15 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                                   risk.score >= 6 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                                   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                
                return (
                  <div
                    key={risk.id}
                    onClick={() => onViewRisk?.(risk)}
                    className="group p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#1a2332] border border-[#2a3548] hover:border-rose-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-rose-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-rose-400 transition-colors">
                          {risk.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-[9px] h-4 px-1.5 bg-slate-500/10 text-slate-400 border-slate-500/20 capitalize">
                            {risk.category || 'uncategorized'}
                          </Badge>
                          <span className="text-[10px] text-slate-500">
                            L:{risk.likelihood || 0} × I:{risk.impact || 0}
                          </span>
                        </div>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 ${scoreColor} font-bold`}>
                        {risk.score}
                      </Badge>
                    </div>
                    {risk.status && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                        {risk.status.replace(/_/g, ' ')}
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