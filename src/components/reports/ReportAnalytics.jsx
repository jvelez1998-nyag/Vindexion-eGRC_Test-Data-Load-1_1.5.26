import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target, Award, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ReportAnalytics({ data }) {
  const { risks, compliance, controls, audits, incidents } = data;

  // Trend data (simulated monthly data)
  const trendData = [
    { month: 'Jan', risks: 45, compliance: 72, controls: 85, incidents: 12 },
    { month: 'Feb', risks: 48, compliance: 75, controls: 87, incidents: 10 },
    { month: 'Mar', risks: 52, compliance: 78, controls: 88, incidents: 8 },
    { month: 'Apr', risks: 50, compliance: 82, controls: 90, incidents: 7 },
    { month: 'May', risks: 47, compliance: 85, controls: 92, incidents: 6 },
    { month: 'Jun', risks: 45, compliance: 88, controls: 94, incidents: 5 }
  ];

  // Performance metrics
  const performanceMetrics = [
    {
      title: 'Risk Reduction',
      value: '18%',
      change: '+5% from last month',
      trend: 'up',
      color: 'emerald'
    },
    {
      title: 'Compliance Score',
      value: '88%',
      change: '+3% from last month',
      trend: 'up',
      color: 'blue'
    },
    {
      title: 'Control Effectiveness',
      value: '94%',
      change: '+2% from last month',
      trend: 'up',
      color: 'purple'
    },
    {
      title: 'Incident Response Time',
      value: '2.4hrs',
      change: '-15min from last month',
      trend: 'down',
      color: 'amber'
    }
  ];

  // Category performance
  const categoryPerformance = [
    { category: 'Access Control', score: 95 },
    { category: 'Data Protection', score: 88 },
    { category: 'Incident Response', score: 92 },
    { category: 'Business Continuity', score: 85 },
    { category: 'Vendor Management', score: 78 },
    { category: 'Audit & Assurance', score: 90 }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, idx) => (
          <Card key={idx} className={`bg-gradient-to-br from-${metric.color}-500/10 to-${metric.color}-600/10 border-${metric.color}-500/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400">{metric.title}</h3>
                {metric.trend === 'up' ? (
                  <TrendingUp className={`h-4 w-4 text-${metric.color}-400`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 text-${metric.color}-400`} />
                )}
              </div>
              <p className="text-3xl font-bold text-white mb-2">{metric.value}</p>
              <p className={`text-xs text-${metric.color}-400`}>{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Multi-Metric Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} name="Compliance %" />
                <Line type="monotone" dataKey="controls" stroke="#3b82f6" strokeWidth={2} name="Controls %" />
                <Line type="monotone" dataKey="risks" stroke="#ef4444" strokeWidth={2} name="Open Risks" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Incident Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Category Performance Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" width={150} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">Positive Trends</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Compliance rate improved by 16% YoY</li>
                <li>• Control effectiveness up 9%</li>
                <li>• Incident count reduced by 58%</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">Areas for Improvement</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Vendor management score below target</li>
                <li>• 12% of controls need retesting</li>
                <li>• Gap in business continuity planning</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Recommendations</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Enhance vendor assessment process</li>
                <li>• Schedule quarterly control reviews</li>
                <li>• Conduct BCP tabletop exercise</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}