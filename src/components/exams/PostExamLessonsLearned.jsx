import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Lightbulb, CheckCircle2, AlertTriangle, TrendingUp, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PostExamLessonsLearned({ exam, onSave }) {
  const [formData, setFormData] = useState({
    what_went_well: '',
    what_could_improve: '',
    unexpected_questions: '',
    documentation_gaps: '',
    process_improvements: '',
    future_recommendations: ''
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateAIInsights = async () => {
    setGenerating(true);
    try {
      const prompt = `Analyze this post-exam debrief and generate actionable insights for future exam preparation.

EXAM TYPE: ${exam?.exam_type}
OUTCOME: ${exam?.outcome || 'Completed'}

DEBRIEF RESPONSES:
${JSON.stringify(formData, null, 2)}

Generate:
1. Key takeaways (5-7 bullet points)
2. Process improvements for next exam (prioritized)
3. Documentation enhancements needed
4. Team training recommendations
5. Risk areas to monitor
6. Timeline adjustments for future exams

Return structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            key_takeaways: { type: "array", items: { type: "string" } },
            process_improvements: { type: "array" },
            documentation_enhancements: { type: "array", items: { type: "string" } },
            training_recommendations: { type: "array", items: { type: "string" } },
            risk_monitoring: { type: "array", items: { type: "string" } },
            timeline_adjustments: { type: "string" }
          }
        }
      });

      setAiInsights(response);
      toast.success("AI insights generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    onSave({ ...formData, ai_insights: aiInsights });
    toast.success("Lessons learned saved");
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-400" />
            Post-Exam Lessons Learned
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-400 flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              What Went Well
            </Label>
            <Textarea
              value={formData.what_went_well}
              onChange={(e) => setFormData({ ...formData, what_went_well: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white h-24"
              placeholder="Document successes, effective strategies, and positive outcomes..."
            />
          </div>

          <div>
            <Label className="text-slate-400 flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              What Could Be Improved
            </Label>
            <Textarea
              value={formData.what_could_improve}
              onChange={(e) => setFormData({ ...formData, what_could_improve: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white h-24"
              placeholder="Areas that need enhancement for future exams..."
            />
          </div>

          <div>
            <Label className="text-slate-400 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Unexpected Questions or Focus Areas
            </Label>
            <Textarea
              value={formData.unexpected_questions}
              onChange={(e) => setFormData({ ...formData, unexpected_questions: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white h-24"
              placeholder="Questions or areas that surprised the team..."
            />
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Documentation Gaps Identified</Label>
            <Textarea
              value={formData.documentation_gaps}
              onChange={(e) => setFormData({ ...formData, documentation_gaps: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white h-24"
              placeholder="Documents that were missing or inadequate..."
            />
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Process Improvements for Next Exam</Label>
            <Textarea
              value={formData.process_improvements}
              onChange={(e) => setFormData({ ...formData, process_improvements: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white h-24"
              placeholder="Specific process changes to implement..."
            />
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">Recommendations for Future Exams</Label>
            <Textarea
              value={formData.future_recommendations}
              onChange={(e) => setFormData({ ...formData, future_recommendations: e.target.value })}
              className="bg-[#0f1623] border-[#2a3548] text-white h-24"
              placeholder="Strategic recommendations based on this experience..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={generateAIInsights} disabled={generating} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {generating ? <Brain className="h-4 w-4 mr-2 animate-pulse" /> : <Brain className="h-4 w-4 mr-2" />}
              Generate AI Insights
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Save Lessons Learned
            </Button>
          </div>
        </CardContent>
      </Card>

      {aiInsights && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <h4 className="text-sm font-semibold text-indigo-400 mb-3">Key Takeaways</h4>
              <ul className="space-y-2">
                {aiInsights.key_takeaways?.map((takeaway, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-400 mb-3">Process Improvements (Prioritized)</h4>
              <ul className="space-y-2">
                {aiInsights.process_improvements?.map((improvement, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-400 mb-3">Training Recommendations</h4>
              <ul className="space-y-2">
                {aiInsights.training_recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}