import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, AlertCircle, Target, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RegulatoryExamInsights({ exams, userProgress }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const completedExams = exams.filter(e => e.status === 'completed');
      const avgScore = completedExams.length > 0 
        ? Math.round(completedExams.reduce((sum, e) => sum + (e.readiness_score || 0), 0) / completedExams.length)
        : 0;
      
      const categoryPerf = {};
      userProgress.forEach(p => {
        if (!categoryPerf[p.category]) categoryPerf[p.category] = { correct: 0, total: 0 };
        categoryPerf[p.category].total++;
        if (p.correct) categoryPerf[p.category].correct++;
      });

      const weakAreas = Object.entries(categoryPerf)
        .map(([cat, stats]) => ({ 
          category: cat, 
          accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0 
        }))
        .filter(c => c.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy);

      const prompt = `As a GRC and regulatory compliance expert, analyze this exam performance data and provide executive-level insights:

PERFORMANCE METRICS:
- Total Exams: ${exams.length}
- Completed: ${completedExams.length}
- Average Score: ${avgScore}%
- Total Questions Practiced: ${userProgress.length}
- Overall Accuracy: ${userProgress.length > 0 ? Math.round((userProgress.filter(p => p.correct).length / userProgress.length) * 100) : 0}%

WEAK AREAS:
${weakAreas.slice(0, 5).map(w => `- ${w.category}: ${w.accuracy}%`).join('\n')}

RECENT ACTIVITY:
- Last 7 Days: ${userProgress.filter(p => new Date(p.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length} questions
- Pass Rate: ${completedExams.length > 0 ? Math.round((completedExams.filter(e => (e.readiness_score || 0) >= 70).length / completedExams.length) * 100) : 0}%

Provide a concise executive summary (2-3 sentences), critical concerns, and 3 priority actions.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            overall_assessment: { type: "string" },
            critical_concerns: { type: "array", items: { type: "string" } },
            priority_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  rationale: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exams.length > 0 && userProgress.length > 0 && !insights) {
      generateInsights();
    }
  }, [exams, userProgress]);

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10 border-indigo-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="text-white">AI Executive Insights</CardTitle>
          </div>
          <Button
            onClick={generateInsights}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !insights ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-3 text-indigo-400 animate-pulse" />
              <p className="text-sm text-slate-400">Analyzing exam performance...</p>
            </div>
          </div>
        ) : !insights ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No insights available yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Executive Summary */}
            <div className="p-4 rounded-lg bg-[#0f1623] border border-indigo-500/20">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs font-semibold text-indigo-400 uppercase">Executive Summary</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{insights.executive_summary}</p>
            </div>

            {/* Overall Assessment */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Assessment</span>
              </div>
              <p className="text-xs text-slate-300">{insights.overall_assessment}</p>
            </div>

            {/* Critical Concerns */}
            {insights.critical_concerns?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Critical Concerns</span>
                </div>
                <div className="space-y-1">
                  {insights.critical_concerns.map((concern, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-slate-300">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Actions */}
            {insights.priority_actions?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Priority Actions</span>
                </div>
                <div className="space-y-2">
                  {insights.priority_actions.map((action, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors cursor-pointer">
                      <div className="flex items-start gap-2">
                        <Badge className={`mt-0.5 ${
                          action.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          action.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {action.priority}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium mb-1">{action.action}</div>
                          <p className="text-xs text-slate-400">{action.rationale}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}