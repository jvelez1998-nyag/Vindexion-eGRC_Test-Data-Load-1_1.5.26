import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Download, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AutomatedDueDiligenceReport({ vendor, riskAssessment, complianceAnalysis }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive due diligence report for vendor onboarding and ongoing management:

**VENDOR INFORMATION:**
- Name: ${vendor.name}
- Category: ${vendor.vendor_category}
- Industry: ${vendor.industry}
- Tier: ${vendor.tier}
- Services: ${vendor.services_provided}
- Contract Value: ${vendor.contract_value}
- Contract Period: ${vendor.contract_start_date} to ${vendor.contract_end_date}
- Status: ${vendor.status}

**RISK ASSESSMENT RESULTS:**
${riskAssessment ? `
- Overall Risk Score: ${riskAssessment.overall_risk_score}/100 (${riskAssessment.risk_level})
- Security Risk: ${riskAssessment.category_scores?.security}/100
- Compliance Risk: ${riskAssessment.category_scores?.compliance}/100
- Financial Risk: ${riskAssessment.category_scores?.financial}/100
- Key Risk Factors: ${riskAssessment.key_risk_factors?.map(f => f.factor).join(', ')}
- Red Flags: ${riskAssessment.red_flags?.join(', ') || 'None'}
` : 'Risk assessment not performed'}

**COMPLIANCE ANALYSIS:**
${complianceAnalysis ? `
- Compliance Score: ${complianceAnalysis.overall_compliance_score}%
- Status: ${complianceAnalysis.compliance_status}
- Missing Certifications: ${complianceAnalysis.missing_certifications?.map(c => c.certification).join(', ') || 'None'}
` : 'Compliance analysis not performed'}

**REPORT REQUIREMENTS:**
Generate a professional due diligence report including:

1. **Executive Summary** - High-level overview and recommendation
2. **Vendor Profile** - Company background and services
3. **Risk Assessment Summary** - Key findings and risk level
4. **Compliance Posture** - Certifications and frameworks
5. **Financial Stability** - Assessment based on available data
6. **Security & Data Protection** - Controls and practices
7. **Operational Capabilities** - Service delivery assessment
8. **Recommendations** - Go/No-Go decision with conditions
9. **Mitigation Requirements** - Mandatory controls before onboarding
10. **Ongoing Monitoring Plan** - KPIs and review schedule

Format as a formal business report suitable for executive review.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            report_date: { type: "string" },
            recommendation: { type: "string" },
            executive_summary: { type: "string" },
            vendor_profile: { type: "string" },
            risk_summary: { type: "string" },
            compliance_summary: { type: "string" },
            financial_assessment: { type: "string" },
            security_assessment: { type: "string" },
            operational_assessment: { type: "string" },
            key_findings: {
              type: "array",
              items: { type: "string" }
            },
            recommendations_detail: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            mitigation_requirements: {
              type: "array",
              items: { type: "string" }
            },
            monitoring_plan: {
              type: "object",
              properties: {
                frequency: { type: "string" },
                kpis: {
                  type: "array",
                  items: { type: "string" }
                },
                escalation_triggers: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            decision: { type: "string" }
          }
        }
      });

      setReport(result);
      
      // Store report in vendor notes
      await base44.entities.Vendor.update(vendor.id, {
        notes: `${vendor.notes || ''}\n\n**Due Diligence Report Generated: ${new Date().toISOString()}**\nDecision: ${result.decision}\nRecommendation: ${result.recommendation}`
      });

      toast.success("Due diligence report generated");
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
DUE DILIGENCE REPORT
Vendor: ${vendor.name}
Date: ${report.report_date}
Decision: ${report.decision}

EXECUTIVE SUMMARY
${report.executive_summary}

RECOMMENDATION: ${report.recommendation}

VENDOR PROFILE
${report.vendor_profile}

RISK ASSESSMENT
${report.risk_summary}

COMPLIANCE POSTURE
${report.compliance_summary}

FINANCIAL STABILITY
${report.financial_assessment}

SECURITY & DATA PROTECTION
${report.security_assessment}

OPERATIONAL CAPABILITIES
${report.operational_assessment}

KEY FINDINGS
${report.key_findings?.map((f, i) => `${i + 1}. ${f}`).join('\n')}

RECOMMENDATIONS
${report.recommendations_detail?.map((r, i) => `${i + 1}. [${r.priority}] ${r.recommendation}`).join('\n')}

MITIGATION REQUIREMENTS
${report.mitigation_requirements?.map((m, i) => `${i + 1}. ${m}`).join('\n')}

MONITORING PLAN
Frequency: ${report.monitoring_plan?.frequency}
KPIs: ${report.monitoring_plan?.kpis?.join(', ')}
Escalation Triggers: ${report.monitoring_plan?.escalation_triggers?.join(', ')}
    `.trim();

    navigator.clipboard.writeText(fullReport);
    toast.success("Report copied to clipboard");
  };

  const getDecisionColor = (decision) => {
    if (decision?.toLowerCase().includes('approve')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (decision?.toLowerCase().includes('conditional')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Automated Due Diligence Report
          </CardTitle>
          <div className="flex items-center gap-2">
            {report && (
              <Button
                onClick={copyReport}
                size="sm"
                variant="outline"
                className="border-[#2a3548]"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
            <Button
              onClick={generateReport}
              disabled={loading}
              size="sm"
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
            <p className="text-slate-400 text-sm mb-2">Generate comprehensive due diligence report</p>
            <p className="text-slate-500 text-xs">Includes risk assessment, compliance analysis, and recommendations</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {/* Header */}
              <Card className={`p-4 ${getDecisionColor(report.decision)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Due Diligence Report</h3>
                    <p className="text-xs text-slate-400">Generated: {report.report_date}</p>
                  </div>
                  <Badge className={getDecisionColor(report.decision)}>
                    {report.decision}
                  </Badge>
                </div>
                <div className="p-3 bg-[#151d2e] rounded border border-current">
                  <p className="text-xs text-slate-400 mb-1">Recommendation:</p>
                  <p className="text-sm text-white font-medium">{report.recommendation}</p>
                </div>
              </Card>

              {/* Executive Summary */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
              </Card>

              {/* Vendor Profile */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Vendor Profile</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{report.vendor_profile}</p>
              </Card>

              {/* Assessment Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Risk Assessment</h4>
                  <p className="text-sm text-slate-300">{report.risk_summary}</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Compliance Posture</h4>
                  <p className="text-sm text-slate-300">{report.compliance_summary}</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Financial Stability</h4>
                  <p className="text-sm text-slate-300">{report.financial_assessment}</p>
                </Card>
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Security Assessment</h4>
                  <p className="text-sm text-slate-300">{report.security_assessment}</p>
                </Card>
              </div>

              {/* Key Findings */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Key Findings</h4>
                <div className="space-y-2">
                  {report.key_findings?.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Detailed Recommendations</h4>
                <div className="space-y-2">
                  {report.recommendations_detail?.map((rec, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-white flex-1">{rec.recommendation}</p>
                        <Badge className={
                          rec.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {rec.priority}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mitigation Requirements */}
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Mitigation Requirements</h4>
                <div className="space-y-1">
                  {report.mitigation_requirements?.map((req, idx) => (
                    <div key={idx} className="text-sm text-slate-300">
                      {idx + 1}. {req}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Monitoring Plan */}
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Ongoing Monitoring Plan</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Review Frequency:</p>
                    <p className="text-sm text-white">{report.monitoring_plan?.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Key Performance Indicators:</p>
                    <div className="space-y-1">
                      {report.monitoring_plan?.kpis?.map((kpi, idx) => (
                        <div key={idx} className="text-sm text-slate-300">• {kpi}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Escalation Triggers:</p>
                    <div className="space-y-1">
                      {report.monitoring_plan?.escalation_triggers?.map((trigger, idx) => (
                        <div key={idx} className="text-sm text-slate-300">• {trigger}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}