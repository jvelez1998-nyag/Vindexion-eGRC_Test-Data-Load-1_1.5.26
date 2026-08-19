import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, Target, Shield, TrendingDown, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

export default function AIMitigationAdvisor({ risk, controls, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const queryClient = useQueryClient();

  const updateRiskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Risk.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Risk updated with AI mitigation plan");
      if (onUpdate) onUpdate();
    }
  });

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const relatedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id) || 
        c.domain === risk.category
      );

      const prompt = `As a risk mitigation expert, provide comprehensive mitigation strategies for this risk.

RISK DETAILS:
Title: ${risk.title}
Category: ${risk.category}
Description: ${risk.description}
Risk Source: ${risk.risk_source || 'Unknown'}

CURRENT RISK ASSESSMENT:
Inherent Likelihood: ${risk.inherent_likelihood}/5
Inherent Impact: ${risk.inherent_impact}/5
Inherent Risk Score: ${risk.inherent_risk_score}
Residual Likelihood: ${risk.residual_likelihood || 'Not assessed'}/5
Residual Impact: ${risk.residual_impact || 'Not assessed'}/5
Residual Risk Score: ${risk.residual_risk_score || 'Not calculated'}

CURRENT TREATMENT:
Strategy: ${risk.risk_treatment_strategy || 'Not defined'}
Mitigation Plan: ${risk.mitigation_plan || 'None'}
Progress: ${risk.mitigation_progress || 0}%

RELATED CONTROLS:
${relatedControls.map(c => `- ${c.name} (${c.category}, Effectiveness: ${c.effectiveness}/5)`).join('\n')}

Provide:
1. **Strategic Recommendations**: High-level treatment approach (avoid, reduce, transfer, accept)
2. **Tactical Actions**: 5-7 specific, actionable mitigation steps with priorities
3. **Control Enhancements**: Suggestions to strengthen existing controls
4. **New Control Recommendations**: New controls to implement
5. **Best Practices**: Industry best practices for this risk type
6. **Quick Wins**: Immediate actions for rapid risk reduction
7. **Long-term Strategy**: Sustainable risk management approach
8. **Success Metrics**: How to measure mitigation effectiveness

Return structured JSON with detailed, actionable guidance.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            recommended_strategy: { type: "string" },
            strategic_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  rationale: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            tactical_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  effort: { type: "string" },
                  timeline: { type: "string" },
                  owner_role: { type: "string" }
                }
              }
            },
            control_enhancements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  enhancement: { type: "string" },
                  expected_effectiveness_gain: { type: "string" }
                }
              }
            },
            new_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  control_type: { type: "string" },
                  description: { type: "string" },
                  implementation_effort: { type: "string" }
                }
              }
            },
            best_practices: { type: "array", items: { type: "string" } },
            quick_wins: { type: "array", items: { type: "string" } },
            long_term_strategy: { type: "string" },
            success_metrics: { type: "array", items: { type: "string" } },
            estimated_risk_reduction: { type: "string" }
          }
        }
      });

      setSuggestions(response);
      toast.success("Mitigation strategies generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const applyMitigationPlan = () => {
    if (!suggestions) return;

    const mitigationPlan = `AI-GENERATED MITIGATION PLAN

RECOMMENDED STRATEGY: ${suggestions.recommended_strategy}

TACTICAL ACTIONS:
${suggestions.tactical_actions?.map((a, i) => `${i + 1}. ${a.action} (${a.priority} priority, ${a.timeline})`).join('\n')}

QUICK WINS:
${suggestions.quick_wins?.map((w, i) => `• ${w}`).join('\n')}

LONG-TERM STRATEGY:
${suggestions.long_term_strategy}`;

    updateRiskMutation.mutate({
      id: risk.id,
      data: {
        risk_treatment_strategy: suggestions.recommended_strategy.toLowerCase().includes('avoid') ? 'avoid' :
                                 suggestions.recommended_strategy.toLowerCase().includes('transfer') ? 'transfer' :
                                 suggestions.recommended_strategy.toLowerCase().includes('accept') ? 'accept' : 'reduce',
        mitigation_plan: mitigationPlan
      }
    });
  };

  if (!suggestions) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">AI Mitigation Advisor</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto">
          Get AI-powered mitigation strategies and best practices tailored to this specific risk
        </p>
        <Button onClick={generateSuggestions} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Mitigation Strategies
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AI Mitigation Strategies</h3>
        <div className="flex gap-2">
          <Button onClick={() => setSuggestions(null)} variant="outline" className="border-[#2a3548]">
            Regenerate
          </Button>
          <Button onClick={applyMitigationPlan} disabled={updateRiskMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" />
            Apply to Risk
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <h4 className="font-semibold text-white mb-2">Executive Summary</h4>
        <p className="text-sm text-slate-300 mb-4">{suggestions.executive_summary}</p>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {suggestions.recommended_strategy}
          </Badge>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            {suggestions.estimated_risk_reduction} Risk Reduction
          </Badge>
        </div>
      </Card>

      <Tabs defaultValue="tactical" className="space-y-4">
        <TabsList className="bg-[#0f1623] border border-[#2a3548]">
          <TabsTrigger value="tactical">Tactical Actions</TabsTrigger>
          <TabsTrigger value="strategic">Strategic</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="tactical" className="space-y-3">
          {suggestions.tactical_actions?.map((action, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-white flex-1">{action.action}</h5>
                <div className="flex gap-2">
                  <Badge className={`text-[10px] ${
                    action.priority === 'critical' || action.priority === 'high' 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {action.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div>Effort: {action.effort}</div>
                <div>Timeline: {action.timeline}</div>
                <div>Owner: {action.owner_role}</div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="strategic" className="space-y-4">
          {suggestions.strategic_recommendations?.map((rec, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
              <h5 className="font-medium text-white mb-2">{rec.recommendation}</h5>
              <p className="text-sm text-slate-400 mb-2">{rec.rationale}</p>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-3 w-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">{rec.expected_impact}</span>
              </div>
            </Card>
          ))}
          <Card className="bg-[#151d2e] border-[#2a3548] p-4">
            <h5 className="font-medium text-white mb-2">Long-Term Strategy</h5>
            <p className="text-sm text-slate-300">{suggestions.long_term_strategy}</p>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div>
            <h5 className="font-semibold text-white mb-3">Control Enhancements</h5>
            <div className="space-y-2">
              {suggestions.control_enhancements?.map((enh, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <h6 className="font-medium text-white mb-1">{enh.control_name}</h6>
                      <p className="text-sm text-slate-400 mb-2">{enh.enhancement}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        +{enh.expected_effectiveness_gain}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3">New Control Recommendations</h5>
            <div className="space-y-2">
              {suggestions.new_controls?.map((ctrl, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h6 className="font-medium text-white">{ctrl.control_name}</h6>
                    <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">
                      {ctrl.control_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{ctrl.description}</p>
                  <p className="text-xs text-slate-500">Implementation: {ctrl.implementation_effort}</p>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548] p-5">
            <h5 className="font-semibold text-white mb-3">Quick Wins</h5>
            <ul className="space-y-2">
              {suggestions.quick_wins?.map((win, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <Sparkles className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548] p-5">
            <h5 className="font-semibold text-white mb-3">Industry Best Practices</h5>
            <ul className="space-y-2">
              {suggestions.best_practices?.map((practice, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <Target className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  {practice}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-[#151d2e] border-[#2a3548] p-5">
            <h5 className="font-semibold text-white mb-3">Success Metrics</h5>
            <ul className="space-y-2">
              {suggestions.success_metrics?.map((metric, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <TrendingDown className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {metric}
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}