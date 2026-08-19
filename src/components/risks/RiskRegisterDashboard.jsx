import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { AlertTriangle, Shield, TrendingUp, Activity, Target, Clock, Plus } from "lucide-react";
import { format, subDays } from "date-fns";

export default function RiskRegisterDashboard({ risks, onRiskClick, onStartNew }) {
  const totalRisks = risks.length;
  const openRisks = risks.filter(r => r.status !== 'closed').length;
  const criticalRisks = risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length;
  const overdueRisks = risks.filter(r => r.due_date && new Date(r.due_date) < new Date() && r.status !== 'closed').length;

  // Risk level distribution
  const riskLevels = risks.map(r => {
    const score = (r.likelihood || 0) * (r.impact || 0);
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

  // Category distribution
  const categoryData = Object.entries(
    risks.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Status distribution
  const statusData = Object.entries(
    risks.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
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
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const risksUpTo = risks.filter(r => new Date(r.created_date) <= date).length;
      const criticalUpTo = risks.filter(r => {
        const created = new Date(r.created_date) <= date;
        const score = (r.likelihood || 0) * (r.impact || 0);
        return created && score >= 16;
      }).length;
      
      data.push({ date: dateStr, total: risksUpTo, critical: criticalUpTo });
    }
    
    return data;
  };

  const trendData = generateTrendData();

  // Recent high-priority risks
  const recentCritical = risks
    .filter(r => (r.likelihood || 0) * (r.impact || 0) >= 9)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Risk Register Overview</h2>
          <p className="text-sm text-slate-400">Comprehensive risk analytics and monitoring</p>
        </div>
        <Button onClick={onStartNew} className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Register New Risk
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Activity className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalRisks}</div>
            </div>
            <div className="text-sm text-slate-400">Total Risks</div>
            <div className="text-xs text-indigo-400 mt-1">{openRisks} open</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-white">{criticalRisks}</div>
            </div>
            <div className="text-sm text-slate-400">Critical Risks</div>
            <div className="text-xs text-rose-400 mt-1">Score ≥ 16</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white">{overdueRisks}</div>
            </div>
            <div className="text-sm text-slate-400">Overdue</div>
            <div className="text-xs text-amber-400 mt-1">Past due date</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white">{risks.filter(r => r.status === 'mitigating').length}</div>
            </div>
            <div className="text-sm text-slate-400">In Mitigation</div>
            <div className="text-xs text-emerald-400 mt-1">Active treatment</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-400" />
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Risks by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
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
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              30-Day Risk Trend
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
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total Risks" />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={100}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Risks - Enhanced Design */}
      <Card className="bg-gradient-to-br from-rose-500/5 via-[#1a2332] to-amber-500/5 border-rose-500/20">
        <CardHeader className="border-b border-[#2a3548]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                High-Priority Risk Register
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Risks requiring immediate attention</p>
            </div>
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
              {recentCritical.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentCritical.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">All Clear</h3>
              <p className="text-slate-400 text-sm">No high-priority risks at this time</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a3548]">
              {recentCritical.map((risk, index) => {
                const score = (risk.likelihood || 0) * (risk.impact || 0);
                const level = score >= 16 ? 'Critical' : 'High';
                const isCritical = score >= 16;
                
                return (
                  <div 
                    key={risk.id}
                    onClick={() => onRiskClick?.(risk)}
                    className={`group relative p-5 hover:bg-[#1e2a3d] cursor-pointer transition-all ${
                      isCritical ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    {/* Priority Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="flex items-start gap-4 ml-3">
                      {/* Risk Number Badge */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isCritical 
                          ? 'bg-gradient-to-br from-rose-500/20 to-red-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        #{index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Title and Score */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-semibold text-white group-hover:text-rose-400 transition-colors">
                            {risk.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-3">
                            <Badge className={`${
                              isCritical 
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            } font-bold`}>
                              {level}
                            </Badge>
                            <Badge className="bg-[#151d2e] text-white border-[#2a3548] font-bold">
                              {score}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Risk Metrics */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-500">Likelihood:</div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`w-2 h-2 rounded-sm ${
                                    i < (risk.likelihood || 0) 
                                      ? isCritical ? 'bg-rose-500' : 'bg-amber-500' 
                                      : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-slate-500">Impact:</div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`w-2 h-2 rounded-sm ${
                                    i < (risk.impact || 0) 
                                      ? isCritical ? 'bg-rose-500' : 'bg-amber-500' 
                                      : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-400">
                              {format(new Date(risk.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Tags and Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="text-[10px] bg-violet-500/10 text-violet-400 border-violet-500/20 capitalize">
                            {risk.category?.replace(/_/g, ' ')}
                          </Badge>
                          {risk.status && (
                            <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                              {risk.status?.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {risk.owner && (
                            <Badge className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                              Owner: {risk.owner.split('@')[0]}
                            </Badge>
                          )}
                          {risk.due_date && new Date(risk.due_date) < new Date() && risk.status !== 'closed' && (
                            <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        {/* Summary Section */}
                        {(risk.description || risk.mitigation_plan || risk.linked_controls) && (
                          <div className="mt-3 pt-3 border-t border-[#2a3548]">
                            <div className="text-xs text-slate-500 font-medium mb-2">Summary</div>
                            <div className="space-y-2">
                              {risk.description && (
                                <p className="text-xs text-slate-400 line-clamp-2">{risk.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs">
                                {risk.linked_controls && risk.linked_controls.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">{risk.linked_controls.length} controls</span>
                                  </div>
                                )}
                                {risk.mitigation_plan && (
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-blue-400" />
                                    <span className="text-blue-400">Mitigation planned</span>
                                  </div>
                                )}
                                {risk.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-amber-400" />
                                    <span className="text-slate-400">Due {format(new Date(risk.due_date), 'MMM d')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}