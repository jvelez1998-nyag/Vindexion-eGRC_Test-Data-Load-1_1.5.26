import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Loader2, Target, Clock, DollarSign, Users, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AIMitigationStrategyEngine({ risks = [], controls = [] }) {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [strategies, setStrategies] = useState(null);

  const queryClient = useQueryClient();

  const createActionMutation = useMutation({
    mutationFn: (action) => base44.entities.MitigationAction.create(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mitigation-actions'] });
      toast.success("Mitigation action created");
    }
  });

  const generateStrategies = async () => {
    if (!selectedRisk) return;

    setGenerating(true);
    try {
      const linkedControls = controls.filter(c =>
        selectedRisk.linked_controls?.includes(c.id)
      );

      const context = {
        risk: {
          title: selectedRisk.title,
          category: selectedRisk.category,
          description: selectedRisk.description,
          likelihood: selectedRisk.likelihood,
          impact: selectedRisk.impact,
          current_treatment: selectedRisk.risk_treatment_strategy
        },
        existing_controls: linkedControls.map(c => ({
          name: c.name,
          type: c.category,
          effectiveness: c.effectiveness,
          status: c.status
        })),
        available_control_types: ["preventive", "detective", "corrective", "directive"]
      };

      const prompt = `As a risk mitigation expert, generate comprehensive treatment strategies for this risk:

RISK CONTEXT:
${JSON.stringify(context, null, 2)}

GENERATE MITIGATION STRATEGIES:

For each strategy, provide:
1. Strategy name and description
2. Treatment approach (accept/mitigate/transfer/avoid)
3. Specific mitigation actions (3-5 actionable steps)
4. Recommended controls (suggest specific control implementations)
5. Resource requirements (people, budget, technology)
6. Implementation timeline with milestones
7. Expected risk reduction (likelihood and impact after mitigation)
8. Success metrics and KPIs
9. Implementation complexity (low/medium/high)
10. Cost-benefit analysis
11. Quick wins vs long-term solutions

Provide 3-5 different strategies ranging from minimal (quick wins) to comprehensive (full mitigation).`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  treatment_approach: { type: "string" },
                  mitigation_actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        owner_role: { type: "string" },
                        timeline: { type: "string" },
                        priority: { type: "string" }
                      }
                    }
                  },
                  recommended_controls: { type: "array", items: { type: "string" } },
                  resource_requirements: {
                    type: "object",
                    properties: {
                      people: { type: "string" },
                      budget_estimate: { type: "string" },
                      technology: { type: "string" }
                    }
                  },
                  timeline: {
                    type: "object",
                    properties: {
                      total_duration: { type: "string" },
                      milestones: { type: "array", items: { type: "string" } }
                    }
                  },
                  expected_reduction: {
                    type: "object",
                    properties: {
                      new_likelihood: { type: "number" },
                      new_impact: { type: "number" },
                      risk_reduction_percentage: { type: "number" }
                    }
                  },
                  success_metrics: { type: "array", items: { type: "string" } },
                  complexity: { type: "string" },
                  cost_benefit_score: { type: "number" },
                  strategy_type: { type: "string" }
                }
              }
            },
            overall_recommendation: { type: "string" },
            priority_rationale: { type: "string" }
          }
        }
      });

      setStrategies(result);
      toast.success(`Generated ${result.strategies?.length} mitigation strategies`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate strategies");
    } finally {
      setGenerating(false);
    }
  };

  const createMitigationActions = async (strategy) => {
    try {
      const actions = strategy.mitigation_actions.map(action => ({
        risk_id: selectedRisk.id,
        action_title: action.action,
        action_type: strategy.treatment_approach,
        priority: action.priority,
        owner: action.owner_role,
        timeline: action.timeline,
        status: 'planned',
        expected_risk_reduction: strategy.expected_reduction.risk_reduction_percentage
      }));

      await Promise.all(actions.map(a => createActionMutation.mutateAsync(a)));
      toast.success("Mitigation actions created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create actions");
    }
  };

  const complexityColors = {
    low: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/5 border border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent">
                  AI Mitigation Strategy Generator
                </CardTitle>
                <p className="text-sm text-slate-400 mt-0.5">AI-driven treatment plans with actionable steps</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              value={selectedRisk?.id || ""} 
              onValueChange={(id) => {
                setSelectedRisk(risks.find(r => r.id === id));
                setStrategies(null);
              }}
            >
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Select a risk..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548] text-white">
                {risks.map(risk => (
                  <SelectItem key={risk.id} value={risk.id}>{risk.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={generateStrategies}
              disabled={!selectedRisk || generating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate Strategies</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strategies Display */}
      {strategies && (
        <div className="space-y-6">
          {/* Overall Recommendation */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-white mb-3">Overall Recommendation</h3>
              <p className="text-sm text-slate-200 mb-3">{strategies.overall_recommendation}</p>
              <p className="text-xs text-violet-400">{strategies.priority_rationale}</p>
            </CardContent>
          </Card>

          {/* Strategy Cards */}
          {strategies.strategies?.map((strategy, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548] hover:border-emerald-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                      <Badge className={complexityColors[strategy.complexity]}>
                        {strategy.complexity} complexity
                      </Badge>
                      <Badge className="bg-indigo-500/20 text-indigo-400 capitalize">
                        {strategy.strategy_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300">{strategy.description}</p>
                  </div>
                  <Button
                    onClick={() => createMitigationActions(strategy)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 ml-4"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Implement
                  </Button>
                </div>

                {/* Expected Reduction */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-4 bg-[#151d2e] rounded-xl border border-emerald-500/20">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">New Likelihood</div>
                    <div className="text-xl font-bold text-emerald-400">{strategy.expected_reduction.new_likelihood}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">New Impact</div>
                    <div className="text-xl font-bold text-emerald-400">{strategy.expected_reduction.new_impact}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">Risk Reduction</div>
                    <div className="text-xl font-bold text-emerald-400">{strategy.expected_reduction.risk_reduction_percentage}%</div>
                  </div>
                </div>

                {/* Mitigation Actions */}
                <div className="mb-4">
                  <Label className="text-xs text-slate-500 mb-2 block">Mitigation Actions:</Label>
                  <div className="space-y-2">
                    {strategy.mitigation_actions?.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#151d2e] rounded border border-[#2a3548]">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white mb-1">{action.action}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="border-[#2a3548]">
                              <Users className="h-3 w-3 mr-1" />
                              {action.owner_role}
                            </Badge>
                            <Badge variant="outline" className="border-[#2a3548]">
                              <Clock className="h-3 w-3 mr-1" />
                              {action.timeline}
                            </Badge>
                            <Badge className={
                              action.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                              action.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-emerald-500/20 text-emerald-400'
                            }>
                              {action.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#151d2e] rounded border border-[#2a3548]">
                    <Label className="text-xs text-slate-500 mb-3 block">Resource Requirements:</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span>{strategy.resource_requirements.people}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span>{strategy.resource_requirements.budget_estimate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span>{strategy.resource_requirements.technology}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#151d2e] rounded border border-[#2a3548]">
                    <Label className="text-xs text-slate-500 mb-3 block">Implementation Timeline:</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                        <Clock className="h-4 w-4 text-indigo-400" />
                        <span className="font-semibold">{strategy.timeline.total_duration}</span>
                      </div>
                      {strategy.timeline.milestones?.slice(0, 3).map((milestone, i) => (
                        <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 text-indigo-400" />
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="mt-4">
                  <Label className="text-xs text-slate-500 mb-2 block">Success Metrics:</Label>
                  <div className="flex flex-wrap gap-2">
                    {strategy.success_metrics?.map((metric, i) => (
                      <Badge key={i} variant="outline" className="border-indigo-500/30 text-indigo-400">
                        <Target className="h-3 w-3 mr-1" />
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}