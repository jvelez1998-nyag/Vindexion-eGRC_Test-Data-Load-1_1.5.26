import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, Play, Loader2, AlertTriangle, CheckCircle2, Link as LinkIcon, TrendingUp, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIControlRiskCorrelation({ controls, risks, tests, onUpdateLinks }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [applyingLinks, setApplyingLinks] = useState(false);

  const runCorrelation = async () => {
    setLoading(true);
    try {
      const controlContext = controls.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        domain: c.domain,
        category: c.category,
        effectiveness: c.effectiveness,
        linked_risks: c.linked_risks || [],
        framework_mappings: c.framework_mappings
      }));

      const riskContext = risks.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        score: (r.likelihood || 0) * (r.impact || 0),
        linked_controls: r.linked_controls || []
      }));

      const testData = tests.map(t => ({
        control_id: t.control_id,
        result: t.result,
        findings: t.findings
      }));

      const prompt = `You are a GRC correlation expert. Analyze controls and risks to identify optimal linkages and gaps.

CONTROLS (${controls.length}):
${JSON.stringify(controlContext, null, 2)}

RISKS (${risks.length}):
${JSON.stringify(riskContext, null, 2)}

TEST RESULTS:
${JSON.stringify(testData, null, 2)}

Perform comprehensive correlation analysis:

1. SUGGESTED LINKS: For each control-risk pair that should be linked but isn't:
   - control_id, risk_id
   - correlation_strength (0-100%): How well the control mitigates the risk
   - reasoning: Why this link is recommended
   - priority (critical/high/medium/low)

2. WEAK LINKS: Existing links that may not be effective:
   - control_id, risk_id
   - weakness_reason
   - suggested_action

3. COVERAGE GAPS:
   - high_risk_no_controls: Critical risks without adequate controls
   - orphaned_controls: Controls not linked to any risks
   - domain_gaps: Risk domains lacking control coverage

4. OPTIMIZATION RECOMMENDATIONS:
   - control_consolidation: Controls that can be merged
   - missing_control_types: Types of controls needed
   - framework_alignment: Framework mapping improvements

Return detailed JSON analysis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  control_name: { type: "string" },
                  risk_id: { type: "string" },
                  risk_title: { type: "string" },
                  correlation_strength: { type: "number" },
                  reasoning: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            weak_links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  control_name: { type: "string" },
                  risk_id: { type: "string" },
                  risk_title: { type: "string" },
                  weakness_reason: { type: "string" },
                  suggested_action: { type: "string" }
                }
              }
            },
            coverage_gaps: {
              type: "object",
              properties: {
                high_risk_no_controls: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      risk_id: { type: "string" },
                      risk_title: { type: "string" },
                      score: { type: "number" },
                      recommended_control_types: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                orphaned_controls: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      control_id: { type: "string" },
                      control_name: { type: "string" },
                      suggested_risk_categories: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                domain_gaps: { type: "array", items: { type: "string" } }
              }
            },
            optimization_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(response);
      toast.success("Correlation analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run correlation analysis");
    } finally {
      setLoading(false);
    }
  };

  const applySelectedLinks = async (selectedLinks) => {
    setApplyingLinks(true);
    try {
      for (const link of selectedLinks) {
        const control = controls.find(c => c.id === link.control_id);
        const risk = risks.find(r => r.id === link.risk_id);
        
        if (control && risk) {
          await base44.entities.Control.update(control.id, {
            linked_risks: [...(control.linked_risks || []), risk.id]
          });
          
          await base44.entities.Risk.update(risk.id, {
            linked_controls: [...(risk.linked_controls || []), control.id]
          });
        }
      }
      
      onUpdateLinks?.();
      toast.success(`Applied ${selectedLinks.length} linkages`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply some linkages");
    } finally {
      setApplyingLinks(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-rose-500 text-white';
      case 'high': return 'bg-amber-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 via-[#1a2332] to-purple-500/5 border-violet-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
              <Network className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Control-Risk Correlation Engine</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Intelligent linkage analysis and gap detection</p>
            </div>
          </div>
          <Button
            onClick={runCorrelation}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!analysis ? (
          <div className="text-center py-12">
            <Network className="h-16 w-16 text-violet-400/30 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Ready to analyze control-risk correlations</p>
            <p className="text-xs text-slate-500">
              {controls.length} controls • {risks.length} risks • {tests.length} test results
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                Analysis Summary
              </h4>
              <p className="text-xs text-slate-300">{analysis.summary}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="bg-[#0f1623] border-emerald-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{analysis.suggested_links?.length || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Suggested Links</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1623] border-amber-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-amber-400">{analysis.weak_links?.length || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Weak Links</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1623] border-rose-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-rose-400">
                    {analysis.coverage_gaps?.high_risk_no_controls?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Unmitigated Risks</div>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1623] border-blue-500/30">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {analysis.coverage_gaps?.orphaned_controls?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Orphaned Controls</div>
                </CardContent>
              </Card>
            </div>

            {/* Suggested Links */}
            {analysis.suggested_links?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-emerald-400" />
                    Recommended Linkages ({analysis.suggested_links.length})
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => applySelectedLinks(analysis.suggested_links.filter(l => l.priority === 'critical' || l.priority === 'high'))}
                    disabled={applyingLinks}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {applyingLinks ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                    Apply High Priority
                  </Button>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-4">
                    {analysis.suggested_links
                      .sort((a, b) => {
                        const order = { critical: 0, high: 1, medium: 2, low: 3 };
                        return order[a.priority] - order[b.priority];
                      })
                      .map((link, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548]">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs ${getPriorityColor(link.priority)}`}>
                                    {link.priority}
                                  </Badge>
                                  <Progress value={link.correlation_strength} className="h-1.5 flex-1" />
                                  <span className="text-xs text-slate-400">{link.correlation_strength}%</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Control</Badge>
                                    <span className="text-white font-medium">{link.control_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Risk</Badge>
                                    <span className="text-white font-medium">{link.risk_title}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">{link.reasoning}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applySelectedLinks([link])}
                                disabled={applyingLinks}
                                className="border-emerald-500/30 hover:bg-emerald-500/10"
                              >
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Link
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Coverage Gaps */}
            {analysis.coverage_gaps?.high_risk_no_controls?.length > 0 && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Risks Without Controls ({analysis.coverage_gaps.high_risk_no_controls.length})
                </h4>
                <div className="space-y-2">
                  {analysis.coverage_gaps.high_risk_no_controls.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#0f1623] rounded-lg border border-rose-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-white">{item.risk_title}</h5>
                        <Badge className="bg-rose-500/20 text-rose-400">Score: {item.score}</Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        <strong>Recommended Controls:</strong> {item.recommended_control_types?.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Links */}
            {analysis.weak_links?.length > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-400 mb-3">⚠️ Weak Linkages ({analysis.weak_links.length})</h4>
                <div className="space-y-2">
                  {analysis.weak_links.map((link, idx) => (
                    <div key={idx} className="p-3 bg-[#0f1623] rounded-lg border border-amber-500/20">
                      <div className="text-xs mb-1">
                        <span className="text-blue-400">{link.control_name}</span> → <span className="text-rose-400">{link.risk_title}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1">{link.weakness_reason}</p>
                      <p className="text-xs text-amber-400">💡 {link.suggested_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.optimization_recommendations?.length > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Optimization Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysis.optimization_recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 pl-4">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}