import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIRiskForecastingEngine from "./AIRiskForecastingEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Loader2, TrendingUp, AlertTriangle, LineChart as LineChartIcon } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function PredictiveAnalytics({ data }) {
  const [predictionType, setPredictionType] = useState('risk_trends');
  const [timeframe, setTimeframe] = useState('3_months');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const generatePredictions = async () => {
    setLoading(true);
    try {
      // Prepare historical data
      const historicalRisks = data.risks.map(r => ({
        category: r.category,
        severity: r.risk_level,
        score: (r.likelihood || 0) * (r.impact || 0),
        status: r.status,
        created: r.created_date
      }));

      const historicalCompliance = data.compliance.map(c => ({
        framework: c.framework,
        status: c.status,
        created: c.created_date
      }));

      const historicalIncidents = data.incidents.map(i => ({
        type: i.incident_type,
        severity: i.severity,
        status: i.status,
        occurred: i.occurred_date
      }));

      const controlFailures = data.controls.filter(c => c.status === 'ineffective').length;

      const prompt = `As a GRC predictive analytics expert, analyze historical data and provide forecasts.

HISTORICAL DATA:
Total Risks: ${data.risks.length}
- Critical: ${data.risks.filter(r => r.risk_level === 'critical').length}
- High: ${data.risks.filter(r => r.risk_level === 'high').length}
- Medium: ${data.risks.filter(r => r.risk_level === 'medium').length}

Compliance Items: ${data.compliance.length}
- Non-compliant: ${data.compliance.filter(c => c.status === 'non_compliant').length}
- In Progress: ${data.compliance.filter(c => c.status === 'in_progress').length}

Incidents (Last 6 months): ${data.incidents.length}
Control Failures: ${controlFailures}

PREDICTION FOCUS: ${predictionType}
TIMEFRAME: ${timeframe}

PROVIDE DETAILED PREDICTIONS:

1. **Forecasted Trends**: Generate month-by-month predictions for the next ${timeframe === '3_months' ? '3' : timeframe === '6_months' ? '6' : '12'} months
   - Risk volume (critical, high, medium)
   - Compliance gaps
   - Incident likelihood
   - Control effectiveness

2. **Risk Likelihood Analysis**: Identify risks most likely to materialize based on:
   - Historical patterns
   - Current control gaps
   - Industry trends
   - Recent incident patterns

3. **Compliance Risk Forecast**: Predict which compliance areas are at highest risk of non-compliance

4. **Control Failure Prediction**: Identify controls at risk of failure based on:
   - Testing history
   - Domain patterns
   - Resource constraints

5. **Resource Planning**: Predict resource needs for the forecast period

6. **Confidence Levels**: Provide confidence scores for predictions (0-100%)

7. **Early Warning Indicators**: Key metrics to monitor for early detection

Format as structured data for visualization.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            confidence_score: { type: "number" },
            forecast_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  critical_risks: { type: "number" },
                  high_risks: { type: "number" },
                  medium_risks: { type: "number" },
                  compliance_gaps: { type: "number" },
                  incident_probability: { type: "number" },
                  control_effectiveness: { type: "number" }
                }
              }
            },
            high_risk_scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scenario: { type: "string" },
                  likelihood: { type: "string" },
                  impact: { type: "string" },
                  timeframe: { type: "string" },
                  indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            compliance_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  risk_level: { type: "string" },
                  predicted_gap_date: { type: "string" },
                  prevention_actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            control_failure_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  domain: { type: "string" },
                  failure_probability: { type: "number" },
                  impact_if_failed: { type: "string" },
                  mitigation_priority: { type: "string" }
                }
              }
            },
            resource_needs: {
              type: "object",
              properties: {
                additional_fte: { type: "number" },
                budget_increase: { type: "string" },
                skill_gaps: { type: "array", items: { type: "string" } }
              }
            },
            early_warnings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  current_value: { type: "string" },
                  threshold: { type: "string" }
                }
              }
            }
          }
        }
      });

      setPredictions(response);
      toast.success('Predictions generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate predictions');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <AIRiskForecastingEngine data={data} />
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={predictionType} onValueChange={setPredictionType}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="risk_trends">Risk Trends</SelectItem>
                <SelectItem value="compliance_gaps">Compliance Gaps</SelectItem>
                <SelectItem value="incident_forecast">Incident Forecast</SelectItem>
                <SelectItem value="control_failures">Control Failures</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="3_months">3 Months</SelectItem>
                <SelectItem value="6_months">6 Months</SelectItem>
                <SelectItem value="12_months">12 Months</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={generatePredictions} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Generate Forecast
            </Button>
          </div>

          {predictions && (
            <div className="space-y-4 mt-6">
              {/* Summary */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Forecast Summary</h4>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {predictions.confidence_score}% Confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">{predictions.summary}</p>
                </CardContent>
              </Card>

              {/* Forecast Chart */}
              {predictions.forecast_data && (
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base text-white">Trend Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={predictions.forecast_data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a2332', 
                              border: '1px solid #2a3548',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Area type="monotone" dataKey="critical_risks" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="high_risks" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="medium_risks" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* High Risk Scenarios */}
              {predictions.high_risk_scenarios?.length > 0 && (
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Predicted High-Risk Scenarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predictions.high_risk_scenarios.map((scenario, idx) => (
                        <div key={idx} className="p-4 bg-[#1a2332] rounded-lg border border-[#2a3548]">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white text-sm">{scenario.scenario}</h4>
                            <div className="flex gap-2">
                              <Badge className={getRiskColor(scenario.likelihood)}>
                                {scenario.likelihood} Likelihood
                              </Badge>
                              <Badge className={getRiskColor(scenario.impact)}>
                                {scenario.impact} Impact
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">Expected: {scenario.timeframe}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 font-medium">Early Warning Indicators:</p>
                            {scenario.indicators?.map((indicator, i) => (
                              <div key={i} className="text-xs text-slate-400 pl-3">• {indicator}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Risks */}
              {predictions.compliance_risks?.length > 0 && (
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base text-white">Compliance Risk Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {predictions.compliance_risks.map((risk, idx) => (
                        <div key={idx} className="p-3 bg-[#1a2332] rounded-lg border border-[#2a3548]">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white text-sm">{risk.framework}</h4>
                            <Badge className={getRiskColor(risk.risk_level)}>{risk.risk_level}</Badge>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">Predicted Gap: {risk.predicted_gap_date}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 font-medium">Prevention Actions:</p>
                            {risk.prevention_actions?.slice(0, 2).map((action, i) => (
                              <div key={i} className="text-xs text-slate-400">• {action}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Control Failure Risks */}
              {predictions.control_failure_risks?.length > 0 && (
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base text-white">Control Failure Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {predictions.control_failure_risks.map((control, idx) => (
                        <div key={idx} className="p-3 bg-[#1a2332] rounded-lg border border-[#2a3548] flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white text-sm">{control.domain}</h4>
                            <p className="text-xs text-slate-400">Impact if failed: {control.impact_if_failed}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-400">{control.failure_probability}%</p>
                            <Badge className={getRiskColor(control.mitigation_priority)}>
                              {control.mitigation_priority} Priority
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}