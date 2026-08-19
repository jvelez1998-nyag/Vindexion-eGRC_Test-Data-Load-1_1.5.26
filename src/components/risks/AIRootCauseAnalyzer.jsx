import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, AlertTriangle, Lightbulb, TrendingDown, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIRootCauseAnalyzer({ risk, incidents = [] }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeRootCause = async () => {
    setLoading(true);
    try {
      const relatedIncidents = incidents.filter(i => 
        i.linked_risks?.includes(risk.id) || 
        i.incident_type?.toLowerCase().includes(risk.category?.toLowerCase())
      );

      const prompt = `Perform a comprehensive root cause analysis for the following critical risk:

**RISK DETAILS:**
- Title: ${risk.title}
- Category: ${risk.category}
- Risk Rating: ${risk.overall_risk_rating} (Likelihood: ${risk.residual_likelihood}, Impact: ${risk.residual_impact})
- Description: ${risk.description}
- Current Status: ${risk.status}
- Risk Source: ${risk.risk_source || 'Not specified'}
- Business Unit: ${risk.business_unit || 'Not specified'}

**CONTROL ENVIRONMENT:**
${risk.control_environment_summary || 'No control information available'}

**RELATED INCIDENTS (${relatedIncidents.length}):**
${relatedIncidents.map(i => `- ${i.title} (${i.severity} severity, ${i.status})`).join('\n') || 'No related incidents'}

**MITIGATION PLAN:**
${risk.mitigation_plan || 'No mitigation plan defined'}

Using the 5 Whys methodology and Fishbone diagram principles, conduct a deep root cause analysis to identify:

1. **Primary Root Causes**: The fundamental reasons this risk exists
2. **Contributing Factors**: Secondary factors that amplify the risk
3. **Systemic Issues**: Organizational or process gaps enabling this risk
4. **Control Gaps**: Missing or ineffective controls
5. **Environmental Factors**: External conditions affecting the risk
6. **Human Factors**: Behavioral or cultural contributors

Provide a structured analysis with evidence-based reasoning.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            primary_root_causes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cause: { type: "string" },
                  evidence: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            contributing_factors: {
              type: "array",
              items: { type: "string" }
            },
            systemic_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            control_gaps: {
              type: "array",
              items: { type: "string" }
            },
            environmental_factors: {
              type: "array",
              items: { type: "string" }
            },
            human_factors: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Root cause analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to perform analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Root Cause Analysis
          </CardTitle>
          <Button
            onClick={analyzeRootCause}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" /> Analyze</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Click "Analyze" to perform AI-powered root cause analysis</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {/* Executive Summary */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Executive Summary
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{analysis.executive_summary}</p>
              </Card>

              {/* Primary Root Causes */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Primary Root Causes</h4>
                <div className="space-y-2">
                  {analysis.primary_root_causes?.map((cause, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-rose-500/30 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-medium text-white flex-1">{cause.cause}</h5>
                        <Badge className={
                          cause.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          cause.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {cause.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{cause.evidence}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              {analysis.contributing_factors?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Contributing Factors</h4>
                  <div className="space-y-1">
                    {analysis.contributing_factors.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Systemic Issues */}
              {analysis.systemic_issues?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Systemic Issues</h4>
                  <div className="space-y-2">
                    {analysis.systemic_issues.map((issue, idx) => (
                      <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                        <p className="text-sm text-white mb-1">{issue.issue}</p>
                        <p className="text-xs text-slate-400">{issue.impact}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Control Gaps */}
              {analysis.control_gaps?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Control Gaps</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {analysis.control_gaps.map((gap, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {analysis.recommendations?.map((rec, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-emerald-500/30 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white flex-1">{rec.action}</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">Timeframe: {rec.timeframe}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}