import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PrivacySimulator() {
  const [scenario, setScenario] = useState(null);
  const [regulation, setRegulation] = useState('GDPR');
  const [scenarioType, setScenarioType] = useState('data_breach');
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarioTypes = [
    { value: 'data_breach', label: 'Data Breach Response' },
    { value: 'dsar', label: 'Data Subject Access Request' },
    { value: 'consent', label: 'Consent Violation' },
    { value: 'vendor', label: 'Third-Party Data Sharing' },
    { value: 'transfer', label: 'Cross-Border Transfer' },
    { value: 'retention', label: 'Retention Policy Issue' }
  ];

  const generateScenario = async () => {
    setLoading(true);
    setEvaluation(null);
    try {
      const prompt = `Generate a realistic ${regulation} privacy scenario for simulation training.

SCENARIO TYPE: ${scenarioType}
REGULATION: ${regulation}

Create a detailed, realistic scenario that:
1. Presents a complex privacy situation
2. Requires knowledge of ${regulation} requirements
3. Has multiple considerations and decision points
4. Tests practical application of privacy principles
5. Includes timeline pressures and stakeholder concerns

Return JSON with:
{
  "title": "scenario title",
  "situation": "detailed scenario description (2-3 paragraphs)",
  "context": "organizational context and background",
  "stakeholders": ["list of involved parties"],
  "timeframe": "time pressure context",
  "question": "What actions would you take and why?",
  "key_considerations": ["point 1", "point 2", "point 3"],
  "regulatory_requirements": ["requirement 1", "requirement 2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            situation: { type: "string" },
            context: { type: "string" },
            stakeholders: { type: "array", items: { type: "string" } },
            timeframe: { type: "string" },
            question: { type: "string" },
            key_considerations: { type: "array", items: { type: "string" } },
            regulatory_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });

      setScenario(response);
      setUserResponse('');
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate scenario");
    } finally {
      setLoading(false);
    }
  };

  const evaluateResponse = async () => {
    if (!userResponse.trim()) return;
    
    setLoading(true);
    try {
      const prompt = `Evaluate this response to a ${regulation} privacy scenario as an expert privacy assessor.

SCENARIO: ${scenario.situation}
KEY CONSIDERATIONS: ${JSON.stringify(scenario.key_considerations)}
REGULATORY REQUIREMENTS: ${JSON.stringify(scenario.regulatory_requirements)}

USER RESPONSE: ${userResponse}

Provide expert evaluation:
{
  "score": 0-100,
  "overall_assessment": "comprehensive feedback (2-3 sentences)",
  "strengths": ["what they did well"],
  "gaps": ["what's missing or incorrect"],
  "regulatory_accuracy": "assessment of regulatory understanding",
  "practical_application": "assessment of practical approach",
  "risk_management": "assessment of risk handling",
  "recommendations": ["specific improvement 1", "improvement 2"],
  "follow_up_questions": ["probing question 1", "probing question 2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            overall_assessment: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            gaps: { type: "array", items: { type: "string" } },
            regulatory_accuracy: { type: "string" },
            practical_application: { type: "string" },
            risk_management: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            follow_up_questions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setEvaluation(response);
      toast.success("Response evaluated");
    } catch (error) {
      console.error(error);
      toast.error("Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            Privacy Scenario Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Select value={regulation} onValueChange={setRegulation}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="GDPR" className="text-white">GDPR</SelectItem>
                <SelectItem value="CCPA" className="text-white">CCPA</SelectItem>
                <SelectItem value="HIPAA" className="text-white">HIPAA</SelectItem>
                <SelectItem value="PIPEDA" className="text-white">PIPEDA</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scenarioType} onValueChange={setScenarioType}>
              <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                {scenarioTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateScenario} disabled={loading} className="w-full bg-indigo-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : 'Generate New Scenario'}
          </Button>
        </CardContent>
      </Card>

      {scenario && (
        <>
          <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
            <CardHeader>
              <CardTitle className="text-base">{scenario.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-rose-400 mb-2">Situation:</h4>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{scenario.situation}</p>
              </div>

              {scenario.context && (
                <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Context:</h4>
                  <p className="text-xs text-slate-300">{scenario.context}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">Stakeholders:</h4>
                  <div className="flex flex-wrap gap-1">
                    {scenario.stakeholders?.map((s, i) => (
                      <Badge key={i} className="text-xs bg-purple-500/20 text-purple-400">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Timeframe:</h4>
                  <p className="text-xs text-slate-300">{scenario.timeframe}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <h4 className="text-sm font-semibold text-indigo-400 mb-2">{scenario.question}</h4>
              </div>
            </CardContent>
          </Card>

          {!evaluation && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="pt-6 space-y-4">
                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Describe your response to this scenario... Include specific actions, regulatory considerations, timeline, and risk mitigation."
                  className="bg-[#0f1623] border-[#2a3548] text-white min-h-48"
                />
                <Button onClick={evaluateResponse} disabled={!userResponse.trim() || loading} className="w-full bg-emerald-600">
                  {loading ? 'Evaluating...' : 'Submit for Evaluation'}
                </Button>
              </CardContent>
            </Card>
          )}

          {evaluation && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Evaluation Results</CardTitle>
                  <Badge className="text-lg">{evaluation.score}/100</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300">{evaluation.overall_assessment}</p>

                {evaluation.strengths?.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.gaps?.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {evaluation.gaps.map((g, i) => (
                        <li key={i}>• {g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Regulatory Accuracy</div>
                    <p className="text-xs text-slate-300">{evaluation.regulatory_accuracy}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Practical Application</div>
                    <p className="text-xs text-slate-300">{evaluation.practical_application}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Risk Management</div>
                    <p className="text-xs text-slate-300">{evaluation.risk_management}</p>
                  </div>
                </div>

                <Button onClick={() => {setScenario(null); setEvaluation(null);}} variant="outline" className="w-full">
                  Try New Scenario
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}