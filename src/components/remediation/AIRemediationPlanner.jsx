import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Plus, CheckCircle2, AlertTriangle, Clock, DollarSign, Users, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function AIRemediationPlanner({ finding, onPlanCreated }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [resourceAnalysis, setResourceAnalysis] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const queryClient = useQueryClient();

  const { data: allTasks = [] } = useQuery({
    queryKey: ['remediation-tasks'],
    queryFn: () => base44.entities.RemediationTask.list()
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.RemediationTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
      toast.success("Remediation task created");
    }
  });

  const generatePlan = async () => {
    setLoading(true);
    try {
      // Context from ongoing activities
      const ongoingTasks = allTasks.filter(t => t.status === 'in_progress' || t.status === 'planned');
      const ongoingTests = controlTests.filter(t => t.status === 'in_progress' || t.status === 'planned');
      const relatedFindings = findings.filter(f => 
        f.category === finding.category && f.id !== finding.id
      );

      const prompt = `As an expert remediation strategist, create a comprehensive remediation plan with automated resource allocation and optimal scheduling.

FINDING DETAILS:
Title: ${finding.title}
Severity: ${finding.severity}
Category: ${finding.category}
Description: ${finding.description}
Condition: ${finding.condition || 'N/A'}
Cause: ${finding.cause || 'N/A'}
Effect: ${finding.effect || 'N/A'}
Current Recommendation: ${finding.recommendation || 'N/A'}

CURRENT ENVIRONMENT:
- Ongoing Remediation Tasks: ${ongoingTasks.length}
- Active Control Tests: ${ongoingTests.length}
- Related Findings: ${relatedFindings.length}

REQUIREMENTS:
1. Create multi-phase remediation with resource allocation
2. Suggest specific roles needed (Security Analyst, Compliance Officer, IT Admin, Developer, etc.)
3. Estimate FTE requirements and person-hours for each task
4. Identify optimal start dates considering ongoing activities
5. Flag tasks that can be executed in parallel
6. Detect resource conflicts and suggest mitigation
7. Recommend budget allocation per task and phase
8. Create realistic timelines with buffer periods
9. Link to control testing where applicable

Provide a detailed plan with resource allocation, scheduling, and conflict analysis.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            root_cause_analysis: { type: "string" },
            remediation_approach: { type: "string" },
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_name: { type: "string" },
                  description: { type: "string" },
                  duration: { type: "string" }
                }
              }
            },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  estimated_hours: { type: "number" },
                  estimated_cost: { type: "number" },
                  suggested_owner_role: { type: "string" },
                  fte_required: { type: "number" },
                  resource_requirements: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        role: { type: "string" },
                        hours: { type: "number" }
                      }
                    }
                  },
                  can_parallelize: { type: "boolean" },
                  optimal_start_date: { type: "string" },
                  dependencies: { type: "array", items: { type: "string" } },
                  expected_outcome: { type: "string" },
                  verification_method: { type: "string" },
                  timeline_days: { type: "number" },
                  linked_control_test: { type: "string" }
                }
              }
            },
            resource_allocation: {
              type: "object",
              properties: {
                total_fte_required: { type: "number" },
                peak_fte: { type: "number" },
                roles_breakdown: { type: "array", items: { type: "object" } },
                budget_breakdown: { type: "object" }
              }
            },
            scheduling_strategy: {
              type: "object",
              properties: {
                approach: { type: "string" },
                parallel_tracks: { type: "array" },
                critical_path: { type: "array", items: { type: "string" } },
                buffer_days: { type: "number" }
              }
            },
            resource_conflicts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  conflict_type: { type: "string" },
                  affected_tasks: { type: "array", items: { type: "string" } },
                  severity: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            success_criteria: { type: "array", items: { type: "string" } },
            risks_and_mitigations: { type: "array", items: { type: "string" } },
            estimated_total_hours: { type: "number" },
            estimated_total_cost: { type: "number" },
            recommended_timeline: { type: "string" }
          }
        }
      });

      setPlan(result);
      
      // Auto-generate resource analysis
      await analyzeResources(result);
      
      toast.success("Remediation plan with resource allocation generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const analyzeResources = async (planData) => {
    setLoadingResources(true);
    try {
      const prompt = `Analyze resource allocation for this remediation plan and identify conflicts:

PLAN SUMMARY:
Total Tasks: ${planData.tasks?.length}
Total Hours: ${planData.estimated_total_hours}
Timeline: ${planData.recommended_timeline}

TASKS:
${planData.tasks?.map(t => `- ${t.title} (${t.fte_required} FTE, ${t.estimated_hours}h, ${t.can_parallelize ? 'Parallel' : 'Sequential'})`).join('\n')}

ONGOING ACTIVITIES:
- Active Remediation Tasks: ${ongoingTasks.length}
- Control Tests in Progress: ${ongoingTests.length}

Provide:
1. Optimal execution timeline with specific dates
2. Resource conflict identification
3. Parallel execution opportunities
4. Load balancing recommendations
5. Budget optimization strategies`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            execution_timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                  total_fte: { type: "number" }
                }
              }
            },
            conflicts_detected: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  severity: { type: "string" },
                  resolution: { type: "string" }
                }
              }
            },
            parallel_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_group: { type: "array", items: { type: "string" } },
                  potential_savings: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResourceAnalysis(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResources(false);
    }
  };

  const createTask = async (task) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (task.timeline_days || 30));

    await createTaskMutation.mutateAsync({
      finding_id: finding.id,
      title: task.title,
      description: task.description,
      remediation_plan: plan.remediation_approach,
      priority: task.priority?.toLowerCase() || 'medium',
      estimated_effort_hours: task.estimated_hours,
      estimated_cost: task.estimated_cost,
      expected_outcome: task.expected_outcome,
      due_date: dueDate.toISOString().split('T')[0],
      ai_generated: true
    });

    if (onPlanCreated) onPlanCreated();
  };

  const createAllTasks = async () => {
    try {
      for (const task of plan.tasks) {
        await createTask(task);
      }
      toast.success(`Created ${plan.tasks.length} remediation tasks`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create some tasks");
    }
  };

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-base text-white">AI Remediation Planner</CardTitle>
          </div>
          <Button 
            onClick={generatePlan} 
            disabled={loading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            {plan ? 'Regenerate' : 'Generate Plan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!plan && !loading && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Generate an AI-powered remediation plan</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          </div>
        )}

        {plan && (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{plan.executive_summary}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] text-slate-500">Timeline</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{plan.recommended_timeline}</p>
                </div>
                <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] text-slate-500">Total Hours</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{plan.estimated_total_hours}h</p>
                </div>
                <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] text-slate-500">Est. Cost</span>
                  </div>
                  <p className="text-sm font-semibold text-white">${plan.estimated_total_cost?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3 text-violet-400" />
                    <span className="text-[10px] text-slate-500">Peak FTE</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{plan.resource_allocation?.peak_fte || 0}</p>
                </div>
              </div>

              {/* Resource Allocation */}
              {plan.resource_allocation && (
                <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-400" />
                    Resource Allocation
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Roles Breakdown</p>
                      {plan.resource_allocation.roles_breakdown?.map((role, i) => (
                        <div key={i} className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300">{role.role}</span>
                          <span className="text-violet-400 font-medium">{role.hours}h</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Budget Breakdown</p>
                      {Object.entries(plan.resource_allocation.budget_breakdown || {}).map(([key, value], i) => (
                        <div key={i} className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                          <span className="text-emerald-400 font-medium">${value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduling Strategy */}
              {plan.scheduling_strategy && (
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    Scheduling Strategy
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Approach:</span>
                      <span className="text-cyan-400 font-medium capitalize">{plan.scheduling_strategy.approach}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Buffer Days:</span>
                      <span className="text-cyan-400 font-medium">{plan.scheduling_strategy.buffer_days}</span>
                    </div>
                    {plan.scheduling_strategy.critical_path?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Critical Path:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.scheduling_strategy.critical_path.map((task, i) => (
                            <Badge key={i} className="text-[9px] bg-rose-500/10 text-rose-400">
                              {task}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {plan.scheduling_strategy.parallel_tracks?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Parallel Tracks:</p>
                        {plan.scheduling_strategy.parallel_tracks.map((track, i) => (
                          <div key={i} className="text-xs text-slate-300 ml-2">• {track}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resource Conflicts */}
              {plan.resource_conflicts?.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Resource Conflicts ({plan.resource_conflicts.length})
                  </h4>
                  <div className="space-y-2">
                    {plan.resource_conflicts.map((conflict, i) => (
                      <div key={i} className="p-2 bg-[#151d2e] rounded border border-amber-500/20">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-amber-400">{conflict.conflict_type}</span>
                          <Badge className={`text-[9px] ${
                            conflict.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                            conflict.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {conflict.severity}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-1">
                          Affects: {conflict.affected_tasks?.join(', ')}
                        </p>
                        <p className="text-[10px] text-emerald-400">
                          <Zap className="h-3 w-3 inline mr-1" />
                          {conflict.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resource Analysis */}
              {resourceAnalysis && (
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Optimization Analysis
                  </h4>
                  
                  {resourceAnalysis.parallel_opportunities?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-2">Parallel Execution Opportunities:</p>
                      {resourceAnalysis.parallel_opportunities.map((opp, i) => (
                        <div key={i} className="text-xs text-slate-300 mb-1">
                          • {opp.task_group?.join(' + ')} 
                          <span className="text-emerald-400 ml-2">({opp.potential_savings} savings)</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {resourceAnalysis.conflicts_detected?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400 mb-2">Detected Conflicts:</p>
                      {resourceAnalysis.conflicts_detected.map((conf, i) => (
                        <div key={i} className="p-2 bg-amber-500/5 rounded text-xs mb-1">
                          <div className="text-amber-400">{conf.description}</div>
                          <div className="text-emerald-400 text-[10px] mt-1">→ {conf.resolution}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {resourceAnalysis.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Recommendations:</p>
                      {resourceAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-2 mb-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Root Cause */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Root Cause Analysis</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{plan.root_cause_analysis}</p>
              </div>

              {/* Phases */}
              {plan.phases?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Remediation Phases</h4>
                  <div className="space-y-2">
                    {plan.phases.map((phase, i) => (
                      <div key={i} className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-white">{phase.phase_name}</p>
                          <span className="text-[10px] text-indigo-400">{phase.duration}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">Remediation Tasks ({plan.tasks?.length})</h4>
                  <Button 
                    onClick={createAllTasks}
                    disabled={createTaskMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create All
                  </Button>
                </div>
                <div className="space-y-3">
                  {plan.tasks?.map((task, i) => (
                    <div key={i} className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h5 className="text-xs font-medium text-white mb-1">{task.title}</h5>
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <Badge className={`text-[9px] ${priorityColors[task.priority?.toLowerCase()] || priorityColors.medium}`}>
                              {task.priority}
                            </Badge>
                            <span className="text-[10px] text-slate-500">{task.estimated_hours}h</span>
                            <span className="text-[10px] text-slate-500">${task.estimated_cost}</span>
                            <span className="text-[10px] text-slate-500">{task.timeline_days}d</span>
                            {task.fte_required && (
                              <Badge className="text-[9px] bg-violet-500/10 text-violet-400">
                                {task.fte_required} FTE
                              </Badge>
                            )}
                            {task.can_parallelize && (
                              <Badge className="text-[9px] bg-emerald-500/10 text-emerald-400">
                                Parallel
                              </Badge>
                            )}
                            {task.optimal_start_date && (
                              <span className="text-[10px] text-blue-400">
                                Start: {task.optimal_start_date}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => createTask(task)}
                          disabled={createTaskMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="border-[#2a3548] hover:bg-[#2a3548]"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2">{task.description}</p>
                      <div className="space-y-1">
                        <p className="text-[10px] text-emerald-400">
                          <span className="text-slate-500">Outcome:</span> {task.expected_outcome}
                        </p>
                        <p className="text-[10px] text-blue-400">
                          <span className="text-slate-500">Owner:</span> {task.suggested_owner_role}
                        </p>
                        {task.resource_requirements?.length > 0 && (
                          <div className="text-[10px]">
                            <span className="text-slate-500">Resources:</span>
                            {task.resource_requirements.map((r, ri) => (
                              <span key={ri} className="text-violet-400 ml-1">
                                {r.role} ({r.hours}h)
                              </span>
                            ))}
                          </div>
                        )}
                        {task.linked_control_test && (
                          <p className="text-[10px] text-cyan-400">
                            <span className="text-slate-500">Links to:</span> {task.linked_control_test}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Criteria */}
              {plan.success_criteria?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Success Criteria</h4>
                  <ul className="space-y-1">
                    {plan.success_criteria.map((criterion, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {plan.risks_and_mitigations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Risks & Mitigations</h4>
                  <ul className="space-y-1">
                    {plan.risks_and_mitigations.map((risk, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}