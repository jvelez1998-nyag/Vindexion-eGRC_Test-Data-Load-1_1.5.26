import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Brain, Target, AlertTriangle, 
  CheckCircle2, Zap, Loader2, Sparkles 
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PredictiveAnalytics({ exams, userEmail }) {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const completedExams = exams.filter(e => e.status === 'passed' || e.status === 'failed');
      
      if (completedExams.length === 0) {
        toast.error("Complete at least one exam to generate predictions");
        return;
      }

      // Gather performance data
      const frameworkScores = {};
      completedExams.forEach(e => {
        if (!frameworkScores[e.framework]) frameworkScores[e.framework] = [];
        frameworkScores[e.framework].push(e.score_percentage);
      });

      const prompt = `You are an AI exam performance analyst. Analyze this student's regulatory exam performance and generate detailed predictions.

PERFORMANCE DATA:
${Object.entries(frameworkScores).map(([fw, scores]) => `
${fw}: ${scores.length} exams, scores: ${scores.join(', ')}, avg: ${Math.round(scores.reduce((a,b) => a+b, 0) / scores.length)}%
`).join('\n')}

Generate comprehensive predictions:
1. Pass probability for each framework (next exam)
2. Weak knowledge areas requiring focus
3. Optimal study strategy recommendations
4. Time-to-mastery estimates
5. Comparative framework difficulty rankings
6. Risk areas (failure points)
7. Strength areas (competencies)
8. Recommended exam sequence for optimal learning
9. Predicted score ranges for next attempts
10. Burnout risk assessment

Return detailed JSON with actionable insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            pass_probabilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  probability: { type: "number" },
                  confidence: { type: "string" },
                  next_score_prediction: { type: "string" }
                }
              }
            },
            weak_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  severity: { type: "string" },
                  recommendation: { type: "string" },
                  study_hours_needed: { type: "number" }
                }
              }
            },
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  proficiency_level: { type: "string" },
                  mastery_percentage: { type: "number" }
                }
              }
            },
            framework_difficulty_ranking: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  difficulty_score: { type: "number" },
                  rationale: { type: "string" }
                }
              }
            },
            recommended_study_path: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sequence: { type: "number" },
                  framework: { type: "string" },
                  rationale: { type: "string" },
                  estimated_weeks: { type: "number" }
                }
              }
            },
            time_to_mastery: {
              type: "object",
              properties: {
                overall_weeks: { type: "number" },
                daily_study_hours: { type: "number" },
                confidence_level: { type: "string" }
              }
            },
            burnout_risk: {
              type: "object",
              properties: {
                risk_level: { type: "string" },
                factors: { type: "array", items: { type: "string" } },
                mitigation: { type: "string" }
              }
            },
            key_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      setPredictions(response);
      toast.success("Predictions generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate predictions");
    } finally {
      setLoading(false);
    }
  };

  if (!predictions) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-12 text-center">
        <Brain className="h-20 w-20 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Predictive Performance Analytics</h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-6">
          Leverage AI to analyze your exam performance history and generate precise predictions about future performance, 
          weak areas, optimal study paths, and mastery timelines.
        </p>
        <Button
          onClick={generatePredictions}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />Generate Predictions</>
          )}
        </Button>
      </Card>
    );
  }

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Key AI Insights
        </h3>
        <div className="space-y-2">
          {predictions.key_insights?.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <Zap className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              {insight}
            </div>
          ))}
        </div>
      </Card>

      {/* Pass Probabilities */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            Framework Pass Probability (Next Exam)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.pass_probabilities?.map((pred, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-500/10 text-indigo-400">{pred.framework}</Badge>
                    <span className="text-sm text-slate-300">Predicted: {pred.next_score_prediction}</span>
                  </div>
                  <Badge className={pred.probability >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 
                                    pred.probability >= 60 ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-rose-500/10 text-rose-400'}>
                    {pred.probability}% pass probability
                  </Badge>
                </div>
                <Progress value={pred.probability} className="h-2" />
                <p className="text-xs text-slate-500">Confidence: {pred.confidence}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Weak Knowledge Areas Requiring Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.weak_areas?.map((area, idx) => (
              <div key={idx} className="p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{area.area}</h4>
                  <Badge className={severityColors[area.severity]}>{area.severity}</Badge>
                </div>
                <p className="text-sm text-slate-400 mb-2">{area.recommendation}</p>
                <div className="text-xs text-slate-500">Study hours needed: {area.study_hours_needed}h</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Your Strengths & Competencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {predictions.strengths?.map((strength, idx) => (
              <div key={idx} className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{strength.area}</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-400">{strength.proficiency_level}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={strength.mastery_percentage} className="h-1.5 flex-1" />
                  <span className="text-xs text-emerald-400 font-medium">{strength.mastery_percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Study Path */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            AI-Recommended Study Sequence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.recommended_study_path?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 font-bold flex-shrink-0">
                  {step.sequence}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{step.framework}</h4>
                    <Badge className="bg-slate-500/10 text-slate-400">{step.estimated_weeks} weeks</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{step.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time to Mastery */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Time to Mastery Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {predictions.time_to_mastery?.overall_weeks}
              </div>
              <div className="text-sm text-slate-400 mb-4">weeks to full mastery</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Daily study:</span>
                <span className="text-white font-medium">{predictions.time_to_mastery?.daily_study_hours}h</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-500">Confidence:</span>
                <Badge className="bg-indigo-500/10 text-indigo-400">{predictions.time_to_mastery?.confidence_level}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base">Burnout Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={
              predictions.burnout_risk?.risk_level === 'low' ? 'bg-emerald-500/10 text-emerald-400' :
              predictions.burnout_risk?.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-rose-500/10 text-rose-400'
            } style={{ marginBottom: '12px' }}>
              {predictions.burnout_risk?.risk_level} risk
            </Badge>
            <div className="space-y-2 mb-4">
              {predictions.burnout_risk?.factors?.map((factor, idx) => (
                <div key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  {factor}
                </div>
              ))}
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded text-sm text-slate-300">
              <strong className="text-blue-400">Mitigation:</strong> {predictions.burnout_risk?.mitigation}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setPredictions(null)} variant="outline" className="border-[#2a3548]">
          Generate New Predictions
        </Button>
      </div>
    </div>
  );
}