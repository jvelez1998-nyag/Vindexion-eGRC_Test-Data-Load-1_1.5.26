import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, AlertTriangle, Sparkles, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskDiscoveryEngine({ incidents, controls, existingRisks }) {
  const [loading, setLoading] = useState(false);
  const [discoveredRisks, setDiscoveredRisks] = useState([]);
  const [autoScan, setAutoScan] = useState(false);
  const queryClient = useQueryClient();

  const createRiskMutation = useMutation({
    mutationFn: (data) => base44.entities.Risk.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Risk created from AI discovery");
    }
  });

  const discoverRisks = async () => {
    setLoading(true);
    try {
      // Analyze incidents for patterns
      const recentIncidents = incidents.filter(i => 
        new Date(i.created_date) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      );

      // Identify control deficiencies
      const weakControls = controls.filter(c => 
        c.effectiveness < 3 || c.status === 'ineffective'
      );

      const prompt = `As an AI risk intelligence analyst, identify potential NEW risks based on incident patterns and control deficiencies.

INCIDENT ANALYSIS:
Total Recent Incidents (6 months): ${recentIncidents.length}

Incident Breakdown:
${recentIncidents.slice(0, 10).map(i => `
- Type: ${i.incident_type}
  Severity: ${i.severity}
  Title: ${i.title}
  Status: ${i.status}
  Root Cause: ${i.root_cause || 'Unknown'}
`).join('\n')}

CONTROL DEFICIENCIES:
Weak/Ineffective Controls: ${weakControls.length}

Key Deficiencies:
${weakControls.slice(0, 10).map(c => `
- Control: ${c.name}
  Domain: ${c.domain}
  Status: ${c.status}
  Effectiveness: ${c.effectiveness}/5
  Issues: ${c.control_procedures || 'N/A'}
`).join('\n')}

EXISTING RISK LANDSCAPE:
${existingRisks.slice(0, 10).map(r => `- ${r.title} (${r.category})`).join('\n')}

TASK: Identify 5-8 potential NEW risks that:
1. Are emerging from incident patterns (recurring incident types, root causes)
2. Result from control gaps or deficiencies
3. Are NOT already captured in existing risks
4. Represent real, actionable risk scenarios
5. Have clear business impact

For each discovered risk, provide:
- Risk title and detailed description
- Category and subcategory
- Risk source (what's causing it)
- Estimated inherent likelihood and impact (1-5 scale)
- Supporting evidence from incidents/controls
- Recommended mitigation approach
- Urgency level

Focus on ACTIONABLE risks that require immediate attention.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_summary: { type: "string" },
            confidence_level: { type: "string" },
            discovered_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  subcategory: { type: "string" },
                  risk_source: { type: "string" },
                  inherent_likelihood: { type: "number" },
                  inherent_impact: { type: "number" },
                  inherent_risk_score: { type: "number" },
                  supporting_evidence: { type: "string" },
                  recommended_mitigation: { type: "string" },
                  urgency: { type: "string" },
                  linked_incident_types: { type: "array", items: { type: "string" } },
                  linked_control_gaps: { type: "array", items: { type: "string" } },
                  potential_impact_areas: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setDiscoveredRisks(response.discovered_risks || []);
      toast.success(`Discovered ${response.discovered_risks?.length || 0} potential risks`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to discover risks");
    } finally {
      setLoading(false);
    }
  };

  const createRiskFromDiscovery = (risk) => {
    createRiskMutation.mutate({
      title: risk.title,
      description: risk.description,
      category: risk.category,
      subcategory: risk.subcategory,
      risk_source: risk.risk_source,
      inherent_likelihood: risk.inherent_likelihood,
      inherent_impact: risk.inherent_impact,
      inherent_risk_score: risk.inherent_risk_score,
      status: 'identified',
      mitigation_plan: risk.recommended_mitigation
    });
  };

  const urgencyColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Risk Discovery Engine</h3>
              <p className="text-xs text-slate-400">Automatically identify emerging risks from incidents and control gaps</p>
            </div>
          </div>
          <Button
            onClick={discoverRisks}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Discover Risks
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-rose-400">{incidents.length}</div>
            <div className="text-xs text-slate-500">Incidents Analyzed</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-amber-400">
              {controls.filter(c => c.effectiveness < 3).length}
            </div>
            <div className="text-xs text-slate-500">Control Gaps</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-indigo-400">{discoveredRisks.length}</div>
            <div className="text-xs text-slate-500">Risks Discovered</div>
          </div>
        </div>
      </Card>

      {discoveredRisks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Discovered Risks</h4>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {discoveredRisks.length} New Risks Found
            </Badge>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {discoveredRisks.map((risk, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-white mb-2">{risk.title}</h5>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={urgencyColors[risk.urgency?.toLowerCase() || 'medium']}>
                          {risk.urgency} Urgency
                        </Badge>
                        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                          {risk.category}
                        </Badge>
                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                          Risk Score: {risk.inherent_risk_score}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createRiskFromDiscovery(risk)}
                      disabled={createRiskMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Risk
                    </Button>
                  </div>

                  <p className="text-sm text-slate-300 mb-4">{risk.description}</p>

                  <div className="space-y-3">
                    <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                      <h6 className="text-xs font-semibold text-slate-500 mb-2">Supporting Evidence</h6>
                      <p className="text-sm text-slate-300">{risk.supporting_evidence}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                        <h6 className="text-xs font-semibold text-slate-500 mb-2">Likelihood</h6>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-orange-400">{risk.inherent_likelihood}</div>
                          <span className="text-xs text-slate-500">/5</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
                        <h6 className="text-xs font-semibold text-slate-500 mb-2">Impact</h6>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-rose-400">{risk.inherent_impact}</div>
                          <span className="text-xs text-slate-500">/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                      <h6 className="text-xs font-semibold text-emerald-400 mb-2">Recommended Mitigation</h6>
                      <p className="text-sm text-slate-300">{risk.recommended_mitigation}</p>
                    </div>

                    {risk.linked_incident_types?.length > 0 && (
                      <div>
                        <h6 className="text-xs font-semibold text-slate-500 mb-2">Related Incidents</h6>
                        <div className="flex flex-wrap gap-1">
                          {risk.linked_incident_types.map((type, i) => (
                            <Badge key={i} className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}