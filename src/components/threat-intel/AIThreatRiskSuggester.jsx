import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Zap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AIThreatRiskSuggester({ threatData, risks, controls, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  async function generateSuggestions() {
    setLoading(true);
    try {
      const prompt = `Based on the latest threat intelligence, suggest new risks and control improvements for the organization.

THREAT INTELLIGENCE:
CVEs: ${threatData.cves.map(c => `${c.id} (${c.severity}, CVSS ${c.score}): ${c.title}`).join('\n')}

TTPs: ${threatData.ttps.map(t => `${t.id}: ${t.technique} (${t.trend})`).join('\n')}

Threat Actors: ${threatData.threatActors.map(a => `${a.name} targeting ${a.targets.join(', ')}`).join('\n')}

EXISTING RISKS: ${risks.length} risks
EXISTING CONTROLS: ${controls.length} controls

Generate:

1. **New Risk Suggestions** (10-15 risks):
   - Risks directly from critical CVEs
   - Risks from trending attack TTPs
   - Risks from threat actor campaigns
   - Include: title, description, category, likelihood, impact, mitigation strategy

2. **Control Improvement Suggestions** (10-15 improvements):
   - Existing controls that need updates based on threats
   - New controls to address threat gaps
   - Control effectiveness improvements
   - Include: control name, current gap, improvement, expected benefit

3. **Priority Recommendations**:
   - Top 5 immediate actions
   - Risk appetite considerations

Provide detailed, actionable suggestions.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            new_risk_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  subcategory: { type: "string" },
                  threat_source: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  mitigation_strategy: { type: "string" },
                  priority: { type: "string" },
                  threat_references: { type: "array", items: { type: "string" } }
                }
              }
            },
            control_improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  improvement_type: { type: "string" },
                  current_gap: { type: "string" },
                  improvement_description: { type: "string" },
                  expected_benefit: { type: "string" },
                  implementation_effort: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            priority_recommendations: {
              type: "object",
              properties: {
                immediate_actions: { type: "array", items: { type: "string" } },
                risk_appetite_notes: { type: "string" },
                summary: { type: "string" }
              }
            }
          }
        }
      });

      setSuggestions(result);
      toast.success("AI suggestions generated");
    } catch (error) {
      console.error(error);
      toast.error("Suggestion generation failed");
    } finally {
      setLoading(false);
    }
  }

  const createRisk = async (riskSuggestion) => {
    try {
      await base44.entities.Risk.create({
        title: riskSuggestion.title,
        description: riskSuggestion.description,
        category: riskSuggestion.category,
        subcategory: riskSuggestion.subcategory,
        risk_source: riskSuggestion.threat_source,
        likelihood: riskSuggestion.likelihood,
        impact: riskSuggestion.impact,
        residual_likelihood: riskSuggestion.likelihood,
        residual_impact: riskSuggestion.impact,
        mitigation_plan: riskSuggestion.mitigation_strategy,
        status: 'identified',
        date_identified: new Date().toISOString().split('T')[0]
      });
      toast.success(`Risk "${riskSuggestion.title}" created`);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Failed to create risk");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          {!suggestions ? (
            <div className="text-center">
              <Brain className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Threat-Based Risk Suggestions</h3>
              <p className="text-sm text-slate-400 mb-4">
                Generate intelligent risk and control improvement suggestions based on real-time threat intelligence.
              </p>
              <Button onClick={generateSuggestions} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI-Generated Suggestions</h3>
                  <p className="text-sm text-slate-400">
                    {suggestions.new_risk_suggestions.length} risks • {suggestions.control_improvements.length} improvements
                  </p>
                </div>
                <Button onClick={generateSuggestions} variant="outline" className="border-indigo-500/30 text-indigo-400">
                  <Zap className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm text-slate-300">{suggestions.priority_recommendations.summary}</p>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">Immediate Actions Required:</h4>
                <ul className="space-y-1">
                  {suggestions.priority_recommendations.immediate_actions.map((action, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {suggestions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* New Risk Suggestions */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">New Risk Suggestions ({suggestions.new_risk_suggestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {suggestions.new_risk_suggestions.map((risk, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white flex-1">{risk.title}</h5>
                        <Badge className={`${
                          risk.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          risk.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {risk.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                        <div className="text-xs text-slate-500">
                          L:{risk.likelihood} × I:{risk.impact} = {risk.likelihood * risk.impact}
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-slate-400 mb-1">Threat Source:</p>
                        <p className="text-xs text-slate-300">{risk.threat_source}</p>
                      </div>
                      {risk.threat_references && risk.threat_references.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {risk.threat_references.map((ref, ridx) => (
                            <Badge key={ridx} className="bg-purple-500/20 text-purple-400 text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        onClick={() => createRisk(risk)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Add to Risk Register
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Control Improvements */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-sm">Control Improvements ({suggestions.control_improvements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {suggestions.control_improvements.map((improvement, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white flex-1">{improvement.control_name}</h5>
                        <Badge className={`${
                          improvement.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          improvement.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {improvement.priority}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">{improvement.improvement_type}</Badge>
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                          <p className="text-xs text-rose-400 font-medium mb-1">Current Gap:</p>
                          <p className="text-xs text-slate-300">{improvement.current_gap}</p>
                        </div>
                        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                          <p className="text-xs text-blue-400 font-medium mb-1">Improvement:</p>
                          <p className="text-xs text-slate-300">{improvement.improvement_description}</p>
                        </div>
                        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs text-emerald-400 font-medium mb-1">Expected Benefit:</p>
                          <p className="text-xs text-slate-300">{improvement.expected_benefit}</p>
                        </div>
                        <div className="text-xs text-slate-500">
                          Effort: {improvement.implementation_effort}
                        </div>
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