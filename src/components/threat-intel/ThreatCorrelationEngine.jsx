import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Network, AlertTriangle, Shield, Link } from "lucide-react";
import { toast } from "sonner";

export default function ThreatCorrelationEngine({ threatData, risks, controls, securityEvents, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [correlations, setCorrelations] = useState(null);

  async function runCorrelation() {
    setLoading(true);
    try {
      const prompt = `As a threat intelligence analyst, correlate the following threat intelligence with existing organizational risks and controls.

THREAT INTELLIGENCE:
CVEs: ${threatData.cves.map(c => `${c.id} (${c.severity}): ${c.title}`).join('; ')}
TTPs: ${threatData.ttps.map(t => `${t.id} - ${t.technique} (${t.trend})`).join('; ')}
Threat Actors: ${threatData.threatActors.map(a => `${a.name} (${a.activity})`).join('; ')}

EXISTING RISKS:
${risks.slice(0, 20).map(r => `- ${r.title} (${r.category})`).join('\n')}

EXISTING CONTROLS:
${controls.slice(0, 20).map(c => `- ${c.name} (${c.domain}, Effectiveness: ${c.effectiveness}/5)`).join('\n')}

RECENT SECURITY EVENTS:
${securityEvents.slice(0, 10).map(e => `- ${e.event_type} (${e.severity})`).join('\n')}

ANALYSIS REQUIRED:

1. **Threat-to-Risk Mapping** (10-15 correlations):
   - Match each critical threat (CVE/TTP) with relevant existing risks
   - Explain why the threat increases the risk likelihood/impact
   - Suggest risk score adjustments

2. **Threat-to-Control Mapping** (10-15 correlations):
   - Identify which controls address each critical threat
   - Rate control adequacy (Adequate/Partial/Inadequate)
   - Suggest control improvements

3. **Gap Analysis** (8-12 gaps):
   - Identify threats NOT adequately covered by existing risks/controls
   - Prioritize gaps by severity

4. **Correlation Insights**:
   - Overall threat coverage score (0-100)
   - Most vulnerable areas
   - Recommended immediate actions

Provide detailed, actionable correlations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            threat_to_risk_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_id: { type: "string" },
                  threat_type: { type: "string" },
                  risk_title: { type: "string" },
                  correlation_strength: { type: "string" },
                  impact_analysis: { type: "string" },
                  recommended_action: { type: "string" }
                }
              }
            },
            threat_to_control_mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_id: { type: "string" },
                  threat_type: { type: "string" },
                  control_name: { type: "string" },
                  adequacy: { type: "string" },
                  effectiveness_assessment: { type: "string" },
                  improvement_suggestions: { type: "array", items: { type: "string" } }
                }
              }
            },
            coverage_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_id: { type: "string" },
                  threat_description: { type: "string" },
                  severity: { type: "string" },
                  gap_type: { type: "string" },
                  recommended_controls: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            overall_assessment: {
              type: "object",
              properties: {
                threat_coverage_score: { type: "number" },
                most_vulnerable_areas: { type: "array", items: { type: "string" } },
                immediate_actions: { type: "array", items: { type: "string" } },
                summary: { type: "string" }
              }
            }
          }
        }
      });

      setCorrelations(result);
      toast.success("Threat correlation analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Correlation analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const linkThreatToRisk = async (riskTitle, threatId) => {
    const risk = risks.find(r => r.title === riskTitle);
    if (risk) {
      try {
        const linkedThreats = risk.linked_threats || [];
        if (!linkedThreats.includes(threatId)) {
          await base44.entities.Risk.update(risk.id, {
            linked_threats: [...linkedThreats, threatId]
          });
          toast.success("Threat linked to risk");
          if (onRefresh) onRefresh();
        }
      } catch (error) {
        toast.error("Failed to link threat");
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          {!correlations ? (
            <div className="text-center">
              <Network className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Threat Correlation</h3>
              <p className="text-sm text-slate-400 mb-4">
                Analyze threat intelligence and correlate with existing risks, controls, and security events to identify gaps and vulnerabilities.
              </p>
              <Button onClick={runCorrelation} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Correlations...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Run Correlation Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Threat Correlation Results</h3>
                  <p className="text-sm text-slate-400">
                    Coverage Score: {correlations.overall_assessment.threat_coverage_score}/100
                  </p>
                </div>
                <Button onClick={runCorrelation} variant="outline" className="border-indigo-500/30 text-indigo-400">
                  <Brain className="h-4 w-4 mr-2" />
                  Re-analyze
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm text-slate-300">{correlations.overall_assessment.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <h4 className="text-sm font-semibold text-amber-400 mb-2">Most Vulnerable Areas</h4>
                  <ul className="space-y-1">
                    {correlations.overall_assessment.most_vulnerable_areas.map((area, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">Immediate Actions</h4>
                  <ul className="space-y-1">
                    {correlations.overall_assessment.immediate_actions.map((action, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <Shield className="h-3 w-3 text-emerald-400 mt-0.5" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {correlations && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Threat-to-Risk Mappings */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Threat-to-Risk ({correlations.threat_to_risk_mappings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {correlations.threat_to_risk_mappings.map((mapping, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-rose-500/20 text-rose-400 text-xs">
                          {mapping.threat_id}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {mapping.correlation_strength}
                        </Badge>
                      </div>
                      <h5 className="text-xs font-semibold text-white mb-1">{mapping.risk_title}</h5>
                      <p className="text-xs text-slate-400 mb-2">{mapping.impact_analysis}</p>
                      <p className="text-xs text-emerald-400">{mapping.recommended_action}</p>
                      <Button 
                        size="sm" 
                        onClick={() => linkThreatToRisk(mapping.risk_title, mapping.threat_id)}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        <Link className="h-3 w-3 mr-1" />
                        Link to Risk
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Threat-to-Control Mappings */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                Threat-to-Control ({correlations.threat_to_control_mappings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {correlations.threat_to_control_mappings.map((mapping, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          {mapping.threat_id}
                        </Badge>
                        <Badge className={`text-xs ${
                          mapping.adequacy === 'Adequate' ? 'bg-emerald-500/20 text-emerald-400' :
                          mapping.adequacy === 'Partial' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {mapping.adequacy}
                        </Badge>
                      </div>
                      <h5 className="text-xs font-semibold text-white mb-1">{mapping.control_name}</h5>
                      <p className="text-xs text-slate-400 mb-2">{mapping.effectiveness_assessment}</p>
                      {mapping.improvement_suggestions.length > 0 && (
                        <div className="text-xs space-y-1">
                          {mapping.improvement_suggestions.map((suggestion, sidx) => (
                            <p key={sidx} className="text-indigo-400">• {suggestion}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Coverage Gaps */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Coverage Gaps ({correlations.coverage_gaps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {correlations.coverage_gaps.map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-amber-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                          {gap.threat_id}
                        </Badge>
                        <Badge className={`text-xs ${
                          gap.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          gap.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{gap.threat_description}</p>
                      <Badge variant="outline" className="text-xs mb-2">{gap.gap_type}</Badge>
                      <div className="text-xs space-y-1">
                        <p className="text-slate-400">Recommended Controls:</p>
                        {gap.recommended_controls.map((control, cidx) => (
                          <p key={cidx} className="text-emerald-400">• {control}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}