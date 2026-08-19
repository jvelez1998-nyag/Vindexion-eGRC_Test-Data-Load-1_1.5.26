import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, TrendingUp, AlertTriangle, Shield, Target, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function AIAssessmentResults({ open, onOpenChange, assessment, onSaveResults }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const generateAIResults = async () => {
    if (!assessment) return;
    
    setAnalyzing(true);
    try {
      const prompt = `You are an expert risk assessment analyst. Analyze this comprehensive risk assessment and provide detailed AI-powered results and outcomes.

ASSESSMENT DATA:
Title: ${assessment.title}
Type: ${assessment.assessment_type}
Risk Category: ${assessment.risk_category}
Risk Subcategory: ${assessment.risk_subcategory || 'N/A'}

RISK METRICS:
Inherent Likelihood: ${assessment.inherent_likelihood}/5
Inherent Impact: ${assessment.inherent_impact}/5
Inherent Risk Score: ${(assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0)}

Control Effectiveness: ${assessment.control_effectiveness}/5
Residual Likelihood: ${assessment.residual_likelihood}/5
Residual Impact: ${assessment.residual_impact}/5
Residual Risk Score: ${(assessment.residual_likelihood || 0) * (assessment.residual_impact || 0)}

Risk Reduction: ${((assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0)) - ((assessment.residual_likelihood || 0) * (assessment.residual_impact || 0))} points

ADDITIONAL CONTEXT:
Description: ${assessment.description || 'N/A'}
Business Process: ${assessment.business_process || 'N/A'}
Asset Affected: ${assessment.asset_affected || 'N/A'}
Risk Treatment: ${assessment.risk_treatment || 'N/A'}
Lifecycle Status: ${assessment.lifecycle_status}
Linked Controls: ${assessment.linked_controls?.length || 0} controls
Regulatory Mappings: ${assessment.regulatory_mappings?.join(', ') || 'None'}
Notes: ${assessment.notes || 'N/A'}

PROVIDE COMPREHENSIVE AI-POWERED ANALYSIS:

1. Executive Summary: High-level overview of the assessment
2. Risk Profile Analysis: Deep dive into inherent vs residual risk
3. Control Effectiveness Assessment: How well controls are mitigating risk
4. Key Findings: Critical insights and observations
5. Risk Treatment Evaluation: Appropriateness of chosen treatment strategy
6. Compliance Impact: Regulatory and compliance considerations
7. Strengths: What's working well
8. Weaknesses: Areas of concern
9. Recommendations: Prioritized actionable recommendations
10. Predictive Insights: Future risk trajectory and emerging concerns
11. Risk Scoring Validation: Is the scoring accurate and justified?
12. Strategic Implications: Business impact and strategic considerations

Return detailed JSON with:
{
  "overall_assessment": {
    "risk_level": "critical/high/medium/low",
    "confidence_score": "number 0-100",
    "assessment_quality": "excellent/good/fair/needs_improvement",
    "key_message": "string"
  },
  "executive_summary": "string",
  "risk_profile": {
    "inherent_analysis": "string",
    "residual_analysis": "string",
    "risk_reduction_effectiveness": "string",
    "risk_velocity": "increasing/stable/decreasing",
    "likelihood_justification": "string",
    "impact_justification": "string"
  },
  "control_assessment": {
    "effectiveness_rating": "string",
    "control_gaps": [],
    "control_strengths": [],
    "coverage_analysis": "string"
  },
  "key_findings": [
    {
      "finding": "string",
      "severity": "critical/high/medium/low",
      "category": "string"
    }
  ],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [
    {
      "recommendation": "string",
      "priority": "critical/high/medium/low",
      "impact": "string",
      "effort": "high/medium/low",
      "timeline": "string"
    }
  ],
  "predictive_insights": {
    "risk_trajectory": "string",
    "emerging_concerns": [],
    "early_warning_indicators": []
  },
  "compliance_impact": {
    "regulatory_considerations": [],
    "compliance_gaps": [],
    "audit_readiness": "string"
  },
  "scoring_validation": {
    "inherent_score_justified": "yes/no/partially",
    "residual_score_justified": "yes/no/partially",
    "scoring_concerns": [],
    "recommended_adjustments": []
  },
  "strategic_implications": "string",
  "dimensions_analysis": [
    { "dimension": "string", "score": "number 0-100", "assessment": "string" }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: {
              type: "object",
              properties: {
                risk_level: { type: "string" },
                confidence_score: { type: "number" },
                assessment_quality: { type: "string" },
                key_message: { type: "string" }
              }
            },
            executive_summary: { type: "string" },
            risk_profile: {
              type: "object",
              properties: {
                inherent_analysis: { type: "string" },
                residual_analysis: { type: "string" },
                risk_reduction_effectiveness: { type: "string" },
                risk_velocity: { type: "string" },
                likelihood_justification: { type: "string" },
                impact_justification: { type: "string" }
              }
            },
            control_assessment: {
              type: "object",
              properties: {
                effectiveness_rating: { type: "string" },
                control_gaps: { type: "array", items: { type: "string" } },
                control_strengths: { type: "array", items: { type: "string" } },
                coverage_analysis: { type: "string" }
              }
            },
            key_findings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  finding: { type: "string" },
                  severity: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            predictive_insights: {
              type: "object",
              properties: {
                risk_trajectory: { type: "string" },
                emerging_concerns: { type: "array", items: { type: "string" } },
                early_warning_indicators: { type: "array", items: { type: "string" } }
              }
            },
            compliance_impact: {
              type: "object",
              properties: {
                regulatory_considerations: { type: "array", items: { type: "string" } },
                compliance_gaps: { type: "array", items: { type: "string" } },
                audit_readiness: { type: "string" }
              }
            },
            scoring_validation: {
              type: "object",
              properties: {
                inherent_score_justified: { type: "string" },
                residual_score_justified: { type: "string" },
                scoring_concerns: { type: "array", items: { type: "string" } },
                recommended_adjustments: { type: "array", items: { type: "string" } }
              }
            },
            strategic_implications: { type: "string" },
            dimensions_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dimension: { type: "string" },
                  score: { type: "number" },
                  assessment: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResults(response);
      
      if (onSaveResults) {
        onSaveResults(response);
      }
      
      toast.success("AI analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI results");
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400',
    high: 'bg-orange-500/10 text-orange-400',
    medium: 'bg-amber-500/10 text-amber-400',
    low: 'bg-blue-500/10 text-blue-400'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a2332] border-[#2a3548] text-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            AI-Powered Assessment Results
          </DialogTitle>
        </DialogHeader>

        {!results ? (
          <div className="p-12 text-center">
            <Sparkles className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Generate AI Analysis</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Get comprehensive AI-powered insights, risk scoring validation, predictive analysis, and strategic recommendations for this assessment.
            </p>
            <Button
              onClick={generateAIResults}
              disabled={analyzing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Results
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="p-6 pt-2">
            <TabsList className="bg-[#151d2e] border border-[#2a3548] mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
              <TabsTrigger value="findings">Findings</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="predictive">Predictive</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="pr-4">
                <TabsContent value="overview" className="space-y-4">
                  {/* Overall Assessment */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Overall Assessment</h3>
                      <Badge className={severityColors[results.overall_assessment?.risk_level]}>
                        {results.overall_assessment?.risk_level} risk
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Confidence Score</div>
                        <div className="text-2xl font-bold text-white">{results.overall_assessment?.confidence_score}%</div>
                      </div>
                      <div className="p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Quality Rating</div>
                        <div className="text-sm font-semibold text-indigo-400">{results.overall_assessment?.assessment_quality}</div>
                      </div>
                      <div className="p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Inherent Score</div>
                        <div className="text-2xl font-bold text-rose-400">
                          {(assessment.inherent_likelihood || 0) * (assessment.inherent_impact || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                      <p className="text-sm text-slate-300">{results.overall_assessment?.key_message}</p>
                    </div>
                  </Card>

                  {/* Executive Summary */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-400" />
                      Executive Summary
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{results.executive_summary}</p>
                  </Card>

                  {/* Dimensions Analysis Chart */}
                  {results.dimensions_analysis && results.dimensions_analysis.length > 0 && (
                    <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                      <h3 className="text-lg font-semibold text-white mb-4">Assessment Dimensions</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={results.dimensions_analysis}>
                          <PolarGrid stroke="#2a3548" />
                          <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                          <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                            labelStyle={{ color: '#e2e8f0' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Card>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="grid lg:grid-cols-2 gap-4">
                    <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        Strengths
                      </h3>
                      <div className="space-y-2">
                        {results.strengths?.map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                            {strength}
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-rose-400" />
                        Weaknesses
                      </h3>
                      <div className="space-y-2">
                        {results.weaknesses?.map((weakness, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5" />
                            {weakness}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  {/* Risk Profile */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      Risk Profile Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Inherent Risk Analysis</div>
                        <p className="text-sm text-slate-300">{results.risk_profile?.inherent_analysis}</p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Residual Risk Analysis</div>
                        <p className="text-sm text-slate-300">{results.risk_profile?.residual_analysis}</p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Risk Reduction Effectiveness</div>
                        <p className="text-sm text-slate-300">{results.risk_profile?.risk_reduction_effectiveness}</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                        <div>
                          <div className="text-xs text-slate-500">Risk Velocity</div>
                          <div className="text-sm font-semibold text-white">{results.risk_profile?.risk_velocity}</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Control Assessment */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      Control Effectiveness Assessment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Effectiveness Rating</div>
                        <p className="text-sm text-slate-300">{results.control_assessment?.effectiveness_rating}</p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Coverage Analysis</div>
                        <p className="text-sm text-slate-300">{results.control_assessment?.coverage_analysis}</p>
                      </div>
                      {results.control_assessment?.control_gaps?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Control Gaps</div>
                          <div className="space-y-1">
                            {results.control_assessment.control_gaps.map((gap, idx) => (
                              <div key={idx} className="text-sm text-rose-400">• {gap}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.control_assessment?.control_strengths?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Control Strengths</div>
                          <div className="space-y-1">
                            {results.control_assessment.control_strengths.map((strength, idx) => (
                              <div key={idx} className="text-sm text-emerald-400">• {strength}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Scoring Validation */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Risk Scoring Validation</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Inherent Score Justified</div>
                          <Badge className={
                            results.scoring_validation?.inherent_score_justified === 'yes' ? 'bg-emerald-500/10 text-emerald-400' :
                            results.scoring_validation?.inherent_score_justified === 'partially' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }>
                            {results.scoring_validation?.inherent_score_justified}
                          </Badge>
                        </div>
                        <div className="p-3 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Residual Score Justified</div>
                          <Badge className={
                            results.scoring_validation?.residual_score_justified === 'yes' ? 'bg-emerald-500/10 text-emerald-400' :
                            results.scoring_validation?.residual_score_justified === 'partially' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }>
                            {results.scoring_validation?.residual_score_justified}
                          </Badge>
                        </div>
                      </div>
                      {results.scoring_validation?.scoring_concerns?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Scoring Concerns</div>
                          <div className="space-y-1">
                            {results.scoring_validation.scoring_concerns.map((concern, idx) => (
                              <div key={idx} className="text-sm text-amber-400">• {concern}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.scoring_validation?.recommended_adjustments?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Recommended Adjustments</div>
                          <div className="space-y-1">
                            {results.scoring_validation.recommended_adjustments.map((adj, idx) => (
                              <div key={idx} className="text-sm text-blue-400">• {adj}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="findings" className="space-y-4">
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
                    <div className="space-y-3">
                      {results.key_findings?.map((finding, idx) => (
                        <div key={idx} className="p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={severityColors[finding.severity]}>
                              {finding.severity}
                            </Badge>
                            <Badge variant="outline" className="border-[#2a3548] text-slate-400">
                              {finding.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300">{finding.finding}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Compliance Impact */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Compliance Impact</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Audit Readiness</div>
                        <p className="text-sm text-slate-300">{results.compliance_impact?.audit_readiness}</p>
                      </div>
                      {results.compliance_impact?.regulatory_considerations?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Regulatory Considerations</div>
                          <div className="space-y-1">
                            {results.compliance_impact.regulatory_considerations.map((reg, idx) => (
                              <div key={idx} className="text-sm text-slate-300">• {reg}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.compliance_impact?.compliance_gaps?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Compliance Gaps</div>
                          <div className="space-y-1">
                            {results.compliance_impact.compliance_gaps.map((gap, idx) => (
                              <div key={idx} className="text-sm text-rose-400">• {gap}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Prioritized Recommendations</h3>
                    <div className="space-y-3">
                      {results.recommendations?.sort((a, b) => {
                        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      }).map((rec, idx) => (
                        <div key={idx} className="p-4 bg-[#1a2332] border border-[#2a3548] rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={priorityColors[rec.priority]}>
                              {rec.priority} priority
                            </Badge>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="outline" className="border-[#2a3548] text-slate-400">
                                {rec.effort} effort
                              </Badge>
                              <Badge variant="outline" className="border-[#2a3548] text-slate-400">
                                {rec.timeline}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{rec.recommendation}</p>
                          <div className="text-xs text-slate-500">Expected Impact: {rec.impact}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Strategic Implications */}
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-3">Strategic Implications</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{results.strategic_implications}</p>
                  </Card>
                </TabsContent>

                <TabsContent value="predictive" className="space-y-4">
                  <Card className="bg-[#151d2e] border-[#2a3548] p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-violet-400" />
                      Predictive Insights
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-2">Risk Trajectory</div>
                        <p className="text-sm text-slate-300">{results.predictive_insights?.risk_trajectory}</p>
                      </div>
                      {results.predictive_insights?.emerging_concerns?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Emerging Concerns</div>
                          <div className="space-y-2">
                            {results.predictive_insights.emerging_concerns.map((concern, idx) => (
                              <div key={idx} className="p-3 bg-[#1a2332] border border-amber-500/20 rounded-lg">
                                <p className="text-sm text-amber-400">{concern}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.predictive_insights?.early_warning_indicators?.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-slate-400 mb-2">Early Warning Indicators</div>
                          <div className="space-y-1">
                            {results.predictive_insights.early_warning_indicators.map((indicator, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                                {indicator}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 border-t border-[#2a3548] flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#2a3548] hover:bg-[#2a3548]"
              >
                Close
              </Button>
              <Button
                onClick={generateAIResults}
                disabled={analyzing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}