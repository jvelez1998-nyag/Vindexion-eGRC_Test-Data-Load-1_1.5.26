import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Loader2,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  XCircle,
  Clock,
  Activity
} from "lucide-react";
import { toast } from "sonner";

export default function AutomatedDueDiligenceEngine({ vendor, documents = [], questionnaireData = null }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [stage, setStage] = useState("idle");
  const queryClient = useQueryClient();

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments', vendor?.id],
    queryFn: () => base44.entities.VendorAssessment.filter({ vendor_id: vendor.id }),
    enabled: !!vendor?.id
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (data) => base44.entities.VendorAssessment.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-assessments'] })
  });

  const createRiskMutation = useMutation({
    mutationFn: (data) => base44.entities.Risk.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['risks'] })
  });

  const createTasksMutation = useMutation({
    mutationFn: (tasks) => base44.entities.VendorOnboardingTask.bulkCreate(tasks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-onboarding-tasks'] })
  });

  const updateVendorMutation = useMutation({
    mutationFn: (data) => base44.entities.Vendor.update(vendor.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] })
  });

  const runAutomatedDueDiligence = async () => {
    if (!vendor) return;

    setAnalyzing(true);
    setProgress(0);
    setStage("initializing");

    try {
      // Stage 1: Document Analysis
      setStage("documents");
      setProgress(15);
      
      const documentAnalysis = await analyzeDocuments(documents);
      
      // Stage 2: Questionnaire Analysis
      setStage("questionnaire");
      setProgress(35);
      
      const questionnaireAnalysis = await analyzeQuestionnaire(questionnaireData);

      // Stage 3: Comprehensive Risk Assessment
      setStage("risk_assessment");
      setProgress(55);
      
      const comprehensiveRisk = await performComprehensiveRiskAssessment(
        documentAnalysis,
        questionnaireAnalysis
      );

      // Stage 4: Generate Risk Score
      setStage("scoring");
      setProgress(75);
      
      const riskScore = await calculateRiskScore(comprehensiveRisk);

      // Stage 5: Create Assessment & Tasks
      setStage("finalization");
      setProgress(90);

      await finalizeAssessment(comprehensiveRisk, riskScore);

      setProgress(100);
      setAnalysis({
        documentAnalysis,
        questionnaireAnalysis,
        comprehensiveRisk,
        riskScore
      });
      
      toast.success("Automated due diligence completed");

    } catch (error) {
      console.error(error);
      toast.error("Failed to complete due diligence");
      setStage("error");
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeDocuments = async (docs) => {
    if (!docs || docs.length === 0) {
      return { status: "no_documents", risks: [], compliance_gaps: [] };
    }

    const documentSummaries = docs.map(doc => ({
      name: doc.document_name,
      type: doc.document_type,
      category: doc.category,
      summary: doc.ai_summary,
      risks: doc.ai_risks_identified || [],
      key_points: doc.ai_key_points || [],
      tags: doc.tags || [],
      expiration_date: doc.expiration_date
    }));

    const prompt = `Analyze the following vendor documents and provide a comprehensive security and compliance assessment.

VENDOR: ${vendor.vendor_name}
DOCUMENTS ANALYZED: ${docs.length}

DOCUMENT DETAILS:
${JSON.stringify(documentSummaries, null, 2)}

ANALYSIS REQUIREMENTS:

1. **Document Completeness Score** (0-100):
   - Are all critical documents present? (contracts, security policies, certifications)
   - Are documents current and not expired?
   - Quality and comprehensiveness of documentation

2. **Identified Risks from Documents** (5-8 risks):
   - Cross-document risk patterns
   - Missing or inadequate policies
   - Expired certifications
   - Contractual red flags
   - Security gaps in policies
   For each: title, severity, evidence, impact, likelihood

3. **Compliance Gaps** (4-6 gaps):
   - Missing compliance documentation
   - Non-conformance to standards
   - Inadequate security controls
   For each: gap description, standards affected, severity, remediation

4. **Document Quality Issues**:
   - Outdated documents
   - Missing critical sections
   - Inconsistencies across documents

5. **Strengths** (3-5):
   - Well-documented areas
   - Strong security policies
   - Current certifications

Provide specific, actionable insights based on actual document content.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          completeness_score: { type: "number" },
          identified_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                evidence: { type: "string" },
                impact: { type: "string" },
                likelihood: { type: "number" }
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
                remediation: { type: "string" }
              }
            }
          },
          quality_issues: { type: "array", items: { type: "string" } },
          strengths: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        }
      }
    });

    return response;
  };

  const analyzeQuestionnaire = async (data) => {
    if (!data) {
      return { status: "no_questionnaire", risks: [] };
    }

    const formattedData = Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === 'boolean') return `${key}: ${value ? 'Yes' : 'No'}`;
        if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
        return `${key}: ${value}`;
      })
      .join('\n');

    const prompt = `Analyze vendor questionnaire responses for security and compliance risks.

VENDOR: ${vendor.vendor_name}
DATA ACCESS: ${vendor.data_access_level}
CRITICALITY: ${vendor.criticality}

RESPONSES:
${formattedData}

Identify:
1. Security control weaknesses (5-7 specific issues)
2. Compliance red flags (3-5 flags)
3. Data protection concerns (3-5 concerns)
4. Incident response gaps (2-4 gaps)
5. Overall questionnaire score (0-100)

Be specific and reference questionnaire responses.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          security_weaknesses: { type: "array", items: { type: "string" } },
          compliance_flags: { type: "array", items: { type: "string" } },
          data_protection_concerns: { type: "array", items: { type: "string" } },
          incident_response_gaps: { type: "array", items: { type: "string" } },
          questionnaire_score: { type: "number" },
          summary: { type: "string" }
        }
      }
    });

    return response;
  };

  const performComprehensiveRiskAssessment = async (docAnalysis, qAnalysis) => {
    const prompt = `Perform comprehensive vendor risk assessment by synthesizing document analysis and questionnaire responses.

VENDOR: ${vendor.vendor_name} (${vendor.vendor_type})
CRITICALITY: ${vendor.criticality}
DATA ACCESS: ${vendor.data_access_level}

DOCUMENT ANALYSIS:
- Completeness Score: ${docAnalysis.completeness_score || 'N/A'}
- Risks Identified: ${docAnalysis.identified_risks?.length || 0}
- Compliance Gaps: ${docAnalysis.compliance_gaps?.length || 0}
- Summary: ${docAnalysis.summary || 'No documents analyzed'}

QUESTIONNAIRE ANALYSIS:
- Questionnaire Score: ${qAnalysis.questionnaire_score || 'N/A'}
- Security Weaknesses: ${qAnalysis.security_weaknesses?.length || 0}
- Compliance Flags: ${qAnalysis.compliance_flags?.length || 0}
- Summary: ${qAnalysis.summary || 'No questionnaire data'}

COMPREHENSIVE ASSESSMENT REQUIRED:

1. **Overall Risk Rating**: low/medium/high/critical
2. **Risk Score** (0-100): Weighted combination of all factors
3. **Consolidated Risk List** (8-12 unique risks):
   - Merge and deduplicate risks from both sources
   - Prioritize by severity and likelihood
   - Each with: title, severity, source (document/questionnaire/both), description, impact

4. **Compliance Status**: compliant/under_review/non_compliant
5. **Critical Findings** (3-5): Most urgent issues requiring immediate attention
6. **Due Diligence Recommendation**: approve/conditional_approve/additional_review_required/reject
7. **Recommended Actions** (8-10): Prioritized action items with timeline
8. **Mitigation Plan**: High-level strategy to address risks

Provide actionable, specific assessment based on ALL available data.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          overall_risk_rating: { type: "string", enum: ["low", "medium", "high", "critical"] },
          risk_score: { type: "number" },
          consolidated_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                severity: { type: "string" },
                source: { type: "string" },
                description: { type: "string" },
                impact: { type: "string" },
                likelihood: { type: "number" }
              }
            }
          },
          compliance_status: { type: "string" },
          critical_findings: { type: "array", items: { type: "string" } },
          recommendation: { type: "string", enum: ["approve", "conditional_approve", "additional_review_required", "reject"] },
          recommended_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          mitigation_plan: { type: "string" },
          executive_summary: { type: "string" }
        }
      }
    });

    return response;
  };

  const calculateRiskScore = async (riskData) => {
    return {
      overall: riskData.risk_score,
      security_controls: Math.max(0, 100 - (riskData.consolidated_risks.filter(r => 
        r.source.includes('questionnaire')).length * 5)),
      documentation: 100 - (riskData.consolidated_risks.filter(r => 
        r.source.includes('document')).length * 6),
      compliance: riskData.compliance_status === 'compliant' ? 90 : 
                  riskData.compliance_status === 'under_review' ? 60 : 30
    };
  };

  const finalizeAssessment = async (riskData, scores) => {
    // Create formal assessment
    await createAssessmentMutation.mutateAsync({
      vendor_id: vendor.id,
      assessment_date: new Date().toISOString().split('T')[0],
      assessment_type: "initial",
      status: "completed",
      security_controls_score: scores.security_controls,
      data_protection_score: scores.overall,
      compliance_score: scores.compliance,
      overall_score: scores.overall,
      risk_rating: riskData.overall_risk_rating,
      recommendations: riskData.recommended_actions.map(a => a.action),
      notes: `AI-Automated Due Diligence\n\n${riskData.executive_summary}`
    });

    // Create high-severity risks in Risk register
    const criticalRisks = riskData.consolidated_risks
      .filter(r => ['critical', 'high'].includes(r.severity))
      .slice(0, 5);

    for (const risk of criticalRisks) {
      await createRiskMutation.mutateAsync({
        title: `[Vendor: ${vendor.vendor_name}] ${risk.title}`,
        description: risk.description,
        category: "third_party",
        status: "identified",
        likelihood: Math.min(5, Math.ceil(risk.likelihood / 20)),
        impact: risk.severity === 'critical' ? 5 : risk.severity === 'high' ? 4 : 3,
        risk_owner: vendor.created_by,
        identification_date: new Date().toISOString().split('T')[0]
      });
    }

    // Create action tasks
    const tasks = riskData.recommended_actions.map(action => ({
      vendor_id: vendor.id,
      task_title: action.action,
      priority: action.priority,
      status: "not_started",
      onboarding_stage: "assessment",
      auto_generated: true,
      notes: `Timeline: ${action.timeline}`
    }));

    await createTasksMutation.mutateAsync(tasks);

    // Update vendor
    await updateVendorMutation.mutateAsync({
      security_score: scores.overall,
      compliance_status: riskData.compliance_status,
      risk_tier: scores.overall >= 70 ? 'tier_3' : scores.overall >= 50 ? 'tier_2' : 'tier_1',
      status: riskData.recommendation === 'reject' ? 'suspended' : 'under_review'
    });
  };

  const stageLabels = {
    idle: "Ready to start",
    initializing: "Initializing analysis...",
    documents: "Analyzing documents...",
    questionnaire: "Analyzing questionnaire responses...",
    risk_assessment: "Performing comprehensive risk assessment...",
    scoring: "Calculating risk scores...",
    finalization: "Creating assessment & tasks...",
    error: "Analysis failed"
  };

  const severityColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-6 w-6 text-purple-400" />
          Automated Due Diligence Engine
        </CardTitle>
        <p className="text-sm text-slate-400">
          AI-powered comprehensive vendor risk assessment combining document analysis & questionnaire evaluation
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="space-y-6">
            {/* Input Summary */}
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs text-slate-400">Documents</span>
                </div>
                <div className="text-2xl font-bold text-white">{documents?.length || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Questionnaire</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {questionnaireData ? '✓' : '✗'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-slate-400">Assessments</span>
                </div>
                <div className="text-2xl font-bold text-white">{assessments.length}</div>
              </div>
            </div>

            {/* Status */}
            {analyzing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    <span className="text-sm text-slate-300">{stageLabels[stage]}</span>
                  </div>
                  <span className="text-sm text-slate-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Start Button */}
            <div className="text-center py-4">
              <Button
                onClick={runAutomatedDueDiligence}
                disabled={analyzing}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {analyzing ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Running Analysis...</>
                ) : (
                  <><Zap className="h-5 w-5 mr-2" /> Start Automated Due Diligence</>
                )}
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                This will analyze all documents and questionnaire responses to generate a comprehensive risk assessment
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Executive Summary */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {analysis.comprehensiveRisk.executive_summary}
                      </p>
                    </div>
                    <div className="text-center ml-6">
                      <div className="text-4xl font-bold text-white mb-1">
                        {analysis.riskScore.overall}
                      </div>
                      <div className="text-xs text-slate-400 mb-2">Risk Score</div>
                      <Badge className={severityColors[analysis.comprehensiveRisk.overall_risk_rating]}>
                        {analysis.comprehensiveRisk.overall_risk_rating.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-400">Recommendation:</strong>
                    <Badge className={`${
                      analysis.comprehensiveRisk.recommendation === 'approve' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      analysis.comprehensiveRisk.recommendation === 'conditional_approve' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {analysis.comprehensiveRisk.recommendation.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {Object.entries(analysis.riskScore).map(([key, score]) => (
                      <div key={key} className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                          <span className={`text-lg font-bold ${
                            score >= 80 ? 'text-emerald-400' :
                            score >= 60 ? 'text-blue-400' :
                            score >= 40 ? 'text-amber-400' : 'text-rose-400'
                          }`}>{score}</span>
                        </div>
                        <Progress value={score} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Critical Findings */}
              {analysis.comprehensiveRisk.critical_findings?.length > 0 && (
                <Alert className="bg-rose-500/10 border-rose-500/30">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <AlertDescription>
                    <div className="font-semibold text-rose-400 mb-2">Critical Findings</div>
                    <ul className="space-y-1">
                      {analysis.comprehensiveRisk.critical_findings.map((finding, i) => (
                        <li key={i} className="text-sm text-slate-300">• {finding}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Consolidated Risks */}
              <Card className="bg-[#151d2e] border-[#2a3548]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-rose-400" />
                    Consolidated Risk Assessment ({analysis.comprehensiveRisk.consolidated_risks?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.comprehensiveRisk.consolidated_risks?.map((risk, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm flex-1">{risk.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={severityColors[risk.severity]}>{risk.severity}</Badge>
                            <Badge className="bg-slate-500/10 text-slate-400 text-xs">{risk.source}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{risk.description}</p>
                        <div className="text-xs text-slate-500">
                          <strong>Impact:</strong> {risk.impact} | <strong>Likelihood:</strong> {risk.likelihood}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mitigation Plan */}
              <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Mitigation Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {analysis.comprehensiveRisk.mitigation_plan}
                  </p>
                  <div>
                    <div className="text-sm font-semibold text-white mb-2">Recommended Actions:</div>
                    <div className="space-y-2">
                      {analysis.comprehensiveRisk.recommended_actions?.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                          <Badge className={`${
                            action.priority === 'critical' || action.priority === 'high' 
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          } text-xs`}>
                            {action.priority}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-white">{action.action}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Timeline: {action.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => setAnalysis(null)}
                variant="outline"
                className="w-full border-[#2a3548]"
              >
                Run New Analysis
              </Button>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}