import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function AIComplianceReportGenerator({ complianceItems, controls, risks, audits }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive compliance report with audit trail:

**COMPLIANCE STATUS:**
Total Requirements: ${complianceItems.length}
By Status:
- Implemented: ${complianceItems.filter(i => i.status === 'implemented').length}
- In Progress: ${complianceItems.filter(i => i.status === 'in_progress').length}
- Not Started: ${complianceItems.filter(i => i.status === 'not_started').length}
- Non-Compliant: ${complianceItems.filter(i => i.status === 'non_compliant').length}

By Framework:
${['GDPR', 'HIPAA', 'SOC2', 'ISO27001', 'PCI-DSS'].map(fw => {
  const items = complianceItems.filter(i => i.framework === fw);
  return `- ${fw}: ${items.length} requirements (${items.filter(i => i.status === 'implemented').length} implemented)`;
}).join('\n')}

**CONTROL ENVIRONMENT:**
Total Controls: ${controls.length}
Effective Controls: ${controls.filter(c => c.status === 'effective').length}

**RISK PROFILE:**
Total Risks: ${risks.length}
Critical/High: ${risks.filter(r => ['critical', 'high'].includes(r.overall_risk_rating?.toLowerCase())).length}

**AUDIT HISTORY:**
Completed Audits: ${audits?.filter(a => a.status === 'completed').length || 0}

Generate a formal compliance report including:
1. **Executive Summary** - High-level compliance posture
2. **Compliance Score** - Overall and by framework
3. **Framework Analysis** - Detailed status per framework
4. **Control Effectiveness** - Assessment of control environment
5. **Risk Assessment** - Compliance-related risks
6. **Gap Analysis** - Critical gaps and remediation
7. **Audit Trail** - Key compliance activities and changes
8. **Recommendations** - Strategic compliance improvements
9. **Timeline** - Compliance milestones and deadlines
10. **Certification Readiness** - Assessment for each framework`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            report_date: { type: "string" },
            reporting_period: { type: "string" },
            executive_summary: { type: "string" },
            overall_compliance_score: { type: "number" },
            compliance_status: { type: "string" },
            framework_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  score: { type: "number" },
                  status: { type: "string" },
                  summary: { type: "string" },
                  implemented: { type: "number" },
                  gaps: { type: "number" }
                }
              }
            },
            control_effectiveness: { type: "string" },
            risk_assessment: { type: "string" },
            gap_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  framework: { type: "string" },
                  severity: { type: "string" },
                  remediation: { type: "string" }
                }
              }
            },
            audit_trail: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  activity: { type: "string" },
                  framework: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            certification_readiness: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  readiness: { type: "string" },
                  estimated_time: { type: "string" }
                }
              }
            }
          }
        }
      });

      setReport(result);
      toast.success("Compliance report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!report) return;
    
    const fullReport = `
COMPLIANCE REPORT
Date: ${report.report_date}
Period: ${report.reporting_period}

EXECUTIVE SUMMARY
${report.executive_summary}

OVERALL COMPLIANCE: ${report.overall_compliance_score}% (${report.compliance_status})

FRAMEWORK ANALYSIS
${report.framework_analysis?.map(fw => `
${fw.framework}: ${fw.score}% (${fw.status})
Implemented: ${fw.implemented} | Gaps: ${fw.gaps}
${fw.summary}
`).join('\n')}

CONTROL EFFECTIVENESS
${report.control_effectiveness}

RISK ASSESSMENT
${report.risk_assessment}

CRITICAL GAPS
${report.gap_analysis?.map((gap, i) => `${i + 1}. [${gap.severity}] ${gap.framework}: ${gap.gap}\n   Remediation: ${gap.remediation}`).join('\n')}

AUDIT TRAIL
${report.audit_trail?.map(entry => `[${entry.date}] ${entry.framework}: ${entry.activity} (${entry.impact})`).join('\n')}

RECOMMENDATIONS
${report.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

CERTIFICATION READINESS
${report.certification_readiness?.map(cert => `${cert.framework}: ${cert.readiness} (Est: ${cert.estimated_time})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(fullReport);
    toast.success("Report copied to clipboard");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            AI Compliance Report Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            {report && (
              <Button onClick={copyReport} size="sm" variant="outline" className="border-[#2a3548]">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
            <Button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Generate comprehensive compliance report with audit trail</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {/* Header */}
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Compliance Report</h3>
                    <p className="text-xs text-slate-400">Generated: {report.report_date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{report.overall_compliance_score}%</div>
                    <Badge className={
                      report.compliance_status === 'Compliant' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }>
                      {report.compliance_status}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Executive Summary */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
              </Card>

              {/* Framework Analysis */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Framework Analysis</h4>
                <div className="space-y-2">
                  {report.framework_analysis?.map((fw, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white">{fw.framework}</h5>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            fw.status === 'Compliant' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }>
                            {fw.score}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{fw.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Implemented: {fw.implemented}</span>
                        <span>Gaps: {fw.gaps}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Gap Analysis */}
              {report.gap_analysis?.length > 0 && (
                <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Critical Gaps</h4>
                  <div className="space-y-2">
                    {report.gap_analysis.map((gap, idx) => (
                      <div key={idx} className="p-2 bg-[#151d2e] rounded border border-rose-500/30">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm text-white flex-1">{gap.gap}</p>
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                            {gap.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{gap.framework}</p>
                        <p className="text-xs text-slate-300">Remediation: {gap.remediation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Audit Trail */}
              <Card className="bg-[#151d2e] border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Audit Trail</h4>
                <div className="space-y-2">
                  {report.audit_trail?.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="text-xs text-slate-400 w-24 flex-shrink-0">{entry.date}</div>
                      <div className="flex-1">
                        <p className="text-white">{entry.activity}</p>
                        <p className="text-xs text-slate-400">{entry.framework} • {entry.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Certification Readiness */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Certification Readiness</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.certification_readiness?.map((cert, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <h5 className="text-sm font-medium text-white mb-1">{cert.framework}</h5>
                      <div className="flex items-center justify-between">
                        <Badge className={
                          cert.readiness === 'Ready' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {cert.readiness}
                        </Badge>
                        <span className="text-xs text-slate-400">{cert.estimated_time}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}