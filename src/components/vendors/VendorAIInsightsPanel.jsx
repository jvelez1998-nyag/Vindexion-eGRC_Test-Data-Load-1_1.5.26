import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, Building2, Users } from "lucide-react";

export default function VendorAIInsightsPanel({ vendors, assessments, controls, risks }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(vendors) && vendors.length > 0) {
      if (!insights && !loading) {
        generateInsights();
      }
    }
  }, [vendors, assessments, controls, risks]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validVendors = Array.isArray(vendors) ? vendors : [];
      const validAssessments = Array.isArray(assessments) ? assessments : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validRisks = Array.isArray(risks) ? risks : [];

      // Vendor-specific metrics
      const activeVendors = validVendors.filter(v => v?.status === 'active');
      const underReview = validVendors.filter(v => v?.status === 'under_review');
      const suspended = validVendors.filter(v => v?.status === 'suspended');
      
      // Risk tier distribution
      const criticalTier = validVendors.filter(v => v?.risk_tier === 'tier_1' || v?.criticality === 'critical');
      const highRiskTier = validVendors.filter(v => v?.risk_tier === 'tier_2' || v?.criticality === 'high');

      // Vendor types
      const byType = {};
      validVendors.forEach(v => {
        const type = v?.vendor_type || 'other';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Assessment status
      const assessmentStatus = {};
      validAssessments.forEach(a => {
        const status = a?.status || 'pending';
        assessmentStatus[status] = (assessmentStatus[status] || 0) + 1;
      });

      // Contract expirations
      const today = new Date();
      const expiringIn90Days = validVendors.filter(v => {
        if (!v?.contract_end_date) return false;
        const endDate = new Date(v.contract_end_date);
        const daysUntil = (endDate - today) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 90;
      });

      const overdue = validVendors.filter(v => {
        if (!v?.contract_end_date) return false;
        return new Date(v.contract_end_date) < today;
      });

      // Average security score
      const vendorsWithScores = validVendors.filter(v => v?.security_score);
      const avgSecurityScore = vendorsWithScores.length > 0
        ? Math.round(vendorsWithScores.reduce((sum, v) => sum + (v.security_score || 0), 0) / vendorsWithScores.length)
        : 0;

      // Compliance status
      const compliantVendors = validVendors.filter(v => v?.compliance_status === 'compliant');
      const nonCompliantVendors = validVendors.filter(v => v?.compliance_status === 'non_compliant');
      const complianceRate = validVendors.length > 0
        ? Math.round((compliantVendors.length / validVendors.length) * 100)
        : 0;

      // Data access analysis
      const highDataAccess = validVendors.filter(v => v?.data_access_level === 'extensive' || v?.data_access_level === 'moderate');

      // Overdue reviews
      const needingReview = validVendors.filter(v => {
        if (!v?.next_review_date) return false;
        return new Date(v.next_review_date) < today;
      });

      const context = {
        total_vendors: validVendors.length,
        active: activeVendors.length,
        under_review: underReview.length,
        suspended: suspended.length,
        risk_tiers: {
          critical: criticalTier.length,
          high: highRiskTier.length
        },
        vendors_by_type: byType,
        avg_security_score: avgSecurityScore,
        compliance_rate: complianceRate,
        compliant: compliantVendors.length,
        non_compliant: nonCompliantVendors.length,
        contracts: {
          expiring_90_days: expiringIn90Days.length,
          overdue: overdue.length
        },
        assessments: {
          total: validAssessments.length,
          by_status: assessmentStatus
        },
        high_data_access: highDataAccess.length,
        reviews_overdue: needingReview.length,
        top_vendors: validVendors.slice(0, 10).map(v => ({
          name: v?.vendor_name,
          type: v?.vendor_type,
          risk_tier: v?.risk_tier,
          security_score: v?.security_score,
          compliance_status: v?.compliance_status
        }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a third-party risk management expert, analyze this vendor portfolio and provide actionable insights:

VENDOR PORTFOLIO SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED VENDOR RISK ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall vendor risk posture (Strong/Adequate/Elevated/Critical)
   - Total vendors: ${validVendors.length} (${criticalTier.length} critical tier, ${highRiskTier.length} high tier)
   - Average security score: ${avgSecurityScore}/100
   - Compliance rate: ${complianceRate}%
   - Key vendor risk exposures and priorities
   - Immediate action items

2. VENDOR PORTFOLIO HEALTH:
   - Active vendors: ${activeVendors.length}
   - Under review: ${underReview.length}
   - Suspended: ${suspended.length}
   - Risk tier distribution and concentration
   - Portfolio diversification assessment

3. RISK ASSESSMENT:
   - Critical tier: ${criticalTier.length}
   - High tier: ${highRiskTier.length}
   - Security score: ${avgSecurityScore}/100
   - Compliance rate: ${complianceRate}%
   - Non-compliant: ${nonCompliantVendors.length}
   - High data access vendors: ${highDataAccess.length}
   - Key risk concentrations

4. CONTRACT MANAGEMENT:
   - Expiring in 90 days: ${expiringIn90Days.length}
   - Overdue contracts: ${overdue.length}
   - Reviews overdue: ${needingReview.length}
   - Renewal priorities and timing

5. ASSESSMENT STATUS:
   - Total assessments: ${validAssessments.length}
   - Status breakdown
   - Assessment coverage gaps
   - Reassessment priorities

6. PRIORITY ACTIONS (Top 5):
   - Vendor-specific risk mitigation
   - Contract renewal priorities
   - Assessment completion needs
   - Compliance remediation
   - Timeline-critical actions

Focus on third-party risk management and vendor oversight. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            risk_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            portfolio_health: {
              type: "object",
              properties: {
                summary: { type: "string" },
                concerns: { type: "array", items: { type: "string" } }
              }
            },
            risk_assessment: {
              type: "object",
              properties: {
                summary: { type: "string" },
                concentrations: { type: "array", items: { type: "string" } }
              }
            },
            contract_management: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            assessment_status: { type: "string" },
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
      console.error('Error generating vendor insights:', error);
      setInsights({
        executive_summary: "Unable to generate vendor insights at this time. Please try again.",
        risk_posture: "Error",
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
    elevated: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-base text-white">Vendor Risk Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered vendor risk insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">Vendor Portfolio Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.risk_posture?.toLowerCase()] || postureColors.adequate
                  }`}>
                    {insights.risk_posture}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Vendor Alerts
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
              {/* Portfolio Health */}
              {insights.portfolio_health && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-indigo-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-indigo-400" /> Portfolio
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.portfolio_health.summary}</p>
                </div>
              )}

              {/* Risk Assessment */}
              {insights.risk_assessment && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Risk
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.risk_assessment.summary}</p>
                </div>
              )}
            </div>

            {/* Contract Management */}
            {insights.contract_management && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Users className="h-3 w-3 text-emerald-400" /> Contract Management
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.contract_management.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.contract_management.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Vendor Actions
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
                      {item.timeline && <p className="text-[10px] text-indigo-400 mt-0.5">{item.timeline}</p>}
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