import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, GitBranch, AlertTriangle, TrendingUp, Shield, Activity, Zap } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function AIVendorRiskCorrelationEngine({ vendor }) {
  const [correlationAnalysis, setCorrelationAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: complianceItems = [] } = useQuery({
    queryKey: ['vendor-compliance', vendor.id],
    queryFn: async () => {
      const allCompliance = await base44.entities.Compliance.list();
      return allCompliance.filter(c => 
        c.notes?.includes(vendor.name) || c.owner === vendor.owner
      );
    }
  });

  const { data: performanceMetrics = [] } = useQuery({
    queryKey: ['vendor-performance-metrics', vendor.id],
    queryFn: () => base44.entities.VendorPerformanceMetric.filter({ vendor_id: vendor.id })
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['vendor-audits', vendor.id],
    queryFn: () => base44.entities.VendorAudit.filter({ vendor_id: vendor.id })
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['vendor-kpis', vendor.id],
    queryFn: () => base44.entities.VendorKPI.filter({ vendor_id: vendor.id })
  });

  const { data: slas = [] } = useQuery({
    queryKey: ['vendor-slas', vendor.id],
    queryFn: () => base44.entities.VendorSLA.filter({ vendor_id: vendor.id })
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews', vendor.id],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendor.id })
  });

  const runCorrelationAnalysis = async () => {
    setLoading(true);
    try {
      const prompt = `Perform advanced AI correlation analysis across vendor risk dimensions:

**VENDOR:** ${vendor.name}
**CURRENT RISK SCORE:** ${vendor.ai_risk_score || 'Not assessed'}

**COMPLIANCE DATA:**
Total Requirements: ${complianceItems.length}
Compliant: ${complianceItems.filter(c => c.status === 'implemented' || c.status === 'verified').length}
Non-Compliant: ${complianceItems.filter(c => c.status === 'non_compliant').length}
Frameworks: ${[...new Set(complianceItems.map(c => c.framework))].join(', ')}

**PERFORMANCE DATA:**
KPIs: ${kpis.length} (Met: ${kpis.filter(k => k.status === 'met' || k.status === 'exceeded').length})
SLAs: ${slas.length} (Avg Compliance: ${slas.length > 0 ? Math.round(slas.reduce((sum, s) => sum + (s.compliance_percentage || 0), 0) / slas.length) : 0}%)
Performance Metrics: ${performanceMetrics.length}
Recent Reviews: ${reviews.slice(0, 3).map(r => `${r.review_type}: ${r.overall_rating}`).join(', ')}

**AUDIT FINDINGS:**
Total Audits: ${audits.length}
Completed: ${audits.filter(a => a.status === 'completed').length}
Critical Findings: ${audits.reduce((sum, a) => sum + (a.critical_findings || 0), 0)}

**ANALYSIS REQUIRED:**

1. **Interdependency Analysis**
   - How compliance gaps affect performance
   - How audit findings correlate with KPI/SLA breaches
   - Cascade effects between dimensions

2. **Predictive Risk Scoring**
   - Calculate nuanced risk score (0-100) considering all dimensions
   - Weight factors: Compliance (30%), Performance (30%), Audit (25%), Historical (15%)
   - Identify leading indicators of risk increase

3. **Trend Correlation**
   - Correlation between compliance trends and performance degradation
   - Early warning signals from audit findings
   - Pattern recognition across timeframes

4. **Risk Prediction**
   - 3-month and 6-month risk outlook
   - Probability of performance degradation
   - Likelihood of compliance failures

5. **Proactive Mitigation Strategies**
   - Targeted actions addressing root causes
   - Preventive measures for identified patterns
   - Resource allocation recommendations

Provide data-driven, predictive insights with specific recommendations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            predictive_risk_score: { type: "number" },
            risk_level: { type: "string" },
            confidence_level: { type: "string" },
            previous_score: { type: "number" },
            score_change: { type: "number" },
            executive_summary: { type: "string" },
            dimension_scores: {
              type: "object",
              properties: {
                compliance_score: { type: "number" },
                performance_score: { type: "number" },
                audit_score: { type: "number" },
                historical_score: { type: "number" }
              }
            },
            interdependencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  relationship: { type: "string" },
                  area_1: { type: "string" },
                  area_2: { type: "string" },
                  correlation_strength: { type: "string" },
                  impact: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            leading_indicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  current_status: { type: "string" },
                  risk_signal: { type: "string" },
                  probability: { type: "string" }
                }
              }
            },
            risk_prediction: {
              type: "object",
              properties: {
                three_month_outlook: { type: "string" },
                three_month_score: { type: "number" },
                six_month_outlook: { type: "string" },
                six_month_score: { type: "number" },
                key_risk_factors: {
                  type: "array",
                  items: { type: "string" }
                },
                mitigation_urgency: { type: "string" }
              }
            },
            compliance_performance_correlation: {
              type: "object",
              properties: {
                correlation_strength: { type: "string" },
                insights: { type: "string" },
                impact_scenarios: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            audit_impact_analysis: {
              type: "object",
              properties: {
                findings_impact_score: { type: "number" },
                recurring_issues: {
                  type: "array",
                  items: { type: "string" }
                },
                remediation_effectiveness: { type: "string" }
              }
            },
            proactive_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  target_area: { type: "string" },
                  expected_risk_reduction: { type: "number" },
                  implementation_timeline: { type: "string" },
                  resource_requirements: { type: "string" },
                  success_metrics: {
                    type: "array",
                    items: { type: "string" }
                  },
                  priority: { type: "string" }
                }
              }
            },
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  rationale: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            }
          }
        }
      });

      setCorrelationAnalysis(result);
      toast.success("Correlation analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const updateRiskScoreMutation = useMutation({
    mutationFn: () => base44.entities.Vendor.update(vendor.id, {
      ai_risk_score: correlationAnalysis.predictive_risk_score,
      risk_level: correlationAnalysis.risk_level,
      last_ai_assessment: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success("Risk score updated");
    }
  });

  const getRiskColor = (score) => {
    if (score >= 75) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (score >= 50) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (score >= 25) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const radarData = correlationAnalysis ? [
    { dimension: 'Compliance', score: correlationAnalysis.dimension_scores?.compliance_score || 0 },
    { dimension: 'Performance', score: correlationAnalysis.dimension_scores?.performance_score || 0 },
    { dimension: 'Audit', score: correlationAnalysis.dimension_scores?.audit_score || 0 },
    { dimension: 'Historical', score: correlationAnalysis.dimension_scores?.historical_score || 0 }
  ] : [];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Risk Correlation Engine
            </CardTitle>
            <Button
              onClick={runCorrelationAnalysis}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Run Correlation Analysis</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!correlationAnalysis ? (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">AI will correlate compliance, performance, and audit data for predictive risk scoring</p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-3 bg-[#151d2e] rounded border border-[#2a3548] text-center">
                  <div className="text-lg font-bold text-emerald-400">{complianceItems.length}</div>
                  <div className="text-xs text-slate-400">Compliance</div>
                </div>
                <div className="p-3 bg-[#151d2e] rounded border border-[#2a3548] text-center">
                  <div className="text-lg font-bold text-blue-400">{performanceMetrics.length + kpis.length}</div>
                  <div className="text-xs text-slate-400">Performance</div>
                </div>
                <div className="p-3 bg-[#151d2e] rounded border border-[#2a3548] text-center">
                  <div className="text-lg font-bold text-amber-400">{audits.length}</div>
                  <div className="text-xs text-slate-400">Audits</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Predictive Risk Score */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Predictive Risk Score</h4>
                    <Badge className={getRiskColor(correlationAnalysis.predictive_risk_score)}>
                      {correlationAnalysis.risk_level}
                    </Badge>
                    <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {correlationAnalysis.confidence_level} confidence
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-white">{correlationAnalysis.predictive_risk_score}</div>
                    {correlationAnalysis.score_change !== 0 && (
                      <div className={`text-sm ${correlationAnalysis.score_change > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {correlationAnalysis.score_change > 0 ? '↑' : '↓'} {Math.abs(correlationAnalysis.score_change)} points
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-300">{correlationAnalysis.executive_summary}</p>
                <Button
                  onClick={() => updateRiskScoreMutation.mutate()}
                  disabled={updateRiskScoreMutation.isPending}
                  size="sm"
                  className="mt-3 bg-purple-600 hover:bg-purple-700"
                >
                  Update Vendor Risk Score
                </Button>
              </Card>

              {/* Dimension Scores Radar */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-4">Risk Dimension Breakdown</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" />
                    <PolarRadiusAxis stroke="#94a3b8" />
                    <Radar name="Risk Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="text-center p-2 bg-[#0f1623] rounded">
                    <div className="text-lg font-bold text-emerald-400">{correlationAnalysis.dimension_scores?.compliance_score}</div>
                    <div className="text-xs text-slate-400">Compliance</div>
                  </div>
                  <div className="text-center p-2 bg-[#0f1623] rounded">
                    <div className="text-lg font-bold text-blue-400">{correlationAnalysis.dimension_scores?.performance_score}</div>
                    <div className="text-xs text-slate-400">Performance</div>
                  </div>
                  <div className="text-center p-2 bg-[#0f1623] rounded">
                    <div className="text-lg font-bold text-amber-400">{correlationAnalysis.dimension_scores?.audit_score}</div>
                    <div className="text-xs text-slate-400">Audit</div>
                  </div>
                  <div className="text-center p-2 bg-[#0f1623] rounded">
                    <div className="text-lg font-bold text-purple-400">{correlationAnalysis.dimension_scores?.historical_score}</div>
                    <div className="text-xs text-slate-400">Historical</div>
                  </div>
                </div>
              </Card>

              {/* Interdependencies */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-blue-400" />
                  Identified Interdependencies ({correlationAnalysis.interdependencies?.length})
                </h4>
                <div className="space-y-2">
                  {correlationAnalysis.interdependencies?.map((dep, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-blue-500/30 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-medium text-white flex-1">{dep.relationship}</h5>
                        <Badge className={
                          dep.correlation_strength === 'Strong' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          dep.correlation_strength === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {dep.correlation_strength}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-xs">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          {dep.area_1}
                        </Badge>
                        <span className="text-slate-500">↔</span>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                          {dep.area_2}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{dep.impact}</p>
                      <div className="text-xs text-slate-300 bg-[#0f1623] p-2 rounded">
                        Evidence: {dep.evidence}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Leading Indicators */}
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Leading Risk Indicators
                </h4>
                <div className="space-y-2">
                  {correlationAnalysis.leading_indicators?.map((indicator, idx) => (
                    <div key={idx} className="p-2 bg-[#151d2e] rounded border border-amber-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-white">{indicator.indicator}</h5>
                        <Badge className={
                          indicator.risk_signal === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          indicator.risk_signal === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }>
                          {indicator.risk_signal}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Status: {indicator.current_status}</span>
                        <span className="text-amber-400">Probability: {indicator.probability}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk Prediction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">3-Month Outlook</h4>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getRiskColor(correlationAnalysis.risk_prediction?.three_month_score)}>
                      {correlationAnalysis.risk_prediction?.three_month_outlook}
                    </Badge>
                    <div className="text-2xl font-bold text-white">
                      {correlationAnalysis.risk_prediction?.three_month_score}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Predicted score based on current trends
                  </div>
                </Card>

                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">6-Month Outlook</h4>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getRiskColor(correlationAnalysis.risk_prediction?.six_month_score)}>
                      {correlationAnalysis.risk_prediction?.six_month_outlook}
                    </Badge>
                    <div className="text-2xl font-bold text-white">
                      {correlationAnalysis.risk_prediction?.six_month_score}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Long-term projection
                  </div>
                </Card>
              </div>

              {/* Proactive Mitigation Strategies */}
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  Proactive Mitigation Strategies
                </h4>
                <div className="space-y-3">
                  {correlationAnalysis.proactive_strategies?.map((strategy, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-emerald-500/30 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-white mb-1">{strategy.strategy}</h5>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                            {strategy.target_area}
                          </Badge>
                        </div>
                        <Badge className={
                          strategy.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          strategy.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {strategy.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div>
                          <span className="text-slate-500">Risk Reduction: </span>
                          <span className="text-emerald-400 font-semibold">-{strategy.expected_risk_reduction}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeline: </span>
                          <span className="text-white">{strategy.implementation_timeline}</span>
                        </div>
                      </div>

                      <div className="mb-2 text-xs">
                        <span className="text-slate-500">Resources: </span>
                        <span className="text-slate-300">{strategy.resource_requirements}</span>
                      </div>

                      {strategy.success_metrics?.length > 0 && (
                        <div className="text-xs">
                          <p className="text-slate-500 mb-1">Success Metrics:</p>
                          <div className="space-y-0.5">
                            {strategy.success_metrics.map((metric, i) => (
                              <div key={i} className="text-slate-300">✓ {metric}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Immediate Actions */}
              {correlationAnalysis.immediate_actions?.length > 0 && (
                <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-rose-400" />
                    Immediate Actions Required
                  </h4>
                  <div className="space-y-2">
                    {correlationAnalysis.immediate_actions.map((action, idx) => (
                      <div key={idx} className="p-3 bg-[#151d2e] rounded border border-rose-500/30">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="text-sm font-medium text-white flex-1">{action.action}</h5>
                          <Badge className={
                            action.urgency === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }>
                            {action.urgency}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">{action.rationale}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Correlation Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Compliance-Performance Link</h4>
                  <Badge className="mb-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {correlationAnalysis.compliance_performance_correlation?.correlation_strength} Correlation
                  </Badge>
                  <p className="text-sm text-slate-300 mb-2">
                    {correlationAnalysis.compliance_performance_correlation?.insights}
                  </p>
                  {correlationAnalysis.compliance_performance_correlation?.impact_scenarios?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Impact Scenarios:</p>
                      <div className="space-y-0.5">
                        {correlationAnalysis.compliance_performance_correlation.impact_scenarios.map((scenario, i) => (
                          <div key={i} className="text-xs text-slate-300">• {scenario}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Audit Impact</h4>
                  <div className="mb-2">
                    <span className="text-slate-400 text-xs">Findings Impact Score: </span>
                    <span className="text-xl font-bold text-white">
                      {correlationAnalysis.audit_impact_analysis?.findings_impact_score}
                    </span>
                  </div>
                  {correlationAnalysis.audit_impact_analysis?.recurring_issues?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 mb-1">Recurring Issues:</p>
                      <div className="space-y-0.5">
                        {correlationAnalysis.audit_impact_analysis.recurring_issues.map((issue, i) => (
                          <div key={i} className="text-xs text-amber-400">⚠️ {issue}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="text-slate-500">Remediation: </span>
                    <span className="text-slate-300">
                      {correlationAnalysis.audit_impact_analysis?.remediation_effectiveness}
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}