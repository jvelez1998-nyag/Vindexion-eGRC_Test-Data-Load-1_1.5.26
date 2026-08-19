import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";

export default function AIChurnPredictor({ client, allClients = [] }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const runChurnAnalysis = async () => {
    setLoading(true);
    try {
      const prompt = `As a client retention expert, analyze this client's churn risk using predictive analytics.

CLIENT PROFILE:
${JSON.stringify(client, null, 2)}

PORTFOLIO CONTEXT:
- Total clients: ${allClients.length}
- Average compliance score: ${Math.round(allClients.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / allClients.length)}
- Average risk score: ${Math.round(allClients.reduce((sum, c) => sum + (c.risk_score || 0), 0) / allClients.length)}

ANALYSIS REQUIRED:
1. **Churn Risk Score** (0-100): Likelihood of client leaving within 12 months
2. **Risk Level**: "low", "medium", "high", or "critical"
3. **Key Risk Factors**: Array of specific concerns
4. **Early Warning Signals**: Observable indicators
5. **Retention Strategies**: Actionable recommendations
6. **Health Metrics**: Scores for engagement, satisfaction, performance, value_delivery (each 0-100)
7. **Timeline**: Expected timeframe if at risk
8. **Confidence**: Your confidence level in this prediction (0-100)

Base your analysis on:
- Compliance score trends
- Risk score changes
- Incident history
- Finding counts
- Assessment frequency
- Status changes
- Industry benchmarks
- Relationship patterns`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            churn_risk_score: { type: "number" },
            risk_level: { type: "string" },
            key_risk_factors: { type: "array", items: { type: "string" } },
            early_warning_signals: { type: "array", items: { type: "string" } },
            retention_strategies: { type: "array", items: { type: "string" } },
            health_metrics: {
              type: "object",
              properties: {
                engagement: { type: "number" },
                satisfaction: { type: "number" },
                performance: { type: "number" },
                value_delivery: { type: "number" }
              }
            },
            timeline: { type: "string" },
            confidence: { type: "number" },
            analysis_summary: { type: "string" }
          }
        }
      });

      setPrediction(response);
      toast.success("Churn prediction complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to predict churn risk");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: { bg: 'from-emerald-500/10 to-green-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
      medium: { bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
      high: { bg: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
      critical: { bg: 'from-rose-500/10 to-red-500/10', border: 'border-rose-500/30', text: 'text-rose-400' }
    };
    return colors[level] || colors.medium;
  };

  const radarData = prediction ? [
    { metric: 'Engagement', score: prediction.health_metrics.engagement },
    { metric: 'Satisfaction', score: prediction.health_metrics.satisfaction },
    { metric: 'Performance', score: prediction.health_metrics.performance },
    { metric: 'Value', score: prediction.health_metrics.value_delivery }
  ] : [];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-400" />
          AI Churn Risk Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction ? (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-violet-400 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-4">
              Analyze client retention risk using AI-powered predictive analytics
            </p>
            <Button 
              onClick={runChurnAnalysis}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Churn Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <Card className={`bg-gradient-to-br ${getRiskColor(prediction.risk_level).bg} ${getRiskColor(prediction.risk_level).border} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Churn Risk Score</span>
                  <Badge className={`${getRiskColor(prediction.risk_level).bg} ${getRiskColor(prediction.risk_level).text} ${getRiskColor(prediction.risk_level).border}`}>
                    {prediction.risk_level}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {prediction.churn_risk_score}%
                </div>
                <Progress value={prediction.churn_risk_score} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{prediction.timeline}</span>
                  <span className="text-slate-500">Confidence: {prediction.confidence}%</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#2a3548" />
                      <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardContent className="p-3">
                  <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    Early Warning Signals
                  </h4>
                  <div className="space-y-1">
                    {prediction.early_warning_signals.slice(0, 4).map((signal, idx) => (
                      <div key={idx} className="text-[10px] text-slate-400 flex items-start gap-1">
                        <span className="text-amber-400">•</span>
                        <span className="line-clamp-2">{signal}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-white mb-2">Key Risk Factors</h4>
                <div className="space-y-1">
                  {prediction.key_risk_factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-rose-500/10 border border-rose-500/20">
                      <span className="text-rose-400">•</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#151d2e] border-[#2a3548]">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Retention Strategies
                </h4>
                <div className="space-y-1">
                  {prediction.retention_strategies.map((strategy, idx) => (
                    <div key={idx} className="text-[10px] text-slate-300 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {idx + 1}. {strategy}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={runChurnAnalysis}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full border-[#2a3548] text-slate-400"
            >
              <Brain className="h-3 w-3 mr-2" />
              Re-analyze
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}