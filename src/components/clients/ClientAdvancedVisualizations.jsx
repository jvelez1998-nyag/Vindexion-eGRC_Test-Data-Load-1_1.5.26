import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { BarChart3, Activity, TrendingUp, Target } from "lucide-react";
import { format, subMonths } from "date-fns";

export default function ClientAdvancedVisualizations({ client }) {
  // Historical trend data from assessment history
  const trendData = (client.assessment_history || []).slice(-6).map(a => ({
    date: format(new Date(a.date), 'MMM yyyy'),
    risk: a.risk_score || 0,
    compliance: a.compliance_score || 0,
    controls: a.control_maturity || 0,
    security: a.security_posture || 0
  }));

  // If no history, create placeholder data
  const displayTrend = trendData.length > 0 ? trendData : [
    { date: format(subMonths(new Date(), 5), 'MMM yyyy'), risk: client.risk_score || 50, compliance: client.compliance_score || 50, controls: client.control_maturity || 50, security: client.security_posture || 50 },
    { date: format(subMonths(new Date(), 4), 'MMM yyyy'), risk: client.risk_score || 50, compliance: client.compliance_score || 50, controls: client.control_maturity || 50, security: client.security_posture || 50 },
    { date: format(subMonths(new Date(), 3), 'MMM yyyy'), risk: client.risk_score || 50, compliance: client.compliance_score || 50, controls: client.control_maturity || 50, security: client.security_posture || 50 },
    { date: format(subMonths(new Date(), 2), 'MMM yyyy'), risk: client.risk_score || 50, compliance: client.compliance_score || 50, controls: client.control_maturity || 50, security: client.security_posture || 50 },
    { date: format(subMonths(new Date(), 1), 'MMM yyyy'), risk: client.risk_score || 50, compliance: client.compliance_score || 50, controls: client.control_maturity || 50, security: client.security_posture || 50 },
    { date: format(new Date(), 'MMM yyyy'), risk: client.risk_score || 50, compliance: client.compliance_score || 50, controls: client.control_maturity || 50, security: client.security_posture || 50 }
  ];

  // Current scores radar
  const radarData = [
    { metric: 'Compliance', score: client.compliance_score || 0 },
    { metric: 'Controls', score: client.control_maturity || 0 },
    { metric: 'Security', score: client.security_posture || 0 },
    { metric: 'Risk Mgmt', score: Math.max(0, 100 - (client.risk_score || 0)) }
  ];

  // Issue breakdown
  const issueData = [
    { name: 'Critical Issues', value: client.critical_issues || 0, color: '#ef4444' },
    { name: 'Findings', value: client.finding_count || 0, color: '#f59e0b' },
    { name: 'Incidents', value: client.incident_count || 0, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Advanced Visualizations</h3>
              <p className="text-xs text-slate-400">Performance trends and analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Trend */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={displayTrend}>
                <defs>
                  <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} fill="url(#complianceGrad)" name="Compliance" />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fill="url(#riskGrad)" name="Risk" />
                <Area type="monotone" dataKey="controls" stroke="#06b6d4" strokeWidth={1.5} fill="transparent" name="Controls" />
                <Area type="monotone" dataKey="security" stroke="#8b5cf6" strokeWidth={1.5} fill="transparent" name="Security" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maturity Radar */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              Current Maturity Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#06b6d4" 
                  fill="#06b6d4" 
                  fillOpacity={0.5} 
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <Badge className="bg-cyan-500/20 text-cyan-400">
                Avg: {Math.round(radarData.reduce((sum, d) => sum + d.score, 0) / radarData.length)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Issue Distribution */}
        {issueData.length > 0 && (
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" />
                Issue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {issueData.map((entry, index) => (
                      <Bar key={index} dataKey="value" fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Score Comparison */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Score Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[
                  { metric: 'Compliance', score: client.compliance_score || 0 },
                  { metric: 'Controls', score: client.control_maturity || 0 },
                  { metric: 'Security', score: client.security_posture || 0 },
                  { metric: 'Risk', score: client.risk_score || 0 }
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis dataKey="metric" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}