import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, TrendingUp, AlertCircle, Target, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIPrioritizationEngine({ risks, onPriorityUpdated }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [prioritizedRisks, setPrioritizedRisks] = useState([]);

  const analyzePriorities = async () => {
    setAnalyzing(true);
    try {
      const riskSummary = risks.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        status: r.status,
        likelihood: r.likelihood || 0,
        impact: r.impact || 0,
        current_score: (r.likelihood || 0) * (r.impact || 0),
        description: r.description?.substring(0, 200),
        existing_controls: r.linked_controls?.length || 0,
        due_date: r.due_date,
        owner: r.owner
      }));

      const prompt = `You are a risk management expert. Analyze these ${risks.length} risks and provide AI-driven prioritization.

RISKS DATA:
${JSON.stringify(riskSummary, null, 2)}

ANALYSIS REQUIREMENTS:
1. Calculate an AI priority score (0-100) for each risk considering:
   - Current likelihood and impact
   - Business criticality (based on category)
   - Mitigation status (existing controls)
   - Urgency (due dates, status)
   - Potential cascading effects
   - Industry threat landscape

2. Assign priority tier: critical, high, medium, or low

3. Provide actionable recommendations for each risk

4. Identify top 5 risks requiring immediate attention

Return comprehensive analysis with scores and reasoning.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            prioritized_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  ai_priority_score: { type: "number" },
                  priority_tier: { type: "string" },
                  priority_factors: {
                    type: "array",
                    items: { type: "string" }
                  },
                  recommendation: { type: "string" },
                  urgency_level: { type: "string" },
                  estimated_impact: { type: "string" }
                }
              }
            },
            top_risks: {
              type: "array",
              items: { type: "string" }
            },
            overall_assessment: { type: "string" }
          }
        }
      });

      const enriched = response.prioritized_risks.map(pr => {
        const originalRisk = risks.find(r => r.id === pr.risk_id);
        return { ...originalRisk, ...pr };
      }).sort((a, b) => b.ai_priority_score - a.ai_priority_score);

      setPrioritizedRisks(enriched);
      toast.success("Risk prioritization complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze priorities");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyPriorities = async () => {
    try {
      await Promise.all(
        prioritizedRisks.map(risk => 
          base44.entities.Risk.update(risk.id, {
            ai_priority_score: risk.ai_priority_score,
            priority_tier: risk.priority_tier,
            ai_recommendation: risk.recommendation
          })
        )
      );

      toast.success("Priorities applied to all risks");
      onPriorityUpdated && onPriorityUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply priorities");
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI-Driven Risk Prioritization
        </CardTitle>
        <p className="text-sm text-slate-400 mt-1">
          Intelligent risk ranking based on multi-factor analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {prioritizedRisks.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit mx-auto mb-4">
              <Target className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              Analyze Risk Priorities
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              AI will evaluate {risks.length} risks and determine optimal prioritization
            </p>
            <Button 
              onClick={analyzePriorities}
              disabled={analyzing || risks.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing {risks.length} risks...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400">
                  {prioritizedRisks.length} risks analyzed
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={analyzePriorities}
                  disabled={analyzing}
                  className="border-[#2a3548]"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Re-analyze
                </Button>
                <Button 
                  size="sm"
                  onClick={applyPriorities}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Apply Priorities
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {prioritizedRisks.map((risk, idx) => (
                <div
                  key={risk.id}
                  className="p-4 rounded-lg border border-[#2a3548] bg-[#151d2e] hover:border-[#3a4558] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-white">#{idx + 1}</div>
                        <div className="text-xs text-slate-500">rank</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{risk.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getTierColor(risk.priority_tier)}>
                            {risk.priority_tier}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-[#2a3548] text-slate-400">
                            {risk.category}
                          </Badge>
                          <Badge className="bg-slate-500/10 text-slate-400">
                            Score: {risk.current_score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">
                        {risk.ai_priority_score}
                      </div>
                      <div className="text-xs text-slate-500">AI Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Priority Score</span>
                        <span className="text-slate-400">{risk.ai_priority_score}/100</span>
                      </div>
                      <Progress 
                        value={risk.ai_priority_score} 
                        className="h-2 bg-[#0f1623]"
                      />
                    </div>

                    {risk.priority_factors && risk.priority_factors.length > 0 && (
                      <div className="bg-[#0f1623] rounded p-3 border border-[#2a3548]">
                        <div className="text-xs font-semibold text-slate-400 mb-2">Key Factors:</div>
                        <ul className="text-xs text-slate-500 space-y-1">
                          {risk.priority_factors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {risk.recommendation && (
                      <div className="bg-indigo-500/5 rounded p-3 border border-indigo-500/20">
                        <div className="text-xs font-semibold text-indigo-400 mb-1">Recommendation:</div>
                        <p className="text-xs text-slate-400">{risk.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}