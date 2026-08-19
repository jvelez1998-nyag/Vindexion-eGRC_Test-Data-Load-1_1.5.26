import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

export default function AnomalyDetection({ data }) {
  const [analysisScope, setAnalysisScope] = useState('all');
  const [loading, setLoading] = useState(false);
  const [anomalies, setAnomalies] = useState(null);

  const detectAnomalies = async () => {
    setLoading(true);
    try {
      // Calculate baseline metrics
      const avgRiskScore = data.risks.reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / data.risks.length;
      const complianceRate = (data.compliance.filter(c => c.status === 'verified' || c.status === 'implemented').length / data.compliance.length) * 100;
      const controlEffectiveness = (data.controls.filter(c => c.status === 'effective').length / data.controls.length) * 100;

      // Risk category distribution
      const risksByCategory = data.risks.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {});

      // Control testing patterns
      const recentControls = data.controls.map(c => ({
        name: c.name,
        domain: c.domain,
        effectiveness: c.effectiveness,
        status: c.status,
        last_tested: c.last_tested_date
      }));

      // Incident patterns
      const incidentsByType = data.incidents.reduce((acc, i) => {
        acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
        return acc;
      }, {});

      const prompt = `As an expert in anomaly detection for GRC systems, analyze the data for unusual patterns.

BASELINE METRICS:
- Average Risk Score: ${avgRiskScore.toFixed(2)}
- Compliance Rate: ${complianceRate.toFixed(1)}%
- Control Effectiveness: ${controlEffectiveness.toFixed(1)}%

DATA OVERVIEW:
Total Risks: ${data.risks.length}
Risk Distribution: ${JSON.stringify(risksByCategory)}

Total Controls: ${data.controls.length}
Ineffective Controls: ${data.controls.filter(c => c.status === 'ineffective').length}

Incidents: ${data.incidents.length}
Incident Types: ${JSON.stringify(incidentsByType)}

ANALYSIS SCOPE: ${analysisScope}

DETECT AND REPORT ANOMALIES:

1. **Statistical Anomalies**: 
   - Outliers in risk scores, control effectiveness, compliance rates
   - Unusual patterns in metrics over time
   - Deviations from expected baselines

2. **Pattern Anomalies**:
   - Unusual clustering of risks in specific categories
   - Abnormal control failure patterns
   - Unexpected incident spikes
   - Irregular compliance status changes

3. **Behavioral Anomalies**:
   - Controls not being tested on schedule
   - Risks not being reviewed/updated
   - Compliance items stuck in same status
   - Unusual assignment patterns

4. **Correlation Anomalies**:
   - Risks without appropriate controls
   - Controls without linked risks
   - Compliance gaps with no mitigation
   - Incidents not triggering control reviews

5. **Emerging Threats**:
   - New risk patterns emerging
   - Control weaknesses appearing
   - Potential systemic issues

For each anomaly, provide:
- Type and description
- Severity (critical/high/medium/low)
- Affected entities
- Potential root causes
- Recommended actions
- Urgency level

Be specific with data points and flag anything unusual or concerning.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            total_anomalies: { type: "number" },
            critical_count: { type: "number" },
            detected_anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  category: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  confidence: { type: "number" },
                  affected_entities: { type: "array", items: { type: "string" } },
                  data_points: {
                    type: "object",
                    properties: {
                      expected: { type: "string" },
                      actual: { type: "string" },
                      deviation: { type: "string" }
                    }
                  },
                  potential_causes: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } },
                  urgency: { type: "string" },
                  impact_if_ignored: { type: "string" }
                }
              }
            },
            pattern_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            emerging_threats: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnomalies(response);
      toast.success(`Detected ${response.total_anomalies} anomalies`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            AI Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={analysisScope} onValueChange={setAnalysisScope} className="flex-1">
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="risks">Risks Only</SelectItem>
                <SelectItem value="controls">Controls Only</SelectItem>
                <SelectItem value="compliance">Compliance Only</SelectItem>
                <SelectItem value="incidents">Incidents Only</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={detectAnomalies} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Detect Anomalies
            </Button>
          </div>

          {anomalies && (
            <div className="space-y-4 mt-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Critical</p>
                    <p className="text-2xl font-bold text-rose-400">{anomalies.critical_count}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Total Detected</p>
                    <p className="text-2xl font-bold text-amber-400">{anomalies.total_anomalies}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Patterns Found</p>
                    <p className="text-2xl font-bold text-blue-400">{anomalies.pattern_insights?.length || 0}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-white mb-2">Analysis Summary</h4>
                  <p className="text-sm text-slate-300">{anomalies.summary}</p>
                </CardContent>
              </Card>

              {/* Detected Anomalies */}
              <Card className="bg-[#0f1623] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base text-white">Detected Anomalies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {anomalies.detected_anomalies?.map((anomaly, idx) => (
                      <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getSeverityColor(anomaly.severity)}>
                                  {anomaly.severity}
                                </Badge>
                                <Badge className="bg-slate-500/20 text-slate-400 text-xs">
                                  {anomaly.category}
                                </Badge>
                                <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                                  {anomaly.confidence}% confidence
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-white mb-1">{anomaly.title}</h4>
                              <p className="text-sm text-slate-400 mb-3">{anomaly.description}</p>
                            </div>
                            <Badge className={`${
                              anomaly.urgency?.toLowerCase() === 'immediate' ? 'bg-rose-500/20 text-rose-400' :
                              anomaly.urgency?.toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {anomaly.urgency}
                            </Badge>
                          </div>

                          {anomaly.data_points && (
                            <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-[#0f1623] rounded-lg">
                              <div>
                                <p className="text-xs text-slate-500">Expected</p>
                                <p className="text-sm text-slate-300">{anomaly.data_points.expected}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Actual</p>
                                <p className="text-sm text-amber-400 font-medium">{anomaly.data_points.actual}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Deviation</p>
                                <p className="text-sm text-rose-400 font-medium">{anomaly.data_points.deviation}</p>
                              </div>
                            </div>
                          )}

                          {anomaly.affected_entities?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-slate-500 mb-1">Affected Entities:</p>
                              <div className="flex flex-wrap gap-1">
                                {anomaly.affected_entities.map((entity, i) => (
                                  <Badge key={i} className="bg-purple-500/10 text-purple-400 text-xs">
                                    {entity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {anomaly.potential_causes?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-slate-500 mb-1">Potential Causes:</p>
                              {anomaly.potential_causes.map((cause, i) => (
                                <div key={i} className="text-xs text-slate-400 pl-3">• {cause}</div>
                              ))}
                            </div>
                          )}

                          {anomaly.recommendations?.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-500 mb-1">Recommendations:</p>
                              {anomaly.recommendations.map((rec, i) => (
                                <div key={i} className="text-xs text-emerald-400 pl-3">→ {rec}</div>
                              ))}
                            </div>
                          )}

                          {anomaly.impact_if_ignored && (
                            <div className="p-2 bg-rose-500/5 rounded border border-rose-500/20 mt-2">
                              <p className="text-xs text-rose-400">
                                <strong>Impact if ignored:</strong> {anomaly.impact_if_ignored}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pattern Insights */}
              {anomalies.pattern_insights?.length > 0 && (
                <Card className="bg-[#0f1623] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base text-white">Pattern Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {anomalies.pattern_insights.map((insight, idx) => (
                        <div key={idx} className="p-3 bg-[#1a2332] rounded-lg border border-[#2a3548]">
                          <p className="text-sm text-white font-medium mb-1">{insight.pattern}</p>
                          <p className="text-xs text-slate-400">{insight.significance}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emerging Threats */}
              {anomalies.emerging_threats?.length > 0 && (
                <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Emerging Threats Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {anomalies.emerging_threats.map((threat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-300">{threat}</p>
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