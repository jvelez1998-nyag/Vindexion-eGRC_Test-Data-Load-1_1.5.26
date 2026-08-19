import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  Target,
  Calendar,
  Loader2,
  LineChart as LineChartIcon,
  BarChart3,
  Globe
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import ThreatIntelligenceFeed from "@/components/threat-intel/ThreatIntelligenceFeed";

export default function AITrendAnalysis({ dataType, historicalData, onInsightsGenerated }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [threatIntel, setThreatIntel] = useState(null);

  const generateAnalysis = async (externalIntel = null) => {
    if (!historicalData || historicalData.length === 0) {
      toast.error("No historical data available for analysis");
      return;
    }

    setLoading(true);
    try {
      const intelContext = externalIntel || threatIntel;
      
      const threatIntelSection = intelContext ? `

EXTERNAL THREAT INTELLIGENCE:
- Global Threat Level: ${intelContext.threat_level}
- Emerging Threats: ${intelContext.emerging_threats.map(t => `${t.name} (${t.severity})`).join(', ')}
- Active CVEs: ${intelContext.vulnerabilities.map(v => `${v.cve_id} (CVSS ${v.cvss_score})`).join(', ')}
- Risk Trends: ${intelContext.risk_trends.map(r => r.area).join(', ')}
` : '';

      const prompt = `You are an expert risk analyst and data scientist specializing in predictive analytics for GRC (Governance, Risk, and Compliance).

HISTORICAL DATA SUMMARY:
${dataType === 'risks' ? `
- Total Risk Assessments: ${historicalData.length}
- Risk Categories: ${[...new Set(historicalData.map(r => r.risk_category))].join(', ')}
- Average Inherent Risk: ${(historicalData.reduce((sum, r) => sum + ((r.inherent_likelihood || 0) * (r.inherent_impact || 0)), 0) / historicalData.length).toFixed(2)}
- Average Residual Risk: ${(historicalData.reduce((sum, r) => sum + ((r.residual_likelihood || 0) * (r.residual_impact || 0)), 0) / historicalData.length).toFixed(2)}
- High/Critical Risks: ${historicalData.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 9).length}
` : `
- Total Audits: ${historicalData.length}
- Audit Types: ${[...new Set(historicalData.map(a => a.type))].join(', ')}
- Completed Audits: ${historicalData.filter(a => a.status === 'completed').length}
- Findings Count: ${historicalData.reduce((sum, a) => sum + (a.findings_count || 0), 0)}
- Critical Findings: ${historicalData.reduce((sum, a) => sum + (a.critical_findings || 0), 0)}
`}

RECENT ITEMS (Last 10):
${historicalData.slice(-10).map((item, idx) => `
${idx + 1}. ${item.title || item.requirement}
   - Date: ${item.created_date || 'N/A'}
   ${dataType === 'risks' ? `- Category: ${item.risk_category}
   - Inherent: ${(item.inherent_likelihood || 0) * (item.inherent_impact || 0)}
   - Residual: ${(item.residual_likelihood || 0) * (item.residual_impact || 0)}` : 
   `- Type: ${item.type}
   - Status: ${item.status}
   - Findings: ${item.findings_count || 0}`}
   `).join('\n')}
   ${threatIntelSection}

   ANALYSIS REQUIREMENTS:

Perform comprehensive trend analysis and provide:

1. **Pattern Identification**: Identify 5-7 significant patterns in the data:
   - Temporal patterns (seasonal, monthly, quarterly trends)
   - Category/type concentrations
   - Risk severity trends
   - Control effectiveness patterns
   - Emerging risk areas

2. **Probability Calculations**: For each major risk category or audit type:
   - Historical occurrence frequency
   - Recurrence probability (as percentage)
   - Time-to-recurrence estimate
   - Confidence level of prediction

3. **Predictive Insights**: Based on historical data, predict:
   - Top 5 risks/issues likely to occur in next 3-6 months
   - Expected severity levels
   - Probability of occurrence (%)
   - Early warning indicators to monitor

4. **Risk Landscape Forecast**: Provide a 6-12 month outlook:
   - Emerging risk areas requiring attention
   - Risk categories likely to increase
   - Control gaps that may surface
   - Recommended proactive measures

5. **Trend Metrics**: Calculate and provide:
   - Month-over-month change rate
   - Year-over-year growth/decline
   - Standard deviation in risk levels
   - Volatility index

6. **Actionable Recommendations**: Provide 5-7 specific actions to:
   - Prevent predicted high-probability risks
   - Improve control effectiveness
   - Optimize resource allocation
   - Enhance monitoring strategies

7. **External Threat Correlation** (if threat intel available):
   - How external threats correlate with internal trends
   - Relevant threats to monitor
   - Preventative actions based on threat landscape

Return structured, data-driven analysis with specific numbers and percentages.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: !intelContext,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern_name: { type: "string" },
                  description: { type: "string" },
                  significance: { type: "string" },
                  data_points: { type: "array", items: { type: "string" } }
                }
              }
            },
            probability_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  occurrence_frequency: { type: "string" },
                  recurrence_probability: { type: "number" },
                  time_to_recurrence: { type: "string" },
                  confidence_level: { type: "string" }
                }
              }
            },
            predictive_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_item: { type: "string" },
                  expected_severity: { type: "string" },
                  probability_percentage: { type: "number" },
                  timeframe: { type: "string" },
                  early_indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            risk_landscape_forecast: {
              type: "object",
              properties: {
                emerging_areas: { type: "array", items: { type: "string" } },
                increasing_categories: { type: "array", items: { type: "string" } },
                potential_control_gaps: { type: "array", items: { type: "string" } },
                proactive_measures: { type: "array", items: { type: "string" } }
              }
            },
            trend_metrics: {
              type: "object",
              properties: {
                month_over_month_change: { type: "string" },
                year_over_year: { type: "string" },
                volatility_index: { type: "string" },
                trend_direction: { type: "string" }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string" },
                  action: { type: "string" },
                  rationale: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            external_threat_correlation: {
              type: "object",
              properties: {
                relevant_threats: { type: "array", items: { type: "string" } },
                correlation_analysis: { type: "string" },
                preventative_actions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setAnalysis(response);
      if (onInsightsGenerated) {
        onInsightsGenerated(response);
      }
      
      // Trigger automation for high probability predictions
      if (window.executeAutomation && response.predictive_insights) {
        response.predictive_insights.forEach(insight => {
          if (insight.probability_percentage >= 70) {
            window.executeAutomation(
              'auto-high-risk-prediction',
              insight,
              'risk_prediction'
            );
          }
        });
      }
      
      toast.success("Trend analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate trend analysis");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Brain className="h-12 w-12 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Driven Trend Analysis</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-4">
                Analyze historical {dataType} data to identify patterns, calculate recurrence probabilities, 
                and predict future risk landscapes with AI-powered insights.
              </p>
              <div className="flex items-center gap-2 justify-center text-sm text-slate-500 mb-6">
                <TrendingUp className="h-4 w-4" />
                <span>Analyzing {historicalData?.length || 0} historical records</span>
              </div>
            </div>
            <Button 
              onClick={generateAnalysis}
              disabled={loading || !historicalData || historicalData.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Trends...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Generate Trend Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Trend Analysis Results</h3>
            <p className="text-sm text-slate-400">Based on {historicalData.length} historical records</p>
          </div>
        </div>
        <Button onClick={generateAnalysis} variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
          <Brain className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">{analysis.executive_summary}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="probability">Probability Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="threat-intel">Threat Intel</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {analysis.patterns.map((pattern, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <LineChartIcon className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{pattern.pattern_name}</h4>
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      {pattern.significance}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-3">{pattern.description}</p>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Key Data Points:</div>
                  {pattern.data_points.map((point, i) => (
                    <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="probability" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.probability_analysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="category" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: 'Probability %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #2a3548',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="recurrence_probability" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {analysis.probability_analysis.map((item, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white">{item.category}</h4>
                  <Badge className={`${item.recurrence_probability >= 70 ? 'bg-rose-500/20 text-rose-400' : item.recurrence_probability >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} border-0`}>
                    {item.recurrence_probability}% Probability
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Frequency:</span>
                    <div className="text-white mt-1">{item.occurrence_frequency}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Time to Recurrence:</span>
                    <div className="text-white mt-1">{item.time_to_recurrence}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Confidence Level:</span>
                    <div className="text-white mt-1">{item.confidence_level}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.predictive_insights.map((insight, idx) => (
                <Card key={idx} className={`bg-[#1a2332] border-[#2a3548] ${insight.probability_percentage >= 70 ? 'ring-1 ring-rose-500/30' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`h-4 w-4 ${insight.probability_percentage >= 70 ? 'text-rose-400' : insight.probability_percentage >= 40 ? 'text-amber-400' : 'text-blue-400'}`} />
                          <h4 className="font-semibold text-white">{insight.risk_item}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                            {insight.expected_severity}
                          </Badge>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                            {insight.timeframe}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${insight.probability_percentage >= 70 ? 'text-rose-400' : insight.probability_percentage >= 40 ? 'text-amber-400' : 'text-blue-400'}`}>
                          {insight.probability_percentage}%
                        </div>
                        <div className="text-xs text-slate-500">Probability</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-2">Early Warning Indicators:</div>
                      <div className="space-y-1">
                        {insight.early_indicators.map((indicator, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <Calendar className="h-3 w-3 mt-0.5 flex-shrink-0 text-indigo-400" />
                            <span>{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="threat-intel">
          <div className="space-y-4">
            <ThreatIntelligenceFeed onIntelligenceReceived={(intel) => {
              setThreatIntel(intel);
              generateAnalysis(intel);
            }} />
            
            {analysis?.external_threat_correlation && (
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    Threat Correlation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Relevant Threats:</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.external_threat_correlation.relevant_threats.map((threat, i) => (
                        <Badge key={i} className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          {threat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Analysis:</h5>
                    <p className="text-sm text-slate-300">{analysis.external_threat_correlation.correlation_analysis}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Preventative Actions:</h5>
                    <ul className="space-y-2">
                      {analysis.external_threat_correlation.preventative_actions.map((action, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">→</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">Emerging Risk Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.risk_landscape_forecast.emerging_areas.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#151d2e]">
                    <TrendingUp className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white">{area}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">Increasing Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.risk_landscape_forecast.increasing_categories.map((cat, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#151d2e]">
                    <BarChart3 className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white">{cat}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">Potential Control Gaps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.risk_landscape_forecast.potential_control_gaps.map((gap, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#151d2e]">
                    <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white">{gap}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">Proactive Measures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.risk_landscape_forecast.proactive_measures.map((measure, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#151d2e]">
                    <Target className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white">{measure}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-base">Trend Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">MoM Change</div>
                  <div className="text-lg font-semibold text-white">{analysis.trend_metrics.month_over_month_change}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">YoY Change</div>
                  <div className="text-lg font-semibold text-white">{analysis.trend_metrics.year_over_year}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Volatility</div>
                  <div className="text-lg font-semibold text-white">{analysis.trend_metrics.volatility_index}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Trend</div>
                  <div className="text-lg font-semibold text-white">{analysis.trend_metrics.trend_direction}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {analysis.recommendations.map((rec, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Badge className={`${rec.priority === 'Critical' || rec.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : rec.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'} border-0 mt-1`}>
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">{rec.action}</h4>
                    <p className="text-sm text-slate-400 mb-2">{rec.rationale}</p>
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="text-xs text-slate-500 mb-1">Expected Impact:</div>
                      <div className="text-sm text-emerald-400">{rec.expected_impact}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}