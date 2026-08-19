import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertTriangle, TrendingUp, Shield, Database, Activity } from "lucide-react";
import { toast } from "sonner";

export default function AIRiskIdentificationEngine({ 
  controlTests = [], 
  incidents = [], 
  externalThreats = [],
  onRisksIdentified 
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [identifiedRisks, setIdentifiedRisks] = useState(null);

  const analyzeDataSources = async () => {
    setAnalyzing(true);
    try {
      // Prepare data sources
      const failedControls = controlTests.filter(t => t.test_result === 'failed').slice(0, 20);
      const recentIncidents = incidents.filter(i => i.status !== 'closed').slice(0, 20);
      const threats = externalThreats.slice(0, 15);

      const context = {
        control_failures: failedControls.map(t => ({
          control_name: t.control_name,
          failure_reason: t.failure_reason,
          domain: t.domain,
          test_date: t.test_date
        })),
        active_incidents: recentIncidents.map(i => ({
          type: i.incident_type,
          severity: i.severity,
          description: i.description,
          affected_systems: i.affected_systems
        })),
        external_threats: threats.map(t => ({
          threat_type: t.threat_type,
          severity: t.severity_level,
          description: t.description
        })),
        metrics: {
          control_failure_rate: failedControls.length / Math.max(controlTests.length, 1) * 100,
          incident_trend: recentIncidents.length,
          critical_threats: threats.filter(t => t.severity_level === 'critical').length
        }
      };

      const prompt = `As an expert risk analyst, analyze these diverse data sources to identify emerging and critical risks:

DATA SOURCES:
${JSON.stringify(context, null, 2)}

IDENTIFY AND SCORE RISKS:

For each identified risk, provide:
1. Risk title and description
2. Category (strategic/operational/financial/compliance/technology/cyber/third_party/reputational)
3. Data source(s) that triggered identification
4. AI-calculated likelihood score (1-5) based on data patterns
5. AI-calculated impact score (1-5) based on potential consequences
6. Confidence level (0-100%) in this risk identification
7. Supporting evidence from data sources
8. Urgency (immediate/high/medium/low)

Focus on:
- Pattern recognition across data sources
- Correlation between control failures and incidents
- Emerging threat alignment with internal weaknesses
- Risk amplification factors
- Critical vulnerabilities

Provide 5-10 most significant risks ranked by AI-calculated risk score.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_summary: { type: "string" },
            data_quality_score: { type: "number" },
            identified_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  subcategory: { type: "string" },
                  data_sources: { type: "array", items: { type: "string" } },
                  likelihood: { type: "number" },
                  impact: { type: "number" },
                  risk_score: { type: "number" },
                  confidence_level: { type: "number" },
                  supporting_evidence: { type: "array", items: { type: "string" } },
                  urgency: { type: "string" },
                  recommended_treatment: { type: "string" }
                }
              }
            },
            correlations_found: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  correlation: { type: "string" },
                  risk_amplification: { type: "string" }
                }
              }
            },
            recommended_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setIdentifiedRisks(result);
      toast.success(`AI identified ${result.identified_risks?.length || 0} risks`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze data sources");
    } finally {
      setAnalyzing(false);
    }
  };

  const createRiskFromIdentification = async (risk) => {
    try {
      const newRisk = {
        title: risk.title,
        description: risk.description,
        category: risk.category,
        subcategory: risk.subcategory,
        likelihood: risk.likelihood,
        impact: risk.impact,
        inherent_likelihood: risk.likelihood,
        inherent_impact: risk.impact,
        residual_likelihood: Math.max(1, risk.likelihood - 1),
        residual_impact: Math.max(1, risk.impact - 1),
        status: 'identified',
        risk_treatment_strategy: risk.recommended_treatment,
        mitigation_plan: `AI-Identified Risk\n\nData Sources: ${risk.data_sources.join(', ')}\n\nEvidence:\n${risk.supporting_evidence.join('\n')}\n\nConfidence: ${risk.confidence_level}%`,
        ai_generated: true
      };

      await base44.entities.Risk.create(newRisk);
      toast.success("Risk created in register");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create risk");
    }
  };

  const urgencyColors = {
    immediate: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/5 border border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 shadow-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg bg-gradient-to-r from-white via-purple-200 to-violet-300 bg-clip-text text-transparent">
                  AI Risk Identification Engine
                </CardTitle>
                <p className="text-sm text-slate-400 mt-0.5">Automated risk discovery from control tests, incidents & threat intelligence</p>
              </div>
            </div>
            <Button
              onClick={analyzeDataSources}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              {analyzing ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Analyze Data Sources</>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Data Source Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a2332] border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-slate-400">Control Tests</span>
              </div>
              <div className="text-2xl font-bold text-white">{controlTests.length}</div>
            </div>
            <div className="text-xs text-blue-400 mt-2">
              {controlTests.filter(t => t.test_result === 'failed').length} failures detected
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-sm text-slate-400">Active Incidents</span>
              </div>
              <div className="text-2xl font-bold text-white">{incidents.length}</div>
            </div>
            <div className="text-xs text-amber-400 mt-2">
              {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length} high severity
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-400" />
                <span className="text-sm text-slate-400">External Threats</span>
              </div>
              <div className="text-2xl font-bold text-white">{externalThreats.length}</div>
            </div>
            <div className="text-xs text-rose-400 mt-2">
              Live threat intelligence
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {identifiedRisks && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Analysis Summary</h3>
                <Badge className="bg-indigo-500/20 text-indigo-400">
                  Quality: {identifiedRisks.data_quality_score}%
                </Badge>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{identifiedRisks.analysis_summary}</p>
            </CardContent>
          </Card>

          {/* Identified Risks */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">
                Identified Risks ({identifiedRisks.identified_risks?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {identifiedRisks.identified_risks?.map((risk, idx) => (
                <Card key={idx} className="bg-[#151d2e] border-[#2a3548] hover:border-purple-500/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-white">{risk.title}</h4>
                          <Badge className={urgencyColors[risk.urgency]}>
                            {risk.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{risk.description}</p>
                      </div>
                      <Button
                        onClick={() => createRiskFromIdentification(risk)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 ml-4"
                      >
                        Create Risk
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-2 bg-[#1a2332] rounded border border-rose-500/20">
                        <div className="text-xs text-slate-400">Risk Score</div>
                        <div className="text-lg font-bold text-rose-400">{risk.risk_score}</div>
                      </div>
                      <div className="p-2 bg-[#1a2332] rounded border border-amber-500/20">
                        <div className="text-xs text-slate-400">Likelihood</div>
                        <div className="text-lg font-bold text-amber-400">{risk.likelihood}/5</div>
                      </div>
                      <div className="p-2 bg-[#1a2332] rounded border border-orange-500/20">
                        <div className="text-xs text-slate-400">Impact</div>
                        <div className="text-lg font-bold text-orange-400">{risk.impact}/5</div>
                      </div>
                      <div className="p-2 bg-[#1a2332] rounded border border-indigo-500/20">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="text-lg font-bold text-indigo-400">{risk.confidence_level}%</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-slate-500 mb-1.5 block">Data Sources:</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {risk.data_sources?.map((source, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-[#2a3548]">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-500 mb-1.5 block">Supporting Evidence:</Label>
                        <div className="space-y-1">
                          {risk.supporting_evidence?.slice(0, 3).map((evidence, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                              <span className="text-purple-400 mt-0.5">•</span>
                              <span>{evidence}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-500 mb-1.5 block">Recommended Treatment:</Label>
                        <Badge className="bg-emerald-500/20 text-emerald-400 capitalize">
                          {risk.recommended_treatment}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Correlations */}
          {identifiedRisks.correlations_found?.length > 0 && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  Risk Correlations Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {identifiedRisks.correlations_found.map((corr, idx) => (
                  <div key={idx} className="p-3 bg-[#151d2e] rounded border border-amber-500/20">
                    <p className="text-sm text-white mb-2">{corr.correlation}</p>
                    <p className="text-xs text-amber-400">{corr.risk_amplification}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}