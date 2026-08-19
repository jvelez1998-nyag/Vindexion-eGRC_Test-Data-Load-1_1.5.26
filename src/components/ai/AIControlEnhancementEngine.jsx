import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Shield, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIControlEnhancementEngine({ controls = [], risks = [], incidents = [] }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const queryClient = useQueryClient();

  const createControlMutation = useMutation({
    mutationFn: async (controlData) => {
      return await base44.entities.Control.create(controlData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['controls']);
      toast.success("Control created successfully");
    }
  });

  const updateControlMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Control.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['controls']);
      toast.success("Control updated successfully");
    }
  });

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      // Identify weak controls
      const weakControls = controls.filter(c => 
        c.effectiveness < 3 || c.status === 'ineffective'
      );

      // Identify high-risk areas
      const highRisks = risks.filter(r => 
        ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 12
      );

      // Analyze recent incidents
      const recentIncidents = incidents.filter(i => {
        const reportedDate = new Date(i.reported_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return reportedDate >= thirtyDaysAgo;
      });

      // Identify control gaps
      const risksWithoutControls = risks.filter(r => 
        !r.linked_controls || r.linked_controls.length === 0
      );

      const prompt = `You are a cybersecurity and GRC expert. Analyze the current control landscape and provide proactive enhancement recommendations.

CURRENT STATE:
- Total Controls: ${controls.length}
- Weak/Ineffective Controls: ${weakControls.length}
- High-Severity Risks: ${highRisks.length}
- Risks Without Controls: ${risksWithoutControls.length}
- Recent Incidents (30 days): ${recentIncidents.length}

WEAK CONTROLS:
${weakControls.slice(0, 5).map(c => `- ${c.name} (${c.domain}, Effectiveness: ${c.effectiveness}/5)`).join('\n') || 'None identified'}

HIGH-PRIORITY RISKS:
${highRisks.slice(0, 5).map(r => `- ${r.title} (${r.category}, Score: ${(r.residual_likelihood || 0) * (r.residual_impact || 0)})`).join('\n') || 'None identified'}

RECENT INCIDENTS:
${recentIncidents.slice(0, 5).map(i => `- ${i.incident_type} (${i.severity})`).join('\n') || 'None in past 30 days'}

PROVIDE COMPREHENSIVE ANALYSIS:

1. **Control Enhancements**: For each weak control, provide specific, actionable improvements
2. **New Control Recommendations**: Suggest 5-7 new controls addressing gaps, based on:
   - Emerging threat intelligence
   - Industry best practices
   - Zero Trust principles
   - Recent incident patterns
3. **Priority Ranking**: Rank all suggestions by impact and urgency
4. **Implementation Roadmap**: Quick wins vs strategic initiatives
5. **Threat Intelligence**: Current threat landscape considerations
6. **Compliance Alignment**: Map to relevant frameworks (ISO 27001, NIST, SOC2)

Be specific with control names, types, and implementation details.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            control_enhancements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  control_name: { type: "string" },
                  current_issues: { type: "string" },
                  recommended_improvements: { type: "string" },
                  expected_effectiveness_gain: { type: "number" },
                  priority: { type: "string" },
                  implementation_effort: { type: "string" }
                }
              }
            },
            new_control_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  control_category: { type: "string" },
                  control_domain: { type: "string" },
                  description: { type: "string" },
                  rationale: { type: "string" },
                  addresses_risks: { type: "array", items: { type: "string" } },
                  priority: { type: "string" },
                  implementation_timeline: { type: "string" },
                  frameworks: { type: "array", items: { type: "string" } }
                }
              }
            },
            threat_intelligence: { type: "string" },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            },
            strategic_initiatives: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success("Control analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze controls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoAnalyze && controls.length > 0) {
      analyzeTrends();
    }
  }, [autoAnalyze, controls.length]);

  const implementEnhancement = async (enhancement) => {
    const control = controls.find(c => c.id === enhancement.control_id);
    if (control) {
      await updateControlMutation.mutateAsync({
        id: control.id,
        data: {
          control_procedures: `${control.control_procedures || ''}\n\nAI Enhancement: ${enhancement.recommended_improvements}`,
          effectiveness: Math.min(5, (control.effectiveness || 0) + enhancement.expected_effectiveness_gain)
        }
      });
    }
  };

  const createNewControl = async (recommendation) => {
    await createControlMutation.mutateAsync({
      name: recommendation.control_name,
      category: recommendation.control_category,
      domain: recommendation.control_domain,
      description: recommendation.description,
      control_objective: recommendation.rationale,
      status: "planned",
      framework_mappings: {
        general: recommendation.frameworks || []
      }
    });
  };

  const priorityColors = {
    critical: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Control Enhancement Engine</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Proactive control improvements & new control suggestions
              </p>
            </div>
          </div>
          <Button
            onClick={analyzeTrends}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Analyze Now
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!suggestions && !loading && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-emerald-400/30 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">
              Analyze your control landscape for enhancement opportunities
            </p>
            <p className="text-xs text-slate-500">
              Uses threat intelligence, risk trends, and incident patterns
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Analyzing controls and threat landscape...</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Executive Summary
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{suggestions.executive_summary}</p>
            </div>

            {/* Threat Intelligence */}
            {suggestions.threat_intelligence && (
              <div className="p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-lg border border-rose-500/20">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Current Threat Landscape
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{suggestions.threat_intelligence}</p>
              </div>
            )}

            {/* Quick Wins */}
            {suggestions.quick_wins?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Quick Wins (Immediate Actions)
                </h3>
                <div className="space-y-1">
                  {suggestions.quick_wins.map((win, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-emerald-400 font-bold text-[10px]">{idx + 1}</span>
                      </div>
                      <span>{win}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Control Enhancements */}
            {suggestions.control_enhancements?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  Control Enhancements ({suggestions.control_enhancements.length})
                </h3>
                <div className="space-y-3">
                  {suggestions.control_enhancements.map((enhancement, idx) => (
                    <div key={idx} className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548] hover:border-amber-500/40 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-white">{enhancement.control_name}</h4>
                            <Badge className={priorityColors[enhancement.priority?.toLowerCase()] || priorityColors.medium}>
                              {enhancement.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400 mb-2">
                            <span className="font-semibold text-slate-300">Issues:</span> {enhancement.current_issues}
                          </div>
                          <div className="text-xs text-slate-300 mb-2">
                            <span className="font-semibold">Improvements:</span> {enhancement.recommended_improvements}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <Badge variant="outline" className="text-emerald-400">
                              +{enhancement.expected_effectiveness_gain} effectiveness
                            </Badge>
                            <span className="text-slate-500">{enhancement.implementation_effort}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => implementEnhancement(enhancement)}
                          className="text-xs"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Control Recommendations */}
            {suggestions.new_control_recommendations?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  New Control Recommendations ({suggestions.new_control_recommendations.length})
                </h3>
                <div className="space-y-3">
                  {suggestions.new_control_recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-white">{rec.control_name}</h4>
                            <Badge className={priorityColors[rec.priority?.toLowerCase()] || priorityColors.medium}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{rec.control_category}</Badge>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">{rec.description}</p>
                          <div className="text-xs text-slate-400 mb-2">
                            <span className="font-semibold text-slate-300">Rationale:</span> {rec.rationale}
                          </div>
                          {rec.addresses_risks?.length > 0 && (
                            <div className="text-xs text-slate-400 mb-2">
                              <span className="font-semibold text-slate-300">Addresses:</span> {rec.addresses_risks.join(', ')}
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {rec.frameworks?.map((fw, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{fw}</Badge>
                            ))}
                            <span className="text-xs text-slate-500 ml-2">{rec.implementation_timeline}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createNewControl(rec)}
                          className="text-xs"
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Initiatives */}
            {suggestions.strategic_initiatives?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg border border-violet-500/20">
                <h3 className="text-sm font-semibold text-white mb-3">Strategic Initiatives (Long-term)</h3>
                <div className="space-y-1">
                  {suggestions.strategic_initiatives.map((initiative, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-violet-400 font-bold text-[10px]">{idx + 1}</span>
                      </div>
                      <span>{initiative}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}