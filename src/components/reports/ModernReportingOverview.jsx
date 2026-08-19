import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Shield, FileCheck, Activity, 
  Brain, Sparkles, Download, Filter, Eye, BarChart3, PieChart, LineChart,
  ArrowUpRight, ArrowDownRight, Zap, Target, Globe, Users, Clock
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart as RechartsLine, Line, AreaChart, Area, 
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend
} from "recharts";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ModernReportingOverview({ data }) {
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const { risks = [], compliance = [], controls = [], audits = [], incidents = [], findings = [], vendors = [] } = data || {};

  // Calculate KPIs
  const kpis = {
    totalRisks: risks.length,
    criticalRisks: risks.filter(r => (r.residual_likelihood || 0) * (r.residual_impact || 0) >= 16).length,
    openRisks: risks.filter(r => r.status !== 'closed').length,
    riskTrend: calculateTrend(risks),
    
    complianceRate: compliance.length > 0 ? Math.round((compliance.filter(c => c.status === 'implemented' || c.status === 'verified').length / compliance.length) * 100) : 0,
    complianceTrend: 5,
    
    controlEffectiveness: controls.length > 0 ? Math.round((controls.filter(c => c.status === 'effective').length / controls.length) * 100) : 0,
    activeControls: controls.filter(c => c.status !== 'retired').length,
    
    auditsConducted: audits.filter(a => a.status === 'completed').length,
    activeAudits: audits.filter(a => a.status === 'in_progress').length,
    
    totalIncidents: incidents.length,
    criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
    
    totalFindings: findings.length,
    openFindings: findings.filter(f => f.status === 'open').length,
    
    vendorRisks: vendors.filter(v => (v.overall_risk_score || 0) > 60).length,
    totalVendors: vendors.length
  };

  // Generate trend data for charts
  const riskTrendData = generateTimeSeriesData(risks, 'created_date', timeRange);
  const complianceTrendData = generateComplianceTrend(compliance, timeRange);
  const controlPerformanceData = generateControlPerformance(controls);
  const incidentDistributionData = generateIncidentDistribution(incidents);

  // Risk distribution by category
  const riskDistribution = generateCategoryDistribution(risks, 'category');
  const controlDistribution = generateCategoryDistribution(controls, 'domain');

  // Maturity Score
  const maturityScore = calculateMaturityScore(kpis);

  useEffect(() => {
    if (risks.length > 0 || compliance.length > 0) {
      generateAIInsights();
    }
  }, [risks.length, compliance.length]);

  async function generateAIInsights() {
    setLoadingInsights(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a GRC analytics expert, analyze this organization's current posture and provide actionable insights.

DATA SUMMARY:
- Total Risks: ${kpis.totalRisks} (${kpis.criticalRisks} critical, ${kpis.openRisks} open)
- Compliance Rate: ${kpis.complianceRate}%
- Control Effectiveness: ${kpis.controlEffectiveness}%
- Active Audits: ${kpis.activeAudits}
- Total Incidents: ${kpis.totalIncidents} (${kpis.criticalIncidents} critical)
- Vendor Risks: ${kpis.vendorRisks} high-risk vendors out of ${kpis.totalVendors}

Provide:
1. Executive Summary (2-3 sentences)
2. Top 3 Strengths
3. Top 3 Priority Areas requiring immediate attention
4. 3 Strategic Recommendations
5. Overall Health Score (0-100)
6. Maturity Level (Initial, Developing, Defined, Managed, Optimizing)`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            priority_areas: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            health_score: { type: "number" },
            maturity_level: { type: "string" }
          }
        }
      });
      setAiInsights(result);
    } catch (error) {
      console.error('Insights error:', error);
    } finally {
      setLoadingInsights(false);
    }
  }

  const colors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6"
  };

  const pieColors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 p-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Executive Intelligence</h3>
                <p className="text-xs text-slate-400">Real-time GRC health assessment</p>
              </div>
              <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Health: {aiInsights.health_score}/100
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {aiInsights.maturity_level}
              </Badge>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{aiInsights.executive_summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {aiInsights.strengths?.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Priority Areas
                </h4>
                <ul className="space-y-1">
                  {aiInsights.priority_areas?.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <h4 className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {aiInsights.recommendations?.slice(0, 3).map((r, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Risk Posture"
          value={kpis.openRisks}
          subtitle={`${kpis.criticalRisks} critical`}
          trend={kpis.riskTrend}
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Compliance Rate"
          value={`${kpis.complianceRate}%`}
          subtitle={`${compliance.length} requirements`}
          trend={kpis.complianceTrend}
          icon={FileCheck}
          color="emerald"
        />
        <KPICard
          title="Control Effectiveness"
          value={`${kpis.controlEffectiveness}%`}
          subtitle={`${kpis.activeControls} active`}
          trend={3}
          icon={Shield}
          color="blue"
        />
        <KPICard
          title="Audit Activity"
          value={kpis.auditsConducted}
          subtitle={`${kpis.activeAudits} in progress`}
          trend={2}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="trends"><LineChart className="h-4 w-4 mr-2" />Trends</TabsTrigger>
          <TabsTrigger value="distribution"><PieChart className="h-4 w-4 mr-2" />Distribution</TabsTrigger>
          <TabsTrigger value="performance"><BarChart3 className="h-4 w-4 mr-2" />Performance</TabsTrigger>
          <TabsTrigger value="matrix"><Globe className="h-4 w-4 mr-2" />Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Risk Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.danger} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.danger} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                    <Area type="monotone" dataKey="count" stroke={colors.danger} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Compliance Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLine data={complianceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                    <Line type="monotone" dataKey="rate" stroke={colors.success} strokeWidth={3} dot={{ fill: colors.success }} />
                  </RechartsLine>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Risk Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Control Distribution by Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={controlDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                    <Bar dataKey="value" fill={colors.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Control Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={controlPerformanceData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                    <PolarRadiusAxis stroke="#64748b" fontSize={10} />
                    <Radar name="Performance" dataKey="value" stroke={colors.primary} fill={colors.primary} fillOpacity={0.5} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Incident Distribution by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="severity" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1623', border: '1px solid #2a3548' }} />
                    <Bar dataKey="count" fill={colors.danger} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">GRC Maturity Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 mb-6">
                {['Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'].map((level, idx) => (
                  <div
                    key={level}
                    className={`p-4 rounded-lg text-center ${
                      maturityScore > idx * 20 ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-[#0f1623] border-[#2a3548]'
                    } border`}
                  >
                    <div className="text-2xl font-bold text-white mb-1">{idx + 1}</div>
                    <div className="text-xs text-slate-400">{level}</div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MaturityMetric label="Risk Management" value={calculateCategoryMaturity(risks, kpis.totalRisks)} />
                <MaturityMetric label="Compliance" value={kpis.complianceRate} />
                <MaturityMetric label="Controls" value={kpis.controlEffectiveness} />
                <MaturityMetric label="Audit Readiness" value={audits.length > 0 ? 85 : 50} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <QuickStat icon={Users} label="Total Vendors" value={kpis.totalVendors} color="blue" />
        <QuickStat icon={AlertTriangle} label="High-Risk Vendors" value={kpis.vendorRisks} color="rose" />
        <QuickStat icon={Activity} label="Total Incidents" value={kpis.totalIncidents} color="amber" />
        <QuickStat icon={Zap} label="Critical Incidents" value={kpis.criticalIncidents} color="red" />
        <QuickStat icon={FileCheck} label="Total Findings" value={kpis.totalFindings} color="purple" />
        <QuickStat icon={Clock} label="Open Findings" value={kpis.openFindings} color="orange" />
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, trend, icon: Icon, color }) {
  const colorMap = {
    rose: "from-rose-500/20 to-red-500/20 border-rose-500/30",
    emerald: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
  };

  const iconColorMap = {
    rose: "text-rose-400",
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    purple: "text-purple-400"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Icon className={`h-8 w-8 ${iconColorMap[color]}`} />
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-slate-400">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function QuickStat({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400"
  };

  return (
    <Card className={`${colorMap[color]} border`}>
      <CardContent className="p-4 text-center">
        <Icon className="h-6 w-6 mx-auto mb-2" />
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function MaturityMetric({ label, value }) {
  return (
    <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
      <div className="text-xs text-slate-400 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white mb-2">{value}%</div>
      <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Utility functions
function calculateTrend(items) {
  if (!items.length) return 0;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentCount = items.filter(i => new Date(i.created_date) > thirtyDaysAgo).length;
  const previousCount = items.length - recentCount;
  if (previousCount === 0) return 0;
  return Math.round(((recentCount - previousCount) / previousCount) * 100);
}

function generateTimeSeriesData(items, dateField, range) {
  const data = [];
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const count = items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate.toDateString() === date.toDateString();
    }).length;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    });
  }
  
  return data;
}

function generateComplianceTrend(compliance, range) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, idx) => ({
    month,
    rate: Math.min(100, 50 + idx * 8 + Math.random() * 5)
  }));
}

function generateControlPerformance(controls) {
  return [
    { metric: 'Effectiveness', value: controls.filter(c => c.status === 'effective').length },
    { metric: 'Coverage', value: Math.min(100, controls.length * 2) },
    { metric: 'Testing', value: controls.filter(c => c.last_tested_date).length },
    { metric: 'Documentation', value: Math.min(100, controls.length * 1.5) },
    { metric: 'Automation', value: controls.filter(c => c.category === 'automated').length * 2 }
  ];
}

function generateIncidentDistribution(incidents) {
  const severities = ['critical', 'high', 'medium', 'low'];
  return severities.map(sev => ({
    severity: sev.charAt(0).toUpperCase() + sev.slice(1),
    count: incidents.filter(i => i.severity === sev).length
  }));
}

function generateCategoryDistribution(items, field) {
  const categories = {};
  items.forEach(item => {
    const cat = item[field] || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

function calculateMaturityScore(kpis) {
  const scores = [
    kpis.complianceRate,
    kpis.controlEffectiveness,
    Math.max(0, 100 - (kpis.criticalRisks * 10)),
    Math.min(100, kpis.auditsConducted * 20)
  ];
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function calculateCategoryMaturity(items, total) {
  if (total === 0) return 0;
  return Math.min(100, Math.round((items.length / Math.max(1, total)) * 100));
}