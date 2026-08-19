import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, CheckCircle2, Layers } from "lucide-react";

export default function ComplianceFrameworkAIInsightsPanel({ compliance, controls, mappings, risks }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(compliance) && compliance.length > 0 && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compliance]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validCompliance = Array.isArray(compliance) ? compliance : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validMappings = Array.isArray(mappings) ? mappings : [];
      const validRisks = Array.isArray(risks) ? risks : [];

      // Framework-specific metrics
      const byFramework = {};
      validCompliance.forEach(c => {
        const fw = c?.framework || 'other';
        if (!byFramework[fw]) {
          byFramework[fw] = { 
            total: 0, 
            implemented: 0, 
            verified: 0, 
            in_progress: 0, 
            not_started: 0,
            non_compliant: 0 
          };
        }
        byFramework[fw].total++;
        if (c?.status === 'implemented') byFramework[fw].implemented++;
        if (c?.status === 'verified') byFramework[fw].verified++;
        if (c?.status === 'in_progress') byFramework[fw].in_progress++;
        if (c?.status === 'not_started') byFramework[fw].not_started++;
        if (c?.status === 'non_compliant') byFramework[fw].non_compliant++;
      });

      // Calculate compliance rates per framework
      const frameworkRates = {};
      Object.entries(byFramework).forEach(([fw, data]) => {
        frameworkRates[fw] = Math.round(((data.implemented + data.verified) / data.total) * 100);
      });

      // Overall compliance
      const implemented = validCompliance.filter(c => c?.status === 'implemented' || c?.status === 'verified');
      const overallRate = validCompliance.length > 0
        ? Math.round((implemented.length / validCompliance.length) * 100)
        : 0;

      // Control mapping coverage
      const mappedControls = validControls.filter(c => 
        c?.regulatory_mappings?.length > 0 || 
        Object.keys(c?.framework_mappings || {}).length > 0
      );
      const mappingCoverage = validControls.length > 0
        ? Math.round((mappedControls.length / validControls.length) * 100)
        : 0;

      // Gap analysis
      const notStarted = validCompliance.filter(c => c?.status === 'not_started');
      const nonCompliant = validCompliance.filter(c => c?.status === 'non_compliant');
      const withoutEvidence = validCompliance.filter(c => !c?.evidence_url && (c?.status === 'implemented' || c?.status === 'verified'));

      // Framework mappings
      const mappingStats = {
        total: validMappings.length,
        active: validMappings.filter(m => m?.status === 'active').length
      };

      // Risk linkage
      const complianceRisks = validRisks.filter(r => r?.category === 'compliance');
      const highComplianceRisks = complianceRisks.filter(r => (r?.likelihood || 0) * (r?.impact || 0) >= 12);

      const context = {
        total_requirements: validCompliance.length,
        overall_compliance_rate: overallRate,
        frameworks: byFramework,
        framework_rates: frameworkRates,
        gaps: {
          not_started: notStarted.length,
          non_compliant: nonCompliant.length,
          without_evidence: withoutEvidence.length
        },
        control_mapping: {
          total_controls: validControls.length,
          mapped: mappedControls.length,
          coverage: mappingCoverage
        },
        mappings: mappingStats,
        compliance_risks: {
          total: complianceRisks.length,
          high: highComplianceRisks.length
        },
        top_requirements: validCompliance.slice(0, 10).map(c => ({
          framework: c?.framework,
          requirement: c?.requirement,
          status: c?.status
        }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a compliance framework management expert, analyze this multi-framework compliance program and provide actionable insights:

COMPLIANCE FRAMEWORK SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED FRAMEWORK ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall framework compliance posture (Excellent/Strong/Adequate/At Risk)
   - Total requirements: ${validCompliance.length}
   - Overall compliance: ${overallRate}%
   - Frameworks covered: ${Object.keys(byFramework).length}
   - Control mapping: ${mappingCoverage}%
   - Key gaps and priorities
   - Multi-framework challenges

2. FRAMEWORK-BY-FRAMEWORK STATUS:
   - Detailed analysis of each framework
   - Compliance rates per framework
   - Framework-specific gaps
   - Priority frameworks needing attention
   - Framework maturity assessment

3. GAP ANALYSIS:
   - Not started: ${notStarted.length}
   - Non-compliant: ${nonCompliant.length}
   - Missing evidence: ${withoutEvidence.length}
   - Critical gaps requiring immediate action
   - Gap remediation priorities

4. CONTROL MAPPING:
   - Mapping coverage: ${mappingCoverage}%
   - Unmapped controls: ${validControls.length - mappedControls.length}
   - Cross-walk effectiveness
   - Mapping quality assessment
   - Recommended mapping priorities

5. COMPLIANCE RISK:
   - Compliance risks: ${complianceRisks.length} (${highComplianceRisks.length} high)
   - Regulatory exposure
   - Framework-specific risks
   - Risk mitigation priorities

6. PRIORITY ACTIONS (Top 5):
   - Framework-specific actions
   - Gap closure priorities
   - Control mapping needs
   - Evidence collection
   - Timeline expectations

Focus on multi-framework compliance management. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            compliance_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            framework_status: {
              type: "object",
              properties: {
                summary: { type: "string" },
                priorities: { type: "array", items: { type: "string" } }
              }
            },
            gap_analysis: {
              type: "object",
              properties: {
                summary: { type: "string" },
                critical_gaps: { type: "array", items: { type: "string" } }
              }
            },
            control_mapping: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            compliance_risk: { type: "string" },
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
      console.error('Error generating framework insights:', error);
      setInsights({
        executive_summary: "Unable to generate framework insights at this time. Please try again.",
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
    excellent: 'bg-emerald-500/20 text-emerald-400',
    strong: 'bg-blue-500/20 text-blue-400',
    adequate: 'bg-amber-500/20 text-amber-400',
    'at risk': 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-base text-white">Framework Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered framework insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white">Framework Portfolio Summary</span>
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
                  <AlertTriangle className="h-3 w-3" /> Critical Framework Alerts
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
              {/* Framework Status */}
              {insights.framework_status && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-blue-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-blue-400" /> Frameworks
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.framework_status.summary}</p>
                </div>
              )}

              {/* Gap Analysis */}
              {insights.gap_analysis && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Gaps
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.gap_analysis.summary}</p>
                </div>
              )}
            </div>

            {/* Control Mapping */}
            {insights.control_mapping && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Control Mapping
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.control_mapping.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.control_mapping.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Framework Actions
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
                      {item.timeline && <p className="text-[10px] text-blue-400 mt-0.5">{item.timeline}</p>}
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