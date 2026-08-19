import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { AlertTriangle, Shield, Target, TrendingUp, Activity, CheckCircle2 } from "lucide-react";

export default function ThreatVulnAssessmentDashboard() {
  const { data: threats = [] } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.Threat.list('-updated_date', 100)
  });

  const { data: vulnerabilities = [] } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: () => base44.entities.Vulnerability.list('-updated_date', 100)
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['threat-assessments'],
    queryFn: () => base44.entities.ThreatAssessment.list('-updated_date', 50)
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-updated_date', 100)
  });

  // Statistics
  const activeThreats = threats.filter(t => t.status === 'active').length;
  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const activeVulns = vulnerabilities.filter(v => v.status !== 'remediated' && v.status !== 'accepted').length;
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;

  // Threat severity distribution
  const threatSeverityData = [
    { name: 'Critical', value: threats.filter(t => t.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: threats.filter(t => t.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: threats.filter(t => t.severity === 'medium').length, color: '#3b82f6' },
    { name: 'Low', value: threats.filter(t => t.severity === 'low').length, color: '#64748b' }
  ].filter(d => d.value > 0);

  // Vulnerability status distribution
  const vulnStatusData = [
    { name: 'Identified', value: vulnerabilities.filter(v => v.status === 'identified').length, color: '#f59e0b' },
    { name: 'Triaging', value: vulnerabilities.filter(v => v.status === 'triaging').length, color: '#3b82f6' },
    { name: 'In Remediation', value: vulnerabilities.filter(v => v.status === 'in_remediation').length, color: '#8b5cf6' },
    { name: 'Remediated', value: vulnerabilities.filter(v => v.status === 'remediated').length, color: '#10b981' },
    { name: 'Accepted', value: vulnerabilities.filter(v => v.status === 'accepted').length, color: '#64748b' }
  ].filter(d => d.value > 0);

  // Coverage analysis
  const threatsWithControls = threats.filter(t => (t.linked_controls || []).length > 0).length;
  const vulnsWithControls = vulnerabilities.filter(v => (v.linked_controls || []).length > 0).length;
  const threatCoverage = threats.length ? Math.round((threatsWithControls / threats.length) * 100) : 0;
  const vulnCoverage = vulnerabilities.length ? Math.round((vulnsWithControls / vulnerabilities.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <Badge className="bg-rose-500/20 text-rose-400">Active</Badge>
            </div>
            <div className="text-2xl font-bold text-white">{activeThreats}</div>
            <div className="text-xs text-slate-400">Active Threats</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Open</Badge>
            </div>
            <div className="text-2xl font-bold text-white">{activeVulns}</div>
            <div className="text-xs text-slate-400">Active Vulnerabilities</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Complete</Badge>
            </div>
            <div className="text-2xl font-bold text-white">{assessments.filter(a => a.status === 'completed').length}</div>
            <div className="text-xs text-slate-400">Assessments Done</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-400">Coverage</Badge>
            </div>
            <div className="text-2xl font-bold text-white">{Math.round((threatCoverage + vulnCoverage) / 2)}%</div>
            <div className="text-xs text-slate-400">Control Coverage</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Threat Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={threatSeverityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {threatSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Vulnerability Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vulnStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {vulnStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Control Coverage */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">Control Coverage Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-semibold text-white">Threat Coverage</span>
                </div>
                <Badge className="bg-rose-500/20 text-rose-400">{threatCoverage}%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">With Controls</span>
                  <span className="text-white font-medium">{threatsWithControls}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Without Controls</span>
                  <span className="text-amber-400 font-medium">{threats.length - threatsWithControls}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Vulnerability Coverage</span>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400">{vulnCoverage}%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">With Controls</span>
                  <span className="text-white font-medium">{vulnsWithControls}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Without Controls</span>
                  <span className="text-rose-400 font-medium">{vulnerabilities.length - vulnsWithControls}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}