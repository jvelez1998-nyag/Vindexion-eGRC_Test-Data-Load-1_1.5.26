import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Loader2, AlertTriangle, Shield, TrendingUp, XCircle, 
  AlertOctagon, CheckCircle2, Target, Activity, Brain, Play
} from "lucide-react";
import { toast } from "sonner";

export default function AIScenarioSimulator() {
  const [scenario, setScenario] = useState({
    name: "",
    description: "",
    threat_type: "cyber_attack",
    severity: "high",
    scope: "organization_wide",
    attack_vector: "",
    affected_systems: "",
    duration: "hours"
  });
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list()
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list()
  });

  const runSimulation = async () => {
    if (!scenario.name || !scenario.description) {
      toast.error("Please provide scenario name and description");
      return;
    }

    setSimulating(true);
    try {
      const controlsContext = controls.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        domain: c.domain,
        status: c.status,
        effectiveness: c.effectiveness,
        description: c.description
      }));

      const risksContext = risks.map(r => ({
        title: r.title,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        status: r.status
      }));

      const historicalIncidents = incidents.slice(0, 10).map(i => ({
        type: i.incident_type,
        severity: i.severity,
        impact: i.impact_assessment,
        root_cause: i.root_cause
      }));

      const prompt = `You are a cybersecurity and risk management expert. Analyze the following threat scenario and simulate its impact on the organization's control framework.

SCENARIO DETAILS:
Name: ${scenario.name}
Description: ${scenario.description}
Threat Type: ${scenario.threat_type}
Severity: ${scenario.severity}
Scope: ${scenario.scope}
Attack Vector: ${scenario.attack_vector || 'Not specified'}
Affected Systems: ${scenario.affected_systems || 'Not specified'}
Expected Duration: ${scenario.duration}

CURRENT CONTROL ENVIRONMENT:
Total Controls: ${controls.length}
Control Categories: ${[...new Set(controls.map(c => c.category))].join(', ')}
Control Domains: ${[...new Set(controls.map(c => c.domain))].join(', ')}

Top Controls:
${controlsContext.slice(0, 15).map(c => `- ${c.name} (${c.category}, ${c.domain}) - Status: ${c.status}, Effectiveness: ${c.effectiveness || 'N/A'}/5`).join('\n')}

CURRENT RISK LANDSCAPE:
${risksContext.slice(0, 10).map(r => `- ${r.title} (${r.category}) - L:${r.likelihood || 'N/A'}, I:${r.impact || 'N/A'}, Status: ${r.status}`).join('\n')}

HISTORICAL INCIDENTS:
${historicalIncidents.map(i => `- Type: ${i.type}, Severity: ${i.severity}`).join('\n')}

ANALYSIS REQUIRED:
1. Identify which controls would be DIRECTLY TESTED or STRESSED by this scenario
2. Predict which controls are likely to FAIL and provide failure probability (0-100%)
3. Identify controls that would be WEAKENED but might hold
4. Identify RESILIENT controls that would remain effective
5. Assess SYSTEMIC VULNERABILITIES and cascading failures
6. Provide CRITICAL GAPS in the control framework exposed by this scenario
7. Recommend IMMEDIATE actions and control reinforcements
8. Estimate overall organizational IMPACT SCORE (0-100)

Provide comprehensive, actionable analysis based on real-world threat scenarios.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            impact_score: { type: "number" },
            overall_assessment: { type: "string" },
            affected_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  control_id: { type: "string" },
                  impact_level: { type: "string" },
                  failure_probability: { type: "number" },
                  failure_reason: { type: "string" },
                  cascading_effects: { type: "string" }
                }
              }
            },
            weakened_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  stress_level: { type: "string" },
                  weakness_description: { type: "string" }
                }
              }
            },
            resilient_controls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  resilience_reason: { type: "string" }
                }
              }
            },
            systemic_vulnerabilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vulnerability: { type: "string" },
                  severity: { type: "string" },
                  affected_domains: { type: "string" },
                  cascading_risk: { type: "string" }
                }
              }
            },
            critical_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap_description: { type: "string" },
                  risk_exposure: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeframe: { type: "string" },
                  resource_requirement: { type: "string" }
                }
              }
            },
            timeline_projection: {
              type: "object",
              properties: {
                immediate: { type: "string" },
                short_term: { type: "string" },
                long_term: { type: "string" }
              }
            }
          }
        }
      });

      setResults(response);
      toast.success("Simulation completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Simulation failed. Please try again.");
    } finally {
      setSimulating(false);
    }
  };

  const getImpactColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'fail':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high':
      case 'severe':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium':
      case 'moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
      case 'minor':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'immediate':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high':
      case 'urgent':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">AI Scenario Simulator</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Simulate threat scenarios and predict control failures with AI-powered analysis
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scenario Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Scenario Name</label>
                <Input
                  value={scenario.name}
                  onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
                  placeholder="e.g., Ransomware Attack on Critical Infrastructure"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Threat Type</label>
                <Select value={scenario.threat_type} onValueChange={(val) => setScenario({ ...scenario, threat_type: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="cyber_attack" className="text-white">Cyber Attack</SelectItem>
                    <SelectItem value="data_breach" className="text-white">Data Breach</SelectItem>
                    <SelectItem value="ransomware" className="text-white">Ransomware</SelectItem>
                    <SelectItem value="insider_threat" className="text-white">Insider Threat</SelectItem>
                    <SelectItem value="supply_chain" className="text-white">Supply Chain Compromise</SelectItem>
                    <SelectItem value="ddos" className="text-white">DDoS Attack</SelectItem>
                    <SelectItem value="physical_security" className="text-white">Physical Security Breach</SelectItem>
                    <SelectItem value="regulatory_change" className="text-white">Regulatory Change</SelectItem>
                    <SelectItem value="natural_disaster" className="text-white">Natural Disaster</SelectItem>
                    <SelectItem value="system_failure" className="text-white">System Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Severity Level</label>
                <Select value={scenario.severity} onValueChange={(val) => setScenario({ ...scenario, severity: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="critical" className="text-white">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Attack Vector</label>
                <Input
                  value={scenario.attack_vector}
                  onChange={(e) => setScenario({ ...scenario, attack_vector: e.target.value })}
                  placeholder="e.g., Phishing email, SQL injection, Zero-day exploit"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Scenario Description</label>
                <Textarea
                  value={scenario.description}
                  onChange={(e) => setScenario({ ...scenario, description: e.target.value })}
                  placeholder="Describe the threat scenario in detail..."
                  className="bg-[#151d2e] border-[#2a3548] text-white h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Scope</label>
                <Select value={scenario.scope} onValueChange={(val) => setScenario({ ...scenario, scope: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="single_system" className="text-white">Single System</SelectItem>
                    <SelectItem value="department" className="text-white">Department</SelectItem>
                    <SelectItem value="division" className="text-white">Division</SelectItem>
                    <SelectItem value="organization_wide" className="text-white">Organization-wide</SelectItem>
                    <SelectItem value="multi_entity" className="text-white">Multi-entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Affected Systems</label>
                <Input
                  value={scenario.affected_systems}
                  onChange={(e) => setScenario({ ...scenario, affected_systems: e.target.value })}
                  placeholder="e.g., Email servers, databases, network infrastructure"
                  className="bg-[#151d2e] border-[#2a3548] text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Expected Duration</label>
                <Select value={scenario.duration} onValueChange={(val) => setScenario({ ...scenario, duration: val })}>
                  <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="minutes" className="text-white">Minutes</SelectItem>
                    <SelectItem value="hours" className="text-white">Hours</SelectItem>
                    <SelectItem value="days" className="text-white">Days</SelectItem>
                    <SelectItem value="weeks" className="text-white">Weeks</SelectItem>
                    <SelectItem value="months" className="text-white">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            onClick={runSimulation} 
            disabled={simulating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {simulating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run AI Simulation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Display */}
      {results && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Simulation Results</span>
              <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 text-base px-4 py-1">
                Impact Score: {results.impact_score}/100
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Executive Summary */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" />
                Executive Summary
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{results.executive_summary}</p>
            </div>

            {/* Overall Assessment */}
            <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <h3 className="text-sm font-semibold text-white mb-2">Overall Assessment</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{results.overall_assessment}</p>
            </div>

            <Tabs defaultValue="affected" className="w-full">
              <TabsList className="bg-[#151d2e] border border-[#2a3548]">
                <TabsTrigger value="affected">Affected Controls</TabsTrigger>
                <TabsTrigger value="weakened">Weakened Controls</TabsTrigger>
                <TabsTrigger value="resilient">Resilient Controls</TabsTrigger>
                <TabsTrigger value="vulnerabilities">Systemic Issues</TabsTrigger>
                <TabsTrigger value="gaps">Critical Gaps</TabsTrigger>
                <TabsTrigger value="actions">Recommendations</TabsTrigger>
              </TabsList>

              {/* Affected Controls */}
              <TabsContent value="affected" className="space-y-3 mt-4">
                {results.affected_controls?.map((control, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{control.control_name}</h4>
                          <Badge className={getImpactColor(control.impact_level)}>
                            {control.impact_level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Failure Probability</div>
                          <div className="text-2xl font-bold text-rose-400">{control.failure_probability}%</div>
                        </div>
                      </div>
                      <Progress value={control.failure_probability} className="h-2 mb-3 [&>div]:bg-rose-500" />
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Failure Reason:</span>
                          <p className="text-slate-300 mt-1">{control.failure_reason}</p>
                        </div>
                        {control.cascading_effects && (
                          <div>
                            <span className="text-slate-500">Cascading Effects:</span>
                            <p className="text-amber-400 mt-1">{control.cascading_effects}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Weakened Controls */}
              <TabsContent value="weakened" className="space-y-3 mt-4">
                {results.weakened_controls?.map((control, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{control.control_name}</h4>
                        <Badge className={getImpactColor(control.stress_level)}>
                          {control.stress_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">{control.weakness_description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Resilient Controls */}
              <TabsContent value="resilient" className="space-y-3 mt-4">
                {results.resilient_controls?.map((control, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-white mb-1">{control.control_name}</h4>
                          <p className="text-sm text-slate-400">{control.resilience_reason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Systemic Vulnerabilities */}
              <TabsContent value="vulnerabilities" className="space-y-3 mt-4">
                {results.systemic_vulnerabilities?.map((vuln, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{vuln.vulnerability}</h4>
                        <Badge className={getImpactColor(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Affected Domains:</span>
                          <p className="text-slate-300">{vuln.affected_domains}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Cascading Risk:</span>
                          <p className="text-orange-400">{vuln.cascading_risk}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Critical Gaps */}
              <TabsContent value="gaps" className="space-y-3 mt-4">
                {results.critical_gaps?.map((gap, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2">{gap.gap_description}</h4>
                        </div>
                        <Badge className={getPriorityColor(gap.priority)}>
                          {gap.priority}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Risk Exposure:</span>
                        <p className="text-rose-400 mt-1">{gap.risk_exposure}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Recommendations */}
              <TabsContent value="actions" className="space-y-3 mt-4">
                {results.recommendations?.map((rec, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} Priority
                        </Badge>
                        <Badge variant="outline" className="border-[#2a3548] text-slate-400">
                          {rec.timeframe}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-white mb-2">{rec.action}</h4>
                      <div className="text-sm text-slate-400">
                        <span className="text-slate-500">Resources Required:</span> {rec.resource_requirement}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {/* Timeline Projection */}
            {results.timeline_projection && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-[#151d2e] border-rose-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-rose-400 mb-2">Immediate (0-24h)</h4>
                    <p className="text-xs text-slate-400">{results.timeline_projection.immediate}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#151d2e] border-amber-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-amber-400 mb-2">Short-term (1-7 days)</h4>
                    <p className="text-xs text-slate-400">{results.timeline_projection.short_term}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#151d2e] border-blue-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Long-term (7+ days)</h4>
                    <p className="text-xs text-slate-400">{results.timeline_projection.long_term}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}