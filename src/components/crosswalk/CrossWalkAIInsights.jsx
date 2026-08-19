import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Loader2, AlertTriangle, CheckCircle2, Target, TrendingUp, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CrossWalkAIInsights({ mappings = [], controls = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (mappings.length > 0 && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappings]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const mappingSummary = mappings.slice(0, 10).map(m => ({
        pair: `${m.source_framework} → ${m.target_framework}`,
        coverage: m.coverage_percentage || 0,
        status: m.status
      }));

      const prompt = `Analyze cross-framework compliance mappings and provide strategic insights:

FRAMEWORK MAPPINGS:
${JSON.stringify(mappingSummary, null, 2)}

CONTROLS IN PLACE: ${controls.length} controls
- Active/Effective: ${controls.filter(c => c.status === 'effective').length}
- Domains: ${[...new Set(controls.map(c => c.domain))].join(', ')}

Provide comprehensive analysis:

1. KEY FRAMEWORK DIFFERENCES (3-5 critical differences):
   - What makes each framework unique
   - Areas of divergence
   - Impact on compliance strategy

2. NON-COMPLIANCE RISK AREAS (Top 5 areas):
   - Where gaps are most critical
   - Potential violations or weaknesses
   - Urgency level (critical/high/medium)

3. COVERAGE OPTIMIZATION STRATEGIES (5-7 recommendations):
   - How to maximize control reuse across frameworks
   - Efficiency improvements
   - Quick wins for better alignment

4. CONTROL EFFECTIVENESS ASSESSMENT:
   - Overall maturity score (1-10)
   - Strengths in current approach
   - Weaknesses to address

5. PRIORITIZED ACTION PLAN (Top 5 actions):
   - Immediate actions (0-30 days)
   - Short-term actions (1-3 months)
   - Expected impact

6. FRAMEWORK SYNERGIES:
   - Which frameworks naturally align
   - Opportunities for unified controls
   - Cross-framework benefits`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_differences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  difference: { type: "string" },
                  impact: { type: "string" },
                  frameworks_affected: { type: "array", items: { type: "string" } }
                }
              }
            },
            non_compliance_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  description: { type: "string" },
                  urgency: { type: "string" },
                  frameworks: { type: "array", items: { type: "string" } }
                }
              }
            },
            optimization_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  benefit: { type: "string" },
                  effort: { type: "string" }
                }
              }
            },
            control_effectiveness: {
              type: "object",
              properties: {
                maturity_score: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeline: { type: "string" },
                  impact: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            framework_synergies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  frameworks: { type: "string" },
                  alignment_score: { type: "number" },
                  opportunities: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setInsights(response);
      toast.success("AI insights generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  const priorityColors = {
    critical: 'bg-rose-500/20 text-rose-400',
    high: 'bg-amber-500/20 text-amber-400',
    medium: 'bg-blue-500/20 text-blue-400',
    low: 'bg-slate-500/20 text-slate-400'
  };

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-base text-white">AI Strategic Insights</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          </div>
        )}

        {insights && (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {/* Executive Summary */}
              {insights.executive_summary && (
                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                  <p className="text-sm text-slate-300 leading-relaxed">{insights.executive_summary}</p>
                </div>
              )}

              {/* Control Effectiveness */}
              {insights.control_effectiveness && (
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        Control Effectiveness
                      </span>
                      <div className="text-2xl font-bold text-emerald-400">
                        {insights.control_effectiveness.maturity_score}/10
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-emerald-400 mb-2">Strengths:</p>
                      <ul className="space-y-1">
                        {insights.control_effectiveness.strengths?.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-400 mb-2">Weaknesses:</p>
                      <ul className="space-y-1">
                        {insights.control_effectiveness.weaknesses?.map((w, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Differences */}
              <div>
                <p className="text-xs uppercase tracking-wider text-violet-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Key Framework Differences
                </p>
                <div className="space-y-2">
                  {insights.key_differences?.map((diff, i) => (
                    <Card key={i} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-3">
                        <p className="text-sm text-white font-medium mb-1">{diff.difference}</p>
                        <p className="text-xs text-slate-400 mb-2">{diff.impact}</p>
                        <div className="flex flex-wrap gap-1">
                          {diff.frameworks_affected?.map((fw, j) => (
                            <Badge key={j} className="text-[9px] bg-violet-500/20 text-violet-400">
                              {fw}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Non-Compliance Risks */}
              <div>
                <p className="text-xs uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Non-Compliance Risk Areas
                </p>
                <div className="space-y-2">
                  {insights.non_compliance_risks?.map((risk, i) => (
                    <Card key={i} className={`border ${urgencyColors[String(risk.urgency || '').toLowerCase()] || 'bg-[#151d2e] border-[#2a3548]'}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-white font-medium flex-1">{risk.area}</p>
                          <Badge className={priorityColors[String(risk.urgency || '').toLowerCase()] || 'bg-slate-500/20 text-slate-400'}>
                            {risk.urgency}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {risk.frameworks?.map((fw, j) => (
                            <Badge key={j} className="text-[9px] bg-rose-500/20 text-rose-400">
                              {fw}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Optimization Strategies */}
              <div>
                <p className="text-xs uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" /> Coverage Optimization Strategies
                </p>
                <div className="space-y-2">
                  {insights.optimization_strategies?.map((strategy, i) => (
                    <Card key={i} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm text-white font-medium flex-1">{strategy.strategy}</p>
                          <Badge className="text-[9px] bg-blue-500/20 text-blue-400">
                            {strategy.effort} effort
                          </Badge>
                        </div>
                        <p className="text-xs text-emerald-400">{strategy.benefit}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Framework Synergies */}
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Framework Synergies
                </p>
                <div className="space-y-2">
                  {insights.framework_synergies?.map((synergy, i) => (
                    <Card key={i} className="bg-[#151d2e] border-emerald-500/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-white font-medium">{synergy.frameworks}</p>
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            {synergy.alignment_score}% aligned
                          </Badge>
                        </div>
                        <ul className="space-y-1">
                          {synergy.opportunities?.map((opp, j) => (
                            <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400">•</span>
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" /> Prioritized Action Plan
                </p>
                <div className="space-y-2">
                  {insights.action_plan?.map((action, i) => (
                    <Card key={i} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${priorityColors[String(action.priority || '').toLowerCase()] || 'bg-slate-500/20 text-slate-400'} flex-shrink-0`}>
                            {action.priority}
                          </Badge>
                          <Badge className="text-[9px] bg-slate-500/20 text-slate-400 ml-2">
                            {action.timeline}
                          </Badge>
                        </div>
                        <p className="text-sm text-white mb-1">{action.action}</p>
                        <p className="text-xs text-emerald-400">{action.impact}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {!loading && !insights && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-violet-400 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400 text-sm">Click Generate to analyze framework mappings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}