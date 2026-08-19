import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, Lock, Eye } from "lucide-react";

export default function PrivacyAIInsightsPanel({ assessments, risks, controls, compliance, incidents }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(assessments) && assessments.length > 0 && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessments]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validAssessments = Array.isArray(assessments) ? assessments : [];
      const validRisks = Array.isArray(risks) ? risks : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validCompliance = Array.isArray(compliance) ? compliance : [];
      const validIncidents = Array.isArray(incidents) ? incidents : [];

      // Privacy-specific metrics
      const completedAssessments = validAssessments.filter(a => a?.status === 'completed');
      const inProgress = validAssessments.filter(a => a?.status === 'in_progress');
      const notStarted = validAssessments.filter(a => a?.status === 'not_started');

      // Risk distribution
      const privacyRisks = validRisks.filter(r => 
        r?.category === 'privacy' || 
        r?.title?.toLowerCase().includes('privacy') ||
        r?.title?.toLowerCase().includes('data')
      );
      const highPrivacyRisks = privacyRisks.filter(r => (r?.likelihood || 0) * (r?.impact || 0) >= 12);

      // Compliance with privacy regulations
      const privacyCompliance = validCompliance.filter(c => 
        ['GDPR', 'CCPA', 'HIPAA'].includes(c?.framework)
      );
      const compliantItems = privacyCompliance.filter(c => 
        c?.status === 'implemented' || c?.status === 'verified'
      );
      const nonCompliantItems = privacyCompliance.filter(c => c?.status === 'non_compliant');
      
      const complianceRate = privacyCompliance.length > 0
        ? Math.round((compliantItems.length / privacyCompliance.length) * 100)
        : 0;

      // Privacy controls
      const privacyControls = validControls.filter(c => 
        c?.domain === 'data_protection' || 
        c?.domain === 'privacy' ||
        c?.name?.toLowerCase().includes('privacy')
      );
      const effectivePrivacyControls = privacyControls.filter(c => c?.effectiveness >= 4);
      const controlEffectiveness = privacyControls.length > 0
        ? Math.round((effectivePrivacyControls.length / privacyControls.length) * 100)
        : 0;

      // Data breach incidents
      const dataBreaches = validIncidents.filter(i => 
        i?.incident_type === 'data_leak' || 
        i?.incident_type === 'security_breach' ||
        i?.incident_type === 'privacy_violation'
      );
      const criticalBreaches = dataBreaches.filter(i => i?.severity === 'critical');

      // Framework coverage
      const frameworkCoverage = {};
      privacyCompliance.forEach(c => {
        const fw = c?.framework || 'other';
        if (!frameworkCoverage[fw]) {
          frameworkCoverage[fw] = { total: 0, compliant: 0 };
        }
        frameworkCoverage[fw].total++;
        if (c?.status === 'implemented' || c?.status === 'verified') {
          frameworkCoverage[fw].compliant++;
        }
      });

      const context = {
        total_assessments: validAssessments.length,
        completed: completedAssessments.length,
        in_progress: inProgress.length,
        not_started: notStarted.length,
        privacy_risks: {
          total: privacyRisks.length,
          high: highPrivacyRisks.length
        },
        privacy_compliance: {
          total: privacyCompliance.length,
          rate: complianceRate,
          compliant: compliantItems.length,
          non_compliant: nonCompliantItems.length
        },
        privacy_controls: {
          total: privacyControls.length,
          effective: effectivePrivacyControls.length,
          effectiveness_rate: controlEffectiveness
        },
        data_breaches: {
          total: dataBreaches.length,
          critical: criticalBreaches.length
        },
        framework_coverage: frameworkCoverage,
        top_assessments: validAssessments.slice(0, 10).map(a => ({
          title: a?.title,
          status: a?.status,
          assessment_type: a?.assessment_type
        }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a privacy compliance expert, analyze this privacy assessment program and provide actionable insights:

PRIVACY PROGRAM SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED PRIVACY ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall privacy posture (Strong/Adequate/At Risk/Critical)
   - Total assessments: ${validAssessments.length} (${completedAssessments.length} completed)
   - Privacy compliance rate: ${complianceRate}%
   - Control effectiveness: ${controlEffectiveness}%
   - Key privacy gaps and priorities
   - Data breach risk assessment

2. ASSESSMENT STATUS:
   - Completed: ${completedAssessments.length}
   - In progress: ${inProgress.length}
   - Not started: ${notStarted.length}
   - Assessment coverage gaps
   - Priority areas needing assessment

3. PRIVACY RISK LANDSCAPE:
   - Total privacy risks: ${privacyRisks.length}
   - High-risk items: ${highPrivacyRisks.length}
   - Data breach incidents: ${dataBreaches.length} (${criticalBreaches.length} critical)
   - Risk concentrations
   - Emerging privacy threats

4. REGULATORY COMPLIANCE:
   - Compliance rate: ${complianceRate}%
   - Framework-by-framework status
   - Non-compliant items: ${nonCompliantItems.length}
   - Critical gaps requiring attention
   - Multi-jurisdiction challenges

5. CONTROL EFFECTIVENESS:
   - Privacy controls: ${privacyControls.length}
   - Effectiveness rate: ${controlEffectiveness}%
   - Control gaps
   - Technical vs. administrative controls
   - Recommended improvements

6. PRIORITY ACTIONS (Top 5):
   - Privacy-specific remediation
   - Assessment completion priorities
   - Control implementation needs
   - Compliance gap closure
   - Timeline expectations

Focus on privacy compliance and data protection. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            privacy_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            assessment_status: {
              type: "object",
              properties: {
                summary: { type: "string" },
                gaps: { type: "array", items: { type: "string" } }
              }
            },
            risk_landscape: {
              type: "object",
              properties: {
                summary: { type: "string" },
                threats: { type: "array", items: { type: "string" } }
              }
            },
            compliance_analysis: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            control_effectiveness: { type: "string" },
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
      console.error('Error generating privacy insights:', error);
      setInsights({
        executive_summary: "Unable to generate privacy insights at this time. Please try again.",
        privacy_posture: "Error",
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
    <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-base text-white">Privacy Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered privacy insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-white">Privacy Program Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.privacy_posture?.toLowerCase()] || postureColors.adequate
                  }`}>
                    {insights.privacy_posture}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Privacy Alerts
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
              {/* Assessment Status */}
              {insights.assessment_status && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-purple-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Eye className="h-3 w-3 text-purple-400" /> Assessments
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.assessment_status.summary}</p>
                </div>
              )}

              {/* Risk Landscape */}
              {insights.risk_landscape && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Risks
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.risk_landscape.summary}</p>
                </div>
              )}
            </div>

            {/* Compliance Analysis */}
            {insights.compliance_analysis && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" /> Compliance
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.compliance_analysis.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.compliance_analysis.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Privacy Actions
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
                      {item.timeline && <p className="text-[10px] text-purple-400 mt-0.5">{item.timeline}</p>}
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