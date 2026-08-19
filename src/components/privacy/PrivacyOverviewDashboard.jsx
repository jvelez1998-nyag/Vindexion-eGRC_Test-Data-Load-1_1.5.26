import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, AlertTriangle, CheckCircle2, TrendingUp, Brain,
  BarChart3, PieChart as PieChartIcon, Activity, Target, Sparkles
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const PRIVACY_FRAMEWORKS = ["GDPR", "CCPA", "PIPEDA", "LGPD", "PDPA"];

const PRIVACY_METRICS = [
  { label: "Data Subject Rights", score: 85, icon: Shield, color: "emerald" },
  { label: "Consent Management", score: 78, icon: CheckCircle2, color: "blue" },
  { label: "Data Minimization", score: 72, icon: Target, color: "violet" },
  { label: "Security Measures", score: 88, icon: AlertTriangle, color: "rose" }
];

export default function PrivacyOverviewDashboard() {
  const [visualMode, setVisualMode] = useState("summary");

  // Fetch data
  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list()
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  // Privacy-specific metrics
  const privacyRisks = risks.filter(r => 
    r.category === 'compliance' || 
    (r.description && r.description.toLowerCase().includes('privacy'))
  );

  const privacyCompliance = compliance.filter(c =>
    PRIVACY_FRAMEWORKS.includes(c.framework)
  );

  const privacyControls = controls.filter(c =>
    c.domain === 'data_protection' || c.regulatory_mappings?.some(m => 
      PRIVACY_FRAMEWORKS.includes(m)
    )
  );

  // Calculate metrics
  const criticalPrivacyRisks = privacyRisks.filter(r => (r.impact || 0) >= 4).length;
  const complianceRate = privacyCompliance.length > 0 
    ? Math.round((privacyCompliance.filter(c => c.status === 'verified' || c.status === 'implemented').length / privacyCompliance.length) * 100)
    : 0;

  // Chart data
  const frameworkStatusData = PRIVACY_FRAMEWORKS.map(framework => {
    const items = privacyCompliance.filter(c => c.framework === framework);
    const compliant = items.filter(c => c.status === 'verified' || c.status === 'implemented').length;
    return {
      framework,
      compliant,
      inProgress: items.filter(c => c.status === 'in_progress').length,
      notStarted: items.filter(c => c.status === 'not_started').length,
      total: items.length,
      percentage: items.length > 0 ? Math.round((compliant / items.length) * 100) : 0
    };
  });

  const riskTrendData = [
    { month: "Jan", critical: 3, high: 8, medium: 12 },
    { month: "Feb", critical: 4, high: 9, medium: 10 },
    { month: "Mar", critical: 2, high: 7, medium: 11 },
    { month: "Apr", critical: 3, high: 8, medium: 9 },
    { month: "May", critical: 2, high: 6, medium: 10 },
    { month: "Jun", critical: 2, high: 5, medium: 8 }
  ];

  const dataTypeDistribution = [
    { name: "Personal Data", value: 45, color: "#3b82f6" },
    { name: "Sensitive Data", value: 25, color: "#ef4444" },
    { name: "Financial Data", value: 15, color: "#f59e0b" },
    { name: "Health Data", value: 10, color: "#8b5cf6" },
    { name: "Other", value: 5, color: "#64748b" }
  ];

  const complianceMaturityData = [
    { area: "Data Mapping", score: 85 },
    { area: "Consent Mgmt", score: 78 },
    { area: "Rights Requests", score: 82 },
    { area: "DPO Function", score: 75 },
    { area: "Privacy by Design", score: 80 },
    { area: "Breach Response", score: 88 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-white font-medium">{payload[0].payload.framework || payload[0].name}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Privacy Risks</p>
                <p className="text-3xl font-bold text-white">{privacyRisks.length}</p>
                <Badge className="mt-2 bg-rose-500/10 text-rose-400 border-rose-500/20">
                  {criticalPrivacyRisks} Critical
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Compliance Rate</p>
                <p className="text-3xl font-bold text-white">{complianceRate}%</p>
                <Progress value={complianceRate} className="mt-2 h-2" />
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Privacy Controls</p>
                <p className="text-3xl font-bold text-white">{privacyControls.length}</p>
                <Badge className="mt-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {privacyControls.filter(c => c.status === 'effective').length} Effective
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Frameworks</p>
                <p className="text-3xl font-bold text-white">{PRIVACY_FRAMEWORKS.length}</p>
                <Badge className="mt-2 bg-violet-500/10 text-violet-400 border-violet-500/20">
                  {privacyCompliance.length} Requirements
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Target className="h-6 w-6 text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Maturity Scores */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            Privacy Program Maturity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRIVACY_METRICS.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-[#0f1623] border border-[#2a3548]">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 text-${metric.color}-400`} />
                    <span className="text-sm font-medium text-white">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{metric.score}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Visualizations */}
      <Tabs value={visualMode} onValueChange={setVisualMode}>
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="maturity">Maturity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-white text-base">Data Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        labelLine={{ stroke: '#64748b' }}
                      >
                        {dataTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-white text-base">Risk Severity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="medium" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white">Framework Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frameworkStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="framework" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Compliant" />
                    <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
                    <Bar dataKey="notStarted" stackId="a" fill="#64748b" name="Not Started" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white">Privacy Risk Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={3} />
                    <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={3} />
                    <Line type="monotone" dataKey="medium" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maturity" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-white">Privacy Compliance Maturity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={complianceMaturityData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <Radar name="Maturity Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Framework Status Grid */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-400" />
            Framework Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {frameworkStatusData.map((framework, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0f1623] border border-[#2a3548] hover:border-[#3a4558] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{framework.framework}</h4>
                  <Badge className={`${
                    framework.percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    framework.percentage >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {framework.percentage}%
                  </Badge>
                </div>
                <Progress value={framework.percentage} className="h-2 mb-3" />
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Compliant:</span>
                    <span className="text-emerald-400 font-medium">{framework.compliant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="text-amber-400 font-medium">{framework.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Started:</span>
                    <span className="text-slate-500 font-medium">{framework.notStarted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}