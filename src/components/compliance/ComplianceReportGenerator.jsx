import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Brain, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import SecureExport from "@/components/security/SecureExport";
import { format } from "date-fns";

export default function ComplianceReportGenerator({ controls, compliance, risks }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [includeGaps, setIncludeGaps] = useState(true);
  const [includeControls, setIncludeControls] = useState(true);
  const [includeRisks, setIncludeRisks] = useState(true);

  async function generateReport() {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive compliance status report with gap analysis.

COMPLIANCE STATUS (${compliance.length} requirements):
${compliance.slice(0, 30).map(c => `- ${c.framework}: ${c.requirement} (${c.status})`).join('\n')}

CONTROLS (${controls.length} controls):
${controls.slice(0, 30).map(c => `- ${c.name} (${c.domain}, Effectiveness: ${c.effectiveness}/5, Status: ${c.status})`).join('\n')}

RISKS (${risks.length} risks):
${risks.slice(0, 20).map(r => `- ${r.title} (${r.category}, Score: ${(r.residual_likelihood || 0) * (r.residual_impact || 0)})`).join('\n')}

GENERATE COMPREHENSIVE REPORT:

1. **Executive Summary**:
   - Overall compliance posture
   - Key achievements
   - Critical gaps
   - Risk exposure

2. **Framework-Specific Status** (SOC2, ISO27001, NIST, PCI-DSS, HIPAA):
   - Compliance percentage
   - Met requirements
   - Outstanding requirements
   - Timeline to full compliance

3. **Gap Analysis** (15-20 gaps):
   - Unmet requirements
   - Control deficiencies
   - Risk implications
   - Remediation priorities

4. **Control Effectiveness Assessment**:
   - Effective controls
   - Controls needing improvement
   - Coverage gaps

5. **Recommendations**:
   - Immediate actions (next 30 days)
   - Short-term actions (90 days)
   - Strategic initiatives

Provide detailed, executive-ready report.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: {
              type: "object",
              properties: {
                overall_posture: { type: "string" },
                key_achievements: { type: "array", items: { type: "string" } },
                critical_gaps: { type: "array", items: { type: "string" } },
                risk_exposure: { type: "string" }
              }
            },
            framework_status: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  compliance_percentage: { type: "number" },
                  met_requirements: { type: "number" },
                  outstanding_requirements: { type: "number" },
                  timeline_to_full_compliance: { type: "string" },
                  key_gaps: { type: "array", items: { type: "string" } }
                }
              }
            },
            gap_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap_title: { type: "string" },
                  framework: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  risk_implications: { type: "string" },
                  remediation_priority: { type: "string" },
                  estimated_effort: { type: "string" }
                }
              }
            },
            control_assessment: {
              type: "object",
              properties: {
                effective_controls: { type: "number" },
                controls_needing_improvement: { type: "number" },
                coverage_gaps: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: {
              type: "object",
              properties: {
                immediate_actions: { type: "array", items: { type: "string" } },
                short_term_actions: { type: "array", items: { type: "string" } },
                strategic_initiatives: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setReport(result);
      toast.success("Compliance report generated");
    } catch (error) {
      console.error(error);
      toast.error("Report generation failed");
    } finally {
      setLoading(false);
    }
  }

  const exportReportData = () => {
    if (!report) return [];

    const data = [
      { Section: 'Executive Summary', Content: report.executive_summary.overall_posture },
      ...report.framework_status.map(f => ({
        Section: 'Framework Status',
        Framework: f.framework,
        'Compliance %': f.compliance_percentage,
        'Met': f.met_requirements,
        'Outstanding': f.outstanding_requirements,
        'Timeline': f.timeline_to_full_compliance
      })),
      ...report.gap_analysis.map(g => ({
        Section: 'Gaps',
        'Gap': g.gap_title,
        Framework: g.framework,
        Severity: g.severity,
        Description: g.description,
        Priority: g.remediation_priority
      }))
    ];

    return data;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-blue-500/20">
        <CardContent className="p-6">
          {!report ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Automated Compliance Reporting</h3>
                <p className="text-sm text-slate-400">
                  Generate comprehensive compliance status reports with AI-powered gap analysis.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="gaps" checked={includeGaps} onCheckedChange={setIncludeGaps} />
                  <Label htmlFor="gaps" className="text-sm text-white cursor-pointer">
                    Include gap analysis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="controls" checked={includeControls} onCheckedChange={setIncludeControls} />
                  <Label htmlFor="controls" className="text-sm text-white cursor-pointer">
                    Include control effectiveness
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="risks" checked={includeRisks} onCheckedChange={setIncludeRisks} />
                  <Label htmlFor="risks" className="text-sm text-white cursor-pointer">
                    Include risk integration
                  </Label>
                </div>
              </div>

              <Button onClick={generateReport} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Compliance Report
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Compliance Report</h3>
                  <p className="text-sm text-slate-400">Generated {format(new Date(), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div className="flex gap-2">
                  <SecureExport
                    data={exportReportData()}
                    filename={`compliance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`}
                    entityType="Compliance"
                  />
                  <Button onClick={generateReport} variant="outline" className="border-blue-500/30 text-blue-400">
                    <Brain className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <div className="grid grid-cols-1 gap-4">
          {/* Executive Summary */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-300">{report.executive_summary.overall_posture}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h5 className="text-xs font-semibold text-emerald-400 mb-2">Key Achievements:</h5>
                  <ul className="space-y-1">
                    {report.executive_summary.key_achievements.map((achievement, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {achievement}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h5 className="text-xs font-semibold text-red-400 mb-2">Critical Gaps:</h5>
                  <ul className="space-y-1">
                    {report.executive_summary.critical_gaps.map((gap, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h5 className="text-xs font-semibold text-amber-400 mb-1">Risk Exposure:</h5>
                <p className="text-xs text-slate-300">{report.executive_summary.risk_exposure}</p>
              </div>
            </CardContent>
          </Card>

          {/* Framework Status */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Framework Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.framework_status.map((framework, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-semibold text-white">{framework.framework}</h5>
                      <Badge className={`${
                        framework.compliance_percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        framework.compliance_percentage >= 60 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {framework.compliance_percentage}%
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Met: {framework.met_requirements}</p>
                      <p>Outstanding: {framework.outstanding_requirements}</p>
                      <p>Timeline: {framework.timeline_to_full_compliance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Gap Analysis ({report.gap_analysis.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {report.gap_analysis.map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white flex-1">{gap.gap_title}</h5>
                        <Badge className={`${
                          gap.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          gap.severity === 'High' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">{gap.framework}</Badge>
                      <p className="text-xs text-slate-400 mb-2">{gap.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Priority:</span>
                          <span className="text-white ml-2">{gap.remediation_priority}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Effort:</span>
                          <span className="text-white ml-2">{gap.estimated_effort}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h5 className="text-xs font-semibold text-red-400 mb-2">Immediate (30 days):</h5>
                  <ul className="space-y-1">
                    {report.recommendations.immediate_actions.map((action, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h5 className="text-xs font-semibold text-amber-400 mb-2">Short-term (90 days):</h5>
                  <ul className="space-y-1">
                    {report.recommendations.short_term_actions.map((action, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h5 className="text-xs font-semibold text-blue-400 mb-2">Strategic:</h5>
                  <ul className="space-y-1">
                    {report.recommendations.strategic_initiatives.map((initiative, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {initiative}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}