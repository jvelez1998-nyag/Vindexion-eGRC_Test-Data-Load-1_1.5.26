import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, CheckCircle2, AlertTriangle, Target, Zap, TrendingUp, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIIncidentWorkflowEngine({ incident, risks, controls, onUpdate }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeIncident = async () => {
    setAnalyzing(true);
    try {
      const riskContext = risks.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact
      }));

      const controlContext = controls.map(c => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        effectiveness: c.effectiveness
      }));

      const prompt = `You are an incident response expert. Analyze this security incident comprehensively:

INCIDENT DETAILS:
Title: ${incident.title}
Type: ${incident.incident_type}
Severity: ${incident.severity}
Status: ${incident.status}
Description: ${incident.description || 'Not provided'}
Occurred Date: ${incident.occurred_date || 'Unknown'}
Affected Systems: ${Array.isArray(incident.affected_systems) ? incident.affected_systems.join(', ') : 'Not specified'}
Current Impact: ${incident.impact_assessment || 'Not assessed'}
Current Root Cause: ${incident.root_cause || 'Under investigation'}

ORGANIZATIONAL CONTEXT:
Active Risks: ${riskContext.length}
${JSON.stringify(riskContext.slice(0, 10), null, 2)}

Existing Controls: ${controlContext.length}
${JSON.stringify(controlContext.slice(0, 10), null, 2)}

REQUIRED ANALYSIS:

1. ROOT CAUSE ANALYSIS:
   - Primary root cause with detailed explanation
   - Contributing factors (technical, process, human)
   - Control failures that allowed this incident
   - Timeline reconstruction if possible

2. REMEDIATION PLAN:
   - Immediate actions (next 24-48 hours)
   - Short-term remediation (1-2 weeks)
   - Long-term improvements (1-3 months)
   - Each step should include: action, owner role, timeline, success criteria

3. IMPACT PREDICTION:
   - Systems/services at risk of cascading failure
   - Related risks that may be triggered (reference risk IDs)
   - Potential business impact (financial, operational, reputational)
   - Compliance/regulatory implications
   - Data breach/privacy concerns

4. CONTROL RECOMMENDATIONS:
   - Preventive controls to avoid recurrence
   - Detective controls for early warning
   - Corrective controls for rapid response
   - Each with implementation priority

Provide detailed, actionable analysis formatted for executive and technical audiences.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            root_cause_analysis: {
              type: "object",
              properties: {
                primary_cause: { type: "string" },
                contributing_factors: { type: "array", items: { type: "string" } },
                control_failures: { type: "array", items: { type: "string" } },
                timeline: { type: "string" },
                confidence_level: { type: "string" }
              }
            },
            remediation_plan: {
              type: "object",
              properties: {
                immediate_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      owner_role: { type: "string" },
                      timeline: { type: "string" },
                      success_criteria: { type: "string" },
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
                      owner_role: { type: "string" },
                      timeline: { type: "string" },
                      success_criteria: { type: "string" }
                    }
                  }
                },
                long_term_improvements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      owner_role: { type: "string" },
                      timeline: { type: "string" },
                      success_criteria: { type: "string" }
                    }
                  }
                }
              }
            },
            impact_prediction: {
              type: "object",
              properties: {
                systems_at_risk: { type: "array", items: { type: "string" } },
                related_risk_ids: { type: "array", items: { type: "string" } },
                business_impact: {
                  type: "object",
                  properties: {
                    financial: { type: "string" },
                    operational: { type: "string" },
                    reputational: { type: "string" }
                  }
                },
                compliance_implications: { type: "array", items: { type: "string" } },
                data_breach_risk: { type: "string" },
                cascading_probability: { type: "number" }
              }
            },
            control_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  control_type: { type: "string" },
                  description: { type: "string" },
                  implementation_priority: { type: "string" },
                  estimated_effectiveness: { type: "number" }
                }
              }
            },
            executive_summary: { type: "string" },
            recommended_escalation: { type: "string" }
          }
        }
      });

      setAnalysis(response);
      toast.success("Analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAnalysis = async () => {
    if (!analysis) return;
    
    try {
      await base44.entities.Incident.update(incident.id, {
        root_cause: analysis.root_cause_analysis.primary_cause,
        ai_root_cause_analysis: JSON.stringify(analysis.root_cause_analysis),
        ai_remediation_plan: JSON.stringify(analysis.remediation_plan),
        ai_impact_prediction: JSON.stringify(analysis.impact_prediction),
        ai_executive_summary: analysis.executive_summary
      });

      toast.success("Analysis applied to incident");
      onUpdate && onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply analysis");
    }
  };

  const createRemediationTasks = async () => {
    if (!analysis?.remediation_plan) return;

    try {
      const tasks = [
        ...analysis.remediation_plan.immediate_actions.map(a => ({
          title: a.action,
          task_type: "remediation",
          related_entity_type: "incident",
          related_entity_id: incident.id,
          assigned_to: incident.assigned_to,
          priority: a.priority || "high",
          status: "not_started",
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })),
        ...analysis.remediation_plan.short_term_actions.map(a => ({
          title: a.action,
          task_type: "remediation",
          related_entity_type: "incident",
          related_entity_id: incident.id,
          assigned_to: incident.assigned_to,
          priority: "medium",
          status: "not_started",
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }))
      ];

      await Promise.all(tasks.map(task => base44.entities.Task.create(task)));
      toast.success(`Created ${tasks.length} remediation tasks`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create tasks");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-400';
      case 'high': return 'bg-orange-500/10 text-orange-400';
      case 'medium': return 'bg-amber-500/10 text-amber-400';
      case 'low': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Incident Analysis
          </CardTitle>
          <Button 
            onClick={analyzeIncident}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit mx-auto mb-4">
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-slate-400 mb-4">
              Get comprehensive root cause analysis, remediation steps, and impact predictions
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {/* Executive Summary */}
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <h4 className="text-sm font-semibold text-indigo-400 mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-300">{analysis.executive_summary}</p>
              </div>

              {/* Root Cause Analysis */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-400" />
                  Root Cause Analysis
                </h4>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-slate-500">Primary Cause:</span>
                    <p className="text-sm text-white mt-1">{analysis.root_cause_analysis.primary_cause}</p>
                  </div>
                  {analysis.root_cause_analysis.confidence_level && (
                    <Badge className="bg-blue-500/10 text-blue-400 mb-3">
                      Confidence: {analysis.root_cause_analysis.confidence_level}
                    </Badge>
                  )}
                  {analysis.root_cause_analysis.contributing_factors?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500">Contributing Factors:</span>
                      {analysis.root_cause_analysis.contributing_factors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.root_cause_analysis.control_failures?.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <span className="text-xs font-semibold text-slate-500">Control Failures:</span>
                      {analysis.root_cause_analysis.control_failures.map((failure, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-rose-400">
                          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {failure}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Remediation Plan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Remediation Plan
                  </h4>
                  <Button size="sm" onClick={createRemediationTasks} className="bg-emerald-600 hover:bg-emerald-700">
                    <Zap className="h-3 w-3 mr-1" />
                    Create Tasks
                  </Button>
                </div>

                {analysis.remediation_plan.immediate_actions?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-rose-400 mb-2">Immediate Actions (24-48h)</div>
                    <div className="space-y-2">
                      {analysis.remediation_plan.immediate_actions.map((action, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-sm font-medium text-white">{action.action}</span>
                            <Badge className={getPriorityColor(action.priority)}>
                              {action.priority}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>
                              <span className="text-slate-500">Owner:</span> {action.owner_role}
                            </div>
                            <div>
                              <span className="text-slate-500">Timeline:</span> {action.timeline}
                            </div>
                          </div>
                          {action.success_criteria && (
                            <p className="text-xs text-slate-500 mt-2">
                              <span className="text-slate-400">Success:</span> {action.success_criteria}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.remediation_plan.short_term_actions?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 mb-2">Short-term (1-2 weeks)</div>
                    <div className="space-y-2">
                      {analysis.remediation_plan.short_term_actions.map((action, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-sm font-medium text-white mb-2">{action.action}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <div>
                              <span className="text-slate-500">Owner:</span> {action.owner_role}
                            </div>
                            <div>
                              <span className="text-slate-500">Timeline:</span> {action.timeline}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.remediation_plan.long_term_improvements?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-blue-400 mb-2">Long-term (1-3 months)</div>
                    <div className="space-y-2">
                      {analysis.remediation_plan.long_term_improvements.map((action, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                          <div className="text-sm font-medium text-white mb-1">{action.action}</div>
                          <div className="text-xs text-slate-400">{action.owner_role} • {action.timeline}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Impact Prediction */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  Impact Prediction
                </h4>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] space-y-3">
                  {analysis.impact_prediction.cascading_probability !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400">Cascading Failure Probability</span>
                        <Badge className={analysis.impact_prediction.cascading_probability > 70 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}>
                          {analysis.impact_prediction.cascading_probability}%
                        </Badge>
                      </div>
                      <Progress value={analysis.impact_prediction.cascading_probability} className="h-2" />
                    </div>
                  )}

                  {analysis.impact_prediction.systems_at_risk?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Systems at Risk:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.impact_prediction.systems_at_risk.map((sys, idx) => (
                          <Badge key={idx} variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                            {sys}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.impact_prediction.related_risk_ids?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Related Risks:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.impact_prediction.related_risk_ids.map((riskId, idx) => (
                          <Badge key={idx} className="bg-rose-500/10 text-rose-400 text-xs">
                            Risk: {riskId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.impact_prediction.business_impact && (
                    <div className="grid gap-2">
                      {analysis.impact_prediction.business_impact.financial && (
                        <div className="text-xs">
                          <span className="text-slate-500">Financial:</span>
                          <span className="text-slate-300 ml-2">{analysis.impact_prediction.business_impact.financial}</span>
                        </div>
                      )}
                      {analysis.impact_prediction.business_impact.operational && (
                        <div className="text-xs">
                          <span className="text-slate-500">Operational:</span>
                          <span className="text-slate-300 ml-2">{analysis.impact_prediction.business_impact.operational}</span>
                        </div>
                      )}
                      {analysis.impact_prediction.business_impact.reputational && (
                        <div className="text-xs">
                          <span className="text-slate-500">Reputational:</span>
                          <span className="text-slate-300 ml-2">{analysis.impact_prediction.business_impact.reputational}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {analysis.impact_prediction.compliance_implications?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Compliance Implications:</span>
                      <ul className="mt-2 space-y-1">
                        {analysis.impact_prediction.compliance_implications.map((impl, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            {impl}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Control Recommendations */}
              {analysis.control_recommendations?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Recommended Controls
                  </h4>
                  <div className="space-y-2">
                    {analysis.control_recommendations.map((control, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-sm font-medium text-white">{control.control_name}</span>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(control.implementation_priority)}>
                              {control.implementation_priority}
                            </Badge>
                            {control.estimated_effectiveness && (
                              <Badge className="bg-blue-500/10 text-blue-400">
                                {control.estimated_effectiveness}/5
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[#2a3548] text-slate-400 mb-2 text-xs">
                          {control.control_type}
                        </Badge>
                        <p className="text-xs text-slate-400">{control.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#2a3548]">
                <Button onClick={applyAnalysis} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Apply to Incident
                </Button>
                <Button onClick={analyzeIncident} variant="outline" className="border-[#2a3548]">
                  <Zap className="h-4 w-4 mr-2" />
                  Re-analyze
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}