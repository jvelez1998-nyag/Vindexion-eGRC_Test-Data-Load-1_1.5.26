import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, Loader2, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ExamPrioritization({ exam, contextData }) {
  const [priorities, setPriorities] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePriorities = async () => {
    setLoading(true);
    try {
      const daysUntilExam = exam?.exam_date ? Math.ceil((new Date(exam.exam_date) - new Date()) / (1000 * 60 * 60 * 24)) : 90;

      const prompt = `You are a regulatory exam preparation strategist. Create a prioritized action plan for exam readiness.

EXAM DETAILS:
- Type: ${exam?.exam_type || 'FFIEC'}
- Days Until Exam: ${daysUntilExam}
- Current Readiness: ${exam?.readiness_score || 0}%
- Workflow Stage: ${exam?.workflow_stage || 'preparation'}

ORGANIZATION CONTEXT:
- Critical Risks: ${contextData?.risks?.filter(r => r.severity === 'critical').length || 0}
- High Risks: ${contextData?.risks?.filter(r => r.severity === 'high').length || 0}
- Non-Compliant Items: ${contextData?.compliance?.filter(c => c.status === 'non_compliant').length || 0}
- Ineffective Controls: ${contextData?.controls?.filter(c => c.effectiveness < 3).length || 0}
- Recent Incidents: ${contextData?.incidents?.filter(i => new Date(i.created_date) > new Date(Date.now() - 180*24*60*60*1000)).length || 0}

Generate a time-based prioritized action plan:

1. IMMEDIATE (This Week) - 5-7 critical actions
2. SHORT-TERM (Next 2 Weeks) - 5-7 high priority items
3. MID-TERM (3-4 Weeks) - 4-5 important items
4. FINAL PREP (Last Week) - 3-4 final items

For each action provide:
- action: Specific actionable item
- category: documentation/testing/remediation/team/governance
- impact: High/Medium impact on exam outcome
- effort: Hours required
- assignee_role: Who should own this
- dependencies: What must be done first

Also provide:
- focus_areas: Top 5 areas examiners will scrutinize
- quick_wins: 3 items that improve readiness significantly with minimal effort

Return structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            immediate: { type: "array" },
            short_term: { type: "array" },
            mid_term: { type: "array" },
            final_prep: { type: "array" },
            focus_areas: { type: "array", items: { type: "string" } },
            quick_wins: { type: "array" }
          }
        }
      });

      setPriorities(response);
      toast.success("Prioritization complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate priorities");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (timeframe) => {
    switch (timeframe) {
      case 'immediate': return 'from-rose-500/20 to-red-500/20 border-rose-500/30';
      case 'short_term': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'mid_term': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'final_prep': return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30';
    }
  };

  const getTimeframeIcon = (timeframe) => {
    switch (timeframe) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'short_term': return <Clock className="h-4 w-4 text-amber-400" />;
      case 'mid_term': return <TrendingUp className="h-4 w-4 text-blue-400" />;
      default: return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              AI-Powered Exam Prioritization
            </CardTitle>
            <Button onClick={generatePriorities} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Generate Plan
            </Button>
          </div>
        </CardHeader>
      </Card>

      {priorities?.quick_wins && (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Quick Wins - High Impact, Low Effort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priorities.quick_wins.map((win, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{win}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {priorities && (
        <>
          {[
            { key: 'immediate', label: 'IMMEDIATE (This Week)', timeframe: 'immediate' },
            { key: 'short_term', label: 'SHORT-TERM (Next 2 Weeks)', timeframe: 'short_term' },
            { key: 'mid_term', label: 'MID-TERM (3-4 Weeks)', timeframe: 'mid_term' },
            { key: 'final_prep', label: 'FINAL PREP (Last Week)', timeframe: 'final_prep' }
          ].map(({ key, label, timeframe }) => (
            priorities[key] && priorities[key].length > 0 && (
              <Card key={key} className={`bg-gradient-to-r ${getPriorityColor(timeframe)} border`}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getTimeframeIcon(timeframe)}
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {priorities[key].map((action, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm flex-1">{action.action}</h4>
                          <Badge className={`${action.impact === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'} text-xs ml-2`}>
                            {action.impact} Impact
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {action.effort}h
                          </span>
                          <span>•</span>
                          <span>{action.category}</span>
                          <span>•</span>
                          <span>Owner: {action.assignee_role}</span>
                        </div>
                        {action.dependencies && (
                          <div className="mt-2 text-xs text-amber-400">
                            ⚠ Depends on: {action.dependencies}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}

          {priorities.focus_areas && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Predicted Examiner Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {priorities.focus_areas.map((area, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">{idx + 1}.</span>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}