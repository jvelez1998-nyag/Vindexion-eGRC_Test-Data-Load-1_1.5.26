import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Copy, Download, Brain } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIVendorAuditReportGenerator({ audit, vendor, analysisData }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const generateReport = async () => {
    setLoading(true);
    try {
      const prompt = `Generate comprehensive vendor audit report:

**VENDOR:** ${vendor.name}
**AUDIT:** ${audit.audit_name}
**AUDIT TYPE:** ${audit.audit_type}
**STATUS:** ${audit.status}
**SCOPE:** ${audit.scope}

${analysisData ? `**ANALYSIS FINDINGS:**
Compliance Gaps: ${analysisData.compliance_gaps?.length || 0}
Control Deficiencies: ${analysisData.control_deficiencies?.length || 0}
Risk Level: ${analysisData.risk_assessment?.overall_risk}` : ''}

Generate formal audit report including:
1. **Executive Summary** - High-level overview for leadership
2. **Audit Background** - Context and methodology
3. **Scope and Objectives** - What was audited
4. **Findings Summary** - Key issues identified
5. **Detailed Findings** - Categorized by severity and domain
6. **Risk Assessment** - Overall risk evaluation
7. **Recommendations** - Prioritized actions
8. **Management Response** - Required actions
9. **Audit Trail** - Timeline of activities
10. **Conclusion** - Overall assessment and next steps`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            report_date: { type: "string" },
            audit_period: { type: "string" },
            executive_summary: { type: "string" },
            audit_background: { type: "string" },
            methodology: { type: "string" },
            findings_summary: {
              type: "object",
              properties: {
                total_findings: { type: "number" },
                critical: { type: "number" },
                high: { type: "number" },
                medium: { type: "number" },
                low: { type: "number" },
                summary_text: { type: "string" }
              }
            },
            detailed_findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  finding_id: { type: "string" },
                  title: { type: "string" },
                  severity: { type: "string" },
                  domain: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  recommendation: { type: "string" },
                  management_response: { type: "string" },
                  target_date: { type: "string" }
                }
              }
            },
            overall_risk_rating: { type: "string" },
            risk_narrative: { type: "string" },
            key_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  responsible_party: { type: "string" }
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
                  performed_by: { type: "string" }
                }
              }
            },
            conclusion: { type: "string" },
            next_steps: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setReport(result);
      toast.success("Audit report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.VendorAudit.update(audit.id, {
        audit_report: report,
        status: 'completed',
        completion_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
      toast.success("Report saved to audit");
    }
  });

  const copyReport = () => {
    if (!report) return;
    
    const fullReport = `
VENDOR AUDIT REPORT
Report Date: ${report.report_date}
Audit Period: ${report.audit_period}

EXECUTIVE SUMMARY
${report.executive_summary}

AUDIT BACKGROUND
${report.audit_background}

METHODOLOGY
${report.methodology}

FINDINGS SUMMARY
Total Findings: ${report.findings_summary?.total_findings}
- Critical: ${report.findings_summary?.critical}
- High: ${report.findings_summary?.high}
- Medium: ${report.findings_summary?.medium}
- Low: ${report.findings_summary?.low}

${report.findings_summary?.summary_text}

DETAILED FINDINGS
${report.detailed_findings?.map((f, i) => `
${i + 1}. [${f.severity}] ${f.title}
Domain: ${f.domain}
Description: ${f.description}
Impact: ${f.impact}
Recommendation: ${f.recommendation}
Management Response: ${f.management_response}
Target Date: ${f.target_date}
`).join('\n')}

OVERALL RISK RATING: ${report.overall_risk_rating}
${report.risk_narrative}

KEY RECOMMENDATIONS
${report.key_recommendations?.map((r, i) => `${i + 1}. [${r.priority}] ${r.recommendation}
   Timeline: ${r.timeline} | Responsible: ${r.responsible_party}`).join('\n')}

AUDIT TRAIL
${report.audit_trail?.map(a => `[${a.date}] ${a.activity} - ${a.performed_by}`).join('\n')}

CONCLUSION
${report.conclusion}

NEXT STEPS
${report.next_steps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(fullReport);
    toast.success("Report copied");
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            AI Audit Report Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            {report && (
              <>
                <Button onClick={copyReport} size="sm" variant="outline" className="border-[#2a3548]">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() => saveReportMutation.mutate()}
                  disabled={saveReportMutation.isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save to Audit
                </Button>
              </>
            )}
            <Button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Generate comprehensive AI-powered audit report</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {/* Header */}
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
                <h3 className="text-lg font-bold text-white mb-1">Vendor Audit Report</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Report Date: {report.report_date}</span>
                  <span>Audit Period: {report.audit_period}</span>
                </div>
              </Card>

              {/* Executive Summary */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
              </Card>

              {/* Findings Summary */}
              <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Findings Summary</h4>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <div className="text-center p-2 bg-[#151d2e] rounded">
                    <div className="text-xl font-bold text-white">{report.findings_summary?.total_findings}</div>
                    <div className="text-xs text-slate-400">Total</div>
                  </div>
                  <div className="text-center p-2 bg-rose-500/20 rounded">
                    <div className="text-xl font-bold text-rose-400">{report.findings_summary?.critical}</div>
                    <div className="text-xs text-slate-400">Critical</div>
                  </div>
                  <div className="text-center p-2 bg-orange-500/20 rounded">
                    <div className="text-xl font-bold text-orange-400">{report.findings_summary?.high}</div>
                    <div className="text-xs text-slate-400">High</div>
                  </div>
                  <div className="text-center p-2 bg-amber-500/20 rounded">
                    <div className="text-xl font-bold text-amber-400">{report.findings_summary?.medium}</div>
                    <div className="text-xs text-slate-400">Medium</div>
                  </div>
                  <div className="text-center p-2 bg-blue-500/20 rounded">
                    <div className="text-xl font-bold text-blue-400">{report.findings_summary?.low}</div>
                    <div className="text-xs text-slate-400">Low</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{report.findings_summary?.summary_text}</p>
              </Card>

              {/* Detailed Findings */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Detailed Findings</h4>
                <div className="space-y-2">
                  {report.detailed_findings?.map((finding, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500">{finding.finding_id}</span>
                            <h5 className="text-sm font-semibold text-white">{finding.title}</h5>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{finding.description}</p>
                        </div>
                        <Badge className={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500">Impact: </span>
                          <span className="text-slate-300">{finding.impact}</span>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded">
                          <span className="text-slate-500">Recommendation: </span>
                          <span className="text-blue-300">{finding.recommendation}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Target: {finding.target_date}</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            {finding.domain}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Risk Rating */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">Overall Risk Rating</h4>
                  <Badge className={getSeverityColor(report.overall_risk_rating)}>
                    {report.overall_risk_rating}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300">{report.risk_narrative}</p>
              </Card>

              {/* Audit Trail */}
              <Card className="bg-[#151d2e] border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Audit Trail</h4>
                <div className="space-y-2">
                  {report.audit_trail?.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="text-xs text-slate-400 w-20 flex-shrink-0">{entry.date}</div>
                      <div className="flex-1">
                        <p className="text-white">{entry.activity}</p>
                        <p className="text-xs text-slate-400">{entry.performed_by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}