import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AIRiskScoring({ findings, controls }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const generateRiskScoring = async () => {
    setLoading(true);
    try {
      const criticalFindings = findings.filter(f => f.severity === 'critical');
      const highFindings = findings.filter(f => f.severity === 'high');
      const ineffectiveControls = controls.filter(c => c.status === 'ineffective' || c.effectiveness < 3);

      const prompt = `Analyze audit findings and control weaknesses to generate comprehensive risk scoring and prioritization.

AUDIT FINDINGS DATA:
Total Findings: ${findings.length}
Critical Findings: ${criticalFindings.length}
High Findings: ${highFindings.length}

Sample Critical Findings:
${criticalFindings.slice(0, 5).map((f, i) => `${i + 1}. ${f.title} - ${f.category} (${f.description})`).join('\n')}

CONTROL WEAKNESSES:
Ineffective/Weak Controls: ${ineffectiveControls.length}
${ineffectiveControls.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} - ${c.domain} (Effectiveness: ${c.effectiveness}/5)`).join('\n')}

Generate a comprehensive risk analysis with:
1. Overall Risk Score (0-100) based on findings severity and control weaknesses
2. Risk Level Classification (Low/Medium/High/Critical)
3. Top Risk Areas (by domain/category with scores)
4. Control Gap Impact Assessment
5. Risk-Finding Correlation Analysis
6. Prioritized Risk List (with scoring justification)
7. Immediate Action Items
8. Long-term Risk Mitigation Strategy

Return structured JSON with detailed risk scoring.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk_score: { type: "number" },
            risk_level: { type: "string" },
            confidence: { type: "number" },
            executive_summary: { type: "string" },
            top_risk_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  domain: { type: "string" },
                  score: { type: "number" },
                  severity: { type: "string" },
                  findings_count: { type: "number" },
                  control_gaps: { type: "number" },
                  rationale: { type: "string" }
                }
              }
            },
            control_gap_impact: {
              type: "object",
              properties: {
                total_gaps: { type: "number" },
                critical_gaps: { type: "number" },
                impact_score: { type: "number" },
                description: { type: "string" }
              }
            },
            risk_finding_correlation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  finding_category: { type: "string" },
                  related_risks: { type: "array", items: { type: "string" } },
                  correlation_strength: { type: "string" },
                  business_impact: { type: "string" }
                }
              }
            },
            prioritized_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rank: { type: "number" },
                  risk_title: { type: "string" },
                  score: { type: "number" },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  justification: { type: "string" },
                  source_findings: { type: "array", items: { type: "string" } }
                }
              }
            },
            immediate_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            long_term_strategy: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(response);
      toast.success("Risk scoring analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate risk scoring");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">AI Risk Scoring Engine</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl mx-auto">
          Analyze {findings.length} audit findings and {controls.length} controls to generate intelligent risk scores and prioritization
        </p>
        <Button onClick={generateRiskScoring} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Risk Scoring
            </>
          )}
        </Button>
      </Card>
    );
  }

  const scoreColor = analysis.overall_risk_score >= 75 ? "text-rose-400" : 
                     analysis.overall_risk_score >= 50 ? "text-orange-400" : 
                     analysis.overall_risk_score >= 25 ? "text-amber-400" : "text-emerald-400";

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AI Risk Scoring Analysis</h3>
        <Button onClick={() => setAnalysis(null)} variant="outline" className="border-[#2a3548]">
          Generate New
        </Button>
      </div>

      <ScrollArea className="h-[700px]">
        <div className="space-y-6 pr-4">
          {/* Overall Score */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-slate-400 mb-2">Overall Risk Score</h4>
                <div className={`text-5xl font-bold ${scoreColor} mb-2`}>{analysis.overall_risk_score}</div>
                <Badge className={severityColors[analysis.risk_level?.toLowerCase() || 'medium']}>
                  {analysis.risk_level} Risk
                </Badge>
                <div className="text-xs text-slate-500 mt-2">Confidence: {analysis.confidence}%</div>
              </div>
              <TrendingUp className={`h-16 w-16 ${scoreColor} opacity-20`} />
            </div>
          </Card>

          {/* Executive Summary */}
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h4 className="font-semibold text-white mb-3">Executive Summary</h4>
            <p className="text-sm text-slate-300">{analysis.executive_summary}</p>
          </Card>

          {/* Top Risk Areas */}
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Top Risk Areas
            </h4>
            <div className="space-y-3">
              {analysis.top_risk_areas?.map((area, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-white">{area.area}</h5>
                      <p className="text-xs text-slate-500">{area.domain}</p>
                    </div>
                    <Badge className={severityColors[area.severity?.toLowerCase() || 'medium']}>
                      Score: {area.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{area.rationale}</p>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span>{area.findings_count} findings</span>
                    <span>•</span>
                    <span>{area.control_gaps} control gaps</span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Control Gap Impact */}
          {analysis.control_gap_impact && (
            <Card className="bg-[#1a2332] border-[#2a3548] p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Control Gap Impact
              </h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-[#151d2e] rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{analysis.control_gap_impact.total_gaps}</div>
                  <div className="text-xs text-slate-500">Total Gaps</div>
                </div>
                <div className="p-3 bg-[#151d2e] rounded-lg text-center">
                  <div className="text-2xl font-bold text-rose-400">{analysis.control_gap_impact.critical_gaps}</div>
                  <div className="text-xs text-slate-500">Critical</div>
                </div>
                <div className="p-3 bg-[#151d2e] rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-400">{analysis.control_gap_impact.impact_score}</div>
                  <div className="text-xs text-slate-500">Impact Score</div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{analysis.control_gap_impact.description}</p>
            </Card>
          )}

          {/* Prioritized Risks */}
          <Card className="bg-[#1a2332] border-[#2a3548] p-6">
            <h4 className="font-semibold text-white mb-4">Prioritized Risk Register</h4>
            <div className="space-y-3">
              {analysis.prioritized_risks?.map((risk, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl font-bold text-indigo-400">#{risk.rank}</div>
                      <div>
                        <h5 className="font-medium text-white">{risk.risk_title}</h5>
                        <div className="flex gap-2 mt-1">
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400">
                            Likelihood: {risk.likelihood}/5
                          </Badge>
                          <Badge className="text-[10px] bg-slate-500/10 text-slate-400">
                            Impact: {risk.impact}/5
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${risk.score >= 16 ? 'text-rose-400' : risk.score >= 9 ? 'text-orange-400' : 'text-amber-400'}`}>
                      {risk.score}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{risk.justification}</p>
                  {risk.source_findings?.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Source Findings: {risk.source_findings.join(', ')}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>

          {/* Immediate Actions */}
          <Card className="bg-rose-500/5 border-rose-500/20 p-6">
            <h4 className="font-semibold text-white mb-4">Immediate Action Items</h4>
            <div className="space-y-2">
              {analysis.immediate_actions?.map((action, idx) => (
                <div key={idx} className="p-3 bg-[#1a2332] border border-rose-500/20 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-white text-sm">{action.action}</h5>
                    <Badge className={severityColors[action.priority?.toLowerCase() || 'high']}>
                      {action.priority}
                    </Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>Timeline: {action.timeline}</span>
                    <span>•</span>
                    <span>Impact: {action.expected_impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Long-term Strategy */}
          {analysis.long_term_strategy?.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548] p-6">
              <h4 className="font-semibold text-white mb-4">Long-term Risk Mitigation Strategy</h4>
              <div className="space-y-2">
                {analysis.long_term_strategy.map((strategy, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    {strategy}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}