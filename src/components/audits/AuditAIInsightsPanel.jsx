import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, CheckCircle2, FileText } from "lucide-react";

export default function AuditAIInsightsPanel({ audits, findings, controls, risks }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(audits) && audits.length > 0) {
      if (!insights && !loading) {
        generateInsights();
      }
    }
  }, [audits, findings, controls, risks]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validAudits = Array.isArray(audits) ? audits : [];
      const validFindings = Array.isArray(findings) ? findings : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validRisks = Array.isArray(risks) ? risks : [];

      // Audit-specific metrics
      const planned = validAudits.filter(a => a?.status === 'planned');
      const inProgress = validAudits.filter(a => a?.status === 'in_progress');
      const completed = validAudits.filter(a => a?.status === 'completed');
      const followUp = validAudits.filter(a => a?.status === 'follow_up');

      // Audit types distribution
      const byType = {};
      validAudits.forEach(a => {
        const type = a?.type || 'other';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Findings analysis
      const criticalFindings = validFindings.filter(f => f?.severity === 'critical');
      const highFindings = validFindings.filter(f => f?.severity === 'high');
      const openFindings = validFindings.filter(f => f?.status === 'open');
      const overdue = validFindings.filter(f => 
        f?.due_date && new Date(f.due_date) < new Date() && f?.status !== 'closed'
      );

      // Findings by audit
      const findingsByAudit = {};
      validFindings.forEach(f => {
        const auditId = f?.audit_id;
        if (auditId) {
          findingsByAudit[auditId] = (findingsByAudit[auditId] || 0) + 1;
        }
      });

      // Control effectiveness from audits
      const auditsWithControls = validAudits.filter(a => {
        const auditFindings = validFindings.filter(f => f?.audit_id === a?.id);
        return auditFindings.some(f => f?.linked_controls?.length > 0);
      });

      const controlCoverage = validAudits.length > 0
        ? Math.round((auditsWithControls.length / validAudits.length) * 100)
        : 0;

      // Risk exposure from findings
      const findingsWithRisks = validFindings.filter(f => f?.linked_risks?.length > 0);
      const riskCoverage = validFindings.length > 0
        ? Math.round((findingsWithRisks.length / validFindings.length) * 100)
        : 0;

      // Recent audits
      const recentCompleted = validAudits
        .filter(a => a?.status === 'completed' && a?.end_date)
        .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
        .slice(0, 5);

      const context = {
        total_audits: validAudits.length,
        planned: planned.length,
        in_progress: inProgress.length,
        completed: completed.length,
        follow_up: followUp.length,
        audits_by_type: byType,
        findings: {
          total: validFindings.length,
          critical: criticalFindings.length,
          high: highFindings.length,
          open: openFindings.length,
          overdue: overdue.length,
          avg_per_audit: validAudits.length > 0 ? (validFindings.length / validAudits.length).toFixed(1) : 0
        },
        control_coverage: controlCoverage,
        risk_coverage: riskCoverage,
        recent_audits: recentCompleted.map(a => ({
          title: a?.title,
          type: a?.type,
          findings_count: findingsByAudit[a?.id] || 0,
          critical_findings: validFindings.filter(f => f?.audit_id === a?.id && f?.severity === 'critical').length
        })),
        audit_effectiveness: {
          total_findings: validFindings.length,
          critical_rate: validFindings.length > 0 ? Math.round((criticalFindings.length / validFindings.length) * 100) : 0,
          closure_rate: validFindings.length > 0 ? Math.round(((validFindings.length - openFindings.length) / validFindings.length) * 100) : 0
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As an audit management expert, analyze this audit portfolio and provide actionable insights:

AUDIT PORTFOLIO SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED AUDIT ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall audit program health (Strong/Adequate/Needs Attention/Critical)
   - Total audits: ${validAudits.length} (${planned.length} planned, ${inProgress.length} in progress)
   - Total findings: ${validFindings.length} (${criticalFindings.length} critical, ${openFindings.length} open)
   - Key audit gaps and priorities
   - Immediate action items

2. AUDIT PIPELINE STATUS:
   - Planned audits: ${planned.length}
   - In progress: ${inProgress.length}
   - Completed: ${completed.length}
   - Follow-up required: ${followUp.length}
   - Pipeline adequacy and coverage gaps

3. FINDINGS ANALYSIS:
   - Total findings: ${validFindings.length}
   - Critical: ${criticalFindings.length}
   - High: ${highFindings.length}
   - Open: ${openFindings.length}
   - Overdue: ${overdue.length}
   - Trending issues and patterns
   - Closure rate: ${context.audit_effectiveness.closure_rate}%

4. CONTROL & RISK LINKAGE:
   - Control coverage: ${controlCoverage}%
   - Risk coverage: ${riskCoverage}%
   - Integration effectiveness
   - Coverage gaps requiring attention

5. AUDIT EFFECTIVENESS:
   - Critical finding rate: ${context.audit_effectiveness.critical_rate}%
   - Average findings per audit: ${context.findings.avg_per_audit}
   - Quality of audit execution
   - Areas requiring process improvement

6. PRIORITY ACTIONS (Top 5):
   - Audit-specific remediation steps
   - Finding closure priorities
   - Control/risk linkage needs
   - Timeline-critical actions
   - Resource allocation recommendations

Focus on audit execution, finding management, and assurance effectiveness. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            program_health: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            pipeline_status: {
              type: "object",
              properties: {
                summary: { type: "string" },
                coverage_gaps: { type: "array", items: { type: "string" } }
              }
            },
            findings_analysis: {
              type: "object",
              properties: {
                summary: { type: "string" },
                trending_issues: { type: "array", items: { type: "string" } }
              }
            },
            linkage_assessment: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            effectiveness_assessment: { type: "string" },
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
      console.error('Error generating audit insights:', error);
      setInsights({
        executive_summary: "Unable to generate audit insights at this time. Please try again.",
        program_health: "Error",
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

  const healthColors = {
    strong: 'bg-emerald-500/20 text-emerald-400',
    adequate: 'bg-blue-500/20 text-blue-400',
    'needs attention': 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-base text-white">Audit Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered audit insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-semibold text-white">Audit Program Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    healthColors[insights.program_health?.toLowerCase()] || healthColors.adequate
                  }`}>
                    {insights.program_health}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Audit Alerts
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
              {/* Pipeline Status */}
              {insights.pipeline_status && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-violet-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-violet-400" /> Pipeline
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.pipeline_status.summary}</p>
                </div>
              )}

              {/* Findings Analysis */}
              {insights.findings_analysis && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-amber-400" /> Findings
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.findings_analysis.summary}</p>
                </div>
              )}
            </div>

            {/* Linkage Assessment */}
            {insights.linkage_assessment && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" /> Control & Risk Linkage
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.linkage_assessment.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.linkage_assessment.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Audit Actions
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
                      {item.timeline && <p className="text-[10px] text-violet-400 mt-0.5">{item.timeline}</p>}
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