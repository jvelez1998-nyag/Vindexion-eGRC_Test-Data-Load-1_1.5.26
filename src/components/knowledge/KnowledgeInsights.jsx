import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, format } from "date-fns";

export default function KnowledgeInsights({ knowledgeData }) {
  // Generate trend data for the last 30 days
  const generateTrendData = () => {
    const days = 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM d');

      const risksUpTo = knowledgeData.risks.filter(r => new Date(r.created_date) <= date).length;
      const incidentsUpTo = knowledgeData.incidents.filter(i => new Date(i.created_date) <= date).length;
      const controlsUpTo = knowledgeData.controls.filter(c => new Date(c.created_date) <= date).length;
      const complianceUpTo = knowledgeData.compliance.filter(c => new Date(c.created_date) <= date).length;

      data.push({
        date: dateStr,
        risks: risksUpTo,
        incidents: incidentsUpTo,
        controls: controlsUpTo,
        compliance: complianceUpTo
      });
    }

    return data;
  };

  const trendData = generateTrendData();

  // Calculate key trends
  const calculateTrend = (data, field) => {
    if (data.length < 2) return 0;
    const recent = data[data.length - 1][field];
    const previous = data[Math.floor(data.length / 2)][field];
    return previous ? ((recent - previous) / previous * 100).toFixed(1) : 0;
  };

  const trends = {
    risks: calculateTrend(trendData, 'risks'),
    incidents: calculateTrend(trendData, 'incidents'),
    controls: calculateTrend(trendData, 'controls'),
    compliance: calculateTrend(trendData, 'compliance')
  };

  // Key insights
  const insights = [
    {
      title: "Risk Growth Rate",
      value: `${trends.risks}%`,
      trend: parseFloat(trends.risks),
      description: "Change in risk volume over 30 days",
      color: "rose"
    },
    {
      title: "Incident Rate",
      value: `${trends.incidents}%`,
      trend: parseFloat(trends.incidents),
      description: "Change in incident reports",
      color: "amber"
    },
    {
      title: "Control Expansion",
      value: `${trends.controls}%`,
      trend: parseFloat(trends.controls),
      description: "Growth in control coverage",
      color: "blue"
    },
    {
      title: "Compliance Progress",
      value: `${trends.compliance}%`,
      trend: parseFloat(trends.compliance),
      description: "Compliance requirements progress",
      color: "emerald"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      rose: { bg: "from-rose-500/20 to-red-500/20", border: "border-rose-500/30", text: "text-rose-400" },
      amber: { bg: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", text: "text-amber-400" },
      blue: { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-400" },
      emerald: { bg: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", text: "text-emerald-400" }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => {
          const colors = getColorClasses(insight.color);
          const isPositive = insight.trend >= 0;
          
          return (
            <Card key={idx} className={`bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400">{insight.title}</p>
                  {isPositive ? (
                    <TrendingUp className={`h-4 w-4 ${colors.text}`} />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                  )}
                </div>
                <p className={`text-2xl font-bold ${colors.text} mb-1`}>{insight.value}</p>
                <p className="text-[10px] text-slate-500">{insight.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Combined Trends Chart */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            30-Day Knowledge Trends
          </CardTitle>
          <p className="text-xs text-slate-500">Growth patterns across all GRC modules</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="risks" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              <Area type="monotone" dataKey="incidents" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Area type="monotone" dataKey="controls" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="compliance" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Risks</Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Incidents</Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Controls</Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Compliance</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coverage Analysis */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Coverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <span className="text-sm text-slate-400">Risks with Controls</span>
              <Badge className="bg-blue-500/20 text-blue-400">
                {knowledgeData.risks.filter(r => r.linked_controls?.length > 0).length} / {knowledgeData.risks.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <span className="text-sm text-slate-400">Compliance Frameworks</span>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                {new Set(knowledgeData.compliance.map(c => c.framework)).size}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <span className="text-sm text-slate-400">Active Assessments</span>
              <Badge className="bg-purple-500/20 text-purple-400">
                {knowledgeData.assessments.filter(a => a.lifecycle_status !== 'closed').length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <span className="text-sm text-slate-400">Open Items</span>
              <Badge className="bg-amber-500/20 text-amber-400">
                {knowledgeData.risks.filter(r => r.status !== 'closed').length + 
                 knowledgeData.incidents.filter(i => !['closed', 'remediated'].includes(i.status)).length}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <span className="text-sm text-slate-400">Critical Priority</span>
              <Badge className="bg-rose-500/20 text-rose-400">
                {knowledgeData.risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length +
                 knowledgeData.incidents.filter(i => i.severity === 'critical').length}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#151d2e] rounded-lg">
              <span className="text-sm text-slate-400">In Progress</span>
              <Badge className="bg-blue-500/20 text-blue-400">
                {knowledgeData.audits.filter(a => a.status === 'in_progress').length +
                 knowledgeData.compliance.filter(c => c.status === 'in_progress').length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}