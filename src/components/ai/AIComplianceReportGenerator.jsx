import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIComplianceReportGenerator({ 
  risks = [], 
  controls = [], 
  compliance = [],
  incidents = [],
  audits = []
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [framework, setFramework] = useState("SOX");
  const [reportType, setReportType] = useState("executive");

  const frameworks = ["SOX", "SOC2", "ISO27001", "GDPR", "PCI-DSS", "HIPAA", "NIST", "COBIT"];
  const reportTypes = [
    { value: "executive", label: "Executive Summary" },
    { value: "detailed", label: "Detailed Compliance Report" },
    { value: "audit_ready", label: "Audit-Ready Package" },
    { value: "gap_analysis", label: "Gap Analysis Report" }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      // Calculate metrics
      const frameworkCompliance = compliance.filter(c => c.framework === framework);
      const compliantCount = frameworkCompliance.filter(c => 
        c.status === 'verified' || c.status === 'implemented'
      ).length;
      const complianceRate = frameworkCompliance.length > 0 
        ? ((compliantCount / frameworkCompliance.length) * 100).toFixed(1)
        : 0;

      const linkedControls = controls.filter(c => 
        c.regulatory_mappings?.includes(framework) ||
        c.framework_mappings?.[framework]?.length > 0
      );

      const effectiveControls = linkedControls.filter(c => c.effectiveness >= 3).length;
      const controlEffectiveness = linkedControls.length > 0
        ? ((effectiveControls / linkedControls.length) * 100).toFixed(1)
        : 0;

      const frameworkRisks = risks.filter(r => 
        r.related_regulations?.includes(framework)
      );

      const criticalRisks = frameworkRisks.filter(r => 
        ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 16
      ).length;

      const recentIncidents = incidents.filter(i => {
        const date = new Date(i.reported_date);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return date >= ninetyDaysAgo;
      });

      const prompt = `You are a compliance and regulatory reporting expert. Generate a comprehensive ${reportType} compliance report for ${framework}.

COMPLIANCE DATA:
- Framework: ${framework}
- Total Requirements: ${frameworkCompliance.length}
- Compliant Requirements: ${compliantCount}
- Compliance Rate: ${complianceRate}%
- Non-Compliant: ${frameworkCompliance.filter(c => c.status === 'non_compliant').length}
- In Progress: ${frameworkCompliance.filter(c => c.status === 'in_progress').length}

CONTROL LANDSCAPE:
- Total ${framework} Controls: ${linkedControls.length}
- Effective Controls: ${effectiveControls}
- Control Effectiveness: ${controlEffectiveness}%
- Planned Controls: ${linkedControls.filter(c => c.status === 'planned').length}

RISK PROFILE:
- ${framework}-Related Risks: ${frameworkRisks.length}
- Critical Risks: ${criticalRisks}
- High Risks: ${frameworkRisks.filter(r => {
  const s = ((r.residual_likelihood || 0) * (r.residual_impact || 0));
  return s >= 12 && s < 16;
}).length}

INCIDENT DATA (Last 90 Days):
- Total Incidents: ${recentIncidents.length}
- Critical: ${recentIncidents.filter(i => i.severity === 'critical').length}
- Compliance-Related: ${recentIncidents.filter(i => i.linked_compliance?.length > 0).length}

AUDIT STATUS:
- Recent Audits: ${audits.filter(a => a.type === 'external' || a.type === 'regulatory').length}
- Open Findings: ${audits.reduce((sum, a) => sum + (a.findings_count || 0), 0)}

GENERATE A ${reportType.toUpperCase()} REPORT WITH:

${reportType === 'executive' ? `
1. **Executive Summary** (2-3 paragraphs)
2. **Compliance Status Overview** - Current state, trends, key achievements
3. **Key Findings** - Top 5 most important points
4. **Risk Summary** - Critical compliance risks
5. **Recommendations** - Top 3 priority actions
6. **Overall Compliance Score** (0-100)
` : ''}

${reportType === 'detailed' ? `
1. **Compliance Status by Requirement** - Detailed breakdown
2. **Control Assessment** - Each control with effectiveness ratings
3. **Gap Analysis** - Specific gaps and remediation plans
4. **Evidence Summary** - Documentation status
5. **Risk Register** - Compliance-related risks
6. **Incident Analysis** - Impact on compliance posture
7. **Action Items** - Detailed remediation roadmap
` : ''}

${reportType === 'audit_ready' ? `
1. **Audit Preparation Checklist**
2. **Evidence Package** - What evidence exists
3. **Control Testing Results**
4. **Exception Summary** - Any deviations
5. **Remediation Status** - Progress on prior findings
6. **Documentation Index**
7. **Management Representation**
` : ''}

${reportType === 'gap_analysis' ? `
1. **Current vs Required State**
2. **Gap Identification** - Specific gaps by requirement
3. **Priority Ranking** - Which gaps are most critical
4. **Resource Requirements**
5. **Implementation Timeline**
6. **Quick Wins vs Long-term Projects**
` : ''}

Format the report professionally with clear sections, actionable insights, and specific data points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            report_title: { type: "string" },
            generated_date: { type: "string" },
            executive_summary: { type: "string" },
            overall_compliance_score: { type: "number" },
            compliance_status: { type: "string" },
            key_findings: {
              type: "array",
              items: { type: "string" }
            },
            risk_summary: { type: "string" },
            control_assessment: { type: "string" },
            gap_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  current_state: { type: "string" },
                  gap: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            incident_impact: { type: "string" },
            next_steps: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setReport({ ...response, framework, reportType });
      toast.success("Compliance report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const content = `
${report.report_title}
${report.generated_date}
Framework: ${report.framework}

EXECUTIVE SUMMARY
${report.executive_summary}

Overall Compliance Score: ${report.overall_compliance_score}/100
Status: ${report.compliance_status}

KEY FINDINGS
${report.key_findings?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'None'}

RISK SUMMARY
${report.risk_summary}

CONTROL ASSESSMENT
${report.control_assessment}

${report.gap_analysis?.length > 0 ? `
GAP ANALYSIS
${report.gap_analysis.map((g, i) => `
${i + 1}. ${g.requirement}
   Current State: ${g.current_state}
   Gap: ${g.gap}
   Priority: ${g.priority}
`).join('\n')}
` : ''}

RECOMMENDATIONS
${report.recommendations?.map((r, i) => `${i + 1}. ${r.action} (${r.priority}, ${r.timeline})`).join('\n') || 'None'}

${report.incident_impact ? `
INCIDENT IMPACT
${report.incident_impact}
` : ''}

NEXT STEPS
${report.next_steps?.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${framework}_Compliance_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success("Report downloaded");
  };

  const scoreColor = (score) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Compliance Report Generator</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated compliance reporting & gap analysis
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">Framework</label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {frameworks.map(fw => (
                    <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateReport}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate {reportTypes.find(t => t.value === reportType)?.label}
          </Button>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-3" />
              <p className="text-sm text-slate-400">Aggregating compliance data and generating report...</p>
            </div>
          )}

          {report && (
            <div className="space-y-4">
              {/* Header */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{report.report_title}</h3>
                    <p className="text-xs text-slate-400">{report.generated_date}</p>
                  </div>
                  <Button size="sm" onClick={downloadReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="text-3xl font-bold">
                    <span className={scoreColor(report.overall_compliance_score)}>
                      {report.overall_compliance_score}
                    </span>
                    <span className="text-slate-500 text-lg">/100</span>
                  </div>
                  <Badge className={
                    report.overall_compliance_score >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                    report.overall_compliance_score >= 75 ? "bg-amber-500/20 text-amber-400" :
                    "bg-rose-500/20 text-rose-400"
                  }>
                    {report.compliance_status}
                  </Badge>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{report.executive_summary}</p>
              </div>

              {/* Key Findings */}
              {report.key_findings?.length > 0 && (
                <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                  <h4 className="text-sm font-semibold text-white mb-3">Key Findings</h4>
                  <div className="space-y-2">
                    {report.key_findings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gap Analysis */}
              {report.gap_analysis?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Gap Analysis
                  </h4>
                  <div className="space-y-2">
                    {report.gap_analysis.map((gap, idx) => (
                      <div key={idx} className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs">{gap.priority}</Badge>
                          <h5 className="text-sm font-semibold text-white">{gap.requirement}</h5>
                        </div>
                        <div className="text-xs text-slate-400 mb-1">
                          <span className="text-slate-300 font-semibold">Current:</span> {gap.current_state}
                        </div>
                        <div className="text-xs text-slate-400">
                          <span className="text-slate-300 font-semibold">Gap:</span> {gap.gap}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {report.recommendations?.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-white mb-3">Priority Recommendations</h4>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Badge className="text-xs mt-0.5">{rec.priority}</Badge>
                        <div className="flex-1">
                          <p className="text-xs text-white">{rec.action}</p>
                          <p className="text-xs text-slate-400 mt-1">{rec.timeline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {report.next_steps?.length > 0 && (
                <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                  <h4 className="text-sm font-semibold text-white mb-3">Next Steps</h4>
                  <div className="space-y-1">
                    {report.next_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-400 font-bold text-[10px]">{idx + 1}</span>
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}