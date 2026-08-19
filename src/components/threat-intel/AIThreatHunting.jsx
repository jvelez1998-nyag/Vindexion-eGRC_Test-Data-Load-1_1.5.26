import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Brain, 
  Target,
  AlertTriangle,
  Loader2,
  Zap,
  Eye,
  TrendingUp,
  Activity,
  Lock,
  FileWarning,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIThreatHunting({ threatIntel, grcData }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  const performThreatHunting = async () => {
    setLoading(true);
    try {
      const prompt = `You are an elite cybersecurity threat hunter specializing in GRC data protection and proactive threat detection.

CURRENT THREAT INTELLIGENCE:
${threatIntel ? JSON.stringify(threatIntel, null, 2) : 'No external threat intelligence available'}

ORGANIZATIONAL GRC DATA SUMMARY:
- Total Risks: ${grcData?.risks?.length || 0}
- High/Critical Risks: ${grcData?.risks?.filter(r => ((r.residual_likelihood || 0) * (r.residual_impact || 0)) >= 9).length || 0}
- Total Controls: ${grcData?.controls?.length || 0}
- Ineffective Controls: ${grcData?.controls?.filter(c => c.status === 'ineffective').length || 0}
- Open Incidents: ${grcData?.incidents?.filter(i => i.status === 'open' || i.status === 'investigating').length || 0}
- Critical Findings: ${grcData?.findings?.filter(f => f.severity === 'critical').length || 0}
- Compliance Gaps: ${grcData?.compliance?.filter(c => c.status === 'non_compliant').length || 0}

GRC-SPECIFIC THREAT CONTEXT:
- Risk Assessment Data
- Control Effectiveness Data
- Audit Findings
- Compliance Status
- Incident History

MISSION: Perform advanced threat hunting analysis with the following objectives:

1. **Anomaly Detection** (5-7 anomalies):
   - Identify unusual patterns in risk assessments
   - Detect suspicious control failures
   - Flag abnormal incident frequencies
   - Identify compliance drift patterns
   - Detect data integrity anomalies
   - Provide severity rating and confidence level for each

2. **Attack Vector Predictions** (Top 5):
   - Based on threat intelligence and GRC vulnerabilities
   - Attack vectors specifically targeting GRC data/systems
   - Exploitation of control gaps
   - Insider threat scenarios
   - Supply chain risks
   - Each with likelihood percentage and impact assessment

3. **Threat Actor Profiling**:
   - Likely threat actor types based on intelligence
   - Typical tactics, techniques, and procedures (TTPs)
   - Motivation and targeting criteria
   - Preferred attack methods

4. **Preemptive Security Measures** (Top 10):
   - Prioritized by effectiveness and urgency
   - Specific to identified threats
   - Actionable and implementable
   - Mapped to MITRE ATT&CK or similar frameworks
   - Include estimated effort and impact

5. **Vulnerable GRC Assets**:
   - Systems, data, or processes at highest risk
   - Specific vulnerabilities in GRC infrastructure
   - Exploitable control weaknesses
   - Data exposure risks

6. **Threat Intelligence Correlation**:
   - How current threat landscape correlates with GRC posture
   - Specific CVEs or threats relevant to GRC systems
   - Emerging threats not yet addressed
   - Intelligence-driven recommendations

7. **Hunting Hypotheses** (5 testable hypotheses):
   - Specific threat scenarios to investigate
   - Evidence to look for
   - Detection methods
   - Expected indicators of compromise (IOCs)

Provide detailed, actionable intelligence with specific technical recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: !threatIntel,
        response_json_schema: {
          type: "object",
          properties: {
            threat_score: { type: "number", description: "Overall threat score 0-100" },
            executive_summary: { type: "string" },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  anomaly_name: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  confidence: { type: "number" },
                  affected_area: { type: "string" },
                  indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            attack_vectors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vector_name: { type: "string" },
                  description: { type: "string" },
                  likelihood_percentage: { type: "number" },
                  potential_impact: { type: "string" },
                  target_assets: { type: "array", items: { type: "string" } },
                  exploitation_method: { type: "string" },
                  mitre_mapping: { type: "string" }
                }
              }
            },
            threat_actors: {
              type: "object",
              properties: {
                likely_actors: { type: "array", items: { type: "string" } },
                ttps: { type: "array", items: { type: "string" } },
                motivation: { type: "string" },
                sophistication_level: { type: "string" }
              }
            },
            security_measures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  measure: { type: "string" },
                  description: { type: "string" },
                  effectiveness: { type: "string" },
                  effort: { type: "string" },
                  mitre_coverage: { type: "array", items: { type: "string" } },
                  implementation_steps: { type: "array", items: { type: "string" } }
                }
              }
            },
            vulnerable_assets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  asset: { type: "string" },
                  vulnerability: { type: "string" },
                  risk_level: { type: "string" },
                  remediation: { type: "string" }
                }
              }
            },
            threat_correlation: {
              type: "object",
              properties: {
                correlation_summary: { type: "string" },
                relevant_cves: { type: "array", items: { type: "string" } },
                emerging_threats: { type: "array", items: { type: "string" } },
                intelligence_recommendations: { type: "array", items: { type: "string" } }
              }
            },
            hunting_hypotheses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hypothesis: { type: "string" },
                  evidence_to_collect: { type: "array", items: { type: "string" } },
                  detection_method: { type: "string" },
                  iocs: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setAnalysis(response);
      toast.success("Threat hunting analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to perform threat hunting analysis");
    } finally {
      setLoading(false);
    }
  };

  const runSimulatedScenario = async (scenario) => {
    setSimulationRunning(true);
    try {
      const prompt = `You are a cybersecurity simulation expert. Run a detailed threat simulation for the following scenario:

SCENARIO: ${scenario}

ORGANIZATIONAL CONTEXT:
${JSON.stringify(grcData, null, 2)}

THREAT INTELLIGENCE:
${threatIntel ? JSON.stringify(threatIntel, null, 2) : 'None'}

Simulate this attack scenario and provide:

1. **Attack Timeline** (detailed step-by-step):
   - Initial access
   - Lateral movement
   - Privilege escalation
   - Data exfiltration/impact
   - Each step with timestamps and detection opportunities

2. **Impact Assessment**:
   - Affected GRC assets
   - Data compromised
   - Business impact
   - Regulatory implications
   - Financial estimates

3. **Detection Opportunities**:
   - Points where the attack could be detected
   - Required detection capabilities
   - Alert signatures
   - Log indicators

4. **Response Actions**:
   - Immediate containment steps
   - Investigation procedures
   - Recovery actions
   - Post-incident activities

5. **Lessons Learned**:
   - Control gaps exploited
   - Detection blind spots
   - Response effectiveness
   - Preventive measures

6. **Simulation Metrics**:
   - Time to detection
   - Time to containment
   - Recovery time
   - Overall effectiveness score (0-100)

Provide realistic, detailed simulation results.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_name: { type: "string" },
            simulation_date: { type: "string" },
            overall_effectiveness: { type: "number" },
            attack_timeline: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  phase: { type: "string" },
                  action: { type: "string" },
                  detection_opportunity: { type: "boolean" },
                  detection_method: { type: "string" }
                }
              }
            },
            impact_assessment: {
              type: "object",
              properties: {
                affected_assets: { type: "array", items: { type: "string" } },
                data_compromised: { type: "array", items: { type: "string" } },
                business_impact: { type: "string" },
                regulatory_impact: { type: "string" },
                financial_estimate: { type: "string" }
              }
            },
            detection_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  checkpoint: { type: "string" },
                  detection_capability: { type: "string" },
                  alert_signature: { type: "string" },
                  log_indicators: { type: "array", items: { type: "string" } }
                }
              }
            },
            response_actions: {
              type: "object",
              properties: {
                containment: { type: "array", items: { type: "string" } },
                investigation: { type: "array", items: { type: "string" } },
                recovery: { type: "array", items: { type: "string" } },
                post_incident: { type: "array", items: { type: "string" } }
              }
            },
            lessons_learned: {
              type: "object",
              properties: {
                control_gaps: { type: "array", items: { type: "string" } },
                detection_blind_spots: { type: "array", items: { type: "string" } },
                response_effectiveness: { type: "string" },
                preventive_measures: { type: "array", items: { type: "string" } }
              }
            },
            metrics: {
              type: "object",
              properties: {
                time_to_detection: { type: "string" },
                time_to_containment: { type: "string" },
                recovery_time: { type: "string" },
                effectiveness_score: { type: "number" }
              }
            }
          }
        }
      });

      setSimulationResults(response);
      toast.success("Threat simulation completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run threat simulation");
    } finally {
      setSimulationRunning(false);
    }
  };

  const predefinedScenarios = [
    "Ransomware attack targeting GRC documentation and audit evidence",
    "Insider threat exfiltrating sensitive risk assessment data",
    "Supply chain compromise affecting control effectiveness monitoring",
    "Advanced persistent threat (APT) targeting compliance reporting systems",
    "Social engineering attack to bypass security controls"
  ];

  if (!analysis) {
    return (
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <Shield className="h-16 w-16 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Threat Hunting</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-4">
                Deploy advanced AI to hunt for threats, detect anomalies, predict attack vectors, 
                and simulate security scenarios based on current intelligence.
              </p>
              <div className="flex items-center gap-2 justify-center text-sm text-slate-500 mb-6">
                <Brain className="h-4 w-4" />
                <span>Proactive threat detection powered by AI</span>
              </div>
            </div>
            <Button 
              onClick={performThreatHunting}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Hunting Threats...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  Start Threat Hunt
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
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <Target className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Threat Hunting Results</h3>
            <p className="text-sm text-slate-400">AI-powered proactive threat detection</p>
          </div>
        </div>
        <Button onClick={performThreatHunting} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          <Brain className="h-4 w-4 mr-2" />
          Re-scan
        </Button>
      </div>

      {/* Threat Score */}
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Overall Threat Level</h4>
              <p className="text-sm text-slate-300">{analysis.executive_summary}</p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${analysis.threat_score >= 75 ? 'text-red-400' : analysis.threat_score >= 50 ? 'text-orange-400' : 'text-yellow-400'}`}>
                {analysis.threat_score}
              </div>
              <div className="text-xs text-slate-400">Threat Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="anomalies" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="anomalies">
            <Eye className="h-4 w-4 mr-2" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="vectors">
            <Zap className="h-4 w-4 mr-2" />
            Attack Vectors
          </TabsTrigger>
          <TabsTrigger value="actors">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Threat Actors
          </TabsTrigger>
          <TabsTrigger value="measures">
            <Lock className="h-4 w-4 mr-2" />
            Security Measures
          </TabsTrigger>
          <TabsTrigger value="hypotheses">
            <FileWarning className="h-4 w-4 mr-2" />
            Hunting Hypotheses
          </TabsTrigger>
          <TabsTrigger value="simulation">
            <PlayCircle className="h-4 w-4 mr-2" />
            Threat Simulation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.anomalies.map((anomaly, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white">{anomaly.anomaly_name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={`${anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'} border-0`}>
                          {anomaly.severity}
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {anomaly.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{anomaly.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs text-slate-500">Affected: {anomaly.affected_area}</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2">Indicators:</div>
                      <div className="space-y-1">
                        {anomaly.indicators.map((indicator, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            {indicator}
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

        <TabsContent value="vectors">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.attack_vectors.map((vector, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white flex-1">{vector.vector_name}</h4>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${vector.likelihood_percentage >= 70 ? 'text-red-400' : vector.likelihood_percentage >= 40 ? 'text-amber-400' : 'text-yellow-400'}`}>
                          {vector.likelihood_percentage}%
                        </div>
                        <div className="text-xs text-slate-400">Likelihood</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{vector.description}</p>
                    <div className="space-y-2 mb-3">
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">Impact:</span> {vector.potential_impact}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">Exploitation:</span> {vector.exploitation_method}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">MITRE:</span> {vector.mitre_mapping}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2">Target Assets:</div>
                      <div className="flex flex-wrap gap-2">
                        {vector.target_assets.map((asset, i) => (
                          <Badge key={i} className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs">
                            {asset}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="actors">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Threat Actor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-400 mb-2">Likely Threat Actors:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.threat_actors.likely_actors.map((actor, i) => (
                      <Badge key={i} className="bg-red-500/20 text-red-400 border-red-500/30">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-400 mb-2">Tactics, Techniques, and Procedures (TTPs):</h5>
                  <ul className="space-y-1">
                    {analysis.threat_actors.ttps.map((ttp, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">→</span>
                        {ttp}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-slate-400 mb-1">Motivation:</h5>
                    <p className="text-sm text-white">{analysis.threat_actors.motivation}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-400 mb-1">Sophistication:</h5>
                    <p className="text-sm text-white">{analysis.threat_actors.sophistication_level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Vulnerable Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.vulnerable_assets.map((asset, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-white text-sm">{asset.asset}</h5>
                        <Badge className={`${asset.risk_level === 'critical' || asset.risk_level === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'} border-0 text-xs`}>
                          {asset.risk_level}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">
                        <span className="font-medium">Vulnerability:</span> {asset.vulnerability}
                      </p>
                      <p className="text-xs text-emerald-400">
                        <span className="font-medium">Remediation:</span> {asset.remediation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base">Threat Intelligence Correlation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">{analysis.threat_correlation.correlation_summary}</p>
                <div>
                  <h5 className="text-sm font-medium text-slate-400 mb-2">Relevant CVEs:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.threat_correlation.relevant_cves.map((cve, i) => (
                      <Badge key={i} className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        {cve}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-400 mb-2">Emerging Threats:</h5>
                  <ul className="space-y-1">
                    {analysis.threat_correlation.emerging_threats.map((threat, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        {threat}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="measures">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {analysis.security_measures.map((measure, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                          {measure.priority}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">{measure.measure}</h4>
                        <p className="text-sm text-slate-400 mb-3">{measure.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            {measure.effectiveness}
                          </Badge>
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                            {measure.effort} effort
                          </Badge>
                        </div>
                        {measure.mitre_coverage.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-slate-500 mb-1">MITRE Coverage:</div>
                            <div className="flex flex-wrap gap-1">
                              {measure.mitre_coverage.map((mitre, i) => (
                                <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                                  {mitre}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">Implementation:</div>
                          <ol className="space-y-1">
                            {measure.implementation_steps.map((step, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="hypotheses">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.hunting_hypotheses.map((hypo, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-white mb-3">{hypo.hypothesis}</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-2">Evidence to Collect:</div>
                        <ul className="space-y-1">
                          {hypo.evidence_to_collect.map((evidence, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">▸</span>
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-1">Detection Method:</div>
                        <p className="text-sm text-white">{hypo.detection_method}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-2">Indicators of Compromise (IOCs):</div>
                        <div className="space-y-1">
                          {hypo.iocs.map((ioc, i) => (
                            <div key={i} className="text-xs text-red-400 font-mono bg-[#0f1623] p-2 rounded">
                              {ioc}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="simulation">
          {!simulationResults ? (
            <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-white mb-4">Threat Scenario Simulation</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Run realistic attack simulations to test your defenses and identify gaps
                </p>
                <div className="space-y-3">
                  {predefinedScenarios.map((scenario, idx) => (
                    <Button
                      key={idx}
                      onClick={() => runSimulatedScenario(scenario)}
                      disabled={simulationRunning}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 border-[#2a3548] hover:bg-[#2a3548]"
                    >
                      <PlayCircle className="h-4 w-4 mr-3 flex-shrink-0 text-purple-400" />
                      <span className="text-sm text-white">{scenario}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6 pr-4">
                <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{simulationResults.scenario_name}</h3>
                        <p className="text-xs text-slate-400">Simulated on {simulationResults.simulation_date}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${simulationResults.overall_effectiveness >= 75 ? 'text-emerald-400' : simulationResults.overall_effectiveness >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {simulationResults.overall_effectiveness}
                        </div>
                        <div className="text-xs text-slate-400">Effectiveness Score</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setSimulationResults(null)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      Run New Simulation
                    </Button>
                  </CardContent>
                </Card>

                {/* Attack Timeline */}
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Attack Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {simulationResults.attack_timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          {idx < simulationResults.attack_timeline.length - 1 && (
                            <div className="absolute left-4 top-10 bottom-0 w-px bg-[#2a3548]" />
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.detection_opportunity ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                            <span className="text-xs font-bold">{idx + 1}</span>
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-slate-500">{event.time}</span>
                              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                                {event.phase}
                              </Badge>
                              {event.detection_opportunity && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                                  Detectable
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white mb-1">{event.action}</p>
                            {event.detection_method && (
                              <p className="text-xs text-slate-400">→ {event.detection_method}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Assessment */}
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Impact Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Affected Assets:</h5>
                      <div className="flex flex-wrap gap-2">
                        {simulationResults.impact_assessment.affected_assets.map((asset, i) => (
                          <Badge key={i} className="bg-red-500/20 text-red-400 border-red-500/30">
                            {asset}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Data Compromised:</h5>
                      <div className="flex flex-wrap gap-2">
                        {simulationResults.impact_assessment.data_compromised.map((data, i) => (
                          <Badge key={i} className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-400 mb-1">Business Impact:</h5>
                        <p className="text-sm text-white">{simulationResults.impact_assessment.business_impact}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-slate-400 mb-1">Regulatory Impact:</h5>
                        <p className="text-sm text-white">{simulationResults.impact_assessment.regulatory_impact}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-slate-400 mb-1">Financial Estimate:</h5>
                      <p className="text-lg font-bold text-red-400">{simulationResults.impact_assessment.financial_estimate}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Lessons Learned */}
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Lessons Learned</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-red-400 mb-2">Control Gaps Exploited:</h5>
                      <ul className="space-y-1">
                        {simulationResults.lessons_learned.control_gaps.map((gap, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">!</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-amber-400 mb-2">Detection Blind Spots:</h5>
                      <ul className="space-y-1">
                        {simulationResults.lessons_learned.detection_blind_spots.map((spot, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">⚠</span>
                            {spot}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-emerald-400 mb-2">Preventive Measures:</h5>
                      <ul className="space-y-1">
                        {simulationResults.lessons_learned.preventive_measures.map((measure, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics */}
                <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-base">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Time to Detection</div>
                        <div className="text-lg font-semibold text-white">{simulationResults.metrics.time_to_detection}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Time to Containment</div>
                        <div className="text-lg font-semibold text-white">{simulationResults.metrics.time_to_containment}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Recovery Time</div>
                        <div className="text-lg font-semibold text-white">{simulationResults.metrics.recovery_time}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Effectiveness</div>
                        <div className="text-lg font-semibold text-emerald-400">{simulationResults.metrics.effectiveness_score}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}