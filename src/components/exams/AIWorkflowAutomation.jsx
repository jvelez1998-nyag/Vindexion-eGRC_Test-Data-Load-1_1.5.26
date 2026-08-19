import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Loader2, Zap, FileText, Calendar, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIWorkflowAutomation({ exam, onUpdateExam }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [automating, setAutomating] = useState(false);
  const [insights, setInsights] = useState(null);

  const analyzeWorkflow = async () => {
    if (!exam) return;
    
    setAnalyzing(true);
    try {
      const prompt = `Analyze this regulatory exam workflow and provide actionable insights:

EXAM DETAILS:
- Title: ${exam.exam_title}
- Type: ${exam.exam_type}
- Current Stage: ${exam.workflow_stage || 'Not started'}
- Status: ${exam.status}
- Exam Date: ${exam.exam_date || 'Not scheduled'}
- Readiness Score: ${exam.readiness_score || 0}%
- Lead Coordinator: ${exam.lead_coordinator || 'Not assigned'}

CURRENT WORKFLOW CONTEXT:
- Workflow stage indicates preparation progress
- Exam date determines urgency
- Readiness score shows preparation adequacy

Please provide:
1. Next recommended actions (3-5 specific steps)
2. Potential bottlenecks (2-3 critical issues)
3. Progress summary (current state assessment)
4. Resource recommendations (people, documents, tools needed)
5. Timeline recommendations (suggested dates for each step)

Response as JSON:
{
  "next_actions": [
    {"action": "...", "priority": "critical/high/medium", "owner": "...", "estimated_hours": 0}
  ],
  "bottlenecks": [
    {"issue": "...", "severity": "critical/high/medium", "recommendation": "..."}
  ],
  "progress_summary": "...",
  "resource_needs": [
    {"type": "person/document/tool", "name": "...", "purpose": "..."}
  ],
  "timeline": [
    {"milestone": "...", "suggested_date": "YYYY-MM-DD", "dependencies": "..."}
  ],
  "overall_health": "excellent/good/fair/needs_attention"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            next_actions: { type: "array" },
            bottlenecks: { type: "array" },
            progress_summary: { type: "string" },
            resource_needs: { type: "array" },
            timeline: { type: "array" },
            overall_health: { type: "string" }
          }
        }
      });

      setInsights(response);
      toast.success("Workflow analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze workflow");
    } finally {
      setAnalyzing(false);
    }
  };

  const autoPopulateExamData = async () => {
    if (!exam) return;
    
    setAutomating(true);
    try {
      const prompt = `Based on this ${exam.exam_type} regulatory exam, suggest detailed preparation content:

EXAM TYPE: ${exam.exam_type}
CURRENT DATA: ${JSON.stringify({
  title: exam.exam_title,
  description: exam.description,
  lead_coordinator: exam.lead_coordinator
})}

Provide comprehensive exam preparation data including:
1. Detailed exam scope and objectives
2. Key regulatory requirements to review
3. Documentation checklist
4. Suggested team members and their roles
5. Pre-exam tasks with priorities
6. Common audit findings for this exam type

Response as JSON:
{
  "scope_objectives": "detailed scope description",
  "regulatory_requirements": ["requirement 1", "requirement 2", "requirement 3"],
  "documentation_checklist": [
    {"category": "...", "items": ["...", "..."]}
  ],
  "suggested_team": [
    {"role": "...", "responsibilities": "...", "suggested_person": "..."}
  ],
  "pre_exam_tasks": [
    {"task": "...", "priority": "critical/high/medium", "deadline": "...", "owner": "..."}
  ],
  "common_findings": ["finding 1", "finding 2"],
  "preparation_tips": "detailed tips for success"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scope_objectives: { type: "string" },
            regulatory_requirements: { type: "array" },
            documentation_checklist: { type: "array" },
            suggested_team: { type: "array" },
            pre_exam_tasks: { type: "array" },
            common_findings: { type: "array" },
            preparation_tips: { type: "string" }
          }
        }
      });

      // Update exam with pre-filled data
      const updatedData = {
        scope: response.scope_objectives,
        regulatory_requirements: response.regulatory_requirements,
        documentation_checklist: response.documentation_checklist,
        suggested_team_structure: response.suggested_team,
        pre_exam_tasks: response.pre_exam_tasks,
        common_findings: response.common_findings,
        preparation_notes: response.preparation_tips
      };

      if (onUpdateExam) {
        await onUpdateExam(exam.id, updatedData);
      }

      toast.success("Exam data auto-populated successfully");
      setInsights({ ...insights, auto_populated: response });
    } catch (error) {
      console.error("Auto-populate error:", error);
      toast.error("Failed to auto-populate exam data");
    } finally {
      setAutomating(false);
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'fair': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'needs_attention': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Automation Actions */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-500/10 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                <Brain className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Workflow Automation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Intelligent exam preparation assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={analyzeWorkflow}
                disabled={analyzing || !exam}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs h-8"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Analyze Workflow
                  </>
                )}
              </Button>
              <Button
                onClick={autoPopulateExamData}
                disabled={automating || !exam}
                variant="outline"
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-xs h-8"
              >
                {automating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Auto-filling...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1.5" />
                    Auto-Populate Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Display */}
      {insights && (
        <>
          {/* Progress Summary */}
          {insights.progress_summary && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    Progress Summary
                  </CardTitle>
                  {insights.overall_health && (
                    <Badge className={getHealthColor(insights.overall_health)}>
                      {insights.overall_health.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed">{insights.progress_summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Next Actions */}
          {insights.next_actions && insights.next_actions.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Recommended Next Actions
                  <Badge className="bg-indigo-500/20 text-indigo-400 ml-auto">
                    {insights.next_actions.length} actions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.next_actions.map((action, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{action.action}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {action.owner && (
                              <span className="text-xs text-slate-400">
                                <Users className="h-3 w-3 inline mr-1" />
                                {action.owner}
                              </span>
                            )}
                            {action.estimated_hours && (
                              <span className="text-xs text-slate-400">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {action.estimated_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottlenecks */}
          {insights.bottlenecks && insights.bottlenecks.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Potential Bottlenecks
                  <Badge className="bg-amber-500/20 text-amber-400 ml-auto">
                    {insights.bottlenecks.length} issues
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.bottlenecks.map((bottleneck, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                            <h4 className="text-sm font-medium text-white">{bottleneck.issue}</h4>
                          </div>
                          <p className="text-xs text-slate-400 ml-5">{bottleneck.recommendation}</p>
                        </div>
                        <Badge className={`flex-shrink-0 ${
                          bottleneck.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          bottleneck.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {bottleneck.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resource Needs */}
          {insights.resource_needs && insights.resource_needs.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Required Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {insights.resource_needs.map((resource, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-sm font-medium text-white">{resource.name}</span>
                      </div>
                      <p className="text-xs text-slate-400">{resource.purpose}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {insights.timeline && insights.timeline.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-400" />
                  Recommended Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.timeline.map((milestone, idx) => (
                    <div key={idx} className="relative">
                      {idx < insights.timeline.length - 1 && (
                        <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-violet-500/30" />
                      )}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="p-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{milestone.milestone}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {milestone.suggested_date}
                            </span>
                            {milestone.dependencies && (
                              <span className="text-xs text-slate-500">
                                Depends on: {milestone.dependencies}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!insights && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Click "Analyze Workflow" to get AI-powered insights</p>
            <p className="text-slate-500 text-xs mt-1">AI will analyze your exam workflow and provide recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}