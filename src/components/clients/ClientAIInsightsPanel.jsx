import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, Users, TrendingDown } from "lucide-react";

export default function ClientAIInsightsPanel({ clients, risks, audits, incidents, findings }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(clients) && clients.length > 0) {
      if (!insights && !loading) {
        generateInsights();
      }
    }
  }, [clients, risks, audits, incidents, findings]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validClients = Array.isArray(clients) ? clients : [];
      const validRisks = Array.isArray(risks) ? risks : [];
      const validAudits = Array.isArray(audits) ? audits : [];
      const validIncidents = Array.isArray(incidents) ? incidents : [];
      const validFindings = Array.isArray(findings) ? findings : [];

      // Client-specific metrics
      const activeClients = validClients.filter(c => c?.status === 'active');
      const atRiskClients = validClients.filter(c => c?.status === 'at_risk');
      const prospects = validClients.filter(c => c?.status === 'prospect');
      const churned = validClients.filter(c => c?.status === 'churned');

      // Risk distribution
      const criticalRisk = validClients.filter(c => c?.risk_level === 'critical');
      const highRisk = validClients.filter(c => c?.risk_level === 'high');
      
      // Client types
      const byType = {};
      validClients.forEach(c => {
        const type = c?.client_type || 'other';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Industries
      const byIndustry = {};
      validClients.forEach(c => {
        const industry = c?.industry || 'other';
        byIndustry[industry] = (byIndustry[industry] || 0) + 1;
      });

      // Average scores
      const clientsWithRiskScore = validClients.filter(c => c?.risk_score);
      const avgRiskScore = clientsWithRiskScore.length > 0
        ? Math.round(clientsWithRiskScore.reduce((sum, c) => sum + (c.risk_score || 0), 0) / clientsWithRiskScore.length)
        : 0;

      const clientsWithComplianceScore = validClients.filter(c => c?.compliance_score);
      const avgComplianceScore = clientsWithComplianceScore.length > 0
        ? Math.round(clientsWithComplianceScore.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / clientsWithComplianceScore.length)
        : 0;

      const clientsWithControlMaturity = validClients.filter(c => c?.control_maturity);
      const avgControlMaturity = clientsWithControlMaturity.length > 0
        ? Math.round(clientsWithControlMaturity.reduce((sum, c) => sum + (c.control_maturity || 0), 0) / clientsWithControlMaturity.length)
        : 0;

      // Linked data analysis
      const clientsWithIssues = validClients.filter(c => 
        (c?.incident_count > 0) || (c?.finding_count > 0) || (c?.critical_issues > 0)
      );

      // Assessment status
      const overdueAssessments = validClients.filter(c => {
        if (!c?.next_review_date) return false;
        return new Date(c.next_review_date) < new Date();
      });

      const context = {
        total_clients: validClients.length,
        active: activeClients.length,
        at_risk: atRiskClients.length,
        prospects: prospects.length,
        churned: churned.length,
        risk_levels: {
          critical: criticalRisk.length,
          high: highRisk.length
        },
        clients_by_type: byType,
        top_industries: Object.entries(byIndustry).sort((a, b) => b[1] - a[1]).slice(0, 5),
        avg_risk_score: avgRiskScore,
        avg_compliance_score: avgComplianceScore,
        avg_control_maturity: avgControlMaturity,
        clients_with_issues: clientsWithIssues.length,
        total_incidents: validIncidents.length,
        total_findings: validFindings.length,
        overdue_assessments: overdueAssessments.length,
        top_clients: validClients.slice(0, 10).map(c => ({
          name: c?.name,
          type: c?.client_type,
          status: c?.status,
          risk_score: c?.risk_score,
          compliance_score: c?.compliance_score
        }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a client risk management expert, analyze this client portfolio and provide actionable insights:

CLIENT PORTFOLIO SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED CLIENT RISK ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall client portfolio health (Strong/Healthy/Concerning/Critical)
   - Total clients: ${validClients.length} (${activeClients.length} active, ${atRiskClients.length} at risk)
   - Average risk score: ${avgRiskScore}/100
   - Average compliance: ${avgComplianceScore}/100
   - Key portfolio risks and priorities
   - Immediate action items

2. PORTFOLIO HEALTH:
   - Active clients: ${activeClients.length}
   - At-risk clients: ${atRiskClients.length}
   - Churned: ${churned.length}
   - Critical/high risk: ${criticalRisk.length + highRisk.length}
   - Portfolio concentration and diversification

3. RISK ASSESSMENT:
   - Average risk score: ${avgRiskScore}/100
   - Average compliance: ${avgComplianceScore}/100
   - Control maturity: ${avgControlMaturity}/100
   - Clients with issues: ${clientsWithIssues.length}
   - Risk concentrations by type/industry

4. CLIENT ENGAGEMENT:
   - Status distribution analysis
   - At-risk client trends
   - Churn patterns and indicators
   - Prospect conversion opportunities

5. ASSESSMENT STATUS:
   - Overdue assessments: ${overdueAssessments.length}
   - Assessment coverage gaps
   - Reassessment priorities
   - Data quality concerns

6. PRIORITY ACTIONS (Top 5):
   - Client-specific risk mitigation
   - At-risk client interventions
   - Assessment completion priorities
   - Compliance improvement actions
   - Timeline expectations

Focus on client risk management and portfolio oversight. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            portfolio_health: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            health_status: {
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
            engagement_analysis: {
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
      console.error('Error generating client insights:', error);
      setInsights({
        executive_summary: "Unable to generate client insights at this time. Please try again.",
        portfolio_health: "Error",
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
    healthy: 'bg-blue-500/20 text-blue-400',
    concerning: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-base text-white">Client Portfolio Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered client portfolio insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Portfolio Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    healthColors[insights.portfolio_health?.toLowerCase()] || healthColors.healthy
                  }`}>
                    {insights.portfolio_health}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Client Alerts
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
              {/* Health Status */}
              {insights.health_status && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-cyan-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3 text-cyan-400" /> Portfolio
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.health_status.summary}</p>
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

            {/* Engagement Analysis */}
            {insights.engagement_analysis && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-emerald-400" /> Engagement Health
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.engagement_analysis.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.engagement_analysis.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Client Actions
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
                      {item.timeline && <p className="text-[10px] text-cyan-400 mt-0.5">{item.timeline}</p>}
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