import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Loader2, TrendingUp, TrendingDown, AlertTriangle, 
  Target, Shield, Zap, Activity, Globe, Eye, RefreshCw,
  CheckCircle2, XCircle, ArrowRight, Clock, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import ReactMarkdown from "react-markdown";

export default function AIPredictiveRiskIntelligence({ open, onOpenChange, risks, controls, incidents, onUpdateRisk }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [monitoring, setMonitoring] = useState(false);
  const [monitoringResults, setMonitoringResults] = useState(null);

  const analyzePredictiveRisks = async () => {
    setAnalyzing(true);
    try {
      const riskSummary = risks.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        currentLikelihood: r.likelihood,
        currentImpact: r.impact,
        currentScore: (r.likelihood || 0) * (r.impact || 0),
        status: r.status,
        owner: r.owner,
        mitigation_plan: r.mitigation_plan,
        linkedControls: controls.filter(c => r.linked_controls?.includes(c.id)).map(c => ({
          name: c.name,
          effectiveness: c.effectiveness,
          status: c.status
        }))
      }));

      const recentIncidents = incidents.slice(0, 10).map(i => ({
        type: i.incident_type,
        severity: i.severity,
        status: i.status,
        linkedRisks: i.linked_risks
      }));

      const controlWeaknesses = controls.filter(c => 
        c.effectiveness <= 2 || c.status === 'ineffective'
      ).map(c => ({
        name: c.name,
        domain: c.domain,
        effectiveness: c.effectiveness,
        linkedRisks: risks.filter(r => r.linked_controls?.includes(c.id)).map(r => r.title)
      }));

      const prompt = `You are an advanced AI risk intelligence system analyzing organizational risk posture with external context awareness and predictive capabilities.

CURRENT RISK PORTFOLIO:
${riskSummary.map(r => `- ${r.title} (${r.category}): L${r.currentLikelihood} x I${r.currentImpact} = ${r.currentScore} | Status: ${r.status} | Controls: ${r.linkedControls.length}`).join('\n')}

CONTROL WEAKNESSES IDENTIFIED:
${controlWeaknesses.map(c => `- ${c.name} (${c.domain}): Effectiveness ${c.effectiveness}/5 | Affects: ${c.linkedRisks.join(', ') || 'None'}`).join('\n')}

RECENT INCIDENTS (Last 10):
${recentIncidents.map(i => `- ${i.type} (${i.severity}): ${i.status}`).join('\n')}

ANALYSIS REQUIREMENTS:

1. **Predictive Risk Scoring** 
   For EACH risk, provide:
   - Predicted likelihood change (next 3 months) with % probability
   - Predicted impact change with reasoning
   - New predicted risk score
   - Trend direction (increasing/stable/decreasing)
   - Confidence level (high/medium/low)
   - Key factors driving the prediction

2. **External Context Analysis**
   Consider current global/industry events that affect risks:
   - Cybersecurity threats and trends
   - Regulatory changes
   - Economic conditions
   - Technology shifts
   - Geopolitical factors
   - Industry-specific threats

3. **Control Gap Impact**
   Analyze how control weaknesses affect risk likelihood/impact:
   - Which risks are most vulnerable due to weak controls
   - Cascading effect analysis
   - Compensating control opportunities

4. **Incident Pattern Analysis**
   - Are recent incidents indicating emerging risks?
   - Which risk categories are materializing?
   - Early warning signals

5. **AI-Generated Mitigation Strategies**
   For high-priority risks, provide:
   - Specific, actionable mitigation steps (prioritized)
   - Quick wins (0-30 days)
   - Medium-term actions (1-3 months)
   - Long-term initiatives (3-12 months)
   - Resource requirements
   - Expected risk reduction
   - Implementation complexity

6. **Monitoring Triggers**
   Define automated monitoring criteria:
   - External data sources to watch
   - Threshold indicators
   - Alert conditions
   - Frequency of checks

7. **Risk Portfolio Optimization**
   - Which risks to prioritize immediately
   - Suggested risk acceptance/transfer decisions
   - Resource allocation recommendations

Return as JSON:
{
  "executiveSummary": "string",
  "portfolioTrend": "increasing|stable|decreasing",
  "criticalAlerts": ["string"],
  "predictions": [
    {
      "riskId": "string",
      "riskTitle": "string",
      "currentScore": number,
      "predictedLikelihood": number,
      "predictedImpact": number,
      "predictedScore": number,
      "trend": "increasing|stable|decreasing",
      "confidence": "high|medium|low",
      "changePercentage": number,
      "keyFactors": ["string"],
      "externalContext": "string"
    }
  ],
  "mitigationStrategies": [
    {
      "riskId": "string",
      "riskTitle": "string",
      "priority": "critical|high|medium|low",
      "quickWins": [{"action": "string", "effort": "string", "impact": "string"}],
      "mediumTerm": [{"action": "string", "effort": "string", "impact": "string"}],
      "longTerm": [{"action": "string", "effort": "string", "impact": "string"}],
      "expectedReduction": "string",
      "resourcesNeeded": ["string"]
    }
  ],
  "monitoringTriggers": [
    {
      "riskId": "string",
      "dataSource": "string",
      "indicator": "string",
      "threshold": "string",
      "frequency": "string"
    }
  ],
  "recommendations": {
    "immediate": ["string"],
    "strategic": ["string"],
    "acceptanceOpportunities": ["string"]
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            executiveSummary: { type: "string" },
            portfolioTrend: { type: "string" },
            criticalAlerts: { type: "array", items: { type: "string" } },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  riskId: { type: "string" },
                  riskTitle: { type: "string" },
                  currentScore: { type: "number" },
                  predictedLikelihood: { type: "number" },
                  predictedImpact: { type: "number" },
                  predictedScore: { type: "number" },
                  trend: { type: "string" },
                  confidence: { type: "string" },
                  changePercentage: { type: "number" },
                  keyFactors: { type: "array", items: { type: "string" } },
                  externalContext: { type: "string" }
                }
              }
            },
            mitigationStrategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  riskId: { type: "string" },
                  riskTitle: { type: "string" },
                  priority: { type: "string" },
                  quickWins: { type: "array", items: { type: "object" } },
                  mediumTerm: { type: "array", items: { type: "object" } },
                  longTerm: { type: "array", items: { type: "object" } },
                  expectedReduction: { type: "string" },
                  resourcesNeeded: { type: "array", items: { type: "string" } }
                }
              }
            },
            monitoringTriggers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  riskId: { type: "string" },
                  dataSource: { type: "string" },
                  indicator: { type: "string" },
                  threshold: { type: "string" },
                  frequency: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                strategic: { type: "array", items: { type: "string" } },
                acceptanceOpportunities: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setPredictions(response);
      toast.success("Predictive analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate predictions");
    } finally {
      setAnalyzing(false);
    }
  };

  const startMonitoring = async () => {
    if (!predictions) return;
    
    setMonitoring(true);
    try {
      const monitoringPrompt = `You are an AI risk monitoring system conducting real-time surveillance of identified risks.

RISKS TO MONITOR:
${predictions.predictions.map(p => `- ${p.riskTitle}: Current score ${p.currentScore}, Predicted ${p.predictedScore}`).join('\n')}

MONITORING TRIGGERS:
${predictions.monitoringTriggers.map(t => `- ${t.riskId}: Watch ${t.dataSource} for ${t.indicator}`).join('\n')}

TASK: Check current external conditions and provide monitoring updates:
1. Any significant changes in external threat landscape?
2. New regulatory developments affecting risks?
3. Industry incidents or breaches relevant to our risks?
4. Economic or market changes impacting risk factors?
5. Technology vulnerabilities or exploits discovered?

For each monitored risk, provide:
- Current status (stable/elevated/critical)
- Any alerts or triggers activated
- Recommended actions if status changed
- Next monitoring checkpoint

Return as JSON with monitoring results for each risk.`;

      const monitoringResponse = await base44.integrations.Core.InvokeLLM({
        prompt: monitoringPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            timestamp: { type: "string" },
            overallStatus: { type: "string" },
            alerts: { type: "array", items: { type: "string" } },
            riskUpdates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  riskId: { type: "string" },
                  riskTitle: { type: "string" },
                  status: { type: "string" },
                  statusChange: { type: "string" },
                  triggersActivated: { type: "array", items: { type: "string" } },
                  externalFactors: { type: "array", items: { type: "string" } },
                  recommendedActions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setMonitoringResults({
        ...monitoringResponse,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Risk monitoring completed!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to monitor risks");
    } finally {
      setMonitoring(false);
    }
  };

  const applyPrediction = async (prediction) => {
    if (!onUpdateRisk) return;

    const risk = risks.find(r => r.id === prediction.riskId);
    if (!risk) return;

    const mitigation = predictions.mitigationStrategies.find(m => m.riskId === prediction.riskId);
    const mitigationPlan = mitigation ? `
AI-GENERATED MITIGATION PLAN:

Priority: ${mitigation.priority.toUpperCase()}

QUICK WINS (0-30 days):
${mitigation.quickWins.map((w, i) => `${i + 1}. ${w.action} | Effort: ${w.effort} | Impact: ${w.impact}`).join('\n')}

MEDIUM-TERM (1-3 months):
${mitigation.mediumTerm.map((w, i) => `${i + 1}. ${w.action} | Effort: ${w.effort} | Impact: ${w.impact}`).join('\n')}

LONG-TERM (3-12 months):
${mitigation.longTerm.map((w, i) => `${i + 1}. ${w.action} | Effort: ${w.effort} | Impact: ${w.impact}`).join('\n')}

Expected Risk Reduction: ${mitigation.expectedReduction}

Resources Needed:
${mitigation.resourcesNeeded.map(r => `- ${r}`).join('\n')}
` : '';

    await onUpdateRisk(risk.id, {
      likelihood: prediction.predictedLikelihood,
      impact: prediction.predictedImpact,
      mitigation_plan: mitigationPlan || risk.mitigation_plan,
      description: `${risk.description}\n\n[AI PREDICTION - ${new Date().toLocaleDateString()}]: ${prediction.externalContext}`
    });

    toast.success(`Applied AI predictions to "${prediction.riskTitle}"`);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-rose-400" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-emerald-400" />;
      default: return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const trendData = predictions?.predictions.map(p => ({
    name: p.riskTitle.substring(0, 20) + '...',
    current: p.currentScore,
    predicted: p.predictedScore
  })) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0 border-b border-[#2a3548]">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Predictive Risk Intelligence
          </DialogTitle>
          <p className="text-sm text-slate-400 mt-1">Advanced risk predictions with external context and automated monitoring</p>
        </DialogHeader>

        {!predictions ? (
          <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Risk Intelligence</h3>
              <p className="text-slate-400 text-sm mb-6">
                Analyze {risks.length} risks with external context, generate predictive scores, 
                create mitigation strategies, and set up automated monitoring.
              </p>
              <Button onClick={analyzePredictiveRisks} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700">
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing with External Data...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Start Predictive Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="predictions" className="flex-1">
            <TabsList className="px-6 bg-transparent border-b border-[#2a3548] rounded-none">
              <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                Predictions
              </TabsTrigger>
              <TabsTrigger value="mitigation" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                Mitigation Strategies
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="px-6 pb-6 m-0">
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-4 py-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Portfolio Trend</span>
                        {getTrendIcon(predictions.portfolioTrend)}
                      </div>
                      <div className="text-2xl font-bold text-white capitalize">{predictions.portfolioTrend}</div>
                    </Card>

                    <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Critical Alerts</span>
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                      </div>
                      <div className="text-2xl font-bold text-rose-400">{predictions.criticalAlerts.length}</div>
                    </Card>

                    <Card className="bg-[#151d2e] border-[#2a3548] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Risks Analyzed</span>
                        <Target className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="text-2xl font-bold text-indigo-400">{predictions.predictions.length}</div>
                    </Card>
                  </div>

                  {/* Executive Summary */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-400" />
                      Executive Summary
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{predictions.executiveSummary}</p>
                  </Card>

                  {/* Critical Alerts */}
                  {predictions.criticalAlerts.length > 0 && (
                    <Card className="bg-rose-500/10 border-rose-500/30 p-5">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                        Critical Alerts
                      </h3>
                      <ul className="space-y-2">
                        {predictions.criticalAlerts.map((alert, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-rose-300">
                            <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {alert}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Trend Visualization */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                      Risk Score Trends: Current vs Predicted
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                        <Legend />
                        <Bar dataKey="current" fill="#6366f1" name="Current Score" />
                        <Bar dataKey="predicted" fill="#a855f7" name="Predicted Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Individual Risk Predictions */}
                  {predictions.predictions.map((pred, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-white">{pred.riskTitle}</h4>
                            {getTrendIcon(pred.trend)}
                            <Badge className={`text-xs ${getConfidenceColor(pred.confidence)}`}>
                              {pred.confidence} confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Current Score</div>
                              <div className="text-xl font-bold text-blue-400">{pred.currentScore}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Predicted Score</div>
                              <div className="text-xl font-bold text-purple-400">{pred.predictedScore}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Change</div>
                              <div className={`text-xl font-bold ${pred.changePercentage > 0 ? 'text-rose-400' : pred.changePercentage < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {pred.changePercentage > 0 ? '+' : ''}{pred.changePercentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => applyPrediction(pred)} className="bg-purple-600 hover:bg-purple-700">
                          <Zap className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">External Context</div>
                          <p className="text-sm text-slate-300 bg-[#1a2332] p-3 rounded">{pred.externalContext}</p>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">Key Factors Driving Change</div>
                          <div className="flex flex-wrap gap-2">
                            {pred.keyFactors.map((factor, i) => (
                              <Badge key={i} className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="mitigation" className="px-6 pb-6 m-0">
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-4 py-4">
                  {predictions.mitigationStrategies.map((strategy, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{strategy.riskTitle}</h4>
                          <Badge className={`text-xs ${
                            strategy.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                            strategy.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                            strategy.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {strategy.priority} priority
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Quick Wins (0-30 days)
                          </h5>
                          <div className="space-y-2">
                            {strategy.quickWins.map((win, i) => (
                              <div key={i} className="bg-[#1a2332] p-3 rounded">
                                <div className="text-sm text-slate-200 mb-1">{win.action}</div>
                                <div className="flex gap-3 text-xs text-slate-500">
                                  <span>Effort: <span className="text-slate-400">{win.effort}</span></span>
                                  <span>Impact: <span className="text-emerald-400">{win.impact}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Medium-Term (1-3 months)
                          </h5>
                          <div className="space-y-2">
                            {strategy.mediumTerm.map((action, i) => (
                              <div key={i} className="bg-[#1a2332] p-3 rounded">
                                <div className="text-sm text-slate-200 mb-1">{action.action}</div>
                                <div className="flex gap-3 text-xs text-slate-500">
                                  <span>Effort: <span className="text-slate-400">{action.effort}</span></span>
                                  <span>Impact: <span className="text-blue-400">{action.impact}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-purple-400 mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Long-Term (3-12 months)
                          </h5>
                          <div className="space-y-2">
                            {strategy.longTerm.map((action, i) => (
                              <div key={i} className="bg-[#1a2332] p-3 rounded">
                                <div className="text-sm text-slate-200 mb-1">{action.action}</div>
                                <div className="flex gap-3 text-xs text-slate-500">
                                  <span>Effort: <span className="text-slate-400">{action.effort}</span></span>
                                  <span>Impact: <span className="text-purple-400">{action.impact}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#2a3548]">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Expected Reduction:</span>
                              <span className="text-emerald-400 ml-2 font-medium">{strategy.expectedReduction}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Resources Needed:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {strategy.resourcesNeeded.map((resource, i) => (
                                  <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="monitoring" className="px-6 pb-6 m-0">
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-4 py-4">
                  {!monitoringResults ? (
                    <div className="text-center py-12">
                      <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Automated Risk Monitoring</h3>
                      <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                        Monitor risks in real-time using external data feeds and intelligence sources. 
                        Receive alerts when conditions change.
                      </p>
                      <Button onClick={startMonitoring} disabled={monitoring} className="bg-blue-600 hover:bg-blue-700">
                        {monitoring ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Monitoring External Sources...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Start Monitoring
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Monitoring Summary */}
                      <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              <Activity className="h-5 w-5 text-blue-400" />
                              Overall Status: <span className="text-blue-400">{monitoringResults.overallStatus}</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Last checked: {new Date(monitoringResults.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button size="sm" onClick={startMonitoring} disabled={monitoring} variant="outline" className="border-blue-500/30 text-blue-400">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                          </Button>
                        </div>

                        {monitoringResults.alerts.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-500/20">
                            <h4 className="text-sm font-medium text-white mb-2">Active Alerts</h4>
                            <ul className="space-y-1">
                              {monitoringResults.alerts.map((alert, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-blue-300">
                                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  {alert}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>

                      {/* Risk Updates */}
                      {monitoringResults.riskUpdates.map((update, idx) => (
                        <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-white mb-1">{update.riskTitle}</h4>
                              <Badge className={`text-xs ${
                                update.status === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                                update.status === 'elevated' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {update.status}
                              </Badge>
                            </div>
                            {update.statusChange && (
                              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                                {update.statusChange}
                              </Badge>
                            )}
                          </div>

                          {update.triggersActivated.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-medium text-slate-400 mb-1">Triggers Activated</div>
                              <div className="flex flex-wrap gap-1">
                                {update.triggersActivated.map((trigger, i) => (
                                  <Badge key={i} className="bg-rose-500/10 text-rose-400 text-xs">
                                    {trigger}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="text-xs font-medium text-slate-400 mb-1">External Factors</div>
                            <ul className="space-y-1">
                              {update.externalFactors.map((factor, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                  <Globe className="h-3 w-3 mt-1 flex-shrink-0 text-blue-400" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {update.recommendedActions.length > 0 && (
                            <div className="pt-3 border-t border-[#2a3548]">
                              <div className="text-xs font-medium text-slate-400 mb-2">Recommended Actions</div>
                              <ul className="space-y-1">
                                {update.recommendedActions.map((action, i) => (
                                  <li key={i} className="text-sm text-emerald-300 flex items-start gap-2">
                                    <CheckCircle2 className="h-3 w-3 mt-1 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Card>
                      ))}

                      {/* Monitoring Triggers Setup */}
                      <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-cyan-400" />
                          Configured Monitoring Triggers
                        </h3>
                        <div className="space-y-3">
                          {predictions.monitoringTriggers.map((trigger, idx) => (
                            <div key={idx} className="bg-[#1a2332] p-3 rounded">
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-sm font-medium text-white">{trigger.dataSource}</div>
                                <Badge className="bg-cyan-500/10 text-cyan-400 text-xs">{trigger.frequency}</Badge>
                              </div>
                              <div className="text-xs text-slate-400 mb-1">
                                Indicator: <span className="text-slate-300">{trigger.indicator}</span>
                              </div>
                              <div className="text-xs text-slate-400">
                                Threshold: <span className="text-slate-300">{trigger.threshold}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}