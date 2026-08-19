import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Brain, Target, Shield, CheckCircle2, Loader2, Sparkles, Clock, TrendingUp } from "lucide-react";

export default function AIThreatMitigationPlanner({ threat, vulnerability }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const queryClient = useQueryClient();

  const createControlMutation = useMutation({
    mutationFn: (data) => base44.entities.Control.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      toast.success("Control created");
    }
  });

  const item = threat || vulnerability;
  const itemType = threat ? 'threat' : 'vulnerability';

  const generatePlan = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive mitigation plan for this ${itemType}:

${itemType.toUpperCase()} DETAILS:
${JSON.stringify(item, null, 2)}

Provide a detailed mitigation plan with:
1. Immediate actions (0-7 days)
2. Short-term actions (1-30 days)
3. Medium-term actions (1-3 months)
4. Long-term strategic controls
5. Recommended control implementations
6. Resource requirements
7. Success metrics

Return JSON with:
- executive_summary (string)
- immediate_actions (array of {action, timeline, owner, priority})
- short_term_actions (array)
- medium_term_actions (array)
- long_term_actions (array)
- recommended_controls (array of {name, description, domain, category, effectiveness_target})
- resource_requirements (string)
- success_metrics (array of strings)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeline: { type: "string" },
                  owner: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            short_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeline: { type: "string" },
                  owner: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            medium_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeline: { type: "string" },
                  owner: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            long_term_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeline: { type: "string" },
                  owner: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            recommended_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  domain: { type: "string" },
                  category: { type: "string" },
                  effectiveness_target: { type: "number" }
                }
              }
            },
            resource_requirements: { type: "string" },
            success_metrics: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPlan(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const implementControl = (control) => {
    createControlMutation.mutate({
      name: control.name,
      description: control.description,
      domain: control.domain || 'network_security',
      category: control.category || 'preventive',
      status: 'planned',
      control_objective: `Mitigate ${itemType}: ${item.name || item.title}`
    });
  };

  const priorityColors = {
    critical: 'bg-rose-500/20 text-rose-400',
    high: 'bg-amber-500/20 text-amber-400',
    medium: 'bg-blue-500/20 text-blue-400',
    low: 'bg-slate-500/20 text-slate-400'
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-base text-white">AI Mitigation Planner</CardTitle>
          </div>
          <Button
            onClick={generatePlan}
            disabled={loading || !item}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Generate Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!item ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">Select a threat or vulnerability to generate mitigation plan</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          </div>
        ) : !plan ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-12 w-12 text-purple-400 mb-3 opacity-50" />
            <p className="text-sm text-slate-400">Click Generate Plan for AI-powered mitigation strategy</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-xs text-slate-300 leading-relaxed">{plan.executive_summary}</p>
              </div>

              {/* Immediate Actions */}
              {plan.immediate_actions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-rose-400" />
                    <h4 className="text-sm font-semibold text-white">Immediate Actions (0-7 days)</h4>
                  </div>
                  <div className="space-y-2">
                    {plan.immediate_actions.map((action, i) => (
                      <div key={i} className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-xs text-white flex-1">{action.action}</p>
                          <Badge className={priorityColors[action.priority?.toLowerCase()]}>{action.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{action.timeline}</span>
                          <span>•</span>
                          <span>{action.owner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short-term Actions */}
              {plan.short_term_actions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-white">Short-term Actions (1-30 days)</h4>
                  </div>
                  <div className="space-y-2">
                    {plan.short_term_actions.map((action, i) => (
                      <div key={i} className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-xs text-white flex-1">{action.action}</p>
                          <Badge className={priorityColors[action.priority?.toLowerCase()]}>{action.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{action.timeline}</span>
                          <span>•</span>
                          <span>{action.owner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Controls */}
              {plan.recommended_controls?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-white">Recommended Controls</h4>
                  </div>
                  <div className="space-y-2">
                    {plan.recommended_controls.map((control, i) => (
                      <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white mb-1">{control.name}</p>
                            <p className="text-xs text-slate-400">{control.description}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => implementControl(control)}
                            disabled={createControlMutation.isPending}
                            className="h-7 bg-emerald-600 hover:bg-emerald-700 ml-2"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Create
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-[9px] bg-slate-500/20 text-slate-400">{control.domain}</Badge>
                          <Badge className="text-[9px] bg-indigo-500/20 text-indigo-400">{control.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Metrics */}
              {plan.success_metrics?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <h4 className="text-sm font-semibold text-white">Success Metrics</h4>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <ul className="space-y-1">
                      {plan.success_metrics.map((metric, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}