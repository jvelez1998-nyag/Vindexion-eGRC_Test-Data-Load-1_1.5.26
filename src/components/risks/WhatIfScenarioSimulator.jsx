import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Lightbulb, Play, RotateCcw, TrendingDown, TrendingUp, Target, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WhatIfScenarioSimulator({ risk, controls }) {
  const [scenario, setScenario] = useState("");
  const [controlAdjustments, setControlAdjustments] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!scenario.trim()) {
      toast.error("Please describe a scenario");
      return;
    }

    setLoading(true);
    try {
      const linkedControls = controls.filter(c => 
        risk.linked_controls?.includes(c.id)
      );

      const prompt = `You are a risk mitigation analyst. Simulate the impact of the following scenario on risk "${risk.title}".

CURRENT RISK STATE:
- Title: ${risk.title}
- Category: ${risk.category}
- Current Score: ${risk.dynamic_score || risk.likelihood * risk.impact}
- Likelihood: ${risk.likelihood}/5
- Impact: ${risk.impact}/5
- Status: ${risk.status}

LINKED CONTROLS:
${linkedControls.map(c => `- ${c.name} (Effectiveness: ${c.effectiveness}/5, Status: ${c.status})`).join('\n')}

SCENARIO:
${scenario}

${controlAdjustments.length > 0 ? `
CONTROL ADJUSTMENTS:
${controlAdjustments.map(adj => `- ${adj.control}: ${adj.adjustment}`).join('\n')}
` : ''}

Analyze and provide:
1. projected_likelihood (1-5): New likelihood after scenario
2. projected_impact (1-5): New impact after scenario
3. projected_score (1-25): New risk score
4. risk_change_percentage: % change from current
5. mitigation_effectiveness: How well controls mitigate in this scenario (0-100%)
6. new_vulnerabilities: Array of new risks this scenario introduces
7. recommended_actions: Array of specific actions to take
8. timeline: Estimated time to implement (days)
9. cost_estimate: Relative cost (low/medium/high)
10. success_probability: Likelihood of successful mitigation (0-100%)
11. detailed_analysis: Comprehensive explanation of the simulation

Return detailed JSON analysis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            projected_likelihood: { type: "number" },
            projected_impact: { type: "number" },
            projected_score: { type: "number" },
            risk_change_percentage: { type: "number" },
            mitigation_effectiveness: { type: "number" },
            new_vulnerabilities: {
              type: "array",
              items: { type: "string" }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            timeline: { type: "number" },
            cost_estimate: { type: "string" },
            success_probability: { type: "number" },
            detailed_analysis: { type: "string" }
          }
        }
      });

      setSimulation(response);
      toast.success("Scenario simulation completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setScenario("");
    setControlAdjustments([]);
    setSimulation(null);
  };

  const currentScore = risk.dynamic_score || risk.likelihood * risk.impact;

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 via-[#1a2332] to-cyan-500/5 border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Lightbulb className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">What-If Scenario Simulator</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Model mitigation strategies and predict outcomes</p>
            </div>
          </div>
          {simulation && (
            <Button
              onClick={resetSimulation}
              variant="outline"
              size="sm"
              className="border-blue-500/30"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!simulation ? (
          <div className="space-y-4">
            {/* Current State */}
            <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <h4 className="text-sm font-semibold text-white mb-3">Current Risk State</h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Current Score</div>
                  <div className="text-2xl font-bold text-white">{currentScore}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Likelihood</div>
                  <div className="text-lg font-semibold text-white">{risk.likelihood}/5</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Impact</div>
                  <div className="text-lg font-semibold text-white">{risk.impact}/5</div>
                </div>
              </div>
            </div>

            {/* Scenario Input */}
            <div>
              <Label htmlFor="scenario" className="text-white mb-2 block">
                Describe Your Scenario *
              </Label>
              <Textarea
                id="scenario"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Example: What if we implement a new automated monitoring system that reduces detection time by 75% and add quarterly security training for all staff?"
                rows={6}
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Tip: Be specific about controls, timelines, resources, and expected outcomes
              </p>
            </div>

            {/* Quick Scenarios */}
            <div>
              <Label className="text-white mb-2 block text-xs">Quick Scenario Templates</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario("Implement automated detection system with 90% accuracy, reducing response time from 4 hours to 15 minutes")}
                  className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                >
                  🤖 Automation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario("Add redundant systems and failover mechanisms, increasing infrastructure costs by 30% but reducing downtime risk by 80%")}
                  className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                >
                  🔄 Redundancy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario("Implement comprehensive staff training program with monthly drills, certification requirements, and performance tracking")}
                  className="text-xs border-blue-500/30 hover:bg-blue-500/10"
                >
                  📚 Training
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
                  Simulating Scenario...
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
            {/* Results Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-2">Current Score</div>
                  <div className="text-3xl font-bold text-white mb-1">{currentScore}</div>
                  <div className="text-xs text-slate-500">Baseline</div>
                </CardContent>
              </Card>
              <Card className={`${
                simulation.projected_score < currentScore 
                  ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30' 
                  : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">Projected Score</div>
                    {simulation.projected_score < currentScore ? (
                      <TrendingDown className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${
                    simulation.projected_score < currentScore ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {simulation.projected_score.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className={
                      simulation.risk_change_percentage < 0 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }>
                      {simulation.risk_change_percentage > 0 ? '+' : ''}
                      {simulation.risk_change_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-500 mb-2">Mitigation Effectiveness</div>
                <Progress value={simulation.mitigation_effectiveness} className="h-2 mb-2" />
                <div className="text-sm font-semibold text-white">{simulation.mitigation_effectiveness}%</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-500 mb-2">Success Probability</div>
                <Progress value={simulation.success_probability} className="h-2 mb-2" />
                <div className="text-sm font-semibold text-white">{simulation.success_probability}%</div>
              </div>
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="text-xs text-slate-500 mb-2">Implementation</div>
                <div className="text-sm font-semibold text-white">{simulation.timeline} days</div>
                <Badge className="mt-1 text-xs bg-slate-500/20 text-slate-400">
                  {simulation.cost_estimate} cost
                </Badge>
              </div>
            </div>

            {/* Analysis */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                Detailed Analysis
              </h4>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{simulation.detailed_analysis}</p>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {simulation.recommended_actions?.map((action, idx) => (
                  <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-white mb-1">{action.action}</p>
                          <p className="text-xs text-slate-400">{action.impact}</p>
                        </div>
                        <Badge className={
                          action.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          action.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {action.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* New Vulnerabilities */}
            {simulation.new_vulnerabilities?.length > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">⚠️ New Vulnerabilities</h4>
                <ul className="space-y-1">
                  {simulation.new_vulnerabilities.map((vuln, idx) => (
                    <li key={idx} className="text-xs text-slate-300 pl-4">• {vuln}</li>
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