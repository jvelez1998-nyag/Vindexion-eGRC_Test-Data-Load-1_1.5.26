import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Sparkles, Download, Copy, TrendingUp, 
  AlertTriangle, CheckCircle2, Target, Loader2, FileText
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIExecutiveSummaryGenerator({ data }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const generateExecutiveSummary = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a comprehensive executive summary for GRC leadership based on the following organizational data:

RISK METRICS:
- Total Risks: ${data.risks?.length || 0}
- High/Critical Risks: ${data.risks?.filter(r => r.overall_risk_rating === 'high' || r.overall_risk_rating === 'critical').length || 0}
- Average Risk Score: ${data.risks?.length ? Math.round(data.risks.reduce((sum, r) => sum + (r.residual_risk_score || 0), 0) / data.risks.length) : 0}

COMPLIANCE STATUS:
- Total Requirements: ${data.compliance?.length || 0}
- Implemented: ${data.compliance?.filter(c => c.status === 'implemented').length || 0}
- Non-Compliant: ${data.compliance?.filter(c => c.status === 'non_compliant').length || 0}

CONTROL EFFECTIVENESS:
- Total Controls: ${data.controls?.length || 0}
- Effective: ${data.controls?.filter(c => c.status === 'effective').length || 0}
- Ineffective: ${data.controls?.filter(c => c.status === 'ineffective').length || 0}

AUDIT FINDINGS:
- Total Audits: ${data.audits?.length || 0}
- Critical Findings: ${data.audits?.reduce((sum, a) => sum + (a.critical_findings || 0), 0)}

INCIDENTS:
- Total Incidents: ${data.incidents?.length || 0}
- High Severity: ${data.incidents?.filter(i => i.severity === 'high' || i.severity === 'critical').length || 0}

${customPrompt ? `\nADDITIONAL CONTEXT:\n${customPrompt}` : ''}

Generate a structured executive summary with:
1. Overall GRC Health Score (0-100)
2. Executive Summary (3-4 sentences)
3. Key Highlights (top 3 positive achievements)
4. Critical Issues (top 3 areas of concern)
5. Risk Trends (increasing, stable, decreasing)
6. Compliance Posture (overall compliance percentage and status)
7. Strategic Recommendations (3-5 actionable items)
8. Next 30-Day Priorities

Use professional executive language suitable for C-suite presentation.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            executive_summary: { type: "string" },
            key_highlights: { type: "array", items: { type: "string" } },
            critical_issues: { type: "array", items: { type: "string" } },
            risk_trend: { type: "string" },
            compliance_posture: { 
              type: "object",
              properties: {
                percentage: { type: "number" },
                status: { type: "string" },
                summary: { type: "string" }
              }
            },
            strategic_recommendations: { type: "array", items: { type: "string" } },
            next_30_days: { type: "array", items: { type: "string" } }
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

  const copySummary = () => {
    const text = `GRC EXECUTIVE SUMMARY
Health Score: ${summary.health_score}/100

${summary.executive_summary}

KEY HIGHLIGHTS:
${summary.key_highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

CRITICAL ISSUES:
${summary.critical_issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

COMPLIANCE POSTURE: ${summary.compliance_posture.percentage}% (${summary.compliance_posture.status})

STRATEGIC RECOMMENDATIONS:
${summary.strategic_recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Executive Summary</h2>
              <p className="text-slate-400 text-sm mt-1">
                Generate intelligent C-suite ready reports with AI insights
              </p>
            </div>
          </div>
          <Button 
            onClick={generateExecutiveSummary}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate Summary</>
            )}
          </Button>
        </div>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Custom Context (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific context, focus areas, or questions for the AI to address..."
            className="bg-[#151d2e] border-[#2a3548] text-white min-h-[100px]"
          />
        </CardContent>
      </Card>

      {summary && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">GRC Health Score</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {summary.health_score}/100
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={copySummary} variant="outline" className="gap-2 border-indigo-500/30">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-400" />
                      Executive Summary
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{summary.executive_summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-emerald-500/10 border-emerald-500/20 p-4">
                      <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Key Highlights
                      </h4>
                      <ul className="space-y-2">
                        {summary.key_highlights?.map((highlight, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">✓</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="bg-rose-500/10 border-rose-500/20 p-4">
                      <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Critical Issues
                      </h4>
                      <ul className="space-y-2">
                        {summary.critical_issues?.map((issue, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-rose-400 mt-1">!</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  <Card className="bg-indigo-500/10 border-indigo-500/20 p-4">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Compliance Posture
                    </h4>
                    <div className="mb-2">
                      <div className="text-3xl font-bold text-white mb-1">
                        {summary.compliance_posture?.percentage}%
                      </div>
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        {summary.compliance_posture?.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300">{summary.compliance_posture?.summary}</p>
                  </Card>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-violet-400" />
                      Strategic Recommendations
                    </h4>
                    <div className="space-y-2">
                      {summary.strategic_recommendations?.map((rec, idx) => (
                        <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                          <div className="flex items-start gap-3">
                            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                              {idx + 1}
                            </Badge>
                            <p className="text-sm text-slate-300 flex-1">{rec}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="bg-amber-500/10 border-amber-500/20 p-4">
                    <h4 className="text-sm font-semibold text-amber-400 mb-3">Next 30-Day Priorities</h4>
                    <ul className="space-y-2">
                      {summary.next_30_days?.map((priority, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 font-bold">{idx + 1}.</span>
                          {priority}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}