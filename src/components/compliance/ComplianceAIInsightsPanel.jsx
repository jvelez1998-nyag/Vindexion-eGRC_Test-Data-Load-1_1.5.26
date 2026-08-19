import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, CheckCircle2 } from "lucide-react";

export default function ComplianceAIInsightsPanel({ compliance, controls }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(compliance) && compliance.length > 0) {
      if (!insights && !loading) {
        generateInsights();
      }
    }
  }, [compliance, controls]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validCompliance = Array.isArray(compliance) ? compliance : [];
      const validControls = Array.isArray(controls) ? controls : [];

      // Compliance-specific metrics
      const implemented = validCompliance.filter(c => c?.status === 'implemented');
      const verified = validCompliance.filter(c => c?.status === 'verified');
      const inProgress = validCompliance.filter(c => c?.status === 'in_progress');
      const notStarted = validCompliance.filter(c => c?.status === 'not_started');
      const nonCompliant = validCompliance.filter(c => c?.status === 'non_compliant');
      
      const complianceRate = validCompliance.length > 0 
        ? Math.round(((implemented.length + verified.length) / validCompliance.length) * 100)
        : 0;

      const byFramework = {};
      validCompliance.forEach(c => {
        const fw = c?.framework || 'uncategorized';
        if (!byFramework[fw]) {
          byFramework[fw] = { total: 0, compliant: 0, non_compliant: 0, in_progress: 0 };
        }
        byFramework[fw].total++;
        if (c?.status === 'implemented' || c?.status === 'verified') byFramework[fw].compliant++;
        if (c?.status === 'non_compliant') byFramework[fw].non_compliant++;
        if (c?.status === 'in_progress') byFramework[fw].in_progress++;
      });

      // Control mapping
      const complianceWithControls = validCompliance.filter(c => {
        const requirementId = c?.requirement_id;
        return validControls.some(ctrl => 
          ctrl?.regulatory_mappings?.includes(requirementId) ||
          ctrl?.framework_mappings?.[c?.framework]?.includes(requirementId)
        );
      });

      const controlCoverage = validCompliance.length > 0
        ? Math.round((complianceWithControls.length / validCompliance.length) * 100)
        : 0;

      // Evidence tracking
      const withEvidence = validCompliance.filter(c => c?.evidence_url);
      const evidenceRate = validCompliance.length > 0
        ? Math.round((withEvidence.length / validCompliance.length) * 100)
        : 0;

      // Overdue items
      const overdue = validCompliance.filter(c => 
        c?.due_date && new Date(c.due_date) < new Date() && 
        !['implemented', 'verified'].includes(c?.status)
      );

      const context = {
        total_requirements: validCompliance.length,
        compliance_rate: complianceRate,
        implemented: implemented.length,
        verified: verified.length,
        in_progress: inProgress.length,
        not_started: notStarted.length,
        non_compliant: nonCompliant.length,
        overdue: overdue.length,
        frameworks: byFramework,
        control_coverage: controlCoverage,
        evidence_rate: evidenceRate,
        top_requirements: validCompliance.slice(0, 10).map(c => ({
          framework: c?.framework,
          requirement: c?.requirement,
          requirement_id: c?.requirement_id,
          status: c?.status,
          has_evidence: !!c?.evidence_url
        })),
        gaps: {
          no_evidence: validCompliance.filter(c => !c?.evidence_url && ['implemented', 'verified'].includes(c?.status)).length,
          no_controls: validCompliance.length - complianceWithControls.length,
          not_started: notStarted.length,
          overdue: overdue.length
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a compliance management expert, analyze this compliance portfolio and provide actionable insights:

COMPLIANCE PORTFOLIO SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED COMPLIANCE ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall compliance posture (Strong/Adequate/At Risk/Critical)
   - Total requirements: ${validCompliance.length}
   - Compliance rate: ${complianceRate}%
   - Key compliance gaps and priorities
   - Framework-specific concerns

2. COMPLIANCE STATUS:
   - Framework-by-framework breakdown
   - Compliant: ${implemented.length + verified.length}
   - Non-compliant: ${nonCompliant.length}
   - In progress: ${inProgress.length}
   - Not started: ${notStarted.length}
   - Critical gaps requiring immediate attention

3. EVIDENCE & DOCUMENTATION:
   - Evidence collection rate: ${evidenceRate}%
   - Requirements lacking evidence: ${context.gaps.no_evidence}
   - Documentation quality and completeness
   - Audit readiness assessment

4. CONTROL MAPPING:
   - Control coverage: ${controlCoverage}%
   - Requirements without controls: ${context.gaps.no_controls}
   - Control-compliance alignment
   - Coverage gaps by framework

5. RISK ASSESSMENT:
   - Overdue requirements: ${overdue.length}
   - High-risk non-compliance areas
   - Regulatory exposure analysis
   - Frameworks at risk

6. PRIORITY ACTIONS (Top 5):
   - Compliance-specific remediation steps
   - Evidence collection priorities
   - Control mapping needs
   - Framework-specific actions
   - Timeline expectations

Focus on compliance management and regulatory adherence. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            compliance_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            compliance_status: {
              type: "object",
              properties: {
                summary: { type: "string" },
                framework_issues: { type: "array", items: { type: "string" } }
              }
            },
            evidence_assessment: {
              type: "object",
              properties: {
                summary: { type: "string" },
                gaps: { type: "array", items: { type: "string" } }
              }
            },
            control_mapping: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            risk_assessment: { type: "string" },
            priority_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  urgency: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            }
          }
        }
      });
      setInsights(result);
    } catch (error) {
      console.error('Error generating compliance insights:', error);
      setInsights({
        executive_summary: "Unable to generate compliance insights at this time. Please try again.",
        compliance_posture: "Error",
        critical_alerts: ["AI service temporarily unavailable"],
        priority_actions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const postureColors = {
    strong: 'bg-emerald-500/20 text-emerald-400',
    adequate: 'bg-blue-500/20 text-blue-400',
    'at risk': 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-base text-white">Compliance Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered compliance insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Compliance Portfolio Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.compliance_posture?.toLowerCase()] || postureColors.adequate
                  }`}>
                    {insights.compliance_posture}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Compliance Alerts
                </p>
                <div className="space-y-1">
                  {insights.critical_alerts.map((alert, i) => (
                    <div key={i} className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <p className="text-xs text-rose-300">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Compliance Status */}
              {insights.compliance_status && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Compliance Status
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.compliance_status.summary}</p>
                </div>
              )}

              {/* Evidence Assessment */}
              {insights.evidence_assessment && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Evidence
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.evidence_assessment.summary}</p>
                </div>
              )}
            </div>

            {/* Control Mapping */}
            {insights.control_mapping && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-violet-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-violet-400" /> Control Coverage
                  </p>
                  <span className="text-sm font-bold text-violet-400">{insights.control_mapping.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.control_mapping.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Compliance Actions
              </p>
              <div className="space-y-1">
                {insights.priority_actions?.slice(0, 5).map((item, i) => (
                  <div 
                    key={i} 
                    className="p-2 bg-[#151d2e] rounded-lg border border-[#2a3548] flex items-start gap-2 hover:bg-[#1e2a3d] transition-colors"
                  >
                    <Badge className={`text-[10px] flex-shrink-0 ${urgencyColors[item.urgency?.toLowerCase()] || urgencyColors.medium}`}>
                      {item.urgency}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white">{item.action}</p>
                      {item.timeline && <p className="text-[10px] text-emerald-400 mt-0.5">{item.timeline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}