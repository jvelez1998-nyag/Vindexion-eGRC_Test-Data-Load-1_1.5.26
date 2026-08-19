import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, CheckCircle2, AlertTriangle, Calendar, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIRiskTreatmentPlanner({ risk, controls = [] }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const createActionMutation = useMutation({
    mutationFn: async (actionData) => {
      return await base44.entities.MitigationAction.create(actionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mitigation-actions']);
      toast.success("Mitigation action created");
    }
  });

  const generateTreatmentPlan = async () => {
    setLoading(true);
    try {
      const linkedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id)
      );

      const prompt = `You are a GRC risk management expert. Generate a comprehensive, actionable risk treatment plan.

RISK DETAILS:
- Title: ${risk.title}
- Description: ${risk.description}
- Category: ${risk.category}
- Current Treatment Strategy: ${risk.risk_treatment_strategy || 'Not defined'}
- Inherent Risk Score: ${risk.inherent_risk_score || (risk.inherent_likelihood * risk.inherent_impact)}
- Residual Risk Score: ${risk.residual_risk_score || (risk.residual_likelihood * risk.residual_impact)}
- Likelihood: ${risk.residual_likelihood || risk.likelihood}/5
- Impact: ${risk.residual_impact || risk.impact}/5

EXISTING CONTROLS:
${linkedControls.length > 0 ? linkedControls.map(c => `- ${c.name} (${c.category}, Effectiveness: ${c.effectiveness}/5)`).join('\n') : 'No controls currently linked'}

GENERATE A COMPREHENSIVE TREATMENT PLAN INCLUDING:

1. **Recommended Strategy**: Choose the most appropriate strategy (Avoid, Reduce, Transfer, Accept) with clear justification

2. **Short-term Actions** (0-3 months): 3-5 immediate actions with:
   - Specific action description
   - Priority (Critical/High/Medium/Low)
   - Estimated timeline (in days)
   - Success criteria
   - Resource requirements

3. **Medium-term Actions** (3-6 months): 3-5 strategic actions

4. **Long-term Actions** (6+ months): 2-3 foundational improvements

5. **Control Recommendations**: Specific controls to implement or enhance

6. **KPIs and Metrics**: Key indicators to track treatment effectiveness

7. **Resource Estimate**: Budget, personnel, and technology needs

8. **Risk Reduction Target**: Expected residual risk score after full implementation

Be specific, practical, and actionable. Focus on what can realistically be achieved.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_strategy: { type: "string" },
            strategy_justification: { type: "string" },
            short_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline_days: { type: "number" },
                  success_criteria: { type: "string" },
                  resources: { type: "string" }
                }
              }
            },
            medium_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline_days: { type: "number" },
                  success_criteria: { type: "string" }
                }
              }
            },
            long_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeline_days: { type: "number" },
                  expected_impact: { type: "string" }
                }
              }
            },
            control_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            kpis: {
              type: "array",
              items: { type: "string" }
            },
            resource_estimate: { type: "string" },
            target_residual_score: { type: "number" }
          }
        }
      });

      setPlan(response);
      toast.success("Treatment plan generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate treatment plan");
    } finally {
      setLoading(false);
    }
  };

  const implementAction = async (action, timeframe) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (action.timeline_days || 30));

    await createActionMutation.mutateAsync({
      risk_id: risk.id,
      action_title: action.action,
      description: action.success_criteria || action.action,
      priority: action.priority?.toLowerCase() || "medium",
      status: "not_started",
      due_date: dueDate.toISOString().split('T')[0],
      expected_outcome: action.success_criteria,
      resources_required: action.resources ? [action.resources] : []
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Target className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Risk Treatment Planner</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive automated treatment strategy
              </p>
            </div>
          </div>
          <Button
            onClick={generateTreatmentPlan}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Generate Plan
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!plan && !loading && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-indigo-400/30 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Generate an AI-powered treatment plan for this risk</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Analyzing risk and generating treatment plan...</p>
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            {/* Strategy */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
              <h3 className="text-sm font-semibold text-white mb-2">Recommended Strategy</h3>
              <Badge className="mb-2">{plan.recommended_strategy}</Badge>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.strategy_justification}</p>
            </div>

            {/* Target */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-400 mb-1">Current Score</div>
                <div className="text-xl font-bold text-rose-400">
                  {risk.residual_risk_score || (risk.residual_likelihood * risk.residual_impact)}
                </div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-emerald-500/30">
                <div className="text-xs text-slate-400 mb-1">Target Score</div>
                <div className="text-xl font-bold text-emerald-400">{plan.target_residual_score}</div>
              </div>
            </div>

            {/* Short-term Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Short-term Actions (0-3 months)
              </h3>
              <div className="space-y-2">
                {plan.short_term_actions?.map((action, idx) => (
                  <div key={idx} className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] hover:border-indigo-500/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={priorityColors[action.priority?.toLowerCase()] || priorityColors.medium}>
                            {action.priority}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {action.timeline_days} days
                          </div>
                        </div>
                        <p className="text-sm text-white font-medium">{action.action}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => implementAction(action, "short_term")}
                        className="text-xs"
                      >
                        Implement
                      </Button>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      <span className="font-semibold text-slate-300">Success:</span> {action.success_criteria}
                    </div>
                    {action.resources && (
                      <div className="text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-300">Resources:</span> {action.resources}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Medium-term Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                Medium-term Actions (3-6 months)
              </h3>
              <div className="space-y-2">
                {plan.medium_term_actions?.map((action, idx) => (
                  <div key={idx} className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge className={priorityColors[action.priority?.toLowerCase()] || priorityColors.medium}>
                        {action.priority}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => implementAction(action, "medium_term")}
                        className="text-xs"
                      >
                        Add to Roadmap
                      </Button>
                    </div>
                    <p className="text-sm text-white">{action.action}</p>
                    <div className="text-xs text-slate-400 mt-2">{action.success_criteria}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-term Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Long-term Strategic Actions (6+ months)
              </h3>
              <div className="space-y-2">
                {plan.long_term_actions?.map((action, idx) => (
                  <div key={idx} className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                    <p className="text-sm text-white mb-2">{action.action}</p>
                    <div className="text-xs text-slate-400">{action.expected_impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Control Recommendations */}
            {plan.control_recommendations?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                <h3 className="text-sm font-semibold text-white mb-3">Control Recommendations</h3>
                <div className="space-y-1">
                  {plan.control_recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs */}
            {plan.kpis?.length > 0 && (
              <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <h3 className="text-sm font-semibold text-white mb-3">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.kpis.map((kpi, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      {kpi}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {plan.resource_estimate && (
              <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-500/20">
                <h3 className="text-sm font-semibold text-white mb-2">Resource Requirements</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{plan.resource_estimate}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}