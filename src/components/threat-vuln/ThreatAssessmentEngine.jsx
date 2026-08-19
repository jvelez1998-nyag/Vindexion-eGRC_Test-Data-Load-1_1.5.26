import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Brain, Target, Shield, AlertTriangle, CheckCircle2, Loader2, Zap, TrendingUp } from "lucide-react";

export default function ThreatAssessmentEngine({ onComplete }) {
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState({
    title: "",
    assessment_type: "threat_landscape",
    methodology: "STRIDE",
    description: "",
    scope: "",
    status: "planning"
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ThreatAssessment.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threat-assessments'] });
      toast.success("Threat assessment created");
      onComplete?.(data);
    }
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const prompt = `Perform comprehensive threat assessment:

ASSESSMENT DETAILS:
- Type: ${assessment.assessment_type}
- Methodology: ${assessment.methodology}
- Scope: ${assessment.scope}
- Description: ${assessment.description}

Generate a detailed threat assessment including:
1. Threat landscape analysis
2. Attack scenarios (5-8 scenarios)
3. Attack paths with MITRE ATT&CK mapping
4. Control gaps identified
5. Risk scoring (0-100)
6. Prioritized recommendations
7. Executive summary

Return structured JSON with:
- threat_landscape_summary (string)
- attack_scenarios (array of {scenario, likelihood, impact, mitre_tactics, description})
- attack_paths (array of {path, steps, risk_level})
- control_gaps (array of {gap, severity, recommendation})
- risk_score (number 0-100)
- critical_findings (number)
- high_findings (number)
- medium_findings (number)
- low_findings (number)
- recommendations (array of {recommendation, priority, timeline})
- executive_summary (string)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            threat_landscape_summary: { type: "string" },
            attack_scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scenario: { type: "string" },
                  likelihood: { type: "string" },
                  impact: { type: "string" },
                  mitre_tactics: { type: "array", items: { type: "string" } },
                  description: { type: "string" }
                }
              }
            },
            attack_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  steps: { type: "array", items: { type: "string" } },
                  risk_level: { type: "string" }
                }
              }
            },
            control_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  severity: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            risk_score: { type: "number" },
            critical_findings: { type: "number" },
            high_findings: { type: "number" },
            medium_findings: { type: "number" },
            low_findings: { type: "number" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            executive_summary: { type: "string" }
          }
        }
      });

      setResults(response);
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComplete = () => {
    createMutation.mutate({
      ...assessment,
      ...results,
      status: "completed",
      assessment_date: new Date().toISOString().split('T')[0],
      ai_generated: true,
      prioritized_actions: results.recommendations
    });
  };

  const progress = (step / 3) * 100;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Target className="h-5 w-5 text-red-400" />
              </div>
              <CardTitle className="text-base text-white">Threat Assessment Engine</CardTitle>
            </div>
            <Badge className="bg-red-500/20 text-red-400">Step {step}/3</Badge>
          </div>
          <Progress value={progress} className="mt-2 h-1.5" />
        </CardHeader>
      </Card>

      {step === 1 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white">Assessment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Assessment Title *</label>
              <Input
                value={assessment.title}
                onChange={(e) => setAssessment({...assessment, title: e.target.value})}
                placeholder="e.g., Q1 2025 Threat Landscape Assessment"
                className="bg-[#0f1623] border-[#2a3548] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Assessment Type *</label>
                <Select value={assessment.assessment_type} onValueChange={(v) => setAssessment({...assessment, assessment_type: v})}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="threat_landscape">Threat Landscape</SelectItem>
                    <SelectItem value="attack_surface">Attack Surface</SelectItem>
                    <SelectItem value="vulnerability_assessment">Vulnerability Assessment</SelectItem>
                    <SelectItem value="penetration_test">Penetration Test</SelectItem>
                    <SelectItem value="red_team">Red Team</SelectItem>
                    <SelectItem value="threat_hunt">Threat Hunt</SelectItem>
                    <SelectItem value="threat_modeling">Threat Modeling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Methodology *</label>
                <Select value={assessment.methodology} onValueChange={(v) => setAssessment({...assessment, methodology: v})}>
                  <SelectTrigger className="bg-[#0f1623] border-[#2a3548] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="STRIDE">STRIDE</SelectItem>
                    <SelectItem value="PASTA">PASTA</SelectItem>
                    <SelectItem value="VAST">VAST</SelectItem>
                    <SelectItem value="OCTAVE">OCTAVE</SelectItem>
                    <SelectItem value="OWASP">OWASP</SelectItem>
                    <SelectItem value="NIST">NIST</SelectItem>
                    <SelectItem value="FAIR">FAIR</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Scope *</label>
              <Textarea
                value={assessment.scope}
                onChange={(e) => setAssessment({...assessment, scope: e.target.value})}
                placeholder="Define the assessment scope (systems, networks, applications)"
                className="bg-[#0f1623] border-[#2a3548] text-white h-20"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
              <Textarea
                value={assessment.description}
                onChange={(e) => setAssessment({...assessment, description: e.target.value})}
                placeholder="Additional context or objectives"
                className="bg-[#0f1623] border-[#2a3548] text-white h-20"
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!assessment.title || !assessment.scope}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              Continue to Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base text-white">AI-Powered Threat Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">AI Analysis Ready</h4>
                  <p className="text-xs text-slate-400">
                    Our AI will analyze your scope and generate comprehensive threat assessment including
                    attack scenarios, MITRE ATT&CK mappings, control gaps, and prioritized recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-rose-400" />
                  <span className="text-xs text-slate-400">Attack Scenarios</span>
                </div>
                <p className="text-sm font-bold text-white">5-8 Scenarios</p>
              </div>

              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Control Gaps</span>
                </div>
                <p className="text-sm font-bold text-white">Identified</p>
              </div>

              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-slate-400">Risk Scoring</span>
                </div>
                <p className="text-sm font-bold text-white">0-100 Scale</p>
              </div>

              <div className="p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Recommendations</span>
                </div>
                <p className="text-sm font-bold text-white">Prioritized</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 bg-[#0f1623] border-[#2a3548] text-white hover:bg-[#1a2332]"
              >
                Back
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && results && (
        <div className="space-y-4">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base text-white">Assessment Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-rose-400">{results.critical_findings}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-400">{results.high_findings}</div>
                  <div className="text-xs text-slate-400">High</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">{results.medium_findings}</div>
                  <div className="text-xs text-slate-400">Medium</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-500/10 to-gray-500/10 border border-slate-500/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-slate-400">{results.low_findings}</div>
                  <div className="text-xs text-slate-400">Low</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{results.executive_summary}</p>
              </div>

              <div className="p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">Overall Risk Score</h4>
                  <Badge className={
                    results.risk_score >= 75 ? 'bg-rose-500/20 text-rose-400' :
                    results.risk_score >= 50 ? 'bg-amber-500/20 text-amber-400' :
                    results.risk_score >= 25 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }>
                    {results.risk_score}/100
                  </Badge>
                </div>
                <Progress value={results.risk_score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleComplete}
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Save Assessment
          </Button>
        </div>
      )}
    </div>
  );
}