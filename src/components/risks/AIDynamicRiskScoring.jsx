import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIDynamicRiskScoring({ risks, controls, incidents, onScoreUpdate }) {
  const [loading, setLoading] = useState(false);
  const [scoringResults, setScoringResults] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const calculateAIScores = async () => {
    setLoading(true);
    try {
      // Prepare risk context
      const riskContext = risks.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        inherent_likelihood: r.inherent_likelihood || r.likelihood,
        inherent_impact: r.inherent_impact || r.impact,
        linked_controls: r.linked_controls?.length || 0,
        linked_incidents: r.linked_incidents?.length || 0,
        status: r.status,
        mitigation_progress: r.mitigation_progress || 0
      }));

      // Control effectiveness data
      const controlData = controls.map(c => ({
        id: c.id,
        effectiveness: c.effectiveness || 3,
        status: c.status
      }));

      // Recent incident data
      const incidentData = incidents
        .filter(i => i.occurred_date && new Date(i.occurred_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
        .map(i => ({
          severity: i.severity,
          type: i.incident_type,
          linked_risks: i.linked_risks || []
        }));

      const prompt = `You are an AI risk analyst. Calculate dynamic risk scores for the following risks.

RISK DATA:
${JSON.stringify(riskContext, null, 2)}

CONTROL EFFECTIVENESS:
${JSON.stringify(controlData, null, 2)}

RECENT INCIDENTS (90 days):
${JSON.stringify(incidentData, null, 2)}

For each risk, calculate:
1. control_effectiveness_factor (0-1): Based on linked controls' effectiveness
2. incident_history_factor (0-2): Impact of recent related incidents
3. dynamic_score (1-25): Adjusted score considering controls and incidents
4. residual_likelihood (1-5): Likelihood after controls
5. residual_impact (1-5): Impact after controls
6. trend (increasing/stable/decreasing): Risk trajectory
7. priority_rank (1-100): Overall priority for attention

Formula guidance:
- Start with inherent_likelihood × inherent_impact
- Apply control_effectiveness_factor (reduces score)
- Apply incident_history_factor (increases score)
- Consider mitigation_progress
- Factor in status (mitigating risks should have lower scores)

Return JSON with array of risk scores.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  control_effectiveness_factor: { type: "number" },
                  incident_history_factor: { type: "number" },
                  dynamic_score: { type: "number" },
                  residual_likelihood: { type: "number" },
                  residual_impact: { type: "number" },
                  trend: { type: "string" },
                  priority_rank: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            summary: { type: "string" },
            critical_attention: { type: "array", items: { type: "string" } }
          }
        }
      });

      setScoringResults(response);

      // Update risks with new scores
      if (onScoreUpdate && response.scores) {
        for (const score of response.scores) {
          const risk = risks.find(r => r.id === score.risk_id);
          if (risk) {
            await base44.entities.Risk.update(risk.id, {
              dynamic_score: score.dynamic_score,
              control_effectiveness_factor: score.control_effectiveness_factor,
              incident_history_factor: score.incident_history_factor,
              residual_likelihood: score.residual_likelihood,
              residual_impact: score.residual_impact,
              last_assessment_date: new Date().toISOString()
            });
          }
        }
        onScoreUpdate();
      }

      toast.success("AI risk scoring completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate AI scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        calculateAIScores();
      }, 3600000); // Every hour
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getScoreColor = (score) => {
    if (score >= 20) return "text-rose-400";
    if (score >= 15) return "text-amber-400";
    if (score >= 10) return "text-yellow-400";
    return "text-emerald-400";
  };

  const getTrendIcon = (trend) => {
    if (trend === "increasing") return "↗️";
    if (trend === "decreasing") return "↘️";
    return "➡️";
  };

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 via-[#1a2332] to-purple-500/5 border-violet-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
              <Brain className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI-Driven Risk Scoring</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Dynamic risk assessment with predictive analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "border-violet-500/50 bg-violet-500/10" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh
            </Button>
            <Button
              onClick={calculateAIScores}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Calculate Scores
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!scoringResults ? (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-violet-400/30 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">AI scoring not yet run</p>
            <p className="text-xs text-slate-500">Click "Calculate Scores" to generate dynamic risk assessments</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                Assessment Summary
              </h4>
              <p className="text-xs text-slate-300">{scoringResults.summary}</p>
              {scoringResults.critical_attention?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-violet-500/20">
                  <p className="text-xs font-medium text-rose-400 mb-2">⚠️ Requires Immediate Attention:</p>
                  <ul className="space-y-1">
                    {scoringResults.critical_attention.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 pl-4">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Top Priority Risks */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Top Priority Risks by AI Score
              </h4>
              <div className="space-y-2">
                {scoringResults.scores
                  ?.sort((a, b) => b.priority_rank - a.priority_rank)
                  .slice(0, 5)
                  .map((score, idx) => {
                    const risk = risks.find(r => r.id === score.risk_id);
                    if (!risk) return null;

                    return (
                      <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30">
                                  #{idx + 1}
                                </Badge>
                                <Badge className={`text-xs ${
                                  score.dynamic_score >= 20 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                  score.dynamic_score >= 15 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                }`}>
                                  {getTrendIcon(score.trend)} {score.trend}
                                </Badge>
                              </div>
                              <h5 className="text-sm font-semibold text-white mb-1">{risk.title}</h5>
                              <p className="text-xs text-slate-400 line-clamp-1 mb-2">{score.reasoning}</p>
                              
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <div className="text-slate-500 mb-1">Dynamic Score</div>
                                  <div className={`font-bold text-lg ${getScoreColor(score.dynamic_score)}`}>
                                    {score.dynamic_score.toFixed(1)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">Residual Risk</div>
                                  <div className="font-semibold text-white">
                                    {score.residual_likelihood} × {score.residual_impact}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">Control Effect</div>
                                  <Progress 
                                    value={score.control_effectiveness_factor * 100} 
                                    className="h-2 mt-1"
                                  />
                                  <div className="text-slate-400 mt-1">
                                    {(score.control_effectiveness_factor * 100).toFixed(0)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-violet-400">
                                {score.priority_rank}
                              </div>
                              <div className="text-xs text-slate-500">Priority</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548] text-xs text-slate-400">
              <strong className="text-white">Last Updated:</strong> {new Date().toLocaleString()} 
              {autoRefresh && " • Auto-refresh enabled"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}