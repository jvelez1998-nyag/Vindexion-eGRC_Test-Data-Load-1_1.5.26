import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Loader2, Link as LinkIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RiskCorrelationMatrix({ data }) {
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(false);

  const findCorrelations = async () => {
    setLoading(true);
    try {
      const riskSummaries = data.risks.map(r => ({
        id: r.id,
        title: r.risk_title,
        category: r.category,
        score: (r.residual_likelihood || 0) * (r.residual_impact || 0),
        description: r.description?.substring(0, 200)
      }));

      const incidentSummaries = data.incidents.map(i => ({
        title: i.incident_title,
        type: i.incident_type,
        severity: i.severity
      }));

      const controlSummaries = data.controls.map(c => ({
        name: c.control_name,
        type: c.control_type,
        effectiveness: c.effectiveness
      }));

      const prompt = `You are an AI correlation analysis system. Find hidden relationships and correlations between risks that appear unrelated on the surface.

RISKS:
${JSON.stringify(riskSummaries.slice(0, 25), null, 2)}

INCIDENTS:
${JSON.stringify(incidentSummaries.slice(0, 15), null, 2)}

CONTROLS:
${JSON.stringify(controlSummaries.slice(0, 15), null, 2)}

FIND CORRELATIONS:
1. Identify 8-10 significant correlations between seemingly unrelated risks
2. For each: risk_1, risk_2, correlation_strength (0-100), relationship_type, explanation, cascade_potential (low/medium/high)
3. Find cross-category correlations (e.g., operational risk → cyber risk)
4. Identify common root causes
5. Highlight systemic vulnerabilities

Return JSON:
{
  "correlations": [{"risk_1": "...", "risk_2": "...", "strength": 85, "type": "...", "explanation": "...", "cascade": "high", "root_cause": "..."}],
  "insights": {"systemic_vulnerabilities": ["...", "..."], "common_root_causes": ["...", "..."]}
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            correlations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_1: { type: "string" },
                  risk_2: { type: "string" },
                  strength: { type: "number" },
                  type: { type: "string" },
                  explanation: { type: "string" },
                  cascade: { type: "string" },
                  root_cause: { type: "string" }
                }
              }
            },
            insights: {
              type: "object",
              properties: {
                systemic_vulnerabilities: { type: "array", items: { type: "string" } },
                common_root_causes: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setCorrelations(response);
      toast.success(`Found ${response.correlations?.length || 0} correlations`);
    } catch (error) {
      console.error(error);
      toast.error("Correlation analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="h-5 w-5 text-emerald-400" />
              AI Risk Correlation Discovery
            </CardTitle>
            <Button 
              onClick={findCorrelations}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
              Analyze Correlations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Machine learning identifies hidden relationships between seemingly unrelated risks, revealing systemic vulnerabilities and cascade effects
          </p>
        </CardContent>
      </Card>

      {correlations && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Systemic Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {correlations.insights?.systemic_vulnerabilities?.map((vuln, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <div className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">{idx + 1}.</span>
                        <span className="text-sm text-slate-300">{vuln}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Common Root Causes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {correlations.insights?.common_root_causes?.map((cause, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">{idx + 1}.</span>
                        <span className="text-sm text-slate-300">{cause}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {correlations.correlations?.map((corr, idx) => (
              <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Network className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-indigo-500/20 text-indigo-400">{corr.risk_1}</Badge>
                        <span className="text-emerald-400">⟷</span>
                        <Badge className="bg-purple-500/20 text-purple-400">{corr.risk_2}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs text-slate-500">Correlation Strength</div>
                          <div className="text-lg font-bold text-emerald-400">{corr.strength}%</div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs text-slate-500">Relationship Type</div>
                          <div className="text-xs font-medium text-white mt-1">{corr.type}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs text-slate-500">Cascade Potential</div>
                          <Badge className={`mt-1 ${
                            corr.cascade === 'high' ? 'bg-rose-500/20 text-rose-400' :
                            corr.cascade === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {corr.cascade}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-xs font-semibold text-slate-400 mb-1">Explanation:</div>
                          <div className="text-sm text-slate-300">{corr.explanation}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="text-xs font-semibold text-amber-400 mb-1">Root Cause Analysis:</div>
                          <div className="text-sm text-slate-300">{corr.root_cause}</div>
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