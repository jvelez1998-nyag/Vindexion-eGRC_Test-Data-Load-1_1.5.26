import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2,
  Target,
  Loader2,
  Shield,
  Activity
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const INCIDENT_SCENARIOS = [
  {
    value: "ransomware",
    label: "Ransomware Attack",
    description: "Simulate a ransomware encryption scenario affecting critical systems"
  },
  {
    value: "data_breach",
    label: "Data Breach",
    description: "Simulate unauthorized access and data exfiltration"
  },
  {
    value: "phishing_campaign",
    label: "Large-Scale Phishing Campaign",
    description: "Simulate widespread phishing attack targeting employees"
  },
  {
    value: "insider_threat",
    label: "Insider Threat",
    description: "Simulate malicious or negligent insider action"
  },
  {
    value: "ddos",
    label: "DDoS Attack",
    description: "Simulate distributed denial of service attack"
  },
  {
    value: "supply_chain",
    label: "Supply Chain Compromise",
    description: "Simulate compromise through third-party vendor"
  },
  {
    value: "zero_day",
    label: "Zero-Day Exploit",
    description: "Simulate attack using unknown vulnerability"
  },
  {
    value: "custom",
    label: "Custom Scenario",
    description: "Define your own incident scenario"
  }
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Low Impact" },
  { value: "medium", label: "Medium Impact" },
  { value: "high", label: "High Impact" },
  { value: "critical", label: "Critical Impact" }
];

export default function AIIncidentSimulator() {
  const [scenario, setScenario] = useState("");
  const [severity, setSeverity] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [affectedSystems, setAffectedSystems] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!scenario || !severity) {
      toast.error("Please select scenario and severity");
      return;
    }

    setLoading(true);
    setSimulation(null);

    try {
      const selectedScenario = INCIDENT_SCENARIOS.find(s => s.value === scenario);
      
      const prompt = `You are an expert incident response consultant. Simulate the following security incident scenario and provide a comprehensive analysis.

SCENARIO: ${selectedScenario?.label || "Custom Scenario"}
SEVERITY: ${severity}
DESCRIPTION: ${scenario === 'custom' ? customDetails : selectedScenario?.description}
${affectedSystems ? `AFFECTED SYSTEMS: ${affectedSystems}` : ''}

Provide a detailed simulation output in the following structure:

## Executive Summary
Brief overview of the simulated incident and its potential impact (2-3 sentences).

## Risk Impact Analysis
### Business Impact
- Financial losses (estimated range)
- Operational disruption (downtime, productivity)
- Reputational damage
- Customer/stakeholder impact

### Technical Impact
- Systems affected
- Data compromised/at risk
- Infrastructure vulnerabilities exposed
- Potential for lateral movement

### Compliance & Legal Impact
- Regulatory requirements triggered
- Notification obligations
- Potential fines and penalties
- Legal exposure

## Immediate Remediation Steps
Provide 5-7 prioritized actions to contain and remediate the incident:
1. [Critical first step]
2. [Second priority action]
(Continue with specific, actionable steps)

## Recommended Response Strategy
### Short-term (0-24 hours)
- [Actions needed in first 24 hours]

### Medium-term (1-7 days)
- [Actions for first week]

### Long-term (1+ months)
- [Strategic improvements]

## Post-Incident Recommendations
### Process Improvements
- [Specific process changes needed]

### Technical Controls
- [Security controls to implement]

### Training & Awareness
- [Training recommendations]

### Policy Updates
- [Policy/procedure changes]

## Key Metrics to Track
- Mean Time to Detect (MTTD)
- Mean Time to Contain (MTTC)
- Mean Time to Recover (MTTR)
- Number of affected users/systems
- Cost of incident response

## Lessons Learned
- [Key takeaways from simulation]
- [Prevention strategies for future]

Provide realistic, actionable guidance based on industry best practices and frameworks (NIST, ISO 27035, SANS).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSimulation(response);
      toast.success("Simulation completed");
    } catch (error) {
      console.error(error);
      toast.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI-Powered Incident Simulation
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Simulate security incidents to understand impacts and test your response capabilities
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Incident Scenario</label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select scenario..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {INCIDENT_SCENARIOS.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scenario && scenario !== 'custom' && (
                <p className="text-xs text-slate-500 mt-1">
                  {INCIDENT_SCENARIOS.find(s => s.value === scenario)?.description}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Severity Level</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue placeholder="Select severity..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {SEVERITY_LEVELS.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {scenario === 'custom' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Custom Scenario Details</label>
              <Textarea
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Describe your custom incident scenario in detail..."
                className="bg-[#151d2e] border-[#2a3548] text-white min-h-[100px]"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Affected Systems (Optional)</label>
            <Textarea
              value={affectedSystems}
              onChange={(e) => setAffectedSystems(e.target.value)}
              placeholder="e.g., Production web servers, customer database, email system..."
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <Button
            onClick={runSimulation}
            disabled={loading || !scenario || !severity}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run AI Simulation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulation && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Simulation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px]">
              <div className="pr-4">
                <ReactMarkdown
                  className="prose prose-invert prose-sm max-w-none"
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-400" />
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-white mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-slate-300 mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 mb-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 mb-4 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">
                        {children}
                      </strong>
                    ),
                    code: ({ inline, children }) => inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-[#151d2e] text-indigo-400 text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className="block px-3 py-2 rounded bg-[#151d2e] text-slate-300 text-sm my-2 overflow-x-auto">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-500/5 rounded-r">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {simulation}
                </ReactMarkdown>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                        <h4 className="font-semibold text-white text-sm">Risk Level</h4>
                      </div>
                      <Badge className="bg-rose-500/20 text-rose-400 text-sm">
                        {severity.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-amber-400" />
                        <h4 className="font-semibold text-white text-sm">Scenario</h4>
                      </div>
                      <p className="text-xs text-slate-300">
                        {INCIDENT_SCENARIOS.find(s => s.value === scenario)?.label || "Custom"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        <h4 className="font-semibold text-white text-sm">Status</h4>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-sm">
                        Completed
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      {!simulation && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm">Simulation Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e]">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Use for Training</p>
                  <p className="text-xs text-slate-400">Run simulations to train your incident response team</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e]">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Test Response Plans</p>
                  <p className="text-xs text-slate-400">Validate your incident response playbooks and procedures</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e]">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Identify Gaps</p>
                  <p className="text-xs text-slate-400">Discover weaknesses in your security controls and processes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#151d2e]">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Executive Briefings</p>
                  <p className="text-xs text-slate-400">Use simulation results for risk awareness and budget justification</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}