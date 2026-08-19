import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Zap, Loader2, CheckCircle2, Users, Clock, DollarSign, Calendar, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function AIImplementationPlanner({ client, recommendedControls, mitigationStrategies }) {
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [plans, setPlans] = useState(null);
  const [autoSuggestions, setAutoSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [conflictAnalysis, setConflictAnalysis] = useState(null);

  const toggleControl = (idx) => {
    const newSelection = selectedControls.includes(idx) 
      ? selectedControls.filter(i => i !== idx) 
      : [...selectedControls, idx];
    setSelectedControls(newSelection);
    if (newSelection.length > 0 || selectedStrategies.length > 0) {
      generateAutoSuggestions(newSelection, selectedStrategies);
    }
  };

  const toggleStrategy = (idx) => {
    const newSelection = selectedStrategies.includes(idx)
      ? selectedStrategies.filter(i => i !== idx)
      : [...selectedStrategies, idx];
    setSelectedStrategies(newSelection);
    if (selectedControls.length > 0 || newSelection.length > 0) {
      generateAutoSuggestions(selectedControls, newSelection);
    }
  };

  const generateAutoSuggestions = async (controlIndices, strategyIndices) => {
    if (controlIndices.length === 0 && strategyIndices.length === 0) {
      setAutoSuggestions(null);
      setConflictAnalysis(null);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const selectedControlsData = controlIndices.map(idx => recommendedControls[idx]);
      const selectedStrategiesData = strategyIndices.map(idx => mitigationStrategies[idx]);

      const prompt = `You are a GRC implementation expert. Analyze the selected controls and strategies, then provide resource allocation estimates, timeline suggestions, and identify potential conflicts.

CLIENT CONTEXT:
- Industry: ${client.industry}
- Type: ${client.client_type} (affects team size and resources)
- Current Maturity: ${client.control_maturity || 'Not assessed'}

SELECTED ITEMS:
Controls: ${selectedControlsData.map(c => `${c.name} (${c.priority}, effort: ${c.implementation_effort})`).join(', ')}
Strategies: ${selectedStrategiesData.map(s => `${s.title} (${s.priority}, timeline: ${s.timeline})`).join(', ')}

Provide:
1. Quick resource estimates for each item
2. Timeline recommendations
3. Resource conflict analysis (overlapping resource needs)
4. Optimal scheduling strategy (parallel vs sequential)

Response JSON:
{
  "quick_estimates": [
    {
      "item": "<name>",
      "estimated_duration": "<duration>",
      "fte_required": <number>,
      "key_roles": ["<role>"],
      "estimated_cost": "<range>"
    }
  ],
  "resource_conflicts": [
    {
      "conflict_type": "<type>",
      "items_affected": ["<item>"],
      "severity": "low|medium|high",
      "description": "<description>",
      "resolution": "<recommendation>"
    }
  ],
  "optimal_schedule": {
    "approach": "parallel|sequential|hybrid",
    "reasoning": "<why>",
    "phases": [
      {
        "phase": "<name>",
        "items": ["<item>"],
        "duration": "<duration>",
        "parallelizable": <boolean>
      }
    ]
  },
  "total_estimates": {
    "duration": "<duration>",
    "peak_fte": <number>,
    "total_cost": "<range>"
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            quick_estimates: { type: "array" },
            resource_conflicts: { type: "array" },
            optimal_schedule: { type: "object" },
            total_estimates: { type: "object" }
          }
        }
      });

      setAutoSuggestions(response);
      setConflictAnalysis(response.resource_conflicts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const generateImplementationPlans = async () => {
    if (selectedControls.length === 0 && selectedStrategies.length === 0) {
      toast.error("Please select at least one control or strategy");
      return;
    }

    setGenerating(true);
    try {
      const selectedControlsData = selectedControls.map(idx => recommendedControls[idx]);
      const selectedStrategiesData = selectedStrategies.map(idx => mitigationStrategies[idx]);

      const prompt = `You are a GRC implementation expert. Generate detailed, actionable implementation plans for the selected controls and mitigation strategies.

CLIENT CONTEXT:
- Name: ${client.name}
- Industry: ${client.industry}
- Type: ${client.client_type}
- Current Maturity: ${client.control_maturity || 'Not assessed'}

SELECTED CONTROLS TO IMPLEMENT:
${selectedControlsData.map((c, i) => `${i + 1}. ${c.name} (${c.type}, Priority: ${c.priority})
   Description: ${c.description}
   Implementation Effort: ${c.implementation_effort}`).join('\n\n')}

SELECTED MITIGATION STRATEGIES:
${selectedStrategiesData.map((s, i) => `${i + 1}. ${s.title} (${s.priority})
   Timeline: ${s.timeline}
   Actions: ${s.actions.join(', ')}`).join('\n\n')}

For each control and strategy, provide:
1. Detailed task breakdown (phases and specific tasks)
2. Resource allocation (roles needed, FTE estimates)
3. Timeline with milestones
4. Dependencies and prerequisites
5. Success criteria and KPIs
6. Budget estimates tailored to ${client.client_type} size
7. Risk mitigation during implementation

Provide response in this JSON structure:
{
  "implementation_plans": [
    {
      "item_name": "<control or strategy name>",
      "item_type": "control|strategy",
      "priority": "<priority>",
      "overview": "<implementation overview>",
      "phases": [
        {
          "phase": "<phase name>",
          "duration": "<duration>",
          "tasks": [
            {
              "task": "<task description>",
              "owner": "<role>",
              "duration": "<duration>",
              "dependencies": ["<dependency>"]
            }
          ]
        }
      ],
      "resources": {
        "roles_needed": [
          {
            "role": "<role name>",
            "fte": <number>,
            "duration": "<duration>",
            "cost_range": "<cost estimate>"
          }
        ],
        "external_resources": ["<resource>"],
        "tools_required": ["<tool>"]
      },
      "timeline": {
        "total_duration": "<duration>",
        "start_date_recommendation": "<recommendation>",
        "milestones": [
          {
            "milestone": "<milestone name>",
            "target": "<timeframe>",
            "deliverables": ["<deliverable>"]
          }
        ]
      },
      "budget": {
        "estimated_cost": "<cost range>",
        "breakdown": {
          "labor": "<cost>",
          "tools": "<cost>",
          "external_services": "<cost>",
          "contingency": "<cost>"
        }
      },
      "success_criteria": ["<criteria>"],
      "kpis": [
        {
          "kpi": "<kpi name>",
          "target": "<target value>",
          "measurement": "<how to measure>"
        }
      ],
      "implementation_risks": [
        {
          "risk": "<risk>",
          "mitigation": "<mitigation>"
        }
      ]
    }
  ],
  "overall_summary": {
    "total_duration": "<duration>",
    "total_estimated_cost": "<cost range>",
    "total_fte_required": <number>,
    "recommended_approach": "<sequential|parallel>",
    "critical_path": ["<item>"]
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            implementation_plans: { type: "array" },
            overall_summary: { type: "object" }
          }
        }
      });

      setPlans(response);
      toast.success("Implementation plans generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate plans: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'P1' || priority === 'critical') return 'bg-rose-500/10 text-rose-400';
    if (priority === 'P2' || priority === 'high') return 'bg-orange-500/10 text-orange-400';
    if (priority === 'P3' || priority === 'medium') return 'bg-amber-500/10 text-amber-400';
    return 'bg-blue-500/10 text-blue-400';
  };

  if (!recommendedControls && !mitigationStrategies) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Run comprehensive risk assessment first to generate implementation plans</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-cyan-400" />
            AI Implementation Planner
          </CardTitle>
          <Button
            onClick={generateImplementationPlans}
            disabled={generating || (selectedControls.length === 0 && selectedStrategies.length === 0)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Plans
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Auto Suggestions */}
        {autoSuggestions && !plans && (
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                AI Quick Estimates
              </h3>
              
              {/* Total Estimates */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2 rounded bg-[#1a2332] text-center">
                  <div className="text-xs text-slate-500">Total Duration</div>
                  <div className="text-lg font-bold text-white">{autoSuggestions.total_estimates.duration}</div>
                </div>
                <div className="p-2 rounded bg-[#1a2332] text-center">
                  <div className="text-xs text-slate-500">Peak FTE</div>
                  <div className="text-lg font-bold text-white">{autoSuggestions.total_estimates.peak_fte}</div>
                </div>
                <div className="p-2 rounded bg-[#1a2332] text-center">
                  <div className="text-xs text-slate-500">Est. Cost</div>
                  <div className="text-lg font-bold text-white">{autoSuggestions.total_estimates.total_cost}</div>
                </div>
              </div>

              {/* Optimal Schedule */}
              <div className="p-3 rounded bg-[#1a2332] mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Recommended Approach</span>
                  <Badge className="bg-cyan-500/20 text-cyan-400">{autoSuggestions.optimal_schedule.approach}</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-2">{autoSuggestions.optimal_schedule.reasoning}</p>
                <div className="space-y-1">
                  {autoSuggestions.optimal_schedule.phases?.map((phase, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{phase.phase}: {phase.items.join(', ')}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-blue-500/10 text-blue-400">{phase.duration}</Badge>
                        {phase.parallelizable && (
                          <Badge className="text-xs bg-emerald-500/10 text-emerald-400">Parallel</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conflict Analysis */}
              {conflictAnalysis?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Resource Conflicts Detected
                  </h4>
                  {conflictAnalysis.map((conflict, idx) => (
                    <div key={idx} className="p-2 rounded bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-amber-400">{conflict.conflict_type}</span>
                        <Badge className={
                          conflict.severity === 'high' ? 'bg-rose-500/10 text-rose-400' :
                          conflict.severity === 'medium' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }>
                          {conflict.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{conflict.description}</p>
                      <div className="text-xs text-emerald-400">
                        <span className="font-medium">Resolution:</span> {conflict.resolution}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loadingSuggestions && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span className="text-sm text-cyan-400">Analyzing resource allocation and scheduling...</span>
          </div>
        )}

        {/* Selection Section */}
        {!plans && (
          <>
            <div>
              <h3 className="text-white font-semibold mb-3">Select Controls to Implement</h3>
              <div className="space-y-2">
                {recommendedControls?.map((control, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-cyan-500/30">
                    <Checkbox
                      checked={selectedControls.includes(idx)}
                      onCheckedChange={() => toggleControl(idx)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{control.name}</span>
                        <Badge className={getPriorityColor(control.priority)}>{control.priority}</Badge>
                        <Badge className="bg-cyan-500/10 text-cyan-400 text-xs">{control.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-400">{control.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Select Mitigation Strategies to Implement</h3>
              <div className="space-y-2">
                {mitigationStrategies?.map((strategy, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-cyan-500/30">
                    <Checkbox
                      checked={selectedStrategies.includes(idx)}
                      onCheckedChange={() => toggleStrategy(idx)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{strategy.title}</span>
                        <Badge className={getPriorityColor(strategy.priority)}>{strategy.priority}</Badge>
                        <Badge className="bg-slate-500/10 text-slate-400 text-xs">{strategy.timeline}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {strategy.actions?.slice(0, 3).map((action, aIdx) => (
                          <Badge key={aIdx} className="bg-emerald-500/10 text-emerald-400 text-xs">
                            {action.substring(0, 50)}{action.length > 50 ? '...' : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Implementation Plans */}
        {plans && (
          <div className="space-y-6">
            {/* Overall Summary */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Overall Implementation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{plans.overall_summary.total_duration}</div>
                    <div className="text-xs text-slate-400">Total Duration</div>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{plans.overall_summary.total_estimated_cost}</div>
                    <div className="text-xs text-slate-400">Estimated Cost</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{plans.overall_summary.total_fte_required}</div>
                    <div className="text-xs text-slate-400">FTE Required</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-500">Approach:</span> <span className="font-semibold">{plans.overall_summary.recommended_approach}</span>
                  </div>
                  {plans.overall_summary.critical_path?.length > 0 && (
                    <div className="text-sm text-slate-300 mt-1">
                      <span className="text-slate-500">Critical Path:</span> {plans.overall_summary.critical_path.join(' → ')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Individual Plans */}
            {plans.implementation_plans?.map((plan, idx) => (
              <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-white">{plan.item_name}</CardTitle>
                      <Badge className={getPriorityColor(plan.priority)}>{plan.priority}</Badge>
                      <Badge className="bg-slate-500/10 text-slate-400">{plan.item_type}</Badge>
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-400">{plan.timeline.total_duration}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{plan.overview}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Phases */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-cyan-400" />
                      Implementation Phases
                    </h4>
                    <div className="space-y-3">
                      {plan.phases?.map((phase, pIdx) => (
                        <div key={pIdx} className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{phase.phase}</span>
                            <Badge className="bg-blue-500/10 text-blue-400 text-xs">{phase.duration}</Badge>
                          </div>
                          <div className="space-y-1">
                            {phase.tasks?.map((task, tIdx) => (
                              <div key={tIdx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-slate-300">{task.task}</span>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                    <span>Owner: {task.owner}</span>
                                    <span>•</span>
                                    <span>{task.duration}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-400" />
                        Resource Allocation
                      </h5>
                      {plan.resources.roles_needed?.map((role, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-sm mt-2">
                          <span className="text-slate-300">{role.role}</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-violet-500/10 text-violet-400 text-xs">{role.fte} FTE</Badge>
                            <span className="text-xs text-slate-500">{role.cost_range}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        Budget Breakdown
                      </h5>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Labor:</span>
                          <span>{plan.budget.breakdown.labor}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Tools:</span>
                          <span>{plan.budget.breakdown.tools}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>External:</span>
                          <span>{plan.budget.breakdown.external_services}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 pt-2 border-t border-[#2a3548]">
                          <span className="font-semibold">Total:</span>
                          <span className="font-semibold text-emerald-400">{plan.budget.estimated_cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                    <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      Key Milestones
                    </h5>
                    <div className="space-y-2">
                      {plan.timeline.milestones?.map((milestone, mIdx) => (
                        <div key={mIdx} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white font-medium">{milestone.milestone}</span>
                              <Badge className="bg-blue-500/10 text-blue-400 text-xs">{milestone.target}</Badge>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {milestone.deliverables?.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <h5 className="text-white font-semibold mb-2">Success Criteria & KPIs</h5>
                    <div className="space-y-2">
                      {plan.kpis?.map((kpi, kIdx) => (
                        <div key={kIdx} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">{kpi.kpi}</span>
                            <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">Target: {kpi.target}</Badge>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{kpi.measurement}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Implementation Risks */}
                  {plan.implementation_risks?.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <h5 className="text-white font-semibold mb-2">Implementation Risks</h5>
                      <div className="space-y-2">
                        {plan.implementation_risks.map((risk, rIdx) => (
                          <div key={rIdx} className="text-sm">
                            <div className="text-amber-400 font-medium">{risk.risk}</div>
                            <div className="text-slate-400 text-xs mt-0.5">Mitigation: {risk.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={() => setPlans(null)}
              variant="outline"
              className="w-full border-[#2a3548] hover:bg-[#2a3548]"
            >
              Generate New Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}