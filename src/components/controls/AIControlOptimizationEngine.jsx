import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { 
  Brain, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Lightbulb,
  BarChart3,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";

export default function AIControlOptimizationEngine({ controls, risks, controlTests, onOptimizationApplied }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const runOptimizationAnalysis = async () => {
    setLoading(true);
    try {
      // Prepare control test failure analysis
      const controlTestMap = {};
      (controlTests || []).forEach(test => {
        if (!controlTestMap[test.control_id]) {
          controlTestMap[test.control_id] = { total: 0, failed: 0, tests: [] };
        }
        controlTestMap[test.control_id].total++;
        if (test.status === 'failed') {
          controlTestMap[test.control_id].failed++;
        }
        controlTestMap[test.control_id].tests.push(test);
      });

      // Identify problematic controls
      const controlAnalysis = controls.map(control => {
        const testData = controlTestMap[control.id] || { total: 0, failed: 0, tests: [] };
        const failureRate = testData.total > 0 ? (testData.failed / testData.total) * 100 : 0;
        const linkedRisks = (risks || []).filter(r => r.linked_controls?.includes(control.id));
        const avgRiskScore = linkedRisks.length > 0 
          ? linkedRisks.reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / linkedRisks.length 
          : 0;

        return {
          control_id: control.id,
          name: control.name,
          domain: control.domain,
          effectiveness: control.effectiveness || 3,
          status: control.status,
          test_count: testData.total,
          failure_rate: failureRate,
          recent_failures: testData.tests.filter(t => t.status === 'failed').slice(0, 3),
          linked_risk_count: linkedRisks.length,
          avg_risk_score: avgRiskScore,
          criticality_score: (failureRate * 0.4) + (avgRiskScore * 2.4) - (control.effectiveness || 3) * 5
        };
      }).filter(c => c.test_count > 0 || c.linked_risk_count > 0)
        .sort((a, b) => b.criticality_score - a.criticality_score)
        .slice(0, 15);

      const prompt = `You are an expert GRC consultant specializing in control optimization. Analyze this control effectiveness data and provide actionable recommendations.

CONTROL EFFECTIVENESS DATA:
${JSON.stringify(controlAnalysis, null, 2)}

RISK LANDSCAPE SUMMARY:
- Total Risks: ${risks.length}
- Critical Risks (16+): ${risks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length}
- High Risks (12-15): ${risks.filter(r => {
  const score = (r.likelihood || 0) * (r.impact || 0);
  return score >= 12 && score < 16;
}).length}

PROVIDE COMPREHENSIVE ANALYSIS:

1. FAILURE PATTERN ANALYSIS:
   - Identify recurring patterns in control failures
   - Common root causes (design flaws, implementation gaps, resource constraints)
   - Domain-specific trends and weaknesses
   - Critical failure points that need immediate attention

2. OPTIMIZATION RECOMMENDATIONS (Top 8):
   For each recommendation provide:
   - control_id: ID of the control
   - control_name: Name of the control
   - issue: Specific problem identified
   - recommendation: Detailed improvement strategy
   - alternative_mechanism: Alternative control approach if redesign is needed
   - expected_effectiveness_increase: Number (1-5)
   - implementation_effort: "low", "medium", or "high"
   - priority: "critical", "high", "medium", or "low"
   - risk_reduction_potential: Percentage (0-100)

3. IMPACT FORECAST:
   Provide forecasts for implementing recommendations:
   - overall_risk_reduction: Percentage reduction in overall risk exposure
   - control_effectiveness_improvement: Average effectiveness increase
   - high_priority_items: Number of critical/high priority items
   - estimated_timeline: Months to implement all recommendations
   - resource_requirements: Brief description
   - roi_projection: Expected return on investment description

4. QUICK WINS:
   Identify 3-5 quick wins - low effort, high impact improvements that can be implemented immediately

Be specific, data-driven, and actionable. Use actual numbers from the data.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            failure_patterns: {
              type: "object",
              properties: {
                recurring_patterns: { type: "array", items: { type: "string" } },
                root_causes: { type: "array", items: { type: "string" } },
                domain_trends: { type: "array", items: { type: "string" } },
                critical_failures: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  control_name: { type: "string" },
                  issue: { type: "string" },
                  recommendation: { type: "string" },
                  alternative_mechanism: { type: "string" },
                  expected_effectiveness_increase: { type: "number" },
                  implementation_effort: { type: "string" },
                  priority: { type: "string" },
                  risk_reduction_potential: { type: "number" }
                }
              }
            },
            impact_forecast: {
              type: "object",
              properties: {
                overall_risk_reduction: { type: "number" },
                control_effectiveness_improvement: { type: "number" },
                high_priority_items: { type: "number" },
                estimated_timeline: { type: "number" },
                resource_requirements: { type: "string" },
                roi_projection: { type: "string" }
              }
            },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Control optimization analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate optimization analysis");
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (rec) => {
    try {
      const control = controls.find(c => c.id === rec.control_id);
      if (!control) {
        toast.error("Control not found");
        return;
      }

      const newEffectiveness = Math.min(5, (control.effectiveness || 3) + rec.expected_effectiveness_increase);
      
      await base44.entities.Control.update(control.id, {
        effectiveness: newEffectiveness,
        notes: `${control.notes || ''}\n\n[AI Optimization Applied - ${new Date().toISOString()}]\nRecommendation: ${rec.recommendation}\nExpected Impact: +${rec.expected_effectiveness_increase} effectiveness, ${rec.risk_reduction_potential}% risk reduction`
      });

      toast.success(`Applied optimization to ${control.name}`);
      if (onOptimizationApplied) onOptimizationApplied();
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply recommendation");
    }
  };

  const priorityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  const effortColors = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#0f1623] via-[#151d2e] to-indigo-950/30 border border-indigo-500/30 shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl"></div>

      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 shadow-xl shadow-indigo-500/40 animate-pulse">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                AI Control Enhancement Engine
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Proactive control improvements & new control suggestions</p>
            </div>
          </div>
          <Button 
            onClick={runOptimizationAnalysis} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/30 text-white font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing Controls...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Now
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-2">
        {!analysis && !loading && (
          <div className="text-center py-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <Brain className="relative h-12 w-12 text-indigo-400/40 mx-auto" />
            </div>
            <p className="text-sm text-slate-300 mb-1 font-medium">Ready to enhance your controls</p>
            <p className="text-xs text-slate-500">AI will analyze patterns and suggest improvements</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="relative h-10 w-10 text-indigo-400 animate-spin mb-4" />
            </div>
            <p className="text-sm text-slate-300 font-medium">Analyzing control effectiveness...</p>
            <p className="text-xs text-slate-500 mt-1">This may take a few moments</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Executive Summary */}
            {analysis.impact_forecast && (
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#1a2332] via-[#1e2840] to-indigo-950/30 border border-indigo-500/30 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <BarChart3 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Executive Summary</h3>
                </div>
                
                <div className="p-4 bg-[#0f1623]/60 rounded-lg border border-indigo-500/20 mb-4">
                  <p className="text-xs text-slate-300 leading-relaxed">{analysis.impact_forecast.roi_projection}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] sm:text-xs text-slate-400">Risk Reduction</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-400">{analysis.impact_forecast.overall_risk_reduction}%</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-[10px] sm:text-xs text-slate-400">Effectiveness ↑</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400">+{analysis.impact_forecast.control_effectiveness_improvement}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-orange-400" />
                      <span className="text-[10px] sm:text-xs text-slate-400">High Priority</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-orange-400">{analysis.impact_forecast.high_priority_items}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-lg border border-violet-500/20 hover:border-violet-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-violet-400" />
                      <span className="text-[10px] sm:text-xs text-slate-400">Timeline</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-violet-400">{analysis.impact_forecast.estimated_timeline}m</p>
                  </div>
                </div>
              </div>
            )}

            {/* Failure Pattern Analysis */}
            {analysis.failure_patterns && (
              <div className="p-4 bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-transparent border border-rose-500/30 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Control Enhancements</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.failure_patterns.recurring_patterns?.length > 0 && (
                    <div className="p-3 bg-[#0f1623]/60 rounded-lg border border-rose-500/20">
                      <p className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Recurring Patterns
                      </p>
                      <ul className="space-y-2">
                        {analysis.failure_patterns.recurring_patterns.map((pattern, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2 pl-2 border-l-2 border-rose-500/20">
                            <span>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.failure_patterns.root_causes?.length > 0 && (
                    <div className="p-3 bg-[#0f1623]/60 rounded-lg border border-orange-500/20">
                      <p className="text-xs font-semibold text-orange-400 mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        Root Causes
                      </p>
                      <ul className="space-y-2">
                        {analysis.failure_patterns.root_causes.map((cause, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2 pl-2 border-l-2 border-orange-500/20">
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {analysis.quick_wins?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                    <Lightbulb className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">New Control Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {analysis.quick_wins.map((win, i) => (
                    <div key={i} className="group p-3 bg-gradient-to-br from-[#0f1623]/60 to-emerald-950/20 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                            {i + 1}
                          </span>
                          <p className="text-sm font-semibold text-white">{win.title}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {win.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{win.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/30 rounded-xl shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                      <Target className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Detailed Recommendations</h3>
                  </div>
                  <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30 text-xs">
                    {analysis.recommendations.length} items
                  </Badge>
                </div>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <div 
                      key={i}
                      className="group p-3 sm:p-4 bg-gradient-to-br from-[#0f1623]/80 to-indigo-950/20 rounded-lg border border-[#2a3548] hover:border-indigo-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedRecommendation(selectedRecommendation === i ? null : i)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-xs font-bold text-indigo-400">
                              {i + 1}
                            </span>
                            <p className="text-sm font-semibold text-white truncate">{rec.control_name}</p>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{rec.issue}</p>
                          
                          {selectedRecommendation === i && (
                            <div className="space-y-3 mt-3 pt-3 border-t border-indigo-500/20">
                              <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                                <p className="text-xs font-semibold text-emerald-400 mb-1.5">💡 Recommendation</p>
                                <p className="text-xs text-slate-300 leading-relaxed">{rec.recommendation}</p>
                              </div>
                              {rec.alternative_mechanism && (
                                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                                  <p className="text-xs font-semibold text-blue-400 mb-1.5">🔄 Alternative Mechanism</p>
                                  <p className="text-xs text-slate-300 leading-relaxed">{rec.alternative_mechanism}</p>
                                </div>
                              )}
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyRecommendation(rec);
                                }}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs shadow-lg"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Apply Enhancement
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge className={`${priorityColors[rec.priority?.toLowerCase()] || priorityColors.medium} text-[10px]`}>
                            {rec.priority}
                          </Badge>
                          <Badge className={`${effortColors[rec.implementation_effort?.toLowerCase()] || effortColors.medium} text-[10px]`}>
                            {rec.implementation_effort}
                          </Badge>
                          <div className="text-right bg-emerald-500/10 rounded px-2 py-1">
                            <p className="text-base sm:text-lg font-bold text-emerald-400">+{rec.expected_effectiveness_increase}</p>
                            <p className="text-[9px] text-slate-500">effectiveness</p>
                          </div>
                          <div className="text-right bg-blue-500/10 rounded px-2 py-1">
                            <p className="text-xs sm:text-sm font-bold text-blue-400">{rec.risk_reduction_potential}%</p>
                            <p className="text-[9px] text-slate-500">risk ↓</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center mt-2 pt-2 border-t border-[#2a3548]/50">
                        <ArrowRight className={`h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-all ${selectedRecommendation === i ? 'rotate-90' : ''}`} />
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