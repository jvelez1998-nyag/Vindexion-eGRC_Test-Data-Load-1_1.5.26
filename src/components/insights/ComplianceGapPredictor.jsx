import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Loader2, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ComplianceGapPredictor({ data }) {
  const [gaps, setGaps] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictGaps = async () => {
    setLoading(true);
    try {
      const complianceData = data.compliance.map(c => ({
        framework: c.framework,
        requirement: c.requirement_name,
        status: c.compliance_status,
        evidence: c.evidence_status,
        last_review: c.last_review_date,
        linked_controls: c.linked_controls?.length || 0
      }));

      const controlData = data.controls.map(c => ({
        name: c.control_name,
        effectiveness: c.effectiveness,
        linked_requirements: c.linked_compliance?.length || 0
      }));

      const prompt = `You are an AI compliance gap predictor. Analyze compliance data and predict potential gaps before they become issues.

COMPLIANCE STATUS (n=${complianceData.length}):
${JSON.stringify(complianceData.slice(0, 25), null, 2)}

CONTROL STATUS (n=${controlData.length}):
${JSON.stringify(controlData.slice(0, 20), null, 2)}

PREDICT COMPLIANCE GAPS:
1. Identify 6-8 compliance requirements at risk of non-compliance in next 90 days
2. For each: framework, requirement, gap_probability (0-100), gap_severity (critical/high/medium), root_causes (array), remediation_steps (array), time_to_remediate_days
3. Consider: current status, evidence quality, control coverage, review frequency, historical patterns
4. Flag emerging regulatory requirements

Return JSON:
{
  "predicted_gaps": [{"framework": "...", "requirement": "...", "probability": 75, "severity": "high", "root_causes": ["...", "..."], "remediation": ["...", "..."], "days_to_remediate": 30}],
  "summary": {"total_gaps": 8, "critical": 2, "high": 3, "frameworks_affected": 4}
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  requirement: { type: "string" },
                  probability: { type: "number" },
                  severity: { type: "string" },
                  root_causes: { type: "array", items: { type: "string" } },
                  remediation: { type: "array", items: { type: "string" } },
                  days_to_remediate: { type: "number" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_gaps: { type: "number" },
                critical: { type: "number" },
                high: { type: "number" },
                frameworks_affected: { type: "number" }
              }
            }
          }
        }
      });

      setGaps(response);
      toast.success(`Identified ${response.summary?.total_gaps || 0} potential gaps`);
    } catch (error) {
      console.error(error);
      toast.error("Compliance gap prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-400" />
              Predictive Compliance Gap Analysis
            </CardTitle>
            <Button 
              onClick={predictGaps}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Detect Gaps
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            AI analyzes compliance patterns, control coverage, and historical data to predict gaps before audits or regulatory reviews
          </p>
        </CardContent>
      </Card>

      {gaps && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white mb-1">{gaps.summary?.total_gaps || 0}</div>
                <div className="text-xs text-slate-400">Predicted Gaps</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-rose-400 mb-1">{gaps.summary?.critical || 0}</div>
                <div className="text-xs text-slate-400">Critical Severity</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-400 mb-1">{gaps.summary?.high || 0}</div>
                <div className="text-xs text-slate-400">High Severity</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{gaps.summary?.frameworks_affected || 0}</div>
                <div className="text-xs text-slate-400">Frameworks Affected</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {gaps.predicted_gaps?.map((gap, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-green-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      gap.severity === 'critical' ? 'bg-rose-500/20' :
                      gap.severity === 'high' ? 'bg-amber-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <Scale className={`h-5 w-5 ${
                        gap.severity === 'critical' ? 'text-rose-400' :
                        gap.severity === 'high' ? 'text-amber-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className="bg-indigo-500/20 text-indigo-400 mb-2">{gap.framework}</Badge>
                          <h4 className="text-base font-semibold text-white mb-2">{gap.requirement}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              gap.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                              gap.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {gap.severity} Severity
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400">
                              {gap.probability}% Probability
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              {gap.days_to_remediate} days to fix
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs font-semibold text-slate-400 mb-2">Root Causes:</div>
                          <ul className="space-y-1">
                            {gap.root_causes?.map((cause, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>{cause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-xs font-semibold text-emerald-400 mb-2">Remediation Steps:</div>
                          <ul className="space-y-1">
                            {gap.remediation?.map((step, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400">{i + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}