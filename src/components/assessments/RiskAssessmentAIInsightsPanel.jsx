import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, Calculator } from "lucide-react";

export default function RiskAssessmentAIInsightsPanel({ assessments, risks, controls }) {
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

      // Assessment metrics
      const byType = {};
      validAssessments.forEach(a => {
        const type = a?.assessment_type || 'other';
        byType[type] = (byType[type] || 0) + 1;
      });

      const byStatus = {};
      validAssessments.forEach(a => {
        const status = a?.lifecycle_status || 'unknown';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      const highRisk = validAssessments.filter(a => {
        const residual = (a?.residual_likelihood || 0) * (a?.residual_impact || 0);
        return residual >= 16;
      });

      const avgControlEffectiveness = validAssessments.length > 0
        ? Math.round(validAssessments.reduce((sum, a) => sum + (a?.control_effectiveness || 0), 0) / validAssessments.length)
        : 0;

      const linkedControls = validAssessments.filter(a => Array.isArray(a?.linked_controls) && a.linked_controls.length > 0);
      const controlCoverage = validAssessments.length > 0 
        ? Math.round((linkedControls.length / validAssessments.length) * 100)
        : 0;

      const context = {
        total_assessments: validAssessments.length,
        by_type: byType,
        by_status: byStatus,
        high_risk_count: highRisk.length,
        avg_control_effectiveness: avgControlEffectiveness,
        control_coverage: controlCoverage,
        pending_review: byStatus.pending_review || 0,
        approved: byStatus.approved || 0,
        in_progress: byStatus.in_progress || 0,
        total_risks: validRisks.length,
        total_controls: validControls.length
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a risk assessment expert, analyze this RCSA portfolio and provide actionable insights:

ASSESSMENT PORTFOLIO:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall assessment maturity (Developing/Maturing/Advanced/Optimized)
   - Total assessments: ${validAssessments.length}
   - High risk items: ${highRisk.length}
   - Avg control effectiveness: ${avgControlEffectiveness}/5
   - Control coverage: ${controlCoverage}%
   - Key strengths and gaps
   - Priority actions

2. COVERAGE ANALYSIS:
   - Assessment distribution by type
   - Coverage gaps
   - Recommended focus areas

3. RISK SCORING:
   - High risk assessments: ${highRisk.length}
   - Scoring trends
   - Areas requiring attention

4. CONTROL LINKAGE:
   - Control coverage: ${controlCoverage}%
   - Effectiveness: ${avgControlEffectiveness}/5
   - Enhancement opportunities

5. LIFECYCLE STATUS:
   - Pending review: ${byStatus.pending_review || 0}
   - Approved: ${byStatus.approved || 0}
   - In progress: ${byStatus.in_progress || 0}
   - Workflow bottlenecks

6. PRIORITY ACTIONS (Top 5):
   - Specific, actionable recommendations
   - Timeline and urgency
   - Expected impact

Focus on RCSA best practices and continuous improvement.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            maturity_level: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            coverage_analysis: {
              type: "object",
              properties: {
                summary: { type: "string" },
                gaps: { type: "array", items: { type: "string" } }
              }
            },
            risk_scoring: {
              type: "object",
              properties: {
                summary: { type: "string" },
                trends: { type: "array", items: { type: "string" } }
              }
            },
            control_linkage: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            lifecycle_status: { type: "string" },
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
      console.error('Error generating insights:', error);
      setInsights({
        executive_summary: "Unable to generate insights at this time. Please try again.",
        maturity_level: "Error",
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

  const maturityColors = {
    developing: 'bg-amber-500/20 text-amber-400',
    maturing: 'bg-blue-500/20 text-blue-400',
    advanced: 'bg-emerald-500/20 text-emerald-400',
    optimized: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-base text-white">Assessment Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered assessment insights</p>
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
                  <span className="text-xs font-semibold text-white">Assessment Portfolio Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    maturityColors[insights.maturity_level?.toLowerCase()] || maturityColors.maturing
                  }`}>
                    {insights.maturity_level}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Alerts
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
              {/* Coverage Analysis */}
              {insights.coverage_analysis && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-cyan-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Calculator className="h-3 w-3 text-cyan-400" /> Coverage
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.coverage_analysis.summary}</p>
                </div>
              )}

              {/* Risk Scoring */}
              {insights.risk_scoring && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Risk Scoring
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.risk_scoring.summary}</p>
                </div>
              )}
            </div>

            {/* Control Linkage */}
            {insights.control_linkage && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" /> Control Linkage
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.control_linkage.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.control_linkage.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Actions
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