import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Download, Eye, Settings, TrendingUp,
  PieChart as PieChartIcon, Activity, GitBranch
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const VISUALIZATION_TYPES = [
  { id: "risk_heat", name: "Risk Heat Map", icon: Activity, color: "rose" },
  { id: "compliance_trend", name: "Compliance Trends", icon: TrendingUp, color: "emerald" },
  { id: "control_radar", name: "Control Maturity Radar", icon: GitBranch, color: "blue" },
  { id: "incident_analysis", name: "Incident Analysis", icon: BarChart3, color: "amber" }
];

export default function AdvancedReportVisualizations({ data }) {
  const [selectedViz, setSelectedViz] = useState("risk_heat");

  // Sample data
  const riskHeatData = [
    { impact: "Critical", rare: 2, unlikely: 3, possible: 5, likely: 8, certain: 12 },
    { impact: "High", rare: 4, unlikely: 6, possible: 9, likely: 11, certain: 7 },
    { impact: "Medium", rare: 8, unlikely: 12, possible: 15, likely: 9, certain: 4 },
    { impact: "Low", rare: 15, unlikely: 18, possible: 12, likely: 6, certain: 2 }
  ];

  const complianceTrendData = [
    { month: "Jan", soc2: 72, iso: 68, gdpr: 75, sox: 70 },
    { month: "Feb", soc2: 75, iso: 71, gdpr: 78, sox: 73 },
    { month: "Mar", soc2: 78, iso: 74, gdpr: 80, sox: 76 },
    { month: "Apr", soc2: 80, iso: 77, gdpr: 82, sox: 78 },
    { month: "May", soc2: 82, iso: 79, gdpr: 84, sox: 80 },
    { month: "Jun", soc2: 85, iso: 82, gdpr: 86, sox: 83 }
  ];

  const controlRadarData = [
    { domain: "Access Control", score: 85 },
    { domain: "Data Protection", score: 78 },
    { domain: "Network Security", score: 82 },
    { domain: "Incident Response", score: 75 },
    { domain: "Business Continuity", score: 80 },
    { domain: "Change Management", score: 77 }
  ];

  const incidentData = [
    { type: "Security", q1: 12, q2: 8, q3: 6, q4: 5 },
    { type: "Compliance", q1: 7, q2: 9, q3: 5, q4: 4 },
    { type: "Operational", q1: 15, q2: 12, q3: 10, q4: 8 },
    { type: "Data", q1: 5, q2: 3, q3: 2, q4: 1 }
  ];

  const renderVisualization = () => {
    switch (selectedViz) {
      case "risk_heat":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Risk Distribution by Likelihood</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={riskHeatData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="impact" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="rare" stackId="a" fill="#10b981" />
                  <Bar dataKey="unlikely" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="possible" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="likely" stackId="a" fill="#ef4444" />
                  <Bar dataKey="certain" stackId="a" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Risk Severity Distribution</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Critical", value: 30, color: "#dc2626" },
                      { name: "High", value: 37, color: "#f59e0b" },
                      { name: "Medium", value: 48, color: "#3b82f6" },
                      { name: "Low", value: 53, color: "#10b981" }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    dataKey="value"
                  >
                    {[
                      { color: "#dc2626" },
                      { color: "#f59e0b" },
                      { color: "#3b82f6" },
                      { color: "#10b981" }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "compliance_trend":
        return (
          <div className="space-y-6">
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Compliance Progress Over Time</h3>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="soc2" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="iso" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="gdpr" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="sox" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Month-over-Month Growth</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="soc2" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="iso" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="gdpr" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="sox" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "control_radar":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Control Domain Maturity</h3>
              <ResponsiveContainer width="100%" height="85%">
                <RadarChart data={controlRadarData}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Radar name="Maturity Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Domain Comparison</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={controlRadarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <YAxis dataKey="domain" type="category" tick={{ fill: '#94a3b8' }} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "incident_analysis":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Quarterly Incident Trends</h3>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="type" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="q1" fill="#ef4444" />
                  <Bar dataKey="q2" fill="#f59e0b" />
                  <Bar dataKey="q3" fill="#3b82f6" />
                  <Bar dataKey="q4" fill="#10b981" />
                  <Line type="monotone" dataKey="q4" stroke="#8b5cf6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="h-96 bg-[#0f1623] rounded-xl border border-[#2a3548] p-6">
              <h3 className="text-white font-semibold mb-4">Incident Reduction Rate</h3>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="type" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="q1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="q4" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30">
                <BarChart3 className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Advanced Visualizations</CardTitle>
                <p className="text-slate-400 text-sm mt-1">Interactive charts and comprehensive data views</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Visualization Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {VISUALIZATION_TYPES.map(viz => {
          const Icon = viz.icon;
          const isSelected = selectedViz === viz.id;
          
          return (
            <Card 
              key={viz.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? `bg-gradient-to-br from-${viz.color}-500/20 to-${viz.color}-600/20 border-${viz.color}-500/50` 
                  : 'bg-[#1a2332] border-[#2a3548] hover:border-[#3a4558]'
              }`}
              onClick={() => setSelectedViz(viz.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 text-${viz.color}-400`} />
                <h3 className="text-white font-semibold text-sm">{viz.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Visualization Display */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {VISUALIZATION_TYPES.find(v => v.id === selectedViz)?.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Eye className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderVisualization()}
        </CardContent>
      </Card>
    </div>
  );
}