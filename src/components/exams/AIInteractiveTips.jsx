import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, AlertTriangle, CheckCircle2, TrendingUp, X, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIInteractiveTips({ exam, contextData }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  const generateTips = async () => {
    setLoading(true);
    try {
      const prompt = `You are an expert regulatory exam consultant. Generate 8-10 personalized, actionable tips for exam preparation.

EXAM CONTEXT:
- Type: ${exam?.exam_type || 'FFIEC'}
- Days Until Exam: ${exam?.exam_date ? Math.ceil((new Date(exam.exam_date) - new Date()) / (1000 * 60 * 60 * 24)) : 'TBD'}
- Current Readiness: ${exam?.readiness_score || 0}%
- Workflow Stage: ${exam?.workflow_stage || 'preparation'}

ORGANIZATION DATA:
- Active Risks: ${contextData?.risks?.length || 0} (${contextData?.risks?.filter(r => r.severity === 'critical' || r.severity === 'high').length || 0} high/critical)
- Controls: ${contextData?.controls?.length || 0}
- Recent Incidents: ${contextData?.incidents?.filter(i => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(i.created_date) > sixMonthsAgo;
}).length || 0} in last 6 months
- Compliance Status: ${contextData?.compliance?.filter(c => c.status === 'compliant').length || 0} of ${contextData?.compliance?.length || 0} compliant

Generate practical, specific tips covering:
- Documentation gaps to address immediately
- High-risk areas examiners will focus on
- Quick wins for improving readiness score
- Common pitfalls to avoid
- Preparation priorities for current stage
- Mock exam recommendations
- Team coordination tips

Each tip should have:
- category: "documentation" | "risk_management" | "compliance" | "preparation" | "team" | "testing"
- priority: "critical" | "high" | "medium"
- title: Brief actionable title
- description: 2-3 sentence explanation
- timeframe: "immediate" | "this_week" | "next_2_weeks" | "before_exam"
- impact: Brief statement of why this matters

Return JSON with tips array.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            tips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  priority: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  timeframe: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setTips(response.tips || []);
      toast.success(`Generated ${response.tips?.length || 0} personalized tips`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate tips");
    } finally {
      setLoading(false);
    }
  };

  const activeTips = tips.filter(t => !dismissed.includes(t.title));

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'risk_management': return <AlertTriangle className="h-4 w-4" />;
      case 'compliance': return <CheckCircle2 className="h-4 w-4" />;
      case 'testing': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'from-rose-500/20 to-red-500/20 border-rose-500/30';
      case 'high': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      default: return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    }
  };

  const getTimeframeBadge = (timeframe) => {
    const colors = {
      immediate: 'bg-rose-500/20 text-rose-400',
      this_week: 'bg-amber-500/20 text-amber-400',
      next_2_weeks: 'bg-blue-500/20 text-blue-400',
      before_exam: 'bg-slate-500/20 text-slate-400'
    };
    return colors[timeframe] || colors.before_exam;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              AI-Powered Interactive Tips
            </CardTitle>
            <Button onClick={generateTips} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? <Lightbulb className="h-4 w-4 mr-2 animate-pulse" /> : <Brain className="h-4 w-4 mr-2" />}
              Generate Tips
            </Button>
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence>
        {activeTips.map((tip, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`bg-gradient-to-r ${getPriorityColor(tip.priority)} border hover:shadow-lg transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    tip.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                    tip.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getCategoryIcon(tip.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-white text-sm">{tip.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-white"
                        onClick={() => setDismissed([...dismissed, tip.title])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{tip.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${tip.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : tip.priority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {tip.priority}
                        </Badge>
                        <Badge className={`text-xs ${getTimeframeBadge(tip.timeframe)}`}>
                          {tip.timeframe?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className="text-xs bg-purple-500/20 text-purple-400">
                          {tip.category?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 rounded bg-black/20">
                      <div className="text-xs text-slate-400">
                        <span className="text-indigo-400 font-semibold">Impact:</span> {tip.impact}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}