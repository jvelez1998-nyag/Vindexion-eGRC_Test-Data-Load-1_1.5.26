import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Shield, CheckCircle2, AlertTriangle, Clock, Activity, TrendingUp, Plus, Brain, Gauge, Target, Zap, BarChart3, FileCheck } from "lucide-react";
import { format, subDays, subMonths } from "date-fns";

export default function ControlDashboard({ controls, controlTests, onControlClick, onStartNew }) {
  const [timeRange, setTimeRange] = useState(30);
  
  const totalControls = controls.length;
  const effectiveControls = controls.filter(c => c.status === 'effective').length;
  const implementedControls = controls.filter(c => c.status === 'implemented').length;
  const ineffectiveControls = controls.filter(c => c.status === 'ineffective').length;
  const testingDue = controls.filter(c => c.next_test_date && new Date(c.next_test_date) <= new Date()).length;
  const notTested = controls.filter(c => !c.last_tested_date).length;
  const avgEffectiveness = controls.length > 0 && controls.filter(c => c.effectiveness).length > 0
    ? (controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.filter(c => c.effectiveness).length).toFixed(1)
    : 0;
  
  // Test failure rate
  const recentTestResults = controlTests?.slice(0, 50) || [];
  const failedTests = recentTestResults.filter(t => t.test_result === 'failed').length;
  const testFailureRate = recentTestResults.length > 0 
    ? Math.round((failedTests / recentTestResults.length) * 100)
    : 0;

  // Status distribution
  const effectivenessData = [
    { name: 'Effective', value: controls.filter(c => c.status === 'effective').length, color: '#10b981' },
    { name: 'Implemented', value: controls.filter(c => c.status === 'implemented').length, color: '#3b82f6' },
    { name: 'Ineffective', value: controls.filter(c => c.status === 'ineffective').length, color: '#ef4444' },
    { name: 'Planned', value: controls.filter(c => c.status === 'planned').length, color: '#94a3b8' },
    { name: 'Retired', value: controls.filter(c => c.status === 'retired').length, color: '#64748b' }
  ].filter(d => d.value > 0);

  // Domain distribution
  const domainData = Object.entries(
    controls.reduce((acc, c) => {
      acc[c.domain] = (acc[c.domain] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Category distribution
  const categoryData = [
    { name: 'Preventive', value: controls.filter(c => c.category === 'preventive').length, color: '#3b82f6' },
    { name: 'Detective', value: controls.filter(c => c.category === 'detective').length, color: '#8b5cf6' },
    { name: 'Corrective', value: controls.filter(c => c.category === 'corrective').length, color: '#f59e0b' },
    { name: 'Directive', value: controls.filter(c => c.category === 'directive').length, color: '#06b6d4' }
  ].filter(d => d.value > 0);

  // Trend data
  const generateTrendData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');
      
      const controlsUpTo = controls.filter(c => new Date(c.created_date) <= date).length;
      const effectiveUpTo = controls.filter(c => {
        const created = new Date(c.created_date) <= date;
        return created && c.status === 'effective';
      }).length;
      
      data.push({ date: dateStr, total: controlsUpTo, effective: effectiveUpTo });
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
      
      const monthControls = controls.filter(c => {
        const created = new Date(c.created_date);
        return created >= monthStart && created <= monthEnd;
      });
      
      data.push({
        month: format(date, 'MMM'),
        controls: monthControls.length,
        effective: monthControls.filter(c => c.status === 'effective').length,
        tested: monthControls.filter(c => c.last_tested_date).length
      });
    }
    return data;
  })();

  // Control maturity radar
  const maturityData = [
    { 
      subject: 'Coverage', 
      score: Math.min(100, (totalControls / 50) * 100)
    },
    { 
      subject: 'Effectiveness', 
      score: totalControls > 0 ? (effectiveControls / totalControls) * 100 : 0
    },
    { 
      subject: 'Testing', 
      score: totalControls > 0 ? ((totalControls - notTested) / totalControls) * 100 : 0
    },
    { 
      subject: 'Documentation', 
      score: controls.filter(c => c.control_procedures).length > 0 ? (controls.filter(c => c.control_procedures).length / totalControls) * 100 : 0
    },
    { 
      subject: 'Compliance', 
      score: controls.filter(c => c.framework_mappings && Object.keys(c.framework_mappings).length > 0).length > 0 
        ? (controls.filter(c => c.framework_mappings && Object.keys(c.framework_mappings).length > 0).length / totalControls) * 100 
        : 0
    }
  ];

  // Recent test results
  const recentTests = controlTests
    ?.sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
    .slice(0, 5) || [];

  return (
    <div className="space-y-5">
      {/* AI-Powered Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Control Framework Intelligence
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time control effectiveness analytics and predictive insights</p>
              </div>
            </div>
            <Button onClick={onStartNew} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Design Control
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
              <div className="text-2xl font-bold text-white">{totalControls}</div>
            </div>
            <div className="text-xs text-slate-400">Total</div>
            <div className="text-[10px] text-blue-400 mt-0.5">Controls</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{effectiveControls}</div>
            </div>
            <div className="text-xs text-slate-400">Effective</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Validated</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{testingDue}</div>
            </div>
            <div className="text-xs text-slate-400">Testing</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Due now</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{notTested}</div>
            </div>
            <div className="text-xs text-slate-400">Untested</div>
            <div className="text-[10px] text-rose-400 mt-0.5">No evidence</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Gauge className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{avgEffectiveness}</div>
            </div>
            <div className="text-xs text-slate-400">Avg Score</div>
            <div className="text-[10px] text-violet-400 mt-0.5">Out of 5</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Zap className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{testFailureRate}%</div>
            </div>
            <div className="text-xs text-slate-400">Failure</div>
            <div className="text-[10px] text-orange-400 mt-0.5">Test rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-400" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-1">Control Status Overview</p>
              <p className="text-xs text-slate-400">
                Distribution of control maturity levels across your framework
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={effectivenessData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {effectivenessData.map((entry, index) => (
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
              {effectivenessData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[11px]">{item.name}</span>
                  <span className="text-white font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Control Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-1">Control Types by Category</p>
              <ul className="text-xs text-slate-400 space-y-0.5">
                <li>• <span className="font-medium">Preventive:</span> Stop threats before they occur</li>
                <li>• <span className="font-medium">Detective:</span> Identify active threats</li>
                <li>• <span className="font-medium">Corrective:</span> Fix vulnerabilities</li>
                <li>• <span className="font-medium">Directive:</span> Guide behavior</li>
              </ul>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  cursor={{ fill: '#2a3548' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Domain Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              Top Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-1">Top Security Domains</p>
              <p className="text-xs text-slate-400">
                Top 5 domains by control count - reveals where your security investments are focused
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={domainData.slice(0, 5)} layout="horizontal">
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
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
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
              6-Month Control Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-1">6-Month Activity Trend</p>
              <p className="text-xs text-slate-400 mb-1">
                Track implementation velocity and effectiveness progression
              </p>
              <p className="text-xs text-slate-500">
                <span className="text-blue-400">●</span> Implemented | <span className="text-emerald-400">●</span> Effective | <span className="text-amber-400">●</span> Tests Conducted
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="controlsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="effectiveGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="controls" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#controlsGrad)" name="Total" />
                <Area type="monotone" dataKey="effective" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#effectiveGrad)" name="Effective" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Control Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Control Framework Maturity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-1">Framework Maturity Model</p>
              <p className="text-xs text-slate-400 mb-2">
                Multi-dimensional maturity assessment:
              </p>
              <ul className="text-xs text-slate-400 space-y-0.5">
                <li>• Coverage breadth across domains</li>
                <li>• Operational effectiveness</li>
                <li>• Testing rigor and frequency</li>
                <li>• Documentation completeness</li>
                <li>• Compliance alignment</li>
              </ul>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={maturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Maturity Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                Maturity: {maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length > 70 ? 'Advanced' : maturityData.reduce((sum, d) => sum + d.score, 0) / maturityData.length > 40 ? 'Developing' : 'Initial'}
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
              <Activity className="h-4 w-4 text-blue-400" />
              Control Growth Trend
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
          <div className="mb-3 p-2 bg-[#0f1623] rounded-lg border border-[#2a3548]">
            <p className="text-xs font-semibold text-white mb-1">Daily Control Growth</p>
            <p className="text-xs text-slate-400">
              <span className="text-blue-400">Total Controls:</span> All controls added over time
            </p>
            <p className="text-xs text-slate-400">
              <span className="text-emerald-400">Effective Controls:</span> Those validated and operational
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Total Controls" />
              <Line type="monotone" dataKey="effective" stroke="#10b981" strokeWidth={2.5} dot={false} name="Effective" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Test Results */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-slate-400" />
              Recent Test Activity
            </CardTitle>
            <Badge className="bg-slate-500/20 text-slate-400 text-[10px]">
              Last {recentTests.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTests.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No test results yet</p>
                <p className="text-xs mt-1">Start testing controls to see results</p>
              </div>
            ) : (
              recentTests.map(test => {
                const control = controls.find(c => c.id === test.control_id);
                const resultColor = test.test_result === 'passed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                   test.test_result === 'failed' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                                   'bg-amber-500/20 text-amber-400 border-amber-500/30';
                
                return (
                  <div 
                    key={test.id}
                    onClick={() => control && onControlClick?.(control)}
                    className="group p-3 rounded-lg bg-gradient-to-r from-[#151d2e] to-[#1a2332] border border-[#2a3548] hover:border-blue-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                          {control?.name || 'Unknown Control'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {format(new Date(test.test_date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <Badge className="text-[9px] h-4 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {test.test_type?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 ${resultColor}`}>
                        {test.test_result}
                      </Badge>
                    </div>
                    {test.notes && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">{test.notes}</p>
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