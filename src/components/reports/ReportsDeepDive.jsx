import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, TrendingUp, AlertTriangle, Shield, FileCheck,
  BarChart3, PieChart as PieChartIcon, Activity, Brain, Download
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const DEEP_DIVE_TOPICS = [
  {
    id: "risk_trends",
    name: "Risk Trends Analysis",
    description: "Analyze risk patterns, trajectories, and emerging threats",
    icon: TrendingUp,
    color: "from-rose-500/20 to-orange-500/20",
    iconColor: "text-rose-400"
  },
  {
    id: "compliance_gaps",
    name: "Compliance Gap Analysis",
    description: "Identify and prioritize compliance gaps across frameworks",
    icon: FileCheck,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  {
    id: "control_maturity",
    name: "Control Maturity Assessment",
    description: "Evaluate control environment maturity and effectiveness",
    icon: Shield,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400"
  },
  {
    id: "incident_patterns",
    name: "Incident Pattern Recognition",
    description: "Discover patterns in incident data for prevention",
    icon: AlertTriangle,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  }
];

export default function ReportsDeepDive({ data }) {
  const [selectedTopic, setSelectedTopic] = useState("risk_trends");
  const [timeRange, setTimeRange] = useState("6m");
  const [analysisType, setAnalysisType] = useState("trend");

  // Sample data for visualizations
  const riskTrendData = [
    { month: "Jan", critical: 4, high: 12, medium: 25, low: 15 },
    { month: "Feb", critical: 5, high: 14, medium: 22, low: 18 },
    { month: "Mar", critical: 3, high: 16, medium: 28, low: 20 },
    { month: "Apr", critical: 6, high: 15, medium: 24, low: 17 },
    { month: "May", critical: 4, high: 18, medium: 26, low: 19 },
    { month: "Jun", critical: 5, high: 14, medium: 30, low: 22 }
  ];

  const complianceGapData = [
    { framework: "SOX", gaps: 12, total: 45, percentage: 73 },
    { framework: "SOC2", gaps: 8, total: 38, percentage: 79 },
    { framework: "ISO 27001", gaps: 15, total: 52, percentage: 71 },
    { framework: "GDPR", gaps: 6, total: 28, percentage: 79 },
    { framework: "PCI-DSS", gaps: 10, total: 35, percentage: 71 }
  ];

  const controlMaturityData = [
    { domain: "Access Control", score: 85 },
    { domain: "Data Protection", score: 78 },
    { domain: "Network Security", score: 82 },
    { domain: "Incident Response", score: 75 },
    { domain: "Business Continuity", score: 80 },
    { domain: "Vendor Management", score: 72 }
  ];

  const incidentPatternData = [
    { type: "Security Breach", count: 8, severity: "High" },
    { type: "Data Leak", count: 3, severity: "Critical" },
    { type: "Policy Violation", count: 15, severity: "Medium" },
    { type: "System Outage", count: 6, severity: "High" },
    { type: "Compliance Breach", count: 4, severity: "High" }
  ];

  const currentTopic = DEEP_DIVE_TOPICS.find(t => t.id === selectedTopic);
  const Icon = currentTopic?.icon;

  const renderVisualization = () => {
    switch (selectedTopic) {
      case "risk_trends":
        return (
          <div className="h-80 bg-[#0f1623] rounded-xl border border-[#2a3548] p-4">
            <ResponsiveContainer width="100%" height="100%">
              {analysisType === "trend" ? (
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                  <Bar dataKey="high" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="medium" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="low" stackId="a" fill="#10b981" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        );

      case "compliance_gaps":
        return (
          <div className="h-80 bg-[#0f1623] rounded-xl border border-[#2a3548] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceGapData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="framework" type="category" tick={{ fill: '#94a3b8' }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="gaps" fill="#ef4444" name="Gaps" />
                <Bar dataKey="percentage" fill="#10b981" name="Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "control_maturity":
        return (
          <div className="h-80 bg-[#0f1623] rounded-xl border border-[#2a3548] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={controlMaturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <Radar name="Maturity Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      case "incident_patterns":
        return (
          <div className="h-80 bg-[#0f1623] rounded-xl border border-[#2a3548] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentPatternData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30">
              <Target className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Reports Deep Dive</h2>
              <p className="text-slate-400 text-sm mt-1">Advanced analytics and detailed insights</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Topic Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEEP_DIVE_TOPICS.map(topic => {
          const TopicIcon = topic.icon;
          const isSelected = selectedTopic === topic.id;
          
          return (
            <Card 
              key={topic.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-[#1a2332] to-[#151d2e] border-indigo-500/50 shadow-lg' 
                  : 'bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558]'
              }`}
              onClick={() => setSelectedTopic(topic.id)}
            >
              <CardContent className="p-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${topic.color} border border-transparent mb-3 w-fit`}>
                  <TopicIcon className={`h-5 w-5 ${topic.iconColor}`} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{topic.name}</h3>
                <p className="text-slate-400 text-xs">{topic.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analysis Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${currentTopic?.color}`}>
                <Icon className={`h-5 w-5 ${currentTopic?.iconColor}`} />
              </div>
              <div>
                <CardTitle className="text-white">{currentTopic?.name}</CardTitle>
                <p className="text-slate-400 text-sm">{currentTopic?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="1m" className="text-white">Last Month</SelectItem>
                  <SelectItem value="3m" className="text-white">Last 3 Months</SelectItem>
                  <SelectItem value="6m" className="text-white">Last 6 Months</SelectItem>
                  <SelectItem value="1y" className="text-white">Last Year</SelectItem>
                </SelectContent>
              </Select>
              {selectedTopic === "risk_trends" && (
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger className="w-32 bg-[#0f1623] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="trend" className="text-white">Trend</SelectItem>
                    <SelectItem value="stacked" className="text-white">Stacked</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visualization */}
          {renderVisualization()}

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white">Key Insight</h4>
                </div>
                <p className="text-xs text-slate-400">Critical risks increased 25% over the past quarter, requiring immediate attention</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-white">Trending</h4>
                </div>
                <p className="text-xs text-slate-400">Data protection controls showing consistent improvement month-over-month</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0f1623] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-white">Recommendation</h4>
                </div>
                <p className="text-xs text-slate-400">Prioritize remediation efforts on SOX and ISO 27001 compliance gaps</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}