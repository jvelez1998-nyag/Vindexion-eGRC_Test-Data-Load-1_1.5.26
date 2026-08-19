import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Download, Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIExecutiveIntegrator({ data }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const generateExecutiveSummary = async () => {
    setLoading(true);
    try {
      const context = {
        risks: (data.risks || []).slice(0, 20).map(r => ({
          title: r.title,
          category: r.category,
          status: r.status,
          score: (r.likelihood || 0) * (r.impact || 0)
        })),
        compliance: (data.compliance || []).slice(0, 20).map(c => ({
          framework: c.framework,
          status: c.status,
          requirement: c.requirement
        })),
        controls: (data.controls || []).slice(0, 20).map(c => ({
          name: c.name,
          status: c.status,
          effectiveness: c.effectiveness
        })),
        audits: (data.audits || []).slice(0, 10).map(a => ({
          title: a.title,
          status: a.status
        })),
        incidents: (data.incidents || []).slice(0, 10).map(i => ({
          type: i.incident_type,
          severity: i.severity,
          status: i.status
        })),
        vendors: (data.vendors || []).slice(0, 10).map(v => ({
          name: v.name,
          risk_rating: v.risk_rating,
          tier: v.tier
        }))
      };

      const prompt = customPrompt || `As an executive GRC analyst, create a comprehensive executive summary for board-level reporting:

DATA CONTEXT:
${JSON.stringify(context, null, 2)}

PROVIDE:

1. EXECUTIVE OVERVIEW (2-3 sentences)
   - Current GRC posture
   - Overall status assessment

2. KEY METRICS
   - Critical risk count: ${context.risks.filter(r => r.score >= 16).length}
   - Compliance rate: ${Math.round((context.compliance.filter(c => ['implemented', 'verified'].includes(c.status)).length / Math.max(context.compliance.length, 1)) * 100)}%
   - Active incidents: ${context.incidents.filter(i => i.status !== 'closed').length}
   - High-risk vendors: ${context.vendors.filter(v => v.risk_rating === 'high' || v.risk_rating === 'critical').length}

3. TOP 3 PRIORITIES
   - Specific, actionable recommendations
   - Expected impact and timeline

4. RISK LANDSCAPE
   - Emerging threats
   - Critical vulnerabilities

5. STRATEGIC RECOMMENDATIONS
   - Board-level actions
   - Resource allocation suggestions

Be concise, executive-focused, and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_overview: { type: "string" },
            overall_status: { type: "string" },
            key_metrics: {
              type: "object",
              properties: {
                critical_risks: { type: "number" },
                compliance_rate: { type: "number" },
                active_incidents: { type: "number" },
                high_risk_vendors: { type: "number" }
              }
            },
            top_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  impact: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            risk_landscape: { type: "string" },
            strategic_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSummary(result);
      toast.success("AI Executive Summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    if (!summary) return;

    const text = `
EXECUTIVE SUMMARY
Generated: ${new Date().toLocaleString()}

${summary.executive_overview}

OVERALL STATUS: ${summary.overall_status}

KEY METRICS:
- Critical Risks: ${summary.key_metrics?.critical_risks}
- Compliance Rate: ${summary.key_metrics?.compliance_rate}%
- Active Incidents: ${summary.key_metrics?.active_incidents}
- High-Risk Vendors: ${summary.key_metrics?.high_risk_vendors}

TOP PRIORITIES:
${summary.top_priorities?.map((p, i) => `
${i + 1}. ${p.priority}
   Impact: ${p.impact}
   Timeline: ${p.timeline}
`).join('\n')}

RISK LANDSCAPE:
${summary.risk_landscape}

STRATEGIC RECOMMENDATIONS:
${summary.strategic_recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `;

    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `executive_summary_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success("Summary downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Generator Card */}
      <Card className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/5 border border-violet-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-600 shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                AI Executive Summary Generator
              </CardTitle>
              <p className="text-sm text-slate-400 mt-0.5">Board-ready insights with AI-powered analysis</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Custom Prompt (Optional)</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter custom instructions for the AI (leave empty for default executive summary)..."
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateExecutiveSummary}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating AI Summary...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Executive Summary</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Display */}
      {summary && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">AI-Generated Executive Summary</CardTitle>
              <Button onClick={downloadSummary} variant="outline" size="sm" className="border-[#2a3548]">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">Executive Overview</h3>
                <Badge className={
                  summary.overall_status?.toLowerCase().includes('critical') ? 'bg-rose-500/20 text-rose-400' :
                  summary.overall_status?.toLowerCase().includes('good') ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-amber-500/20 text-amber-400'
                }>
                  {summary.overall_status}
                </Badge>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{summary.executive_overview}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#151d2e] rounded-xl border border-rose-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-xs text-slate-400">Critical Risks</span>
                </div>
                <div className="text-2xl font-bold text-rose-400">{summary.key_metrics?.critical_risks}</div>
              </div>
              <div className="p-4 bg-[#151d2e] rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Compliance Rate</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{summary.key_metrics?.compliance_rate}%</div>
              </div>
              <div className="p-4 bg-[#151d2e] rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Active Incidents</span>
                </div>
                <div className="text-2xl font-bold text-amber-400">{summary.key_metrics?.active_incidents}</div>
              </div>
              <div className="p-4 bg-[#151d2e] rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-slate-400">High-Risk Vendors</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{summary.key_metrics?.high_risk_vendors}</div>
              </div>
            </div>

            {/* Top Priorities */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Top Priorities</h3>
              {summary.top_priorities?.map((priority, i) => (
                <div key={i} className="p-4 bg-[#151d2e] rounded-xl border border-[#2a3548]">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white mb-2">{priority.priority}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                          Impact: {priority.impact}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                          Timeline: {priority.timeline}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Landscape */}
            <div className="p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-xl border border-rose-500/20">
              <h3 className="text-sm font-bold text-white mb-3">Risk Landscape</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{summary.risk_landscape}</p>
            </div>

            {/* Strategic Recommendations */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Strategic Recommendations</h3>
              {summary.strategic_recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-[#151d2e] rounded-lg">
                  <span className="text-indigo-400 font-semibold mt-0.5">•</span>
                  <p className="text-sm text-slate-300">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}