import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, Target, Calendar, Users, CheckCircle2, AlertTriangle, TrendingUp, Clock, Play } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, isPast, isFuture } from "date-fns";

export default function AIRiskMitigationAssistant({ risks, controls }) {
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState(null);
  const [selectedRiskForPlan, setSelectedRiskForPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [monitoringData, setMonitoringData] = useState(null);

  const queryClient = useQueryClient();

  const { data: mitigationActions = [] } = useQuery({
    queryKey: ['mitigation-actions'],
    queryFn: () => base44.entities.MitigationAction.list('-created_date')
  });

  const createActionMutation = useMutation({
    mutationFn: (data) => base44.entities.MitigationAction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mitigation-actions'] });
      toast.success("Action created");
    }
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MitigationAction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mitigation-actions'] });
      toast.success("Action updated");
    }
  });

  // Auto-monitor on load
  useEffect(() => {
    if (mitigationActions.length > 0) {
      analyzeProgress();
    }
  }, [mitigationActions]);

  const generateMitigationStrategies = async () => {
    setLoading(true);
    try {
      const highPriorityRisks = risks
        .filter(r => {
          const score = (r.likelihood || 3) * (r.impact || 3);
          return score >= 9;
        })
        .sort((a, b) => ((b.likelihood || 3) * (b.impact || 3)) - ((a.likelihood || 3) * (a.impact || 3)))
        .slice(0, 10);

      const effectiveControls = controls.filter(c => c.effectiveness >= 4);
      const weakControls = controls.filter(c => c.effectiveness < 3);

      const prompt = `You are an expert GRC risk mitigation strategist. Analyze these risks and generate tailored, actionable mitigation strategies.

HIGH-PRIORITY RISKS:
${highPriorityRisks.map((r, i) => `${i + 1}. ${r.title}
   Category: ${r.category}
   Risk Score: ${(r.likelihood || 3) * (r.impact || 3)}
   Likelihood: ${r.likelihood || 3}/5, Impact: ${r.impact || 3}/5
   Status: ${r.status}
   Current Mitigation: ${r.mitigation_plan || 'None'}
   Description: ${r.description}`).join('\n\n')}

EXISTING CONTROLS LANDSCAPE:
Effective Controls: ${effectiveControls.length} (can be leveraged)
${effectiveControls.slice(0, 5).map(c => `- ${c.name} (${c.domain}): ${c.effectiveness}/5`).join('\n')}

Weak Controls: ${weakControls.length} (need improvement)
${weakControls.slice(0, 5).map(c => `- ${c.name} (${c.domain}): ${c.effectiveness}/5`).join('\n')}

For each high-priority risk, generate:
1. **Tailored Strategy**: Specific mitigation approach considering risk nature, existing controls, and resources
2. **Control Leverage**: How to use/improve existing controls
3. **New Control Recommendations**: Additional controls needed
4. **Quick Wins**: Fast, low-effort actions for immediate risk reduction
5. **Long-term Approach**: Sustainable risk management strategy
6. **Resource Requirements**: People, tools, budget estimates
7. **Success Metrics**: How to measure effectiveness
8. **Timeline**: Realistic implementation phases

Be specific, actionable, and practical. Consider organizational constraints.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            overall_approach: { type: "string" },
            risk_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_title: { type: "string" },
                  risk_id: { type: "string" },
                  risk_score: { type: "number" },
                  strategy_overview: { type: "string" },
                  control_leverage: {
                    type: "object",
                    properties: {
                      existing_controls_to_use: { type: "array", items: { type: "string" } },
                      controls_to_strengthen: { type: "array", items: { type: "string" } }
                    }
                  },
                  new_controls_needed: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        control_name: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string" }
                      }
                    }
                  },
                  quick_wins: { type: "array", items: { type: "string" } },
                  long_term_actions: { type: "array", items: { type: "string" } },
                  resources_required: {
                    type: "object",
                    properties: {
                      people: { type: "array", items: { type: "string" } },
                      tools: { type: "array", items: { type: "string" } },
                      budget_estimate: { type: "string" }
                    }
                  },
                  success_metrics: { type: "array", items: { type: "string" } },
                  timeline: {
                    type: "object",
                    properties: {
                      phase_1: { type: "string" },
                      phase_2: { type: "string" },
                      phase_3: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Match risk IDs
      const strategiesWithIds = {
        ...response,
        risk_strategies: response.risk_strategies?.map(s => {
          const matchedRisk = highPriorityRisks.find(r => 
            r.title.toLowerCase().includes(s.risk_title.toLowerCase()) ||
            s.risk_title.toLowerCase().includes(r.title.toLowerCase())
          );
          return { ...s, risk_id: matchedRisk?.id };
        })
      };

      setStrategies(strategiesWithIds);
      toast.success("Mitigation strategies generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate strategies");
    } finally {
      setLoading(false);
    }
  };

  const generateActionPlan = async (risk, strategy) => {
    setGeneratingPlan(true);
    try {
      const prompt = `Generate a detailed, executable action plan for mitigating this risk.

RISK: ${risk.title}
Category: ${risk.category}
Risk Score: ${(risk.likelihood || 3) * (risk.impact || 3)}
Description: ${risk.description}

RECOMMENDED STRATEGY:
${strategy.strategy_overview}

Quick Wins: ${strategy.quick_wins?.join(', ')}
Long-term: ${strategy.long_term_actions?.join(', ')}

Generate a comprehensive action plan with:
- 5-8 specific, measurable action items
- Clear owners (roles like "IT Manager", "Compliance Officer", "Risk Manager")
- Realistic timelines (start and due dates)
- Dependencies between actions
- Resource requirements for each action
- Expected outcomes

Actions should be prioritized (critical/high/medium) and sequenced logically.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            plan_summary: { type: "string" },
            total_timeline: { type: "string" },
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action_title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  owner: { type: "string" },
                  start_offset_days: { type: "number" },
                  duration_days: { type: "number" },
                  estimated_effort_hours: { type: "number" },
                  resources_required: { type: "array", items: { type: "string" } },
                  dependencies: { type: "array", items: { type: "string" } },
                  expected_outcome: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create mitigation actions in database
      const today = new Date();
      for (const action of response.actions || []) {
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() + (action.start_offset_days || 0));
        
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + (action.duration_days || 7));

        await createActionMutation.mutateAsync({
          risk_id: risk.id,
          action_title: action.action_title,
          description: action.description,
          priority: action.priority?.toLowerCase() || 'medium',
          owner: action.owner,
          start_date: startDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          estimated_effort_hours: action.estimated_effort_hours,
          resources_required: action.resources_required,
          dependencies: action.dependencies,
          expected_outcome: action.expected_outcome,
          status: 'not_started',
          progress_percentage: 0
        });
      }

      toast.success(`Created ${response.actions?.length || 0} action items for ${risk.title}`);
      setSelectedRiskForPlan(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate action plan");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const analyzeProgress = async () => {
    if (mitigationActions.length === 0) {
      setMonitoringData({ alerts: [], summary: "No actions to monitor" });
      return;
    }

    const today = new Date();
    const alerts = [];
    const statusCounts = { not_started: 0, in_progress: 0, completed: 0, delayed: 0, blocked: 0 };

    mitigationActions.forEach(action => {
      statusCounts[action.status]++;

      const dueDate = action.due_date ? new Date(action.due_date) : null;
      const startDate = action.start_date ? new Date(action.start_date) : null;

      // Check for delays
      if (dueDate && isPast(dueDate) && action.status !== 'completed') {
        const daysOverdue = differenceInDays(today, dueDate);
        alerts.push({
          type: 'overdue',
          severity: daysOverdue > 7 ? 'critical' : 'high',
          action_id: action.id,
          action_title: action.action_title,
          message: `${daysOverdue} days overdue`,
          owner: action.owner
        });

        // Auto-flag as delayed
        if (action.status !== 'delayed' && action.status !== 'blocked') {
          updateActionMutation.mutate({
            id: action.id,
            data: { ...action, status: 'delayed', delay_reason: 'Auto-flagged: Past due date' }
          });
        }
      }

      // Check for approaching deadlines
      if (dueDate && isFuture(dueDate) && action.status === 'in_progress') {
        const daysUntilDue = differenceInDays(dueDate, today);
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          alerts.push({
            type: 'upcoming',
            severity: 'medium',
            action_id: action.id,
            action_title: action.action_title,
            message: `Due in ${daysUntilDue} days`,
            owner: action.owner
          });
        }
      }

      // Check for not started actions past start date
      if (startDate && isPast(startDate) && action.status === 'not_started') {
        alerts.push({
          type: 'not_started',
          severity: 'medium',
          action_id: action.id,
          action_title: action.action_title,
          message: 'Not started yet',
          owner: action.owner
        });
      }

      // Check for blocked actions
      if (action.status === 'blocked') {
        alerts.push({
          type: 'blocked',
          severity: 'high',
          action_id: action.id,
          action_title: action.action_title,
          message: action.delay_reason || 'Action blocked',
          owner: action.owner
        });
      }
    });

    const summary = `${statusCounts.completed}/${mitigationActions.length} actions completed. ${alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} critical alerts.`;

    setMonitoringData({ alerts, statusCounts, summary });
  };

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Risk Mitigation Assistant</h2>
              <p className="text-sm text-slate-400">Intelligent strategies, action plans, and progress monitoring</p>
            </div>
          </div>
          {!strategies && (
            <Button onClick={generateMitigationStrategies} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="h-4 w-4 mr-2" />Generate Strategies</>}
            </Button>
          )}
        </div>

        {!strategies && !loading && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Analyze {risks.length} risks to generate tailored mitigation strategies</p>
            <p className="text-sm text-slate-500">Leveraging {controls.length} existing controls</p>
          </div>
        )}
      </Card>

      {strategies && (
        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="strategies">Mitigation Strategies</TabsTrigger>
            <TabsTrigger value="actions">Action Plans</TabsTrigger>
            <TabsTrigger value="monitoring">Progress Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="strategies">
            <div className="space-y-6">
              <Card className="bg-indigo-500/5 border-indigo-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
                <p className="text-sm text-slate-300 mb-4">{strategies.executive_summary}</p>
                <div className="p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Overall Approach</h4>
                  <p className="text-sm text-slate-400">{strategies.overall_approach}</p>
                </div>
              </Card>

              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {strategies.risk_strategies?.map((strategy, idx) => (
                    <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{strategy.risk_title}</h3>
                          <Badge className={severityColors[strategy.risk_score >= 16 ? 'critical' : strategy.risk_score >= 9 ? 'high' : 'medium']}>
                            Risk Score: {strategy.risk_score}
                          </Badge>
                        </div>
                        {strategy.risk_id && (
                          <Button
                            onClick={() => setSelectedRiskForPlan(risks.find(r => r.id === strategy.risk_id))}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Generate Action Plan
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Strategy Overview</h4>
                          <p className="text-sm text-slate-400">{strategy.strategy_overview}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                            <h4 className="text-sm font-semibold text-emerald-400 mb-2">Quick Wins</h4>
                            <ul className="space-y-1">
                              {strategy.quick_wins?.map((win, i) => (
                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  {win}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                            <h4 className="text-sm font-semibold text-indigo-400 mb-2">Long-term Actions</h4>
                            <ul className="space-y-1">
                              {strategy.long_term_actions?.map((action, i) => (
                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                  <TrendingUp className="h-3 w-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {strategy.new_controls_needed?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">New Controls Needed</h4>
                            <div className="space-y-2">
                              {strategy.new_controls_needed.map((control, i) => (
                                <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-white">{control.control_name}</span>
                                    <Badge className={severityColors[control.priority?.toLowerCase() || 'medium']}>
                                      {control.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400">{control.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded">
                            <h5 className="text-xs font-semibold text-slate-400 mb-2">Timeline</h5>
                            <div className="space-y-1 text-xs text-slate-500">
                              <div><strong>Phase 1:</strong> {strategy.timeline?.phase_1}</div>
                              <div><strong>Phase 2:</strong> {strategy.timeline?.phase_2}</div>
                              <div><strong>Phase 3:</strong> {strategy.timeline?.phase_3}</div>
                            </div>
                          </div>

                          <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded">
                            <h5 className="text-xs font-semibold text-slate-400 mb-2">Resources</h5>
                            <div className="space-y-1 text-xs text-slate-500">
                              <div><strong>People:</strong> {strategy.resources_required?.people?.join(', ')}</div>
                              <div><strong>Budget:</strong> {strategy.resources_required?.budget_estimate}</div>
                            </div>
                          </div>

                          <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded">
                            <h5 className="text-xs font-semibold text-slate-400 mb-2">Success Metrics</h5>
                            <ul className="space-y-1">
                              {strategy.success_metrics?.slice(0, 2).map((metric, i) => (
                                <li key={i} className="text-xs text-slate-500">• {metric}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-6">
              {selectedRiskForPlan && (
                <Card className="bg-emerald-500/5 border-emerald-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Generate Action Plan</h3>
                      <p className="text-sm text-slate-400">For: {selectedRiskForPlan.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setSelectedRiskForPlan(null)} variant="outline" className="border-[#2a3548]">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const strategy = strategies.risk_strategies?.find(s => s.risk_id === selectedRiskForPlan.id);
                          if (strategy) {
                            generateActionPlan(selectedRiskForPlan, strategy);
                          }
                        }}
                        disabled={generatingPlan}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {generatingPlan ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Play className="h-4 w-4 mr-2" />Generate Plan</>}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid gap-4">
                {risks.filter(r => mitigationActions.some(a => a.risk_id === r.id)).map(risk => {
                  const actions = mitigationActions.filter(a => a.risk_id === risk.id);
                  const completedCount = actions.filter(a => a.status === 'completed').length;
                  const progress = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

                  return (
                    <Card key={risk.id} className="bg-[#1a2332] border-[#2a3548] p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{risk.title}</h4>
                          <p className="text-xs text-slate-500">{risk.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{Math.round(progress)}%</div>
                          <div className="text-xs text-slate-500">{completedCount}/{actions.length} complete</div>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2 mb-4" />

                      <div className="space-y-2">
                        {actions.map(action => (
                          <div key={action.id} className="p-3 bg-[#151d2e] border border-[#2a3548] rounded">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="text-sm font-medium text-white">{action.action_title}</h5>
                                <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                              </div>
                              <Badge className={`ml-2 text-[10px] ${
                                action.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                action.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                                action.status === 'delayed' ? 'bg-rose-500/10 text-rose-400' :
                                action.status === 'blocked' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-slate-500/10 text-slate-400'
                              }`}>
                                {action.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {action.owner}
                              </span>
                              {action.due_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due {format(new Date(action.due_date), 'MMM d')}
                                </span>
                              )}
                              <Badge className={severityColors[action.priority]}>
                                {action.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="space-y-6">
              {monitoringData && (
                <>
                  <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        Progress Monitoring
                      </h3>
                      <Button onClick={analyzeProgress} size="sm" variant="outline" className="border-[#2a3548]">
                        Refresh
                      </Button>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{monitoringData.summary}</p>

                    <div className="grid grid-cols-5 gap-3">
                      {Object.entries(monitoringData.statusCounts || {}).map(([status, count]) => (
                        <div key={status} className="p-3 bg-[#151d2e] border border-[#2a3548] rounded text-center">
                          <div className="text-2xl font-bold text-white">{count}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{status.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {monitoringData.alerts?.length > 0 && (
                    <Card className="bg-[#1a2332] border-[#2a3548] p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        Active Alerts ({monitoringData.alerts.length})
                      </h3>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3 pr-4">
                          {monitoringData.alerts.map((alert, idx) => (
                            <Card key={idx} className={`border p-4 ${
                              alert.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/20' :
                              alert.severity === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                              'bg-amber-500/5 border-amber-500/20'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-white text-sm">{alert.action_title}</h4>
                                  <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                                </div>
                                <Badge className={severityColors[alert.severity]}>
                                  {alert.severity}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Users className="h-3 w-3" />
                                {alert.owner}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}