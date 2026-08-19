import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Shield, AlertTriangle, RefreshCw, Loader2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIDynamicControlScoring({ controls, risks, tests, onScoreUpdate }) {
  const [loading, setLoading] = useState(false);
  const [scoringResults, setScoringResults] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [hasAutoRun, setHasAutoRun] = useState(false);

  // Auto-run on mount
  useEffect(() => {
    if (!hasAutoRun && controls.length > 0 && !loading) {
      setHasAutoRun(true);
      const timer = setTimeout(() => calculateAIScores(), 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.length, hasAutoRun]);

  const calculateAIScores = async () => {
    setLoading(true);
    try {
      const controlContext = controls.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        domain: c.domain,
        current_effectiveness: c.effectiveness || 3,
        status: c.status,
        linked_risks: c.linked_risks?.length || 0,
        last_tested_date: c.last_tested_date,
        review_frequency: c.review_frequency
      }));

      const testResults = tests
        .filter(t => t.test_date && new Date(t.test_date) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))
        .map(t => ({
          control_id: t.control_id,
          result: t.result,
          findings_count: t.findings?.length || 0
        }));

      const riskCoverage = risks.map(r => ({
        severity: (r.likelihood || 0) * (r.impact || 0),
        linked_controls: r.linked_controls || [],
        status: r.status
      }));

      const prompt = `You are a control effectiveness analyst. Calculate dynamic effectiveness scores for the following controls.

CONTROL DATA:
${JSON.stringify(controlContext, null, 2)}

RECENT TEST RESULTS (180 days):
${JSON.stringify(testResults, null, 2)}

RISK COVERAGE:
${JSON.stringify(riskCoverage, null, 2)}

For each control, calculate:
1. effectiveness_score (1-5): Comprehensive effectiveness rating
2. test_performance_factor (0-1): Based on recent test results
3. risk_coverage_factor (0-1): How well it mitigates linked risks
4. implementation_quality (1-5): Quality of implementation
5. trend (improving/stable/degrading): Effectiveness trajectory
6. maturity_level (1-5): Control maturity (1=initial, 5=optimized)
7. priority_rank (1-100): Priority for review/improvement
8. recommended_frequency: Suggested testing frequency

Consider:
- Failed tests reduce effectiveness
- Dormant controls (not tested recently) are less effective
- Controls linked to high-severity risks need higher effectiveness
- Status impacts score (effective > implemented > planned)

Return JSON with array of control scores.`;

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
                  control_id: { type: "string" },
                  effectiveness_score: { type: "number" },
                  test_performance_factor: { type: "number" },
                  risk_coverage_factor: { type: "number" },
                  implementation_quality: { type: "number" },
                  trend: { type: "string" },
                  maturity_level: { type: "number" },
                  priority_rank: { type: "number" },
                  recommended_frequency: { type: "string" },
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

      if (onScoreUpdate && response.scores) {
        for (const score of response.scores) {
          const control = controls.find(c => c.id === score.control_id);
          if (control) {
            await base44.entities.Control.update(control.id, {
              effectiveness: Math.round(score.effectiveness_score),
              test_performance_factor: score.test_performance_factor,
              risk_coverage_factor: score.risk_coverage_factor,
              implementation_quality: score.implementation_quality,
              maturity_level: score.maturity_level,
              last_assessment_date: new Date().toISOString()
            });
          }
        }
        onScoreUpdate();
      }

      toast.success("AI control scoring completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to calculate AI scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(calculateAIScores, 3600000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-emerald-400";
    if (score >= 3.5) return "text-blue-400";
    if (score >= 2.5) return "text-amber-400";
    return "text-rose-400";
  };

  const getTrendIcon = (trend) => {
    if (trend === "improving") return "↗️";
    if (trend === "degrading") return "↘️";
    return "➡️";
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 via-[#1a2332] to-green-500/5 border-emerald-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Brain className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Control Effectiveness Scoring</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Dynamic assessment with predictive analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh
            </Button>
            <Button
              onClick={calculateAIScores}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
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
            <Brain className="h-16 w-16 text-emerald-400/30 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">AI scoring not yet run</p>
            <p className="text-xs text-slate-500">Click "Calculate Scores" to generate effectiveness assessments</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Assessment Summary
              </h4>
              <p className="text-xs text-slate-300">{scoringResults.summary}</p>
              {scoringResults.critical_attention?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <p className="text-xs font-medium text-amber-400 mb-2">⚠️ Requires Attention:</p>
                  <ul className="space-y-1">
                    {scoringResults.critical_attention.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 pl-4">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                Top Priority Controls
              </h4>
              <div className="space-y-2">
                {scoringResults.scores
                  ?.sort((a, b) => b.priority_rank - a.priority_rank)
                  .slice(0, 5)
                  .map((score, idx) => {
                    const control = controls.find(c => c.id === score.control_id);
                    if (!control) return null;

                    return (
                      <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  #{idx + 1}
                                </Badge>
                                <Badge className={`text-xs ${
                                  score.effectiveness_score >= 4.5 ? 'bg-emerald-500/20 text-emerald-400' :
                                  score.effectiveness_score >= 3.5 ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {getTrendIcon(score.trend)} {score.trend}
                                </Badge>
                              </div>
                              <h5 className="text-sm font-semibold text-white mb-1">{control.name}</h5>
                              <p className="text-xs text-slate-400 line-clamp-1 mb-2">{score.reasoning}</p>
                              
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <div className="text-slate-500 mb-1">Effectiveness</div>
                                  <div className={`font-bold text-lg ${getScoreColor(score.effectiveness_score)}`}>
                                    {score.effectiveness_score.toFixed(1)}/5
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">Maturity</div>
                                  <Progress value={(score.maturity_level / 5) * 100} className="h-2 mt-1" />
                                  <div className="text-slate-400 mt-1">Level {score.maturity_level}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">Risk Coverage</div>
                                  <Progress value={score.risk_coverage_factor * 100} className="h-2 mt-1" />
                                  <div className="text-slate-400 mt-1">{(score.risk_coverage_factor * 100).toFixed(0)}%</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-400">{score.priority_rank}</div>
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