import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIExecutiveSummary({ dashboardData }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const prompt = `Generate an executive summary for the GRC dashboard with key insights.

**DASHBOARD DATA:**
${JSON.stringify(dashboardData, null, 2)}

Provide:
1. **Executive Overview** - High-level summary (2-3 sentences)
2. **Key Insights** - 3-5 critical insights
3. **Risk Highlights** - Top risks requiring attention
4. **Compliance Status** - Overall compliance posture
5. **Control Effectiveness** - Control performance summary
6. **Immediate Actions** - Priority actions needed
7. **Trends** - Notable trends and patterns`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_overview: { type: "string" },
            overall_health_score: { type: "number" },
            key_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  insight: { type: "string" },
                  severity: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            risk_highlights: {
              type: "array",
              items: { type: "string" }
            },
            compliance_summary: { type: "string" },
            control_summary: { type: "string" },
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            trends: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSummary(result);
      toast.success("Executive summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Executive Summary
          </CardTitle>
          <Button
            onClick={generateSummary}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!summary ? (
          <p className="text-sm text-slate-400">Click Generate to create an AI-powered executive summary of your dashboard</p>
        ) : (
          <div className="space-y-4">
            {/* Health Score */}
            <div className="flex items-center justify-between p-3 bg-[#0f1623] rounded">
              <span className="text-sm text-slate-400">Overall Health Score</span>
              <div className="text-2xl font-bold text-white">{summary.overall_health_score}/100</div>
            </div>

            {/* Overview */}
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{summary.executive_overview}</ReactMarkdown>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {summary.key_insights?.map((insight, idx) => (
                  <div key={idx} className="p-2 bg-[#0f1623] rounded flex items-start gap-2">
                    <Badge className={
                      insight.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      insight.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }>
                      {insight.severity}
                    </Badge>
                    <p className="text-sm text-slate-300 flex-1">{insight.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Highlights */}
            {summary.risk_highlights?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  Risk Highlights
                </h4>
                <div className="space-y-1">
                  {summary.risk_highlights.map((risk, idx) => (
                    <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Immediate Actions */}
            {summary.immediate_actions?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Immediate Actions Required</h4>
                <div className="space-y-2">
                  {summary.immediate_actions.map((action, idx) => (
                    <div key={idx} className="p-2 bg-rose-500/10 rounded border border-rose-500/30">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm text-white flex-1">{action.action}</p>
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">Timeline: {action.timeline}</p>
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