import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VendorRiskSimulator() {
  const [scenario, setScenario] = useState("vendor_breach");
  const [response, setResponse] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    { value: "vendor_breach", label: "Vendor Data Breach", severity: "critical" },
    { value: "sla_violation", label: "SLA Violation", severity: "high" },
    { value: "contract_renewal", label: "Contract Renewal Assessment", severity: "medium" },
    { value: "vendor_bankruptcy", label: "Vendor Financial Distress", severity: "critical" },
    { value: "audit_failure", label: "Failed Vendor Audit", severity: "high" }
  ];

  const scenarioDetails = {
    vendor_breach: "Your critical SaaS vendor has reported a data breach affecting customer data. Initial reports suggest unauthorized access to production databases. What is your immediate response plan?",
    sla_violation: "Your vendor has missed the agreed 99.9% uptime SLA for three consecutive months, causing service disruptions. How do you address this with the vendor?",
    contract_renewal: "A strategic vendor's contract is up for renewal. Recent performance has been inconsistent, and a cheaper competitor has approached you. How do you evaluate this decision?",
    vendor_bankruptcy: "You've learned that a critical vendor is facing bankruptcy proceedings. They provide essential services with no immediate alternative. What actions do you take?",
    audit_failure: "Your annual vendor audit revealed significant security control deficiencies, including lack of MFA and unpatched systems. How do you respond?"
  };

  const simulateScenario = async () => {
    if (!response.trim()) {
      toast.error("Please provide your response");
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Evaluate this vendor risk management response:

Scenario: ${scenarios.find(s => s.value === scenario)?.label}
Scenario Details: ${scenarioDetails[scenario]}

User Response: ${response}

Evaluate the response based on:
1. Completeness - Did they address all key aspects?
2. Risk Assessment - Did they properly assess the risk?
3. Stakeholder Communication - Did they consider communication plans?
4. Remediation - Did they outline clear remediation steps?
5. Compliance - Did they consider regulatory/contractual obligations?

Provide:
- Overall score (0-100)
- Detailed feedback on strengths and weaknesses
- What they missed
- Best practice recommendations
- Next steps they should take`,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            rating: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            missed_points: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            next_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      setEvaluation(result);
      toast.success("Response evaluated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to evaluate response");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setResponse("");
    setEvaluation(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5" />
            Vendor Risk Scenario Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Practice responding to real-world vendor risk scenarios and get AI-powered feedback
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white">Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select value={scenario} onValueChange={(v) => { setScenario(v); resetSimulation(); }}>
                <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  {scenarios.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-white">
                      <div className="flex items-center justify-between w-full">
                        <span>{s.label}</span>
                        <Badge className={`ml-2 ${
                          s.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                          s.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {s.severity}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Scenario Details</h4>
                  <p className="text-sm text-slate-300">{scenarioDetails[scenario]}</p>
                </div>
              </div>
            </div>

            <div>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter your response to this scenario... Consider immediate actions, stakeholder communication, risk assessment, and remediation plans."
                className="bg-[#0f1623] border-[#2a3548] text-white min-h-[300px]"
              />
            </div>

            <Button
              onClick={simulateScenario}
              disabled={loading || !response.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Evaluate Response
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white">Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            {!evaluation ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Submit your response to receive detailed feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div>
                    <p className="text-sm text-slate-400">Overall Score</p>
                    <p className="text-3xl font-bold text-white">{evaluation.score}/100</p>
                  </div>
                  <Badge className={`${
                    evaluation.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    evaluation.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  } text-base px-3 py-1`}>
                    {evaluation.rating}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {evaluation.strengths?.map((s, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-amber-400 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {evaluation.weaknesses?.map((w, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {evaluation.recommendations?.map((r, idx) => (
                        <li key={idx} className="text-sm text-slate-300">• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button onClick={resetSimulation} variant="outline" className="w-full border-[#2a3548]">
                  Try Another Scenario
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}