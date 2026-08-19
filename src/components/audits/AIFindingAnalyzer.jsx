import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, AlertTriangle, GitBranch, Lightbulb, CheckCircle2, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIFindingAnalyzer({ finding, allFindings = [], onUpdate }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeFinding = async () => {
    setAnalyzing(true);
    try {
      const prompt = `Analyze this audit finding comprehensively:

CURRENT FINDING:
- Title: ${finding.title}
- Description: ${finding.description}
- Current Severity: ${finding.severity || 'Not set'}
- Category: ${finding.category || 'Not set'}
- Status: ${finding.status || 'open'}

HISTORICAL FINDINGS CONTEXT (${allFindings.length} total):
${allFindings.slice(0, 20).map(f => 
  `- ${f.title} (Severity: ${f.severity}, Category: ${f.category}, Status: ${f.status})`
).join('\n')}

Provide comprehensive analysis:

1. ROOT CAUSE CATEGORIZATION:
   Identify primary root cause: process_weakness, system_deficiency, human_error, control_gap, design_flaw, compliance_gap, or resource_constraint
   Explain the reasoning

2. SEVERITY & IMPACT ASSESSMENT:
   Based on historical patterns and industry benchmarks:
   - Recommended severity (critical/high/medium/low)
   - Confidence level (high/medium/low)
   - Impact areas (financial, operational, compliance, reputational)
   - Justification

3. SYSTEMIC ISSUES DETECTION:
   Analyze relationships with other findings:
   - Identify patterns or common root causes
   - Find related findings (provide titles)
   - Determine if this indicates a systemic issue
   - Risk of recurrence

4. REMEDIATION RECOMMENDATIONS:
   Propose 3-5 specific, actionable remediation steps:
   - Immediate actions (short-term)
   - Preventive measures (long-term)
   - Process improvements
   - Control enhancements
   - Estimated effort and priority

Return as JSON:
{
  "root_cause": {
    "category": "process_weakness|system_deficiency|human_error|control_gap|design_flaw|compliance_gap|resource_constraint",
    "subcategory": "string",
    "explanation": "string",
    "confidence": "high|medium|low"
  },
  "severity_assessment": {
    "recommended_severity": "critical|high|medium|low",
    "confidence": "high|medium|low",
    "impact_areas": ["financial", "operational", "compliance", "reputational"],
    "justification": "string",
    "industry_benchmark": "string"
  },
  "systemic_analysis": {
    "is_systemic": boolean,
    "related_findings": ["finding_title1", "finding_title2"],
    "pattern_description": "string",
    "recurrence_risk": "high|medium|low",
    "scope_of_impact": "string"
  },
  "remediation_plan": [
    {
      "step": "string",
      "type": "immediate|preventive|process_improvement|control_enhancement",
      "description": "string",
      "priority": "high|medium|low",
      "estimated_effort": "string",
      "responsible_party": "string"
    }
  ],
  "overall_risk_score": number,
  "key_insights": ["insight1", "insight2"]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            root_cause: { type: "object" },
            severity_assessment: { type: "object" },
            systemic_analysis: { type: "object" },
            remediation_plan: { type: "array" },
            overall_risk_score: { type: "number" },
            key_insights: { type: "array" }
          }
        }
      });

      setAnalysis(response);
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze finding");
    } finally {
      setAnalyzing(false);
    }
  };

  const applyRecommendations = () => {
    if (analysis && onUpdate) {
      onUpdate({
        severity: analysis.severity_assessment.recommended_severity,
        category: analysis.root_cause.category,
        recommendation: analysis.remediation_plan.map(r => r.step).join('\n\n'),
        root_cause: analysis.root_cause.explanation
      });
      toast.success("Recommendations applied");
    }
  };

  const getRootCauseColor = (category) => {
    const colors = {
      process_weakness: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      system_deficiency: 'bg-red-500/20 text-red-400 border-red-500/30',
      human_error: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      control_gap: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      design_flaw: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      compliance_gap: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      resource_constraint: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Analysis Trigger */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-violet-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">AI Finding Analysis</h3>
                <p className="text-xs text-slate-400">Automatic categorization, severity assessment, and remediation planning</p>
              </div>
            </div>
            <Button 
              onClick={analyzeFinding}
              disabled={analyzing}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Root Cause */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Root Cause Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={getRootCauseColor(analysis.root_cause.category)}>
                  {analysis.root_cause.category.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                <Badge className={`text-xs ${
                  analysis.root_cause.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                  analysis.root_cause.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {analysis.root_cause.confidence} confidence
                </Badge>
              </div>
              {analysis.root_cause.subcategory && (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Subcategory:</span> {analysis.root_cause.subcategory}
                </p>
              )}
              <p className="text-sm text-slate-300">{analysis.root_cause.explanation}</p>
            </CardContent>
          </Card>

          {/* Severity Assessment */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" />
                Severity & Impact Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Recommended Severity:</span>
                <Badge className={`${
                  analysis.severity_assessment.recommended_severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  analysis.severity_assessment.recommended_severity === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  analysis.severity_assessment.recommended_severity === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {analysis.severity_assessment.recommended_severity.toUpperCase()}
                </Badge>
                <Badge className="bg-slate-500/20 text-slate-400 text-xs">
                  {analysis.severity_assessment.confidence} confidence
                </Badge>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-2">Impact Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {analysis.severity_assessment.impact_areas.map((area, i) => (
                    <Badge key={i} className="bg-indigo-500/10 text-indigo-400 text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Justification:</p>
                <p className="text-sm text-slate-300">{analysis.severity_assessment.justification}</p>
              </div>

              {analysis.severity_assessment.industry_benchmark && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400 font-semibold mb-1">Industry Benchmark:</p>
                  <p className="text-xs text-slate-300">{analysis.severity_assessment.industry_benchmark}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Systemic Analysis */}
          <Card className={`bg-[#1a2332] border-[#2a3548] ${analysis.systemic_analysis.is_systemic ? 'border-rose-500/40' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-400" />
                Systemic Issues Detection
                {analysis.systemic_analysis.is_systemic && (
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">SYSTEMIC</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Recurrence Risk:</span>
                <Badge className={`${
                  analysis.systemic_analysis.recurrence_risk === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  analysis.systemic_analysis.recurrence_risk === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {analysis.systemic_analysis.recurrence_risk.toUpperCase()}
                </Badge>
              </div>

              <p className="text-sm text-slate-300">{analysis.systemic_analysis.pattern_description}</p>

              {analysis.systemic_analysis.scope_of_impact && (
                <div className="p-3 bg-[#151d2e] border border-[#2a3548] rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Scope of Impact:</p>
                  <p className="text-sm text-slate-300">{analysis.systemic_analysis.scope_of_impact}</p>
                </div>
              )}

              {analysis.systemic_analysis.related_findings?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Related Findings ({analysis.systemic_analysis.related_findings.length}):</p>
                  <div className="space-y-1">
                    {analysis.systemic_analysis.related_findings.map((title, i) => (
                      <div key={i} className="text-xs p-2 bg-[#151d2e] border border-[#2a3548] rounded text-slate-300">
                        • {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Remediation Plan */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                AI Remediation Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {analysis.remediation_plan.map((step, i) => {
                    const typeColors = {
                      immediate: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                      preventive: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      process_improvement: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
                      control_enhancement: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    };

                    const priorityColors = {
                      high: 'bg-red-500/20 text-red-400',
                      medium: 'bg-amber-500/20 text-amber-400',
                      low: 'bg-blue-500/20 text-blue-400'
                    };

                    return (
                      <Card key={i} className="bg-[#151d2e] border-[#2a3548] p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-2">{step.step}</h4>
                            <p className="text-xs text-slate-400 mb-2">{step.description}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className={`text-[10px] ${typeColors[step.type]}`}>
                                {step.type.replace(/_/g, ' ')}
                              </Badge>
                              <Badge className={`text-[10px] ${priorityColors[step.priority]}`}>
                                {step.priority} priority
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Effort: {step.estimated_effort}</span>
                              {step.responsible_party && <span>Owner: {step.responsible_party}</span>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Key Insights */}
          {analysis.key_insights?.length > 0 && (
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.key_insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2" />
                      <p className="text-sm text-slate-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Score */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <span className="text-sm text-slate-400">Overall Risk Score</span>
                </div>
                <div className="text-3xl font-bold text-white">{analysis.overall_risk_score}/100</div>
              </div>
            </CardContent>
          </Card>

          {/* Apply Button */}
          {onUpdate && (
            <Button 
              onClick={applyRecommendations}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Apply AI Recommendations to Finding
            </Button>
          )}
        </div>
      )}
    </div>
  );
}