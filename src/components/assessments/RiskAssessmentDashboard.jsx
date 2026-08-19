import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock, Target, Zap, Activity, Brain, Gauge, BarChart3, Users, FileCheck } from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import InteractiveAssessmentCharts from "./InteractiveAssessmentCharts";

export default function RiskAssessmentDashboard({ assessments, onAssessmentClick, onStartNew }) {
  const [timeRange, setTimeRange] = useState(30);
  const [selectedView, setSelectedView] = useState('overview');

  // Calculate metrics
  const totalAssessments = assessments.length;
  const pendingReview = assessments.filter(a => a.lifecycle_status === 'pending_review').length;
  const inProgress = assessments.filter(a => a.lifecycle_status === 'in_progress').length;
  const approved = assessments.filter(a => a.lifecycle_status === 'approved').length;
  const criticalRisks = assessments.filter(a => {
    const score = (a.residual_likelihood || 0) * (a.residual_impact || 0);
    return score >= 16;
  }).length;
  const highRisks = assessments.filter(a => {
    const score = (a.residual_likelihood || 0) * (a.residual_impact || 0);
    return score >= 9 && score < 16;
  }).length;
  const avgControlEffectiveness = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + (a.control_effectiveness || 0), 0) / assessments.length * 10) / 10
    : 0;
  
  // Calculate risk reduction
  const avgInherentRisk = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + ((a.inherent_likelihood || 0) * (a.inherent_impact || 0)), 0) / assessments.length
    : 0;
  const avgResidualRisk = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + ((a.residual_likelihood || 0) * (a.residual_impact || 0)), 0) / assessments.length
    : 0;
  const riskReduction = avgInherentRisk > 0 ? Math.round(((avgInherentRisk - avgResidualRisk) / avgInherentRisk) * 100) : 0;

  // Risk distribution
  const riskLevels = assessments.map(a => {
    const score = (a.residual_likelihood || 0) * (a.residual_impact || 0);
    if (score >= 16) return 'Critical';
    if (score >= 9) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  });

  const distributionData = [
    { name: 'Critical', value: riskLevels.filter(l => l === 'Critical').length, color: '#ef4444' },
    { name: 'High', value: riskLevels.filter(l => l === 'High').length, color: '#f59e0b' },
    { name: 'Medium', value: riskLevels.filter(l => l === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: riskLevels.filter(l => l === 'Low').length, color: '#10b981' }
  ];

  // Type distribution
  const typeData = Object.entries(
    assessments.reduce((acc, a) => {
      acc[a.assessment_type] = (acc[a.assessment_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const assessmentsUpTo = assessments.filter(a => new Date(a.created_date) <= date).length;
      const criticalUpTo = assessments.filter(a => {
        const created = new Date(a.created_date) <= date;
        const score = (a.residual_likelihood || 0) * (a.residual_impact || 0);
        return created && score >= 16;
      }).length;
      
      data.push({ date: dateStr, total: assessmentsUpTo, critical: criticalUpTo });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Recent assessments
  const recentAssessments = assessments
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  // Risk category distribution
  const categoryData = Object.entries(
    assessments.reduce((acc, a) => {
      const cat = a.risk_category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value,
    color: name === 'critical' ? '#ef4444' : name === 'high' ? '#f59e0b' : name === 'operational' ? '#6366f1' : name === 'strategic' ? '#8b5cf6' : name === 'compliance' ? '#10b981' : '#06b6d4'
  }));

  // Lifecycle status data
  const lifecycleData = [
    { name: 'Draft', value: assessments.filter(a => !a.lifecycle_status || a.lifecycle_status === 'draft').length, color: '#64748b' },
    { name: 'Pending', value: pendingReview, color: '#f59e0b' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Approved', value: approved, color: '#10b981' },
    { name: 'Monitoring', value: assessments.filter(a => a.lifecycle_status === 'monitoring').length, color: '#06b6d4' }
  ].filter(d => d.value > 0);

  // Risk maturity radar data
  const maturityData = [
    { subject: 'Identification', score: assessments.length > 0 ? Math.min(100, (totalAssessments / 10) * 100) : 0 },
    { subject: 'Assessment', score: assessments.length > 0 ? (approved / totalAssessments) * 100 : 0 },
    { subject: 'Treatment', score: avgControlEffectiveness * 20 },
    { subject: 'Monitoring', score: assessments.filter(a => a.lifecycle_status === 'monitoring').length > 0 ? (assessments.filter(a => a.lifecycle_status === 'monitoring').length / totalAssessments) * 100 : 0 },
    { subject: 'Reporting', score: assessments.filter(a => a.notes).length > 0 ? (assessments.filter(a => a.notes).length / totalAssessments) * 100 : 0 }
  ];

  // Monthly comparison data
  const monthlyData = (() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthAssessments = assessments.filter(a => {
        const created = new Date(a.created_date);
        return created >= monthStart && created <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        assessments: monthAssessments.length,
        critical: monthAssessments.filter(a => ((a.residual_likelihood || 0) * (a.residual_impact || 0)) >= 16).length,
        approved: monthAssessments.filter(a => a.lifecycle_status === 'approved').length
      });
    }
    return data;
  })();

  return (
    <div className="space-y-5">
      {/* Header with AI Insights Badge */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Brain className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Risk Assessment Intelligence
                  <Badge className="bg-indigo-500/20 text-indigo-400 text-[10px] border-indigo-500/30">AI-POWERED</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time analytics and predictive risk intelligence</p>
              </div>
            </div>
            <Button onClick={onStartNew} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
              <Target className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Shield className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalAssessments}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Assessments</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{pendingReview}</div>
            </div>
            <div className="text-xs text-slate-400">Pending</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Review needed</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{criticalRisks}</div>
            </div>
            <div className="text-xs text-slate-400">Critical</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Score ≥ 16</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Zap className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{highRisks}</div>
            </div>
            <div className="text-xs text-slate-400">High Risk</div>
            <div className="text-[10px] text-orange-400 mt-0.5">Score 9-15</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgControlEffectiveness.toFixed(1)}</div>
            </div>
            <div className="text-xs text-slate-400">Control</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Avg rating /5</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <TrendingUp className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{riskReduction}%</div>
            </div>
            <div className="text-xs text-slate-400">Risk</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Reduction</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Level Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-violet-400" />
              Risk Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData.filter(d => d.value > 0)}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {distributionData.map((entry, index) => (
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
              {distributionData.filter(d => d.value > 0).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Category */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData.slice(0, 6)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  cursor={{ fill: '#2a3548' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lifecycle Status */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Lifecycle Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={lifecycleData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#94a3b8' }}
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
              </PieChart>
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
              6-Month Assessment Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="assessments" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAssessments)" name="Total" />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCritical)" name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Maturity Radar */}
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
                <Radar name="Maturity Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                Maturity Level: {maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length > 70 ? 'Advanced' : maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length > 40 ? 'Developing' : 'Initial'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend with Time Range Selection */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Assessment Growth Trend
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
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} dot={false} name="Total Assessments" />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Critical Risk" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Interactive Advanced Charts */}
      <InteractiveAssessmentCharts assessments={assessments} />

      {/* Recent Assessments with Enhanced Details */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Recent Activity
            </CardTitle>
            <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
              Last {recentAssessments.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAssessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No assessments yet</p>
                <p className="text-xs mt-1">Click "New Assessment" to begin</p>
              </div>
            ) : (
              recentAssessments.map(assessment => {
                const score = (assessment.residual_likelihood || 0) * (assessment.residual_impact || 0);
                const level = score >= 16 ? 'Critical' : score >= 9 ? 'High' : score >= 4 ? 'Medium' : 'Low';
                const levelColor = score >= 16 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                                   score >= 9 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                                   score >= 4 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                                   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                const statusColor = assessment.lifecycle_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                   assessment.lifecycle_status === 'pending_review' ? 'bg-amber-500/20 text-amber-400' :
                                   assessment.lifecycle_status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                   'bg-slate-500/20 text-slate-400';
                
                return (
                  <div 
                    key={assessment.id}
                    onClick={() => onAssessmentClick?.(assessment)}
                    className="group p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#1a2332] border border-[#2a3548] hover:border-indigo-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {assessment.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {format(new Date(assessment.created_date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <Badge className="text-[9px] h-4 px-1.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                            {assessment.assessment_type?.toUpperCase()}
                          </Badge>
                          <Badge className={`text-[9px] h-4 px-1.5 ${statusColor}`}>
                            {assessment.lifecycle_status?.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 ${levelColor}`}>
                        {level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Shield className="h-3 w-3" />
                        <span>Score: {score}</span>
                      </div>
                      {assessment.control_effectiveness > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Controls: {assessment.control_effectiveness}/5</span>
                        </div>
                      )}
                    </div>
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