import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Play, RotateCcw, TrendingUp, Target, Loader2, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WhatIfControlOptimizer({ control, risks }) {
  const [scenario, setScenario] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!scenario.trim()) {
      toast.error("Please describe an optimization scenario");
      return;
    }

    setLoading(true);
    try {
      const linkedRisks = risks.filter(r => r.linked_controls?.includes(control.id));

      const prompt = `You are a control optimization expert. Simulate the impact of the following optimization scenario on control "${control.name}".

CURRENT CONTROL STATE:
- Name: ${control.name}
- Domain: ${control.domain}
- Category: ${control.category}
- Current Effectiveness: ${control.effectiveness}/5
- Status: ${control.status}
- Review Frequency: ${control.review_frequency}

LINKED RISKS:
${linkedRisks.map(r => `- ${r.title} (Score: ${r.likelihood * r.impact})`).join('\n')}

OPTIMIZATION SCENARIO:
${scenario}

Analyze and provide:
1. projected_effectiveness (1-5): New effectiveness after optimization
2. effectiveness_change_percentage: % improvement
3. implementation_complexity (low/medium/high)
4. resource_requirements: Resources needed
5. timeline_days: Implementation timeline
6. cost_estimate (low/medium/high)
7. risk_reduction: How much linked risks are reduced (%)
8. automation_potential: Can this be automated (0-100%)
9. roi_score (1-10): Return on investment
10. recommended_steps: Array of implementation steps
11. potential_challenges: Array of challenges
12. success_factors: Array of critical success factors
13. detailed_analysis: Comprehensive explanation

Return detailed JSON analysis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            projected_effectiveness: { type: "number" },
            effectiveness_change_percentage: { type: "number" },
            implementation_complexity: { type: "string" },
            resource_requirements: { type: "string" },
            timeline_days: { type: "number" },
            cost_estimate: { type: "string" },
            risk_reduction: { type: "number" },
            automation_potential: { type: "number" },
            roi_score: { type: "number" },
            recommended_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  duration: { type: "string" },
                  dependencies: { type: "string" }
                }
              }
            },
            potential_challenges: { type: "array", items: { type: "string" } },
            success_factors: { type: "array", items: { type: "string" } },
            detailed_analysis: { type: "string" }
          }
        }
      });

      setSimulation(response);
      toast.success("Optimization simulation completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setScenario("");
    setSimulation(null);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 via-[#1a2332] to-cyan-500/5 border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Lightbulb className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">What-If Control Optimizer</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Model optimization strategies and predict outcomes</p>
            </div>
          </div>
          {simulation && (
            <Button onClick={resetSimulation} variant="outline" size="sm" className="border-blue-500/30">
              <RotateCcw className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!simulation ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <h4 className="text-sm font-semibold text-white mb-3">Current Control State</h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Effectiveness</div>
                  <div className="text-2xl font-bold text-white">{control.effectiveness}/5</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Domain</div>
                  <div className="text-sm font-semibold text-white">{control.domain}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Status</div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">{control.status}</Badge>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="scenario" className="text-white mb-2 block">Describe Optimization Scenario *</Label>
              <Textarea
                id="scenario"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Example: Implement automated continuous monitoring with AI-powered anomaly detection, reducing manual review time by 80% and improving detection accuracy to 95%"
                rows={6}
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2 block text-xs">Quick Optimization Templates</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario("Implement full automation with continuous monitoring, real-time alerting, and automated remediation workflows")}
                  className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                >
                  🤖 Full Automation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario("Increase testing frequency from quarterly to monthly with automated testing tools")}
                  className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                >
                  ⚡ Enhanced Testing
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario("Implement AI-powered predictive analytics to identify potential control failures before they occur")}
                  className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                >
                  🔮 Predictive
                </Button>
              </div>
            </div>

            <Button
              onClick={runSimulation}
              disabled={loading || !scenario.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-2">Current Effectiveness</div>
                  <div className="text-3xl font-bold text-white mb-1">{control.effectiveness}/5</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">Projected</div>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{simulation.projected_effectiveness.toFixed(1)}/5</div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">+{simulation.effectiveness_change_percentage.toFixed(1)}%</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-500 mb-2">Risk Reduction</div>
                <Progress value={simulation.risk_reduction} className="h-2 mb-2" />
                <div className="text-sm font-semibold text-white">{simulation.risk_reduction}%</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-500 mb-2">Automation Potential</div>
                <Progress value={simulation.automation_potential} className="h-2 mb-2" />
                <div className="text-sm font-semibold text-white">{simulation.automation_potential}%</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-500 mb-2">ROI Score</div>
                <Progress value={(simulation.roi_score / 10) * 100} className="h-2 mb-2" />
                <div className="text-sm font-semibold text-white">{simulation.roi_score}/10</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#0f1623] rounded-lg">
                <div className="text-slate-500 mb-1">Complexity</div>
                <Badge className={
                  simulation.implementation_complexity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                  simulation.implementation_complexity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }>{simulation.implementation_complexity}</Badge>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg">
                <div className="text-slate-500 mb-1">Timeline</div>
                <div className="text-white font-semibold">{simulation.timeline_days} days</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg">
                <div className="text-slate-500 mb-1">Cost</div>
                <Badge className="bg-slate-500/20 text-slate-400">{simulation.cost_estimate}</Badge>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                Analysis
              </h4>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{simulation.detailed_analysis}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Implementation Steps</h4>
              <div className="space-y-2">
                {simulation.recommended_steps?.map((step, idx) => (
                  <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-400">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white mb-1">{step.step}</p>
                          <div className="flex gap-2 text-xs">
                            <Badge className="bg-slate-500/20 text-slate-400">⏱️ {step.duration}</Badge>
                            {step.dependencies && <Badge className="bg-blue-500/20 text-blue-400">🔗 {step.dependencies}</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {simulation.success_factors?.length > 0 && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">✓ Success Factors</h4>
                <ul className="space-y-1">
                  {simulation.success_factors.map((factor, idx) => (
                    <li key={idx} className="text-xs text-slate-300 pl-4">• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}