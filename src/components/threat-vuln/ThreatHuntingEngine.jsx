import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Crosshair, Search, Target, AlertTriangle, CheckCircle2, Loader2, Brain, Database, Radio, Activity, Code, BarChart3, TrendingUp, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, LineChart, Line } from "recharts";

const HUNT_TEMPLATES = [
  {
    value: "lateral_movement",
    label: "Lateral Movement Detection",
    description: "Hunt for signs of attackers moving laterally across network"
  },
  {
    value: "data_exfiltration",
    label: "Data Exfiltration",
    description: "Identify unusual data transfers or exfiltration attempts"
  },
  {
    value: "privilege_escalation",
    label: "Privilege Escalation",
    description: "Detect unauthorized privilege escalation activities"
  },
  {
    value: "persistence",
    label: "Persistence Mechanisms",
    description: "Find persistence techniques used by attackers"
  },
  {
    value: "command_control",
    label: "Command & Control",
    description: "Identify C2 communications and beaconing"
  }
];

export default function ThreatHuntingEngine() {
  const [hypothesis, setHypothesis] = useState("");
  const [template, setTemplate] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("guided");
  
  // Advanced query builder state
  const [queryBuilder, setQueryBuilder] = useState({
    dataSource: "siem",
    timeRange: "24h",
    filters: []
  });
  
  // External integrations state
  const [integrations, setIntegrations] = useState({
    virustotal: true,
    misp: true,
    alienvault: true,
    threatconnect: false
  });
  
  // Anomaly detection state
  const [anomalyResults, setAnomalyResults] = useState(null);
  const [behavioralResults, setBehavioralResults] = useState(null);

  const startHunt = async () => {
    if (!hypothesis && !template) {
      toast.error("Please provide a hypothesis or select a template");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const selectedTemplate = HUNT_TEMPLATES.find(t => t.value === template);
      
      const prompt = `You are a cybersecurity threat hunting expert. Conduct a threat hunting analysis based on the following:

${template ? `HUNT TEMPLATE: ${selectedTemplate.label}` : ''}
${template ? `TEMPLATE DESCRIPTION: ${selectedTemplate.description}` : ''}
HYPOTHESIS: ${hypothesis || 'Use the selected template to guide the hunt'}

Provide a comprehensive threat hunting report with the following sections:

## Hunt Overview
Brief summary of the threat hunting mission and hypothesis.

## IoCs (Indicators of Compromise)
List specific indicators to search for:
- Network indicators (IPs, domains, URLs)
- File indicators (hashes, file paths, names)
- Registry keys
- Process behaviors
- Authentication patterns

## Data Sources to Examine
List the log sources and data to analyze:
- SIEM logs
- EDR telemetry
- Network traffic
- Authentication logs
- Cloud logs
- etc.

## Hunting Queries
Provide specific queries or search patterns for:
- SIEM/Splunk queries
- KQL (Azure Sentinel)
- SQL queries for databases
- Command-line searches

## Expected Findings
What would indicate a positive finding for this hypothesis?

## Analysis Techniques
Methods to analyze the collected data:
- Timeline analysis
- Baseline comparison
- Anomaly detection
- Correlation analysis

## Remediation Actions
If threats are found, what actions should be taken?

## False Positive Considerations
Common false positives to be aware of and how to filter them.

Make this practical and actionable for a SOC analyst.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setResults(response);
      toast.success("Hunt analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Hunt analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const runAnomalyDetection = async () => {
    setLoading(true);
    try {
      const prompt = `Perform AI-driven anomaly detection and behavioral analysis to identify sophisticated threats and zero-day exploits.

ANALYSIS PARAMETERS:
Data Sources: ${queryBuilder.dataSource}
Time Range: ${queryBuilder.timeRange}
Active Integrations: ${Object.entries(integrations).filter(([k,v]) => v).map(([k]) => k).join(', ')}

Provide comprehensive anomaly detection analysis in JSON format:

{
  "anomalies_detected": [
    {
      "anomaly_id": "unique_id",
      "type": "behavioral/statistical/ml_based",
      "severity": "critical/high/medium/low",
      "confidence": 95,
      "description": "detailed description",
      "indicators": ["indicator1", "indicator2"],
      "baseline_deviation": "percentage",
      "affected_entities": ["entity1", "entity2"],
      "potential_threat": "threat description",
      "zero_day_likelihood": "high/medium/low"
    }
  ],
  "behavioral_patterns": [
    {
      "pattern_name": "pattern name",
      "description": "pattern description",
      "frequency": "count",
      "risk_score": 85,
      "entities_involved": ["entity1"],
      "timeline": ["event sequence"],
      "correlation_with_known_attacks": "description"
    }
  ],
  "threat_intel_matches": [
    {
      "source": "VirusTotal/MISP/AlienVault",
      "match_type": "IOC/signature/behavior",
      "confidence": 90,
      "threat_name": "threat name",
      "description": "match description"
    }
  ],
  "recommendations": ["action1", "action2"],
  "visualization_data": {
    "anomaly_timeline": [{"timestamp": "time", "count": 5, "severity": "high"}],
    "entity_risk_scores": [{"entity": "name", "score": 85}],
    "behavior_clustering": [{"x": 10, "y": 20, "cluster": "A", "risk": 75}]
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies_detected: { type: "array" },
            behavioral_patterns: { type: "array" },
            threat_intel_matches: { type: "array" },
            recommendations: { type: "array" },
            visualization_data: { type: "object" }
          }
        }
      });

      setAnomalyResults(response);
      toast.success(`Detected ${response.anomalies_detected?.length || 0} anomalies`);
    } catch (error) {
      console.error(error);
      toast.error("Anomaly detection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="guided">
            <Crosshair className="h-4 w-4 mr-2" />
            Guided Hunt
          </TabsTrigger>
          <TabsTrigger value="anomaly">
            <Brain className="h-4 w-4 mr-2" />
            AI Anomaly Detection
          </TabsTrigger>
          <TabsTrigger value="query">
            <Code className="h-4 w-4 mr-2" />
            Query Builder
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Radio className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="visualize">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visualizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guided">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-violet-400" />
            AI-Powered Threat Hunting
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Proactive threat detection using hypothesis-driven hunting
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Hunt Template (Optional)</label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                <SelectValue placeholder="Select a hunt template..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {HUNT_TEMPLATES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-white">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {template && (
              <p className="text-xs text-slate-500 mt-1">
                {HUNT_TEMPLATES.find(t => t.value === template)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Threat Hunting Hypothesis</label>
            <Textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="e.g., Adversaries may be using PowerShell to download and execute malicious payloads from external domains..."
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[120px]"
            />
          </div>

          <Button
            onClick={startHunt}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Start Threat Hunt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              Hunt Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactMarkdown
              className="prose prose-invert prose-sm max-w-none"
              components={{
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-white mt-6 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-violet-400" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-white mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-slate-300 mb-3 leading-relaxed text-sm">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1 mb-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-slate-300 flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                code: ({ inline, children }) => inline ? (
                  <code className="px-1.5 py-0.5 rounded bg-[#151d2e] text-violet-400 text-xs">
                    {children}
                  </code>
                ) : (
                  <code className="block px-3 py-2 rounded bg-[#151d2e] text-slate-300 text-xs my-2 overflow-x-auto">
                    {children}
                  </code>
                )
              }}
            >
              {results}
            </ReactMarkdown>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="anomaly" className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400" />
                AI-Driven Anomaly Detection
              </CardTitle>
              <p className="text-sm text-slate-400 mt-2">
                Machine learning-powered detection of sophisticated threats and zero-day exploits
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Data Source</label>
                  <Select value={queryBuilder.dataSource} onValueChange={(v) => setQueryBuilder({...queryBuilder, dataSource: v})}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="siem" className="text-white">SIEM Logs</SelectItem>
                      <SelectItem value="edr" className="text-white">EDR Telemetry</SelectItem>
                      <SelectItem value="network" className="text-white">Network Traffic</SelectItem>
                      <SelectItem value="cloud" className="text-white">Cloud Logs</SelectItem>
                      <SelectItem value="all" className="text-white">All Sources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Time Range</label>
                  <Select value={queryBuilder.timeRange} onValueChange={(v) => setQueryBuilder({...queryBuilder, timeRange: v})}>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="1h" className="text-white">Last 1 Hour</SelectItem>
                      <SelectItem value="24h" className="text-white">Last 24 Hours</SelectItem>
                      <SelectItem value="7d" className="text-white">Last 7 Days</SelectItem>
                      <SelectItem value="30d" className="text-white">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={runAnomalyDetection}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                Run Anomaly Detection
              </Button>
            </CardContent>
          </Card>

          {anomalyResults && (
            <div className="space-y-4">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm">Detected Anomalies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {anomalyResults.anomalies_detected?.map((anomaly, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge className={
                              anomaly.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                              anomaly.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }>
                              {anomaly.severity}
                            </Badge>
                            <Badge className="bg-indigo-500/20 text-indigo-400 ml-2">
                              Confidence: {anomaly.confidence}%
                            </Badge>
                            {anomaly.zero_day_likelihood === 'high' && (
                              <Badge className="bg-red-500/20 text-red-400 ml-2">
                                Possible Zero-Day
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-white font-medium mb-1">{anomaly.description}</p>
                        <p className="text-xs text-slate-400 mb-2">Baseline Deviation: {anomaly.baseline_deviation}</p>
                        {anomaly.indicators?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {anomaly.indicators.map((ind, i) => (
                              <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs">
                                {ind}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {anomalyResults.behavioral_patterns?.length > 0 && (
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-sm">Behavioral Patterns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {anomalyResults.behavioral_patterns.map((pattern, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">{pattern.pattern_name}</h4>
                          <Badge className="bg-amber-500/20 text-amber-400">
                            Risk: {pattern.risk_score}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{pattern.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {anomalyResults.threat_intel_matches?.length > 0 && (
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-sm">External Threat Intelligence Matches</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {anomalyResults.threat_intel_matches.map((match, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div>
                          <p className="text-sm text-white font-medium">{match.threat_name}</p>
                          <p className="text-xs text-slate-400">Source: {match.source}</p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          {match.confidence}% match
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="query">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-5 w-5 text-cyan-400" />
                Advanced Query Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Log Source</label>
                  <Select>
                    <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                      <SelectValue placeholder="Select log source..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                      <SelectItem value="siem" className="text-white">SIEM (Splunk/ELK)</SelectItem>
                      <SelectItem value="edr" className="text-white">EDR Platform</SelectItem>
                      <SelectItem value="cloud" className="text-white">Cloud Security Lake</SelectItem>
                      <SelectItem value="firewall" className="text-white">Firewall Logs</SelectItem>
                      <SelectItem value="proxy" className="text-white">Web Proxy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Field</label>
                    <Input placeholder="e.g., src_ip, user, process" className="bg-[#151d2e] border-[#2a3548] text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Operator</label>
                    <Select>
                      <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                        <SelectItem value="equals" className="text-white">Equals</SelectItem>
                        <SelectItem value="contains" className="text-white">Contains</SelectItem>
                        <SelectItem value="regex" className="text-white">Regex</SelectItem>
                        <SelectItem value="gt" className="text-white">Greater Than</SelectItem>
                        <SelectItem value="lt" className="text-white">Less Than</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Value</label>
                  <Input placeholder="Enter value or pattern" className="bg-[#151d2e] border-[#2a3548] text-white" />
                </div>

                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  + Add Filter Condition
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <p className="text-xs text-slate-500 mb-2">Generated Query:</p>
                <code className="text-xs text-cyan-400 font-mono">
                  index=security sourcetype=firewall action=blocked | stats count by src_ip | where count > 10
                </code>
              </div>

              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Search className="h-4 w-4 mr-2" />
                Execute Query
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-5 w-5 text-emerald-400" />
                External Threat Intelligence Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'virustotal', name: 'VirusTotal', description: 'File and URL reputation analysis' },
                  { id: 'misp', name: 'MISP', description: 'Threat intelligence sharing platform' },
                  { id: 'alienvault', name: 'AlienVault OTX', description: 'Open threat exchange' },
                  { id: 'threatconnect', name: 'ThreatConnect', description: 'Threat intelligence aggregation' },
                  { id: 'crowdstrike', name: 'CrowdStrike', description: 'Falcon intelligence feed' },
                  { id: 'recorded_future', name: 'Recorded Future', description: 'Real-time threat intelligence' }
                ].map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{platform.name}</p>
                        <p className="text-xs text-slate-400">{platform.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={integrations[platform.id] || false}
                      onCheckedChange={(checked) => setIntegrations({...integrations, [platform.id]: checked})}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualize">
          {anomalyResults?.visualization_data && (
            <div className="space-y-6">
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm">Anomaly Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={anomalyResults.visualization_data.anomaly_timeline || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm">Entity Risk Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={anomalyResults.visualization_data.entity_risk_scores || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="entity" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                      <Bar dataKey="score" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-sm">Behavior Clustering Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                      <XAxis dataKey="x" stroke="#94a3b8" />
                      <YAxis dataKey="y" stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548' }} />
                      <Scatter name="Behaviors" data={anomalyResults.visualization_data.behavior_clustering || []} fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          {!anomalyResults && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Run anomaly detection to view visualizations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}