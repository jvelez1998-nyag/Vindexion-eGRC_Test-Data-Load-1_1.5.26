import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, AlertTriangle, TrendingUp, Shield, Bell, Globe } from "lucide-react";
import { toast } from "sonner";
import ThreatIntelligenceFeed from "@/components/threat-intel/ThreatIntelligenceFeed";

export default function PredictiveIncidentAnalysis() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [threatIntel, setThreatIntel] = useState(null);

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list()
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const analyzePredictivePatterns = async (externalIntel = null) => {
    setLoading(true);
    try {
      const intelContext = externalIntel || threatIntel;
      
      const threatIntelSection = intelContext ? `

EXTERNAL THREAT INTELLIGENCE:
- Global Threat Level: ${intelContext.threat_level}
- Emerging Threats:
${intelContext.emerging_threats.slice(0, 5).map(t => `  • ${t.name} (${t.severity}) - ${t.type}
    Sectors: ${t.affected_sectors.join(', ')}
    Vectors: ${t.attack_vectors.join(', ')}`).join('\n')}

- Active Vulnerabilities:
${intelContext.vulnerabilities.slice(0, 5).map(v => `  • ${v.cve_id} (CVSS ${v.cvss_score}) - ${v.exploitation_status}
    Affected: ${Array.isArray(v.affected_systems) ? v.affected_systems.join(', ') : (typeof v.affected_systems === 'string' ? v.affected_systems : 'N/A')}`).join('\n')}

- Threat Actor Activity:
${intelContext.threat_actors.slice(0, 3).map(a => `  • ${a.name} - ${a.motivation}
    Targets: ${a.targets.join(', ')}`).join('\n')}
` : '';

      const prompt = `You are an expert in predictive analytics for GRC incidents. Analyze the following historical data COMBINED WITH EXTERNAL THREAT INTELLIGENCE to predict potential future incidents and their preventative measures.

HISTORICAL INCIDENT DATA:
- Total Incidents: ${incidents.length}
- Critical Incidents: ${incidents.filter(i => i.severity === 'critical').length}
- Recent Incidents (Last 10):
${incidents.slice(-10).map((inc, idx) => `
  ${idx + 1}. ${inc.title}
     - Type: ${inc.incident_type}
     - Severity: ${inc.severity}
     - Affected Systems: ${Array.isArray(inc.affected_systems) ? inc.affected_systems.join(', ') : 'N/A'}
     - Root Cause: ${inc.root_cause || 'Under investigation'}
     - Date: ${inc.occurred_date || inc.created_date}
`).join('\n')}

RISK LANDSCAPE:
- Total Active Risks: ${risks.length}
- High/Critical Risks: ${risks.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 9).length}
- Risk Categories: ${[...new Set(risks.map(r => r.category))].join(', ')}

AUDIT FINDINGS:
- Total Findings: ${findings.length}
- Critical: ${findings.filter(f => f.severity === 'critical').length}
- High: ${findings.filter(f => f.severity === 'high').length}
- Open Findings: ${findings.filter(f => f.status === 'open').length}

CONTROL EFFECTIVENESS:
- Total Controls: ${controls.length}
- Effective: ${controls.filter(c => c.status === 'effective').length}
- Ineffective: ${controls.filter(c => c.status === 'ineffective').length}
${threatIntelSection}

ANALYSIS REQUIRED (enriched with threat intelligence):

1. **Pattern Identification** (5-7 patterns):
   - Common precursors to incidents
   - Risk factors that often materialize
   - Control failures that led to incidents
   - Temporal patterns (time-based trends)
   - Correlation between findings and incidents

2. **Incident Predictions** (5-8 predictions):
   For each predicted incident:
   - Incident type and description
   - Probability of occurrence (%)
   - Expected severity (Low/Medium/High/Critical)
   - Timeframe (e.g., "1-3 months", "3-6 months")
   - Leading indicators to monitor
   - Confidence level (%)

3. **Preventative Measures** (3-5 per prediction):
   - Specific actionable steps
   - Priority level (Critical/High/Medium/Low)
   - Responsible function/team
   - Expected effort (Low/Medium/High)
   - Expected impact on preventing incident

4. **Early Warning Indicators** (10-15 indicators):
   - Specific metrics or conditions to monitor
   - Threshold values that indicate elevated risk
   - Monitoring frequency
   - Alert triggers

5. **Stakeholder Alerts**:
   - Who should be notified for each prediction
   - Urgency level
   - Recommended notification timeline

6. **External Threat Correlation**:
   - How emerging threats map to predicted incidents
   - Which external vulnerabilities increase incident likelihood
   - Threat actor TTPs that could manifest as incidents

Provide data-driven, specific predictions with clear preventative actions enriched by external threat intelligence.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: !intelContext,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            overall_risk_score: { type: "number" },
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern_name: { type: "string" },
                  description: { type: "string" },
                  frequency: { type: "string" },
                  correlation_strength: { type: "string" }
                }
              }
            },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  incident_type: { type: "string" },
                  description: { type: "string" },
                  probability: { type: "number" },
                  severity: { type: "string" },
                  timeframe: { type: "string" },
                  leading_indicators: { type: "array", items: { type: "string" } },
                  confidence_level: { type: "number" },
                  preventative_measures: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        priority: { type: "string" },
                        responsible: { type: "string" },
                        effort: { type: "string" },
                        impact: { type: "string" }
                      }
                    }
                  },
                  stakeholders_to_alert: { type: "array", items: { type: "string" } },
                  urgency: { type: "string" }
                }
              }
            },
            early_warning_indicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  threshold: { type: "string" },
                  monitoring_frequency: { type: "string" },
                  alert_trigger: { type: "string" }
                }
              }
            },
            external_threat_correlation: {
              type: "object",
              properties: {
                threat_mapping: { type: "array", items: { type: "string" } },
                vulnerability_impact: { type: "array", items: { type: "string" } },
                actor_ttp_predictions: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setPredictions(response);

      // Trigger automation for high-probability predictions
      if (window.executeAutomation && response.predictions) {
        response.predictions.forEach(pred => {
          if (pred.probability >= 60 && pred.urgency === 'High') {
            window.executeAutomation(
              'auto-incident-prediction',
              pred,
              'ai_incident_prediction'
            );
          }
        });
      }

      // Send notifications for critical predictions
      const criticalPredictions = response.predictions.filter(p => p.severity === 'Critical' && p.probability >= 70);
      if (criticalPredictions.length > 0) {
        await base44.integrations.Core.SendEmail({
          to: 'admin@organization.com',
          subject: `⚠️ Critical Incident Predictions Detected - Immediate Action Required`,
          body: `AI Predictive Analysis has identified ${criticalPredictions.length} high-probability critical incidents.

${criticalPredictions.map((p, i) => `
${i + 1}. ${p.incident_type} - ${p.probability}% probability
   Timeframe: ${p.timeframe}
   ${p.description}
`).join('\n')}

Please review the Predictive Incident Analysis dashboard immediately.`
        });
      }

      toast.success("Predictive analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate predictions");
    } finally {
      setLoading(false);
    }
  };

  if (!predictions) {
    return (
      <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <Brain className="h-12 w-12 text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Predictive Incident Analysis</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-4">
                Analyze historical incident data, risk patterns, and audit findings to predict potential 
                future incidents and recommend preventative measures.
              </p>
              <div className="flex items-center gap-2 justify-center text-sm text-slate-500 mb-6">
                <TrendingUp className="h-4 w-4" />
                <span>Analyzing {incidents.length} incidents, {risks.length} risks, {findings.length} findings</span>
              </div>
            </div>
            <Button 
              onClick={analyzePredictivePatterns}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Patterns...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Generate Predictions
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
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Predictive Incident Analysis</h3>
            <p className="text-sm text-slate-400">AI-powered incident predictions and preventative measures</p>
          </div>
        </div>
        <Button onClick={analyzePredictivePatterns} variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
          <Brain className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Risk Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-slate-300 leading-relaxed">{predictions.executive_summary}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-rose-400">{predictions.overall_risk_score}</div>
              <div className="text-xs text-slate-400 mt-1">Risk Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Alerts */}
      {predictions.predictions.filter(p => p.probability >= 70 || p.severity === 'Critical').length > 0 && (
        <Alert className="bg-rose-500/10 border-rose-500/30">
          <Bell className="h-4 w-4 text-rose-400" />
          <AlertDescription className="text-white">
            <strong>{predictions.predictions.filter(p => p.probability >= 70 || p.severity === 'Critical').length}</strong> high-priority 
            incident predictions require immediate attention. Stakeholder notifications have been triggered.
          </AlertDescription>
        </Alert>
      )}

      {/* Patterns */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Identified Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predictions.patterns.map((pattern, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <h4 className="font-semibold text-white text-sm mb-2">{pattern.pattern_name}</h4>
                <p className="text-xs text-slate-400 mb-2">{pattern.description}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                    {pattern.frequency}
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                    {pattern.correlation_strength}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Incident Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {predictions.predictions.map((pred, idx) => (
                <div key={idx} className={`p-5 rounded-lg border ${pred.probability >= 70 ? 'bg-rose-500/5 border-rose-500/30' : 'bg-[#151d2e] border-[#2a3548]'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-base mb-1">{pred.incident_type}</h4>
                      <p className="text-sm text-slate-400 mb-3">{pred.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${pred.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' : pred.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'} border-0`}>
                          {pred.severity}
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {pred.timeframe}
                        </Badge>
                        <Badge className={`${pred.urgency === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'} border-0`}>
                          {pred.urgency} Urgency
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-3xl font-bold ${pred.probability >= 70 ? 'text-rose-400' : pred.probability >= 50 ? 'text-orange-400' : 'text-amber-400'}`}>
                        {pred.probability}%
                      </div>
                      <div className="text-xs text-slate-500">Probability</div>
                      <div className="text-xs text-slate-400 mt-1">{pred.confidence_level}% confidence</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Leading Indicators */}
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Leading Indicators:
                      </div>
                      <div className="space-y-1">
                        {pred.leading_indicators.map((indicator, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">→</span>
                            {indicator}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preventative Measures */}
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Preventative Measures:
                      </div>
                      <div className="space-y-2">
                        {pred.preventative_measures.map((measure, i) => (
                          <div key={i} className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm text-white font-medium">{measure.action}</span>
                              <Badge className={`${measure.priority === 'Critical' || measure.priority === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/10 text-blue-400'} border-0 text-xs`}>
                                {measure.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>Responsible: {measure.responsible}</span>
                              <span>Effort: {measure.effort}</span>
                              <span className="text-emerald-400">Impact: {measure.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stakeholders */}
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <Bell className="h-3 w-3" />
                        Stakeholders to Alert:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pred.stakeholders_to_alert.map((stakeholder, i) => (
                          <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                            {stakeholder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Threat Intelligence */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            External Threat Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThreatIntelligenceFeed onIntelligenceReceived={(intel) => {
            setThreatIntel(intel);
            analyzePredictivePatterns(intel);
          }} />
          
          {predictions?.external_threat_correlation && (
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <h5 className="text-sm font-medium text-rose-400 mb-2">Threat → Incident Mapping:</h5>
                <ul className="space-y-1">
                  {predictions.external_threat_correlation.threat_mapping.map((map, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      {map}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <h5 className="text-sm font-medium text-amber-400 mb-2">Vulnerability Impact:</h5>
                <ul className="space-y-1">
                  {predictions.external_threat_correlation.vulnerability_impact.map((impact, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      {impact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Early Warning Indicators */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Early Warning Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predictions.early_warning_indicators.map((indicator, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <h4 className="font-semibold text-white text-sm mb-2">{indicator.indicator}</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Threshold: <span className="text-white">{indicator.threshold}</span></div>
                  <div>Monitor: <span className="text-white">{indicator.monitoring_frequency}</span></div>
                  <div>Alert: <span className="text-amber-400">{indicator.alert_trigger}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}