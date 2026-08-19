import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Copy, Download, Brain } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AIPerformanceReportGenerator({ vendor, performanceData }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const generateReport = async () => {
    setLoading(true);
    try {
      const prompt = `Generate comprehensive vendor performance review report:

**VENDOR:** ${vendor.name}
**CATEGORY:** ${vendor.vendor_category}
**TIER:** ${vendor.tier}
**CONTRACT VALUE:** ${vendor.annual_spend || 'Not specified'}

${performanceData ? `**PERFORMANCE ANALYSIS:**
Overall Score: ${performanceData.overall_score}
Trend: ${performanceData.trend}
Future Outlook: ${performanceData.future_prediction?.outlook}
Current Issues: ${performanceData.current_issues?.length || 0}
Strengths: ${performanceData.strengths?.length || 0}
Weaknesses: ${performanceData.weaknesses?.length || 0}` : ''}

Generate formal performance review report including:
1. **Executive Summary** - High-level performance overview
2. **Report Period** - Timeframe covered
3. **Performance Metrics** - Key performance indicators
4. **Trend Analysis** - Historical performance trends
5. **Strengths & Achievements** - What went well
6. **Issues & Concerns** - Problems identified
7. **Risk Assessment** - Performance-related risks
8. **Future Outlook** - Predicted performance
9. **Recommendations** - Action items
10. **Contract Decision** - Renew/Renegotiate/Terminate recommendation`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            report_date: { type: "string" },
            review_period: { type: "string" },
            executive_summary: { type: "string" },
            overall_rating: { type: "string" },
            overall_score: { type: "number" },
            performance_metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  target: { type: "string" },
                  actual: { type: "string" },
                  status: { type: "string" },
                  variance: { type: "string" }
                }
              }
            },
            trend_analysis: {
              type: "object",
              properties: {
                current_trend: { type: "string" },
                trend_narrative: { type: "string" },
                historical_comparison: { type: "string" }
              }
            },
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strength: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" },
                  resolution_status: { type: "string" }
                }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                overall_risk: { type: "string" },
                risk_narrative: { type: "string" },
                risk_factors: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            future_outlook: {
              type: "object",
              properties: {
                outlook: { type: "string" },
                confidence: { type: "string" },
                key_factors: {
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
                  timeline: { type: "string" }
                }
              }
            },
            contract_decision: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                rationale: { type: "string" },
                action_items: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      setReport(result);
      toast.success("Performance report generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.VendorReview.create({
        vendor_id: vendor.id,
        review_type: 'performance',
        review_date: new Date().toISOString(),
        overall_rating: report.overall_rating,
        overall_score: report.overall_score,
        review_notes: JSON.stringify(report),
        reviewer: 'AI System'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews'] });
      toast.success("Report saved");
    }
  });

  const copyReport = () => {
    if (!report) return;
    const fullReport = `VENDOR PERFORMANCE REVIEW REPORT\n${report.report_date}\n\n${JSON.stringify(report, null, 2)}`;
    navigator.clipboard.writeText(fullReport);
    toast.success("Report copied");
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            AI Performance Report Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            {report && (
              <>
                <Button onClick={copyReport} size="sm" variant="outline" className="border-[#2a3548]">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() => saveReportMutation.mutate()}
                  disabled={saveReportMutation.isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
            <Button
              onClick={generateReport}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Generate Report</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Generate AI-powered performance review report</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {/* Header */}
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 p-4">
                <h3 className="text-lg font-bold text-white mb-2">Performance Review Report</h3>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <p>Report Date: {report.report_date}</p>
                    <p>Review Period: {report.review_period}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{report.overall_score}</div>
                    <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {report.overall_rating}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Executive Summary */}
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
              </Card>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Performance Metrics</h4>
                <div className="space-y-2">
                  {report.performance_metrics?.map((metric, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-white">{metric.metric}</h5>
                        <Badge className={
                          metric.status === 'Met' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          metric.status === 'Exceeded' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Target: </span>
                          <span className="text-white">{metric.target}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Actual: </span>
                          <span className="text-white">{metric.actual}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Variance: </span>
                          <span className="text-white">{metric.variance}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contract Decision */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Contract Recommendation</h4>
                <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {report.contract_decision?.recommendation}
                </Badge>
                <p className="text-sm text-slate-300 mb-3">{report.contract_decision?.rationale}</p>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Action Items:</p>
                  <div className="space-y-1">
                    {report.contract_decision?.action_items?.map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-300">• {item}</div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}