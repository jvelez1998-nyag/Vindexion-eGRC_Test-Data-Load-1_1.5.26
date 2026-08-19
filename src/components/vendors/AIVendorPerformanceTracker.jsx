import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorPerformanceTracker({ vendor }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const { data: metrics = [] } = useQuery({
    queryKey: ['vendor-performance-metrics', vendor.id],
    queryFn: () => base44.entities.VendorPerformanceMetric.filter({ vendor_id: vendor.id })
  });

  const analyzePerformance = async () => {
    setLoading(true);
    try {
      const prompt = `Analyze vendor performance comprehensively:

**VENDOR:** ${vendor.name}

**KPIs (${kpis.length} metrics):**
${kpis.map(k => `- ${k.kpi_name}: ${k.current_value}/${k.target_value} ${k.unit} (Status: ${k.status})`).join('\n')}

**SLAs (${slas.length} agreements):**
${slas.map(s => `- ${s.sla_name}: ${s.compliance_percentage}% compliance (Target: ${s.target_percentage}%)`).join('\n')}

**Performance Metrics:**
${metrics.map(m => `- ${m.metric_name}: ${m.metric_value} (Period: ${m.measurement_period})`).join('\n')}

**Reviews (${reviews.length} total):**
Average Rating: ${reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.length).toFixed(1) : 'N/A'}
Recent Reviews: ${reviews.slice(0, 3).map(r => `${r.review_type}: ${r.overall_rating}`).join(', ')}

Provide comprehensive analysis:
1. **Overall Performance Score** (0-100)
2. **Performance Trends** - Improving, Stable, Declining
3. **Strengths** - What vendor does well
4. **Weaknesses** - Areas of concern
5. **Issue Detection** - Current and potential problems
6. **Risk Indicators** - Warning signs
7. **Future Performance Prediction** - 3-month outlook
8. **Recommendations** - Specific improvement actions`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            performance_rating: { type: "string" },
            trend: { type: "string" },
            trend_direction: { type: "string" },
            summary: { type: "string" },
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            weaknesses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            current_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            risk_indicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  risk_level: { type: "string" },
                  probability: { type: "string" }
                }
              }
            },
            future_prediction: {
              type: "object",
              properties: {
                outlook: { type: "string" },
                confidence: { type: "string" },
                predicted_score: { type: "number" },
                key_factors: {
                  type: "array",
                  items: { type: "string" }
                },
                potential_risks: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Performance analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend?.toLowerCase().includes('improv')) return <TrendingUp className="h-5 w-5 text-emerald-400" />;
    if (trend?.toLowerCase().includes('declin')) return <TrendingDown className="h-5 w-5 text-rose-400" />;
    return <TrendingUp className="h-5 w-5 text-blue-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend?.toLowerCase().includes('improv')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (trend?.toLowerCase().includes('declin')) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Performance Analysis
            </CardTitle>
            <Button
              onClick={analyzePerformance}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Analyze Performance</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">AI will analyze performance data from all sources</p>
              <div className="grid grid-cols-4 gap-2 mt-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{kpis.length}</div>
                  <div className="text-xs text-slate-400">KPIs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{slas.length}</div>
                  <div className="text-xs text-slate-400">SLAs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{reviews.length}</div>
                  <div className="text-xs text-slate-400">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{metrics.length}</div>
                  <div className="text-xs text-slate-400">Metrics</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Performance */}
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(analysis.trend)}
                    <div>
                      <h4 className="text-sm font-semibold text-white">Overall Performance</h4>
                      <Badge className={getTrendColor(analysis.trend)}>
                        {analysis.trend}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{analysis.overall_score}</div>
                    <div className="text-xs text-slate-400">Performance Score</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{analysis.summary}</p>
              </Card>

              {/* Current Issues */}
              {analysis.current_issues?.length > 0 && (
                <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    Current Issues ({analysis.current_issues.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.current_issues.map((issue, idx) => (
                      <div key={idx} className="p-2 bg-[#151d2e] rounded border border-rose-500/30">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="text-sm font-medium text-white flex-1">{issue.issue}</h5>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{issue.impact}</p>
                        <div className="p-2 bg-blue-500/10 rounded text-xs text-blue-300">
                          💡 {issue.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Strengths
                  </h4>
                  <div className="space-y-2">
                    {analysis.strengths?.map((strength, idx) => (
                      <div key={idx}>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-white font-medium">{strength.area}</p>
                            <p className="text-xs text-slate-400">{strength.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Weaknesses
                  </h4>
                  <div className="space-y-2">
                    {analysis.weaknesses?.map((weakness, idx) => (
                      <div key={idx}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm text-white font-medium">{weakness.area}</p>
                          <Badge className={getSeverityColor(weakness.severity)}>
                            {weakness.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{weakness.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Future Prediction */}
              <Card className="bg-[#151d2e] border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3">3-Month Performance Prediction</h4>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Outlook:</p>
                    <Badge className={getTrendColor(analysis.future_prediction?.outlook)}>
                      {analysis.future_prediction?.outlook}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">Predicted Score:</p>
                    <p className="text-2xl font-bold text-white">{analysis.future_prediction?.predicted_score}</p>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-slate-400 mb-1">Key Factors:</p>
                  <div className="space-y-0.5">
                    {analysis.future_prediction?.key_factors?.map((factor, idx) => (
                      <div key={idx} className="text-xs text-slate-300">• {factor}</div>
                    ))}
                  </div>
                </div>
                {analysis.future_prediction?.potential_risks?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Potential Risks:</p>
                    <div className="space-y-0.5">
                      {analysis.future_prediction.potential_risks.map((risk, idx) => (
                        <div key={idx} className="text-xs text-amber-400">⚠️ {risk}</div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}