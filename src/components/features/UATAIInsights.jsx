import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Loader2, AlertTriangle, CheckCircle2, TrendingUp, Target, Lightbulb } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function UATAIInsights({ features, uatStatus }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (features.length > 0 && Object.keys(uatStatus).length > 0 && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, uatStatus]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const stats = calculateStats();
      const failedTests = features
        .filter(f => uatStatus[f.name]?.status === 'failed')
        .map(f => ({
          name: f.name,
          module: f.module,
          notes: uatStatus[f.name]?.notes
        }));

      const prompt = `Analyze UAT testing results and provide comprehensive insights:

UAT TESTING SUMMARY:
- Total Features: ${stats.total}
- Passed: ${stats.passed} (${stats.passRate}%)
- Failed: ${stats.failed} (${stats.failRate}%)
- Pending: ${stats.pending}
- Completion: ${stats.completion}%

FAILED TESTS DETAILS:
${failedTests.length > 0 ? failedTests.map(f => `
Feature: ${f.name}
Module: ${f.module}
Notes: ${f.notes || 'No notes'}
`).join('\n') : 'No failures recorded'}

MODULES TESTED:
${stats.moduleBreakdown.map(m => `${m.module}: ${m.passed}/${m.total} passed`).join('\n')}

Provide:

1. TESTING RESULTS ANALYSIS (Executive Summary):
   - Overall test health assessment
   - Key strengths in testing coverage
   - Critical concerns
   - Testing velocity insights

2. FAILURE PATTERNS (Detailed Analysis):
   - Common failure patterns across modules
   - Root cause categories
   - High-risk areas requiring attention
   - Inter-module dependencies causing failures

3. REMEDIATION PRIORITIES (Top 5-7 actions):
   - Prioritized list of issues to fix
   - Estimated impact (critical/high/medium)
   - Suggested fix approach
   - Dependencies or blockers

4. QUALITY RECOMMENDATIONS (Strategic Guidance):
   - Testing process improvements
   - Coverage gaps to address
   - Automation opportunities
   - Best practices to adopt

5. RISK ASSESSMENT:
   - Production readiness score (0-100)
   - Go/No-Go recommendation
   - Conditional requirements for deployment
   - Post-deployment monitoring areas

6. SUCCESS METRICS:
   - What's working well
   - Features ready for production
   - Team performance highlights`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            test_health_score: { type: "number" },
            failure_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  affected_modules: { type: "array", items: { type: "string" } },
                  root_cause: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            remediation_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  impact: { type: "string" },
                  fix_approach: { type: "string" },
                  estimated_effort: { type: "string" }
                }
              }
            },
            quality_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  benefit: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                production_readiness_score: { type: "number" },
                go_no_go: { type: "string" },
                conditions: { type: "array", items: { type: "string" } },
                monitoring_areas: { type: "array", items: { type: "string" } }
              }
            },
            success_highlights: {
              type: "array",
              items: { type: "string" }
            },
            production_ready_features: {
              type: "array",
              items: { type: "string" }
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

  const calculateStats = () => {
    const total = features.length;
    const passed = Object.values(uatStatus).filter(s => s.status === 'passed').length;
    const failed = Object.values(uatStatus).filter(s => s.status === 'failed').length;
    const pending = total - passed - failed;
    const completion = Math.round((passed / total) * 100);
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;

    const moduleBreakdown = {};
    features.forEach(f => {
      if (!moduleBreakdown[f.module]) {
        moduleBreakdown[f.module] = { module: f.module, total: 0, passed: 0 };
      }
      moduleBreakdown[f.module].total++;
      if (uatStatus[f.name]?.status === 'passed') {
        moduleBreakdown[f.module].passed++;
      }
    });

    return {
      total,
      passed,
      failed,
      pending,
      completion,
      passRate,
      failRate,
      moduleBreakdown: Object.values(moduleBreakdown)
    };
  };

  const severityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  const impactColors = {
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
            <CardTitle className="text-base text-white">UAT Testing AI Insights</CardTitle>
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
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {/* Executive Summary */}
              {insights.executive_summary && (
                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">Executive Summary</h4>
                    <Badge className="bg-violet-500/20 text-violet-400">
                      Health Score: {insights.test_health_score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{insights.executive_summary}</p>
                </div>
              )}

              {/* Risk Assessment */}
              {insights.risk_assessment && (
                <Card className="bg-[#151d2e] border-[#2a3548]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        Risk Assessment
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={insights.risk_assessment.go_no_go === 'GO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                          {insights.risk_assessment.go_no_go}
                        </Badge>
                        <span className="text-xl font-bold text-white">
                          {insights.risk_assessment.production_readiness_score}/100
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insights.risk_assessment.conditions?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-amber-400 mb-2">Deployment Conditions:</p>
                        <ul className="space-y-1">
                          {insights.risk_assessment.conditions.map((cond, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              {cond}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {insights.risk_assessment.monitoring_areas?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-400 mb-2">Post-Deployment Monitoring:</p>
                        <ul className="space-y-1">
                          {insights.risk_assessment.monitoring_areas.map((area, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">•</span>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Failure Patterns */}
              {insights.failure_patterns?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Failure Patterns
                  </p>
                  <div className="space-y-2">
                    {insights.failure_patterns.map((pattern, i) => (
                      <Card key={i} className={`border ${severityColors[pattern.severity?.toLowerCase()] || 'bg-[#151d2e] border-[#2a3548]'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm text-white font-medium flex-1">{pattern.pattern}</p>
                            <Badge className={impactColors[pattern.severity?.toLowerCase()] || 'bg-slate-500/20 text-slate-400'}>
                              {pattern.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">Root Cause: {pattern.root_cause}</p>
                          <div className="flex flex-wrap gap-1">
                            {pattern.affected_modules?.map((mod, j) => (
                              <Badge key={j} className="text-[9px] bg-rose-500/20 text-rose-400">
                                {mod}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation Priorities */}
              {insights.remediation_priorities?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3" /> Remediation Priorities
                  </p>
                  <div className="space-y-2">
                    {insights.remediation_priorities.map((item, i) => (
                      <Card key={i} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={`${impactColors[item.impact?.toLowerCase()] || 'bg-slate-500/20 text-slate-400'} flex-shrink-0`}>
                              {item.impact}
                            </Badge>
                            <Badge className="text-[9px] bg-slate-500/20 text-slate-400 ml-2">
                              {item.estimated_effort}
                            </Badge>
                          </div>
                          <p className="text-sm text-white mb-1">{item.action}</p>
                          <p className="text-xs text-slate-400 mb-2">{item.fix_approach}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Recommendations */}
              {insights.quality_recommendations?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Quality Recommendations
                  </p>
                  <div className="space-y-2">
                    {insights.quality_recommendations.map((rec, i) => (
                      <Card key={i} className="bg-[#151d2e] border-[#2a3548]">
                        <CardContent className="p-3">
                          <p className="text-sm text-white font-medium mb-1">{rec.recommendation}</p>
                          <p className="text-xs text-emerald-400 mb-1">Benefit: {rec.benefit}</p>
                          <p className="text-xs text-slate-400">Implementation: {rec.implementation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Highlights */}
              {insights.success_highlights?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Success Highlights
                  </p>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <ul className="space-y-2">
                      {insights.success_highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Production Ready Features */}
              {insights.production_ready_features?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Production Ready Features
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.production_ready_features.map((feature, i) => (
                      <Badge key={i} className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {!loading && !insights && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-violet-400 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400 text-sm">Click Generate to analyze UAT testing results</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}