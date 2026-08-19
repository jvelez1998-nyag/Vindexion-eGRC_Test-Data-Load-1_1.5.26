import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, FileCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const REGULATIONS = [
  { id: 'sox', name: 'SOX (Sarbanes-Oxley)', areas: ['Financial Controls', 'Internal Controls', 'Audit Requirements'] },
  { id: 'gdpr', name: 'GDPR', areas: ['Data Protection', 'Privacy Rights', 'Consent Management'] },
  { id: 'iso27001', name: 'ISO 27001', areas: ['Information Security', 'Risk Management', 'Access Control'] },
  { id: 'hipaa', name: 'HIPAA', areas: ['PHI Protection', 'Security Safeguards', 'Privacy Rules'] },
  { id: 'pci-dss', name: 'PCI-DSS', areas: ['Payment Security', 'Encryption', 'Network Security'] },
  { id: 'nist', name: 'NIST CSF', areas: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'] }
];

export default function AIComplianceGapAnalyzer({ client }) {
  const [loading, setLoading] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const runGapAnalysis = async () => {
    if (!selectedRegulation) {
      toast.error("Please select a regulation");
      return;
    }

    setLoading(true);
    try {
      const regulation = REGULATIONS.find(r => r.id === selectedRegulation);
      
      const prompt = `As a compliance expert, conduct a comprehensive gap analysis for this client against ${regulation.name}.

CLIENT DATA:
${JSON.stringify(client, null, 2)}

REGULATION: ${regulation.name}
KEY AREAS: ${regulation.areas.join(', ')}

Perform detailed gap analysis and provide:

1. **Overall Compliance Score** (0-100): Current compliance level
2. **Compliance Status**: "compliant", "partially_compliant", "non_compliant", or "needs_assessment"
3. **Critical Gaps**: Array of critical compliance gaps with:
   - gap_title
   - requirement (specific regulation requirement)
   - current_state (what exists now)
   - gap_description (what's missing)
   - risk_level: "critical", "high", "medium", or "low"
   - remediation_effort (hours/days)
4. **Strengths**: Array of areas where client is compliant
5. **Quick Wins**: Easy improvements with high impact
6. **Remediation Roadmap**: Prioritized action plan with timelines
7. **Estimated Timeline**: Overall time to achieve compliance
8. **Budget Estimate**: Rough cost estimate for remediation
9. **Next Steps**: Immediate actions to take

Be specific to the regulation and provide actionable insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_compliance_score: { type: "number" },
            compliance_status: { type: "string" },
            critical_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap_title: { type: "string" },
                  requirement: { type: "string" },
                  current_state: { type: "string" },
                  gap_description: { type: "string" },
                  risk_level: { type: "string" },
                  remediation_effort: { type: "string" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            quick_wins: { type: "array", items: { type: "string" } },
            remediation_roadmap: { type: "array", items: { type: "string" } },
            estimated_timeline: { type: "string" },
            budget_estimate: { type: "string" },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis({ ...response, regulation: regulation.name });
      toast.success("Gap analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze compliance gaps");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      compliant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      partially_compliant: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      non_compliant: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      needs_assessment: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.needs_assessment;
  };

  const getRiskColor = (level) => {
    const colors = {
      critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[level] || colors.medium;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-cyan-400" />
          AI Compliance Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
            <SelectTrigger className="flex-1 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue placeholder="Select regulation..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              {REGULATIONS.map(reg => (
                <SelectItem key={reg.id} value={reg.id} className="text-white">
                  {reg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={runGapAnalysis}
            disabled={loading || !selectedRegulation}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-3">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">{analysis.regulation} Compliance</span>
                    <Badge className={getStatusColor(analysis.compliance_status)}>
                      {analysis.compliance_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {analysis.overall_compliance_score}%
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <span className="text-slate-500">Timeline:</span>
                      <span className="text-white ml-1">{analysis.estimated_timeline}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Budget:</span>
                      <span className="text-white ml-1">{analysis.budget_estimate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analysis.critical_gaps?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-rose-400" />
                      Critical Gaps ({analysis.critical_gaps.length})
                    </h4>
                    <div className="space-y-2">
                      {analysis.critical_gaps.map((gap, idx) => (
                        <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-xs font-semibold text-white">{gap.gap_title}</h5>
                              <Badge className={getRiskColor(gap.risk_level)}>
                                {gap.risk_level}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-[10px]">
                              <div>
                                <span className="text-slate-500">Requirement:</span>
                                <p className="text-slate-300">{gap.requirement}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Current State:</span>
                                <p className="text-slate-300">{gap.current_state}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Gap:</span>
                                <p className="text-slate-300">{gap.gap_description}</p>
                              </div>
                              <div className="pt-1">
                                <Badge className="text-[8px] bg-blue-500/10 text-blue-400">
                                  Effort: {gap.remediation_effort}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.strengths?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Strengths
                    </h4>
                    <div className="space-y-1">
                      {analysis.strengths.map((strength, idx) => (
                        <div key={idx} className="text-[10px] text-slate-300 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          ✓ {strength}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.quick_wins?.length > 0 && (
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardContent className="p-3">
                    <h4 className="text-xs font-semibold text-white mb-2">Quick Wins</h4>
                    <div className="space-y-1">
                      {analysis.quick_wins.map((win, idx) => (
                        <div key={idx} className="text-[10px] text-slate-300 p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {idx + 1}. {win}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-white mb-2">Remediation Roadmap</h4>
                  <div className="space-y-1">
                    {analysis.remediation_roadmap.map((step, idx) => (
                      <div key={idx} className="text-[10px] text-slate-300 p-2 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2">
                        <span className="font-bold text-indigo-400">{idx + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-white mb-2">Next Steps</h4>
                  <div className="space-y-1">
                    {analysis.next_steps.map((step, idx) => (
                      <div key={idx} className="text-[10px] text-slate-300 p-2 rounded bg-violet-500/10 border border-violet-500/20">
                        → {step}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}