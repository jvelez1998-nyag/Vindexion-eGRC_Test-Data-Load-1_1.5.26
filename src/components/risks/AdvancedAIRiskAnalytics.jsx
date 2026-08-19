import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Loader2, 
  TrendingUp, 
  Network, 
  Search,
  AlertTriangle,
  ArrowRight,
  Target,
  Clock,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AdvancedAIRiskAnalytics({ open, onOpenChange, risks, incidents, controls }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("predictive");

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      // Prepare historical risk data
      const riskData = risks.map(r => ({
        title: r.title,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        status: r.status,
        created: r.created_date,
        mitigation: r.mitigation_plan
      }));

      const incidentData = incidents.map(i => ({
        title: i.title,
        type: i.incident_type,
        severity: i.severity,
        status: i.status,
        occurred: i.occurred_date,
        root_cause: i.root_cause
      }));

      const controlData = controls.map(c => ({
        name: c.name,
        domain: c.domain,
        effectiveness: c.effectiveness,
        status: c.status
      }));

      const prompt = `You are an advanced AI risk analytics engine. Analyze the following GRC data and provide comprehensive insights:

RISK DATA:
${JSON.stringify(riskData, null, 2)}

INCIDENT DATA:
${JSON.stringify(incidentData, null, 2)}

CONTROL DATA:
${JSON.stringify(controlData, null, 2)}

Provide the following analyses:

1. PREDICTIVE RISK MODELING:
   - Identify emerging risk trends based on historical patterns
   - Forecast 3-5 potential future risk scenarios with likelihood estimates
   - Predict which risk categories are likely to increase/decrease
   - Estimate timeframes for predicted risks (next 30/60/90 days)
   - Provide confidence levels for each prediction

2. RISK CORRELATION ENGINE:
   - Identify interdependencies between different risks
   - Map cascade effects (how one risk triggers others)
   - Find hidden correlations between risk categories
   - Identify risk clusters that share common root causes
   - Suggest which risks should be managed together

3. ROOT CAUSE ANALYSIS:
   - For high-impact risks (likelihood * impact >= 12), provide:
     * Primary root causes
     * Contributing factors
     * Control gaps that enabled the risk
     * Systemic issues
     * Recommended preventive measures

Format as structured JSON with clear sections.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            predictive_modeling: {
              type: "object",
              properties: {
                emerging_trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      trend: { type: "string" },
                      direction: { type: "string" },
                      confidence: { type: "number" }
                    }
                  }
                },
                future_scenarios: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      scenario: { type: "string" },
                      category: { type: "string" },
                      likelihood: { type: "number" },
                      impact: { type: "number" },
                      timeframe: { type: "string" },
                      confidence: { type: "number" },
                      triggers: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                category_forecast: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      trend: { type: "string" },
                      reasoning: { type: "string" }
                    }
                  }
                }
              }
            },
            risk_correlations: {
              type: "object",
              properties: {
                interdependencies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      risk1: { type: "string" },
                      risk2: { type: "string" },
                      relationship: { type: "string" },
                      strength: { type: "string" }
                    }
                  }
                },
                cascade_effects: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      trigger_risk: { type: "string" },
                      affected_risks: { type: "array", items: { type: "string" } },
                      impact_multiplier: { type: "string" }
                    }
                  }
                },
                risk_clusters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      cluster_name: { type: "string" },
                      risks: { type: "array", items: { type: "string" } },
                      common_cause: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                }
              }
            },
            root_cause_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_title: { type: "string" },
                  risk_score: { type: "number" },
                  primary_causes: { type: "array", items: { type: "string" } },
                  contributing_factors: { type: "array", items: { type: "string" } },
                  control_gaps: { type: "array", items: { type: "string" } },
                  systemic_issues: { type: "array", items: { type: "string" } },
                  preventive_measures: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setAnalysis(response);
      toast.success("Advanced analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 16) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (score >= 9) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (score >= 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'text-emerald-400';
    if (conf >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setAnalysis(null);
      setActiveTab("predictive");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-4 border-b border-[#2a3548]">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400 animate-pulse" />
            Advanced AI Risk Analytics
          </DialogTitle>
          <p className="text-sm text-slate-400 mt-1">
            Predictive modeling, correlation analysis, and root cause insights
          </p>
        </DialogHeader>

        {!analysis ? (
          <div className="p-12 text-center">
            <Brain className="h-24 w-24 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-semibold text-white mb-3">AI-Powered Risk Intelligence</h3>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Leverage advanced machine learning to predict future risks, discover hidden correlations, 
              and understand root causes of high-impact threats
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-white mb-1">Predictive Modeling</h4>
                <p className="text-xs text-slate-500">Forecast future risk scenarios</p>
              </Card>
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <Network className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-white mb-1">Correlation Engine</h4>
                <p className="text-xs text-slate-500">Find risk interdependencies</p>
              </Card>
              <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                <Search className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-white mb-1">Root Cause Analysis</h4>
                <p className="text-xs text-slate-500">Understand risk origins</p>
              </Card>
            </div>
            <Button 
              onClick={generateAnalysis} 
              disabled={loading}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Analyzing {risks.length} risks...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Generate Advanced Analytics
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="mx-6 bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger 
                  value="predictive" 
                  className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Predictive Modeling
                </TabsTrigger>
                <TabsTrigger 
                  value="correlations" 
                  className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400 gap-2"
                >
                  <Network className="h-4 w-4" />
                  Risk Correlations
                </TabsTrigger>
                <TabsTrigger 
                  value="root-cause" 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 gap-2"
                >
                  <Search className="h-4 w-4" />
                  Root Cause Analysis
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(90vh-220px)]">
                <TabsContent value="predictive" className="p-6 space-y-6 m-0">
                  {/* Emerging Trends */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Emerging Risk Trends</h3>
                    </div>
                    <div className="grid gap-3">
                      {analysis.predictive_modeling?.emerging_trends?.map((trend, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-1">{trend.trend}</h4>
                              <div className="flex items-center gap-3 text-xs">
                                <Badge className={trend.direction === 'increasing' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}>
                                  {trend.direction}
                                </Badge>
                                <span className={getConfidenceColor(trend.confidence)}>
                                  {trend.confidence}% confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {/* Future Scenarios */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-amber-400" />
                      <h3 className="text-lg font-semibold text-white">Predicted Future Scenarios</h3>
                    </div>
                    <div className="grid gap-4">
                      {analysis.predictive_modeling?.future_scenarios?.map((scenario, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-white mb-2">{scenario.scenario}</h4>
                              <Badge className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                                {scenario.category}
                              </Badge>
                            </div>
                            <Badge className={`text-xs border ${getRiskColor(scenario.likelihood * scenario.impact)}`}>
                              Score: {scenario.likelihood * scenario.impact}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div>
                              <span className="text-slate-500">Likelihood: </span>
                              <span className="text-amber-400">{scenario.likelihood}/5</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Impact: </span>
                              <span className="text-rose-400">{scenario.impact}/5</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Timeframe: </span>
                              <span className="text-white">{scenario.timeframe}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Confidence: </span>
                              <span className={getConfidenceColor(scenario.confidence)}>{scenario.confidence}%</span>
                            </div>
                          </div>
                          {scenario.triggers?.length > 0 && (
                            <div className="border-t border-[#2a3548] pt-3">
                              <p className="text-xs text-slate-500 mb-2">Potential Triggers:</p>
                              <div className="flex flex-wrap gap-1">
                                {scenario.triggers.map((trigger, i) => (
                                  <Badge key={i} className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                    {trigger}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {/* Category Forecast */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-violet-400" />
                      <h3 className="text-lg font-semibold text-white">Category Forecast</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.predictive_modeling?.category_forecast?.map((cat, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {cat.category}
                            </Badge>
                            <Badge className={cat.trend === 'increasing' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}>
                              {cat.trend}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300">{cat.reasoning}</p>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="correlations" className="p-6 space-y-6 m-0">
                  {/* Interdependencies */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Network className="h-5 w-5 text-violet-400" />
                      <h3 className="text-lg font-semibold text-white">Risk Interdependencies</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.risk_correlations?.interdependencies?.map((dep, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-4">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {dep.risk1}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-slate-600" />
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              {dep.risk2}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mt-2">{dep.relationship}</p>
                          <Badge className={`text-[10px] mt-2 ${
                            dep.strength === 'high' ? 'bg-rose-500/20 text-rose-400' :
                            dep.strength === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {dep.strength} correlation
                          </Badge>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {/* Cascade Effects */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                      <h3 className="text-lg font-semibold text-white">Cascade Effects</h3>
                    </div>
                    <div className="space-y-4">
                      {analysis.risk_correlations?.cascade_effects?.map((cascade, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-4">
                          <div className="mb-3">
                            <span className="text-xs text-slate-500">Trigger Risk:</span>
                            <Badge className="ml-2 bg-rose-500/20 text-rose-400 border-rose-500/30">
                              {cascade.trigger_risk}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <span className="text-xs text-slate-500">Affected Risks:</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {cascade.affected_risks?.map((risk, i) => (
                              <Badge key={i} className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400">
                            <span className="text-white font-medium">Impact Multiplier:</span> {cascade.impact_multiplier}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {/* Risk Clusters */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Network className="h-5 w-5 text-emerald-400" />
                      <h3 className="text-lg font-semibold text-white">Risk Clusters</h3>
                    </div>
                    <div className="space-y-4">
                      {analysis.risk_correlations?.risk_clusters?.map((cluster, idx) => (
                        <Card key={idx} className="bg-[#0f1623] border-[#2a3548] p-4">
                          <h4 className="font-medium text-white mb-3">{cluster.cluster_name}</h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {cluster.risks?.map((risk, i) => (
                              <Badge key={i} className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                          <div className="border-t border-[#2a3548] pt-3 space-y-2">
                            <div>
                              <span className="text-xs text-slate-500">Common Cause: </span>
                              <span className="text-sm text-white">{cluster.common_cause}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">Recommendation: </span>
                              <span className="text-sm text-emerald-400">{cluster.recommendation}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="root-cause" className="p-6 space-y-4 m-0">
                  {analysis.root_cause_analysis?.map((rca, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{rca.risk_title}</h3>
                          <Badge className={`text-xs border ${getRiskColor(rca.risk_score)}`}>
                            Risk Score: {rca.risk_score}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-rose-400 mb-2">Primary Root Causes</h4>
                          <ul className="space-y-1">
                            {rca.primary_causes?.map((cause, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-rose-400 mt-1">•</span>
                                <span>{cause}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-amber-400 mb-2">Contributing Factors</h4>
                          <ul className="space-y-1">
                            {rca.contributing_factors?.map((factor, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-amber-400 mt-1">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-blue-400 mb-2">Control Gaps</h4>
                          <ul className="space-y-1">
                            {rca.control_gaps?.map((gap, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-violet-400 mb-2">Systemic Issues</h4>
                          <ul className="space-y-1">
                            {rca.systemic_issues?.map((issue, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-[#2a3548] pt-4">
                          <h4 className="text-sm font-medium text-emerald-400 mb-2">Recommended Preventive Measures</h4>
                          <ul className="space-y-1">
                            {rca.preventive_measures?.map((measure, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>{measure}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {(!analysis.root_cause_analysis || analysis.root_cause_analysis.length === 0) && (
                    <Card className="bg-[#151d2e] border-[#2a3548] p-12 text-center">
                      <p className="text-slate-400">No high-impact risks (score ≥ 12) found for root cause analysis</p>
                    </Card>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="p-6 pt-4 border-t border-[#2a3548] flex justify-between">
              <Button 
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-[#2a3548] hover:bg-[#2a3548] text-slate-300"
              >
                Close
              </Button>
              <Button 
                onClick={generateAnalysis}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                Regenerate Analysis
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}