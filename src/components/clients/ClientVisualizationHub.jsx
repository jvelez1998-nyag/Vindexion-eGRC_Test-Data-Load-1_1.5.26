import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { BarChart3, Activity, Target, TrendingUp } from "lucide-react";

export default function ClientVisualizationHub({ clients }) {
  // Risk vs Compliance Scatter
  const scatterData = clients.map(c => ({
    name: c.name,
    risk: c.risk_score || 0,
    compliance: c.compliance_score || 0,
    size: (c.incident_count || 0) + (c.finding_count || 0)
  }));

  // Industry comparison
  const industryData = Object.entries(
    clients.reduce((acc, c) => {
      if (!acc[c.industry]) {
        acc[c.industry] = { 
          industry: c.industry,
          avgRisk: 0,
          avgCompliance: 0,
          avgControl: 0,
          avgSecurity: 0,
          count: 0 
        };
      }
      acc[c.industry].avgRisk += c.risk_score || 0;
      acc[c.industry].avgCompliance += c.compliance_score || 0;
      acc[c.industry].avgControl += c.control_maturity || 0;
      acc[c.industry].avgSecurity += c.security_posture || 0;
      acc[c.industry].count++;
      return acc;
    }, {})
  ).map(([_, data]) => ({
    industry: data.industry,
    avgRisk: Math.round(data.avgRisk / data.count),
    avgCompliance: Math.round(data.avgCompliance / data.count),
    avgControl: Math.round(data.avgControl / data.count),
    avgSecurity: Math.round(data.avgSecurity / data.count)
  }));

  // Risk distribution
  const riskDistribution = [
    { name: 'Low', value: clients.filter(c => c.risk_level === 'low').length, color: '#10b981' },
    { name: 'Medium', value: clients.filter(c => c.risk_level === 'medium').length, color: '#3b82f6' },
    { name: 'High', value: clients.filter(c => c.risk_level === 'high').length, color: '#f59e0b' },
    { name: 'Critical', value: clients.filter(c => c.risk_level === 'critical').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Maturity comparison
  const maturityData = clients.slice(0, 10).map(c => ({
    name: c.name.substring(0, 15),
    compliance: c.compliance_score || 0,
    controls: c.control_maturity || 0,
    security: c.security_posture || 0
  }));

  // Portfolio health trend (simulated)
  const healthTrend = [
    { month: 'Jan', avgRisk: 45, avgCompliance: 72 },
    { month: 'Feb', avgRisk: 43, avgCompliance: 74 },
    { month: 'Mar', avgRisk: 40, avgCompliance: 76 },
    { month: 'Apr', avgRisk: 38, avgCompliance: 78 },
    { month: 'May', avgRisk: 36, avgCompliance: 80 },
    { month: 'Jun', avgRisk: 35, avgCompliance: 82 }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Advanced Visualization Hub</h3>
              <p className="text-xs text-slate-400">Interactive portfolio analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scatter" className="w-full">
        <TabsList className="bg-[#151d2e] border border-[#2a3548] grid grid-cols-5 w-full">
          <TabsTrigger value="scatter">Scatter</TabsTrigger>
          <TabsTrigger value="industry">Industry</TabsTrigger>
          <TabsTrigger value="risk">Risk Dist</TabsTrigger>
          <TabsTrigger value="maturity">Maturity</TabsTrigger>
          <TabsTrigger value="trend">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="scatter" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                Risk vs Compliance Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    type="number" 
                    dataKey="risk" 
                    name="Risk Score"
                    stroke="#94a3b8"
                    label={{ value: 'Risk Score', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="compliance" 
                    name="Compliance"
                    stroke="#94a3b8"
                    label={{ value: 'Compliance Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter name="Clients" data={scatterData} fill="#06b6d4">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.risk > 70 ? '#ef4444' :
                        entry.risk > 50 ? '#f59e0b' :
                        entry.risk > 30 ? '#3b82f6' :
                        '#10b981'
                      } />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industry" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                Industry Benchmarking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={industryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis 
                    dataKey="industry" 
                    stroke="#94a3b8"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="avgCompliance" fill="#10b981" name="Avg Compliance" />
                  <Bar dataKey="avgControl" fill="#06b6d4" name="Avg Controls" />
                  <Bar dataKey="avgSecurity" fill="#8b5cf6" name="Avg Security" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" />
                Risk Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {riskDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name}</span>
                    <span className="text-white font-semibold ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maturity" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Client Maturity Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={maturityData.slice(0, 5)}>
                  <PolarGrid stroke="#2a3548" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                  <Radar name="Compliance" dataKey="compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Controls" dataKey="controls" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  <Radar name="Security" dataKey="security" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="mt-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Portfolio Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={healthTrend}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="avgRisk" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fill="url(#riskGradient)" 
                    name="Avg Risk Score"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgCompliance" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#complianceGradient)" 
                    name="Avg Compliance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}