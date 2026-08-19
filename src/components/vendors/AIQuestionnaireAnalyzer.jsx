import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Loader2, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  CheckCircle2,
  FileText,
  Zap,
  Target,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIQuestionnaireAnalyzer({ open, onOpenChange, questionnaireData, vendor, onComplete }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const createAssessmentMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorAssessment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] })
  });

  const createTasksMutation = useMutation({
    mutationFn: (tasks) => base44.entities.VendorOnboardingTask.bulkCreate(tasks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] })
  });

  const analyzeQuestionnaire = async () => {
    if (!questionnaireData || !vendor) return;

    setAnalyzing(true);
    setProgress(10);

    try {
      // Format questionnaire data
      const formattedData = Object.entries(questionnaireData)
        .map(([key, value]) => {
          if (typeof value === 'boolean') return `${key}: ${value ? 'Yes' : 'No'}`;
          if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
          return `${key}: ${value}`;
        })
        .join('\n');

      setProgress(30);

      const prompt = `You are an expert Third Party Risk Management analyst. Analyze this vendor security questionnaire and provide a comprehensive risk assessment.

VENDOR INFORMATION:
Name: ${vendor.vendor_name}
Type: ${vendor.vendor_type}
Criticality: ${vendor.criticality}
Data Access: ${vendor.data_access_level}

QUESTIONNAIRE RESPONSES:
${formattedData}

ANALYSIS REQUIRED:

1. **Executive Summary** (3-4 sentences):
   - Overall risk posture
   - Key concerns
   - Recommendation (approve/conditional approve/reject)

2. **Risk Score Breakdown** (0-100 for each):
   - Security Controls Score
   - Data Protection Score
   - Compliance Score
   - Incident Response Score
   - Business Continuity Score
   - Overall Risk Score

3. **Risk Rating**:
   - Overall: low/medium/high/critical
   - Rationale for the rating

4. **Identified Risks** (5-8 risks):
   For each risk:
   - Risk title
   - Severity (low/medium/high/critical)
   - Description
   - Likelihood (%)
   - Impact assessment
   - Evidence from questionnaire

5. **Compliance Gaps** (3-5 gaps):
   - Gap description
   - Applicable standards/regulations
   - Severity
   - Remediation priority

6. **Strengths** (3-4 strengths):
   - What the vendor does well
   - Positive security indicators

7. **Weaknesses** (3-5 weaknesses):
   - Areas of concern
   - Missing controls or certifications

8. **Mitigation Strategies** (5-7 strategies):
   For each strategy:
   - Strategy title
   - Description
   - Priority (critical/high/medium/low)
   - Implementation effort (low/medium/high)
   - Expected impact
   - Specific action items
   - Timeline recommendation
   - Responsible party suggestion

9. **Recommended Actions** (5-7 actions):
   - Action description
   - Priority
   - Due date (relative, e.g., "within 30 days")
   - Assigned to (role/team)

10. **Contract Recommendations**:
    - Specific clauses to include
    - Additional safeguards needed
    - Insurance requirements
    - SLA recommendations

11. **Monitoring Requirements**:
    - Ongoing monitoring needs
    - Key metrics to track
    - Review frequency
    - Red flags to watch for

Be specific, actionable, and data-driven. Reference specific questionnaire responses in your analysis.`;

      setProgress(50);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true, // Get latest threat intel
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            recommendation: { type: "string", enum: ["approve", "conditional_approve", "reject"] },
            scores: {
              type: "object",
              properties: {
                security_controls: { type: "number" },
                data_protection: { type: "number" },
                compliance: { type: "number" },
                incident_response: { type: "number" },
                business_continuity: { type: "number" },
                overall: { type: "number" }
              }
            },
            risk_rating: { type: "string", enum: ["low", "medium", "high", "critical"] },
            risk_rating_rationale: { type: "string" },
            identified_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  likelihood: { type: "number" },
                  impact: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            compliance_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  standards: { type: "string" },
                  severity: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            mitigation_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  effort: { type: "string" },
                  impact: { type: "string" },
                  action_items: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  responsible_party: { type: "string" }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  due_date: { type: "string" },
                  assigned_to: { type: "string" }
                }
              }
            },
            contract_recommendations: {
              type: "object",
              properties: {
                clauses: { type: "array", items: { type: "string" } },
                safeguards: { type: "array", items: { type: "string" } },
                insurance: { type: "string" },
                sla: { type: "string" }
              }
            },
            monitoring_requirements: {
              type: "object",
              properties: {
                needs: { type: "array", items: { type: "string" } },
                metrics: { type: "array", items: { type: "string" } },
                frequency: { type: "string" },
                red_flags: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setProgress(80);
      setAnalysis(response);

      // Create formal assessment record
      await createAssessmentMutation.mutateAsync({
        vendor_id: vendor.id,
        assessment_date: new Date().toISOString().split('T')[0],
        assessment_type: "initial",
        status: "completed",
        security_controls_score: response.scores.security_controls,
        data_protection_score: response.scores.data_protection,
        compliance_score: response.scores.compliance,
        incident_response_score: response.scores.incident_response,
        business_continuity_score: response.scores.business_continuity,
        overall_score: response.scores.overall,
        risk_rating: response.risk_rating,
        recommendations: response.mitigation_strategies.map(s => s.title),
        notes: `AI-Generated Assessment\n\n${response.executive_summary}\n\nRating: ${response.risk_rating}\n\n${response.risk_rating_rationale}`
      });

      // Create tasks from recommended actions
      const tasks = response.recommended_actions.map(action => ({
        vendor_id: vendor.id,
        task_title: action.action,
        priority: action.priority,
        status: "not_started",
        onboarding_stage: "assessment",
        auto_generated: true,
        notes: `AI-recommended action. ${action.due_date}`
      }));

      await createTasksMutation.mutateAsync(tasks);

      setProgress(100);
      toast.success("AI analysis completed");
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze questionnaire");
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-purple-400" />
            AI Questionnaire Analysis
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6">
          {!analysis ? (
            <div className="text-center py-16">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 inline-block mb-6">
                <Brain className="h-20 w-20 text-purple-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Risk Analysis</h3>
              <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                Our AI will analyze the submitted questionnaire responses, correlate with external threat intelligence, 
                identify potential risks, and generate comprehensive risk assessment with mitigation strategies.
              </p>

              {analyzing && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                    <span className="text-sm text-slate-400">Analyzing questionnaire responses...</span>
                  </div>
                  <Progress value={progress} className="h-2 max-w-md mx-auto" />
                </div>
              )}

              <Button 
                onClick={analyzeQuestionnaire}
                disabled={analyzing}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {analyzing ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...</>
                ) : (
                  <><Zap className="h-5 w-5 mr-2" /> Start AI Analysis</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* Executive Summary */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
                      <p className="text-slate-300 leading-relaxed">{analysis.executive_summary}</p>
                    </div>
                    <div className="text-center ml-6">
                      <div className="text-5xl font-bold text-white mb-1">{analysis.scores.overall}</div>
                      <div className="text-xs text-slate-400">Risk Score</div>
                      <Badge className={`mt-2 ${severityColors[analysis.risk_rating]}`}>
                        {analysis.risk_rating.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-400">Recommendation:</strong>
                    <Badge className={`${
                      analysis.recommendation === 'approve' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      analysis.recommendation === 'conditional_approve' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {analysis.recommendation.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{analysis.risk_rating_rationale}</p>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(analysis.scores).map(([key, score]) => (
                      <div key={key} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                          <span className={`text-lg font-bold ${
                            score >= 80 ? 'text-emerald-400' :
                            score >= 60 ? 'text-blue-400' :
                            score >= 40 ? 'text-amber-400' : 'text-rose-400'
                          }`}>{score}</span>
                        </div>
                        <Progress value={score} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Identified Risks */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                    Identified Risks ({analysis.identified_risks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.identified_risks.map((risk, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{risk.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={severityColors[risk.severity]}>{risk.severity}</Badge>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{risk.likelihood}%</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{risk.description}</p>
                        <div className="text-xs text-slate-500">
                          <strong>Impact:</strong> {risk.impact}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          <strong>Evidence:</strong> {risk.evidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mitigation Strategies */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    Mitigation Strategies ({analysis.mitigation_strategies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.mitigation_strategies.map((strategy, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-white flex-1">{strategy.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              strategy.priority === 'critical' || strategy.priority === 'high' 
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {strategy.priority}
                            </Badge>
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                              {strategy.effort} effort
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{strategy.description}</p>
                        <div className="grid md:grid-cols-2 gap-2 mb-3 text-xs text-slate-500">
                          <div><strong>Impact:</strong> {strategy.impact}</div>
                          <div><strong>Timeline:</strong> {strategy.timeline}</div>
                          <div className="md:col-span-2"><strong>Responsible:</strong> {strategy.responsible_party}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-2">Action Items:</div>
                          <ul className="space-y-1">
                            {strategy.action_items.map((item, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 mt-1">!</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Gaps */}
              <Card className="bg-[#1a2332] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-400" />
                    Compliance Gaps ({analysis.compliance_gaps.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.compliance_gaps.map((gap, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-1">{gap.gap}</p>
                          <p className="text-xs text-slate-400">{gap.standards}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={severityColors[gap.severity]}>{gap.severity}</Badge>
                          <Badge className="bg-slate-500/10 text-slate-400">{gap.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contract & Monitoring */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Contract Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-1">Required Clauses:</div>
                      <ul className="space-y-1">
                        {analysis.contract_recommendations.clauses.map((clause, i) => (
                          <li key={i} className="text-xs text-slate-300">• {clause}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-1">Additional Safeguards:</div>
                      <ul className="space-y-1">
                        {analysis.contract_recommendations.safeguards.map((safeguard, i) => (
                          <li key={i} className="text-xs text-slate-300">• {safeguard}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a2332] border-[#2a3548]">
                  <CardHeader>
                    <CardTitle className="text-base">Monitoring Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-1">Key Metrics:</div>
                      <ul className="space-y-1">
                        {analysis.monitoring_requirements.metrics.map((metric, i) => (
                          <li key={i} className="text-xs text-slate-300">• {metric}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-1">Red Flags:</div>
                      <ul className="space-y-1">
                        {analysis.monitoring_requirements.red_flags.map((flag, i) => (
                          <li key={i} className="text-xs text-rose-400">⚠ {flag}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="px-6 pb-6 pt-4 border-t border-[#2a3548] flex justify-between">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a3548] hover:bg-[#2a3548]"
          >
            Close
          </Button>
          {analysis && (
            <Button 
              onClick={() => {
                onComplete?.(analysis);
                onOpenChange(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Complete Onboarding
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}