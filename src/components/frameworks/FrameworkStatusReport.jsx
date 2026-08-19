import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function FrameworkStatusReport({ framework, controls, risks }) {
  const mappedControls = controls.filter(c => c.framework_mappings?.[framework]?.length > 0);
  const effectiveControls = mappedControls.filter(c => c.status === 'effective');
  const implementedControls = mappedControls.filter(c => c.status === 'implemented');
  const plannedControls = mappedControls.filter(c => c.status === 'planned');

  const complianceRate = mappedControls.length > 0 ? Math.round((effectiveControls.length / mappedControls.length) * 100) : 0;

  const statusData = [
    { name: 'Effective', value: effectiveControls.length, color: '#10b981' },
    { name: 'Implemented', value: implementedControls.length, color: '#f59e0b' },
    { name: 'Planned', value: plannedControls.length, color: '#ef4444' }
  ];

  const domainData = [
    { domain: 'Access Control', count: mappedControls.filter(c => c.domain === 'access_control').length },
    { domain: 'Data Protection', count: mappedControls.filter(c => c.domain === 'data_protection').length },
    { domain: 'Network Security', count: mappedControls.filter(c => c.domain === 'network_security').length },
    { domain: 'Incident Response', count: mappedControls.filter(c => c.domain === 'incident_response').length },
    { domain: 'Business Continuity', count: mappedControls.filter(c => c.domain === 'business_continuity').length }
  ].filter(d => d.count > 0);

  const downloadReport = () => {
    const report = `
${framework} COMPLIANCE STATUS REPORT
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Compliance Rate: ${complianceRate}%
Total Mapped Controls: ${mappedControls.length}
Effective Controls: ${effectiveControls.length}
Implemented Controls: ${implementedControls.length}
Planned Controls: ${plannedControls.length}

CONTROL STATUS BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${statusData.map(s => `${s.name}: ${s.value} (${Math.round((s.value / mappedControls.length) * 100)}%)`).join('\n')}

COVERAGE BY DOMAIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${domainData.map(d => `${d.domain}: ${d.count} controls`).join('\n')}

EFFECTIVE CONTROLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${effectiveControls.map(c => `• ${c.name} - ${c.domain}`).join('\n')}

CONTROLS REQUIRING ATTENTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${[...implementedControls, ...plannedControls].map(c => `• ${c.name} - Status: ${c.status}`).join('\n')}

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Focus on moving implemented controls to effective status through testing
2. Accelerate implementation of planned controls
3. Ensure all critical requirements are mapped
4. Conduct regular compliance assessments
5. Maintain comprehensive documentation
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${framework}_status_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              {framework} Compliance Status Report
            </CardTitle>
            <Button onClick={downloadReport} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Overall Compliance</span>
                <span className="text-white font-semibold">{complianceRate}%</span>
              </div>
              <Progress value={complianceRate} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{effectiveControls.length}</div>
                <div className="text-xs text-slate-400">Effective</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{implementedControls.length}</div>
                <div className="text-xs text-slate-400">Implemented</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-rose-400">{plannedControls.length}</div>
                <div className="text-xs text-slate-400">Planned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg">Control Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-2">Control Maturity Status</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• <span className="font-medium text-emerald-400">Effective:</span> Fully operational and validated</li>
                <li>• <span className="font-medium text-amber-400">Implemented:</span> Deployed, awaiting validation</li>
                <li>• <span className="font-medium text-rose-400">Planned:</span> Scheduled for future implementation</li>
              </ul>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-lg">Coverage by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <p className="text-xs font-semibold text-white mb-2">Domain Coverage Analysis</p>
              <p className="text-xs text-slate-400 mb-1">
                Distribution of controls across security domains
              </p>
              <p className="text-xs text-slate-500">
                Identifies concentration areas and potential coverage gaps
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="domain" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-emerald-500/5 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Effective Controls ({effectiveControls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {effectiveControls.map(control => (
                <div key={control.id} className="p-3 rounded-lg bg-[#1a2332] border border-emerald-500/20">
                  <h4 className="text-sm font-medium text-white">{control.name}</h4>
                  <Badge className="mt-1 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {control.domain}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Needs Attention ({implementedControls.length + plannedControls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {[...implementedControls, ...plannedControls].map(control => (
                <div key={control.id} className="p-3 rounded-lg bg-[#1a2332] border border-amber-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{control.name}</h4>
                      <Badge className="mt-1 text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                        {control.domain}
                      </Badge>
                    </div>
                    <Badge className={`ml-2 text-[10px] ${
                      control.status === 'implemented' 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {control.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}