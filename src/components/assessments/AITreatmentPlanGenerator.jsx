import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Download, CheckCircle2, Calendar, Users, Target } from "lucide-react";
import { toast } from "sonner";

export default function AITreatmentPlanGenerator({ risks = [] }) {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [treatmentPlan, setTreatmentPlan] = useState(null);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Risk.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success("Treatment plan applied to risk");
    }
  });

  const generatePlan = async () => {
    if (!selectedRisk) return;

    setGenerating(true);
    try {
      const prompt = `Generate a comprehensive, actionable risk treatment plan:

RISK DETAILS:
Title: ${selectedRisk.title}
Category: ${selectedRisk.category}
Description: ${selectedRisk.description}
Current Risk Score: ${(selectedRisk.likelihood || 0) * (selectedRisk.impact || 0)}
Current Treatment: ${selectedRisk.risk_treatment_strategy || 'None'}

CREATE A DETAILED TREATMENT PLAN:

1. Treatment Strategy Selection & Rationale
2. Detailed Action Plan (step-by-step implementation)
3. Roles & Responsibilities (specific assignments)
4. Timeline & Milestones (with dates)
5. Resource Allocation (budget, people, tools)
6. Success Criteria & KPIs
7. Risk Monitoring Plan (ongoing assessment)
8. Contingency Plans (if treatment fails)
9. Stakeholder Communication Plan
10. Documentation Requirements

Make it executive-ready and immediately actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            treatment_strategy: { type: "string" },
            strategy_rationale: { type: "string" },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  description: { type: "string" },
                  responsible_role: { type: "string" },
                  timeline: { type: "string" },
                  dependencies: { type: "string" }
                }
              }
            },
            roles_responsibilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  responsibilities: { type: "string" },
                  time_commitment: { type: "string" }
                }
              }
            },
            timeline: {
              type: "object",
              properties: {
                total_duration: { type: "string" },
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration: { type: "string" },
                      deliverables: { type: "string" }
                    }
                  }
                }
              }
            },
            resources: {
              type: "object",
              properties: {
                budget_estimate: { type: "string" },
                personnel_required: { type: "string" },
                technology_tools: { type: "string" },
                external_support: { type: "string" }
              }
            },
            success_criteria: { type: "array", items: { type: "string" } },
            kpis: { type: "array", items: { type: "string" } },
            monitoring_plan: { type: "string" },
            contingency_plan: { type: "string" },
            communication_plan: { type: "string" },
            documentation_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });

      setTreatmentPlan(result);
      toast.success("Treatment plan generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate treatment plan");
    } finally {
      setGenerating(false);
    }
  };

  const applyPlanToRisk = async () => {
    if (!selectedRisk || !treatmentPlan) return;

    const planText = `
TREATMENT STRATEGY: ${treatmentPlan.treatment_strategy}

RATIONALE:
${treatmentPlan.strategy_rationale}

ACTION PLAN:
${treatmentPlan.action_plan?.map((step, i) => `
${i + 1}. ${step.step}
   Description: ${step.description}
   Owner: ${step.responsible_role}
   Timeline: ${step.timeline}
`).join('\n')}

TIMELINE: ${treatmentPlan.timeline?.total_duration}

RESOURCES REQUIRED:
- Budget: ${treatmentPlan.resources?.budget_estimate}
- Personnel: ${treatmentPlan.resources?.personnel_required}
- Technology: ${treatmentPlan.resources?.technology_tools}

SUCCESS CRITERIA:
${treatmentPlan.success_criteria?.map((c, i) => `${i + 1}. ${c}`).join('\n')}

MONITORING: ${treatmentPlan.monitoring_plan}
    `;

    updateMutation.mutate({
      id: selectedRisk.id,
      data: {
        risk_treatment_strategy: treatmentPlan.treatment_strategy.split(' ')[0].toLowerCase(),
        mitigation_plan: planText,
        mitigation_actions: treatmentPlan.action_plan
      }
    });
  };

  const downloadPlan = () => {
    if (!treatmentPlan) return;

    const text = `RISK TREATMENT PLAN
Generated: ${new Date().toLocaleString()}
Risk: ${selectedRisk.title}

${treatmentPlan.treatment_strategy}

${treatmentPlan.strategy_rationale}

ACTION PLAN:
${treatmentPlan.action_plan?.map((step, i) => `
${i + 1}. ${step.step}
   ${step.description}
   Owner: ${step.responsible_role}
   Timeline: ${step.timeline}
`).join('\n')}

FULL PLAN DETAILS AVAILABLE IN APPLICATION
    `;

    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treatment_plan_${selectedRisk.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success("Plan downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Selection & Generation */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Generate AI Treatment Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={selectedRisk?.id || ""} 
            onValueChange={(id) => {
              setSelectedRisk(risks.find(r => r.id === id));
              setTreatmentPlan(null);
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
            onClick={generatePlan}
            disabled={!selectedRisk || generating}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating Plan...</>
            ) : (
              <><FileText className="h-4 w-4 mr-2" /> Generate Treatment Plan</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Treatment Plan Display */}
      {treatmentPlan && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">AI-Generated Treatment Plan</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={downloadPlan} size="sm" variant="outline" className="border-[#2a3548]">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={applyPlanToRisk} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Apply to Risk
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strategy */}
            <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
              <h3 className="text-sm font-bold text-white mb-2">Treatment Strategy</h3>
              <p className="text-base text-white font-semibold mb-2">{treatmentPlan.treatment_strategy}</p>
              <p className="text-sm text-slate-300">{treatmentPlan.strategy_rationale}</p>
            </div>

            {/* Action Plan */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Action Plan</h3>
              <div className="space-y-3">
                {treatmentPlan.action_plan?.map((step, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{step.step}</h4>
                          <p className="text-xs text-slate-300 mb-2">{step.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                              <Users className="h-3 w-3 mr-1" />
                              {step.responsible_role}
                            </Badge>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {step.timeline}
                            </Badge>
                          </div>
                          {step.dependencies && (
                            <p className="text-xs text-slate-500 mt-2">Dependencies: {step.dependencies}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Timeline Phases */}
            <div className="p-4 bg-[#151d2e] rounded border border-[#2a3548]">
              <h3 className="text-sm font-bold text-white mb-3">Implementation Phases ({treatmentPlan.timeline?.total_duration})</h3>
              <div className="space-y-2">
                {treatmentPlan.timeline?.phases?.map((phase, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-[#1a2332] rounded">
                    <Badge className="bg-indigo-500/20 text-indigo-400 mt-0.5">{idx + 1}</Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{phase.phase}</span>
                        <Badge variant="outline" className="text-xs border-[#2a3548]">{phase.duration}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">{phase.deliverables}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Metrics & KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#151d2e] rounded border border-emerald-500/20">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  Success Criteria
                </h3>
                <div className="space-y-1">
                  {treatmentPlan.success_criteria?.map((criterion, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-400" />
                      <span>{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#151d2e] rounded border border-indigo-500/20">
                <h3 className="text-sm font-bold text-white mb-3">Key Performance Indicators</h3>
                <div className="space-y-1">
                  {treatmentPlan.kpis?.map((kpi, i) => (
                    <div key={i} className="text-xs text-slate-300">• {kpi}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}