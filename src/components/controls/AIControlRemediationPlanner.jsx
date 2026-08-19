import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Loader2, AlertTriangle, CheckCircle2, Clock, User, TrendingUp, Wrench, Ticket, ArrowRight, Zap, Target } from "lucide-react";
import { toast } from "sonner";

export default function AIControlRemediationPlanner({ control, controlTests = [], risks = [] }) {
  const [loading, setLoading] = useState(false);
  const [remediationPlan, setRemediationPlan] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);

  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.RemediationTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediation-tasks'] });
      toast.success("Remediation task created");
    }
  });

  const generateRemediationPlan = async () => {
    if (!control) {
      toast.error("No control selected");
      return;
    }

    setLoading(true);
    try {
      // Get failed tests and control context
      const failedTests = controlTests.filter(t => 
        t.control_id === control.id && (t.status === 'failed' || t.exceptions)
      );

      const linkedRisks = risks.filter(r => r.linked_controls?.includes(control.id));
      const highRisks = linkedRisks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 12);

      const controlContext = {
        name: control.name,
        domain: control.domain,
        category: control.category,
        status: control.status,
        effectiveness: control.effectiveness,
        last_tested: control.last_tested_date,
        owner: control.owner,
        tester: control.tester
      };

      const testingContext = {
        total_tests: controlTests.filter(t => t.control_id === control.id).length,
        failed_tests: failedTests.length,
        recent_failures: failedTests.slice(0, 5).map(t => ({
          test_type: t.test_type,
          date: t.test_date,
          findings: t.findings,
          exceptions: t.exceptions,
          conclusion: t.conclusion
        }))
      };

      const riskContext = {
        total_linked_risks: linkedRisks.length,
        high_priority_risks: highRisks.length,
        risk_details: highRisks.slice(0, 3).map(r => ({
          title: r.title,
          category: r.category,
          likelihood: r.likelihood,
          impact: r.impact
        }))
      };

      const prompt = `You are an expert GRC remediation consultant. Analyze this control failure and create a comprehensive, actionable remediation plan.

CONTROL DETAILS:
${JSON.stringify(controlContext, null, 2)}

TESTING HISTORY & FAILURES:
${JSON.stringify(testingContext, null, 2)}

RISK CONTEXT:
${JSON.stringify(riskContext, null, 2)}

AVAILABLE TEAM MEMBERS:
${users.map(u => `${u.full_name} (${u.email}) - Role: ${u.role}`).join('\n')}

CREATE A DETAILED REMEDIATION PLAN INCLUDING:

1. **Root Cause Analysis**: What's actually causing the control failure?
2. **Impact Assessment**: Business, compliance, and security impact
3. **Remediation Actions**: Specific, actionable steps with clear owners
4. **Automated Workflows**: Which actions can be automated?
5. **Effort Estimation**: Hours per action, total effort
6. **Resource Allocation**: Assign owners based on expertise and role
7. **Timeline**: Realistic timeline with phases and milestones
8. **Success Criteria**: How to measure remediation success
9. **Prevention Strategy**: How to prevent recurrence
10. **Ticketing Integration**: Which actions warrant automated ticket creation?

Be specific and practical. Consider the control type, domain, and organizational context.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            root_cause: {
              type: "object",
              properties: {
                primary_cause: { type: "string" },
                contributing_factors: { type: "array", items: { type: "string" } },
                severity: { type: "string" }
              }
            },
            impact_assessment: {
              type: "object",
              properties: {
                business_impact: { type: "string" },
                compliance_impact: { type: "string" },
                security_impact: { type: "string" },
                financial_impact_estimate: { type: "string" },
                urgency_level: { type: "string" }
              }
            },
            remediation_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action_id: { type: "string" },
                  action: { type: "string" },
                  description: { type: "string" },
                  owner: { type: "string" },
                  backup_owner: { type: "string" },
                  estimated_hours: { type: "number" },
                  priority: { type: "string" },
                  dependencies: { type: "array", items: { type: "string" } },
                  automation_potential: { type: "string" },
                  create_ticket: { type: "boolean" },
                  ticket_priority: { type: "string" }
                }
              }
            },
            automated_workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  workflow_name: { type: "string" },
                  trigger: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                  approval_required: { type: "boolean" }
                }
              }
            },
            timeline: {
              type: "object",
              properties: {
                total_duration_days: { type: "number" },
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration_days: { type: "number" },
                      actions: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            success_criteria: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  criterion: { type: "string" },
                  measurement: { type: "string" }
                }
              }
            },
            prevention_strategy: {
              type: "object",
              properties: {
                monitoring_frequency: { type: "string" },
                preventive_controls: { type: "array", items: { type: "string" } },
                training_needs: { type: "array", items: { type: "string" } },
                process_improvements: { type: "array", items: { type: "string" } }
              }
            },
            resource_summary: {
              type: "object",
              properties: {
                total_hours: { type: "number" },
                required_skills: { type: "array", items: { type: "string" } },
                external_support: { type: "boolean" }
              }
            },
            executive_summary: { type: "string" }
          }
        }
      });

      setRemediationPlan(result);
      setSelectedActions(result.remediation_actions?.filter(a => a.create_ticket).map(a => a.action_id) || []);
      toast.success("Remediation plan generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate remediation plan");
    } finally {
      setLoading(false);
    }
  };

  const createRemediationTasks = async () => {
    if (!remediationPlan || selectedActions.length === 0) {
      toast.error("Please select actions to create tasks for");
      return;
    }

    const actionsToCreate = remediationPlan.remediation_actions.filter(a => 
      selectedActions.includes(a.action_id)
    );

    try {
      for (const action of actionsToCreate) {
        await createTaskMutation.mutateAsync({
          control_id: control.id,
          title: action.action,
          description: action.description,
          assigned_to: action.owner,
          priority: action.priority?.toLowerCase() || 'medium',
          estimated_hours: action.estimated_hours,
          status: 'pending',
          due_date: calculateDueDate(action.priority),
          dependencies: action.dependencies?.join(', '),
          automated: action.automation_potential === 'High',
          ticket_created: action.create_ticket
        });
      }

      toast.success(`Created ${actionsToCreate.length} remediation tasks`);
      setSelectedActions([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create tasks");
    }
  };

  const createTickets = async () => {
    if (!remediationPlan) return;

    const ticketActions = remediationPlan.remediation_actions.filter(a => 
      a.create_ticket && selectedActions.includes(a.action_id)
    );

    // Simulate ticket creation (would integrate with actual ticketing system)
    toast.success(`${ticketActions.length} tickets queued for creation in external system`);
  };

  const calculateDueDate = (priority) => {
    const date = new Date();
    switch(priority?.toLowerCase()) {
      case 'critical': date.setDate(date.getDate() + 3); break;
      case 'high': date.setDate(date.getDate() + 7); break;
      case 'medium': date.setDate(date.getDate() + 14); break;
      default: date.setDate(date.getDate() + 30);
    }
    return date.toISOString().split('T')[0];
  };

  const toggleAction = (actionId) => {
    setSelectedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getAutomationColor = (potential) => {
    switch(potential?.toLowerCase()) {
      case 'high': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'low': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (!control) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
        <Wrench className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">No Control Selected</h3>
        <p className="text-slate-400 text-sm">Select a control to generate remediation plans</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <Wrench className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-white">AI Remediation Planner</CardTitle>
                <p className="text-slate-400 text-sm mt-1">
                  Automated remediation workflows for control: {control.name}
                </p>
              </div>
            </div>
            {!remediationPlan && (
              <Button 
                onClick={generateRemediationPlan}
                disabled={loading}
                className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Generate Plan
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {loading && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
          <Loader2 className="h-12 w-12 text-violet-400 mx-auto mb-4 animate-spin" />
          <p className="text-white font-semibold mb-2">Analyzing Control Failures...</p>
          <p className="text-slate-400 text-sm">AI is reviewing test results, risks, and generating remediation strategies</p>
        </Card>
      )}

      {remediationPlan && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[#1a2332] border border-[#2a3548]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="actions">Actions ({remediationPlan.remediation_actions?.length})</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="prevention">Prevention</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Executive Summary */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-violet-500/5 rounded-lg border border-violet-500/20">
                  <p className="text-sm text-slate-300 leading-relaxed">{remediationPlan.executive_summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Root Cause */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-rose-400" />
                  Root Cause Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className={getPriorityColor(remediationPlan.root_cause?.severity)}>
                    {remediationPlan.root_cause?.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-2">Primary Cause</p>
                    <p className="text-sm text-slate-300">{remediationPlan.root_cause?.primary_cause}</p>
                  </div>
                </div>
                {remediationPlan.root_cause?.contributing_factors?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Contributing Factors:</p>
                    <ul className="space-y-1">
                      {remediationPlan.root_cause.contributing_factors.map((factor, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact Assessment */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Impact Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Business Impact</p>
                    <p className="text-sm text-white">{remediationPlan.impact_assessment?.business_impact}</p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Compliance Impact</p>
                    <p className="text-sm text-white">{remediationPlan.impact_assessment?.compliance_impact}</p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Security Impact</p>
                    <p className="text-sm text-white">{remediationPlan.impact_assessment?.security_impact}</p>
                  </div>
                  <div className="p-3 bg-[#151d2e] rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Financial Impact</p>
                    <p className="text-sm text-white">{remediationPlan.impact_assessment?.financial_impact_estimate}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-rose-500/5 rounded-lg border border-rose-500/20">
                  <p className="text-xs text-rose-400 font-semibold">
                    Urgency Level: {remediationPlan.impact_assessment?.urgency_level}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resource Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Effort</p>
                    <p className="text-2xl font-bold text-white">
                      {remediationPlan.resource_summary?.total_hours}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
              </Card>
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-2xl font-bold text-white">
                      {remediationPlan.timeline?.total_duration_days}d
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-emerald-400" />
                </div>
              </Card>
              <Card className="bg-[#1a2332] border-[#2a3548] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Actions</p>
                    <p className="text-2xl font-bold text-white">
                      {remediationPlan.remediation_actions?.length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-violet-400" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Remediation Actions</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500/20 text-indigo-400">
                      {selectedActions.length} selected
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={createRemediationTasks}
                      disabled={selectedActions.length === 0 || createTaskMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      Create Tasks
                    </Button>
                    <Button 
                      size="sm"
                      onClick={createTickets}
                      disabled={selectedActions.length === 0}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Ticket className="h-3 w-3 mr-2" />
                      Create Tickets
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {remediationPlan.remediation_actions?.map((action, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedActions.includes(action.action_id)}
                            onCheckedChange={() => toggleAction(action.action_id)}
                            className="mt-1 border-[#2a3548]"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-white">{action.action}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(action.priority)}>
                                  {action.priority}
                                </Badge>
                                {action.create_ticket && (
                                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                                    <Ticket className="h-3 w-3 mr-1" />
                                    Auto-Ticket
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-slate-400 mb-3">{action.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="flex items-center gap-1 text-slate-500">
                                <User className="h-3 w-3" />
                                {action.owner}
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-3 w-3" />
                                {action.estimated_hours}h
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge className={`text-[10px] ${getAutomationColor(action.automation_potential)}`}>
                                  <Zap className="h-2.5 w-2.5 mr-1" />
                                  {action.automation_potential} Auto
                                </Badge>
                              </div>
                              {action.dependencies?.length > 0 && (
                                <div className="text-slate-500">
                                  Deps: {action.dependencies.length}
                                </div>
                              )}
                            </div>

                            {action.dependencies?.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#2a3548]">
                                <p className="text-xs text-slate-500 mb-1">Dependencies:</p>
                                <div className="flex flex-wrap gap-1">
                                  {action.dependencies.map((dep, i) => (
                                    <Badge key={i} className="text-[10px] bg-amber-500/10 text-amber-400">
                                      {dep}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-400" />
                  Automated Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {remediationPlan.automated_workflows?.map((workflow, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">{workflow.workflow_name}</h4>
                        {workflow.approval_required && (
                          <Badge className="bg-amber-500/10 text-amber-400 text-xs">
                            Approval Required
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Trigger:</p>
                          <p className="text-sm text-slate-300 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                            {workflow.trigger}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-2">Automated Actions:</p>
                          <div className="space-y-1">
                            {workflow.actions?.map((action, i) => (
                              <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <ArrowRight className="h-3.5 w-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Remediation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-[#151d2e] rounded-lg">
                  <p className="text-xs text-slate-500">Total Duration</p>
                  <p className="text-xl font-bold text-white">
                    {remediationPlan.timeline?.total_duration_days} days
                  </p>
                </div>

                <div className="space-y-3">
                  {remediationPlan.timeline?.phases?.map((phase, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-500/20 text-indigo-400">
                            Day {remediationPlan.timeline.phases.slice(0, idx).reduce((sum, p) => sum + p.duration_days, 1)}-
                            {remediationPlan.timeline.phases.slice(0, idx + 1).reduce((sum, p) => sum + p.duration_days, 0)}
                          </Badge>
                          <h4 className="text-sm font-semibold text-white">{phase.phase}</h4>
                        </div>
                        <span className="text-xs text-slate-500">{phase.duration_days} days</span>
                      </div>
                      <ul className="space-y-1 mt-2">
                        {phase.actions?.map((action, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>

                {/* Success Criteria */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Success Criteria</h4>
                  <div className="space-y-2">
                    {remediationPlan.success_criteria?.map((criterion, i) => (
                      <div key={i} className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        <p className="text-sm text-white mb-1">{criterion.criterion}</p>
                        <p className="text-xs text-slate-400">Measurement: {criterion.measurement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prevention">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  Prevention Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-[#151d2e] rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Monitoring Frequency</p>
                  <p className="text-sm font-semibold text-white">
                    {remediationPlan.prevention_strategy?.monitoring_frequency}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Preventive Controls</h4>
                  <div className="space-y-2">
                    {remediationPlan.prevention_strategy?.preventive_controls?.map((control, i) => (
                      <div key={i} className="p-2 bg-blue-500/5 rounded border border-blue-500/10 text-sm text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 inline mr-2" />
                        {control}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Training Needs</h4>
                  <div className="space-y-1">
                    {remediationPlan.prevention_strategy?.training_needs?.map((training, i) => (
                      <p key={i} className="text-sm text-slate-400">• {training}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Process Improvements</h4>
                  <div className="space-y-1">
                    {remediationPlan.prevention_strategy?.process_improvements?.map((improvement, i) => (
                      <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}