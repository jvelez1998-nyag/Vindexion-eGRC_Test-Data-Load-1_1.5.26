import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity } from "lucide-react";

export default function RiskAIInsightsPanel({ risks, controls, incidents }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(risks) && risks.length > 0 && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risks]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validRisks = Array.isArray(risks) ? risks : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validIncidents = Array.isArray(incidents) ? incidents : [];

      // Risk metrics
      const byCategory = {};
      validRisks.forEach(r => {
        const cat = r?.category || 'other';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });

      const byStatus = {};
      validRisks.forEach(r => {
        const status = r?.status || 'unknown';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      const criticalRisks = validRisks.filter(r => {
        const score = (r?.likelihood || 0) * (r?.impact || 0);
        return score >= 16;
      });

      const highRisks = validRisks.filter(r => {
        const score = (r?.likelihood || 0) * (r?.impact || 0);
        return score >= 9 && score < 16;
      });

      const overdueRisks = validRisks.filter(r => 
        r?.due_date && new Date(r.due_date) < new Date() && r?.status !== 'closed'
      );

      const linkedControls = validRisks.filter(r => 
        Array.isArray(r?.linked_controls) && r.linked_controls.length > 0
      );

      const controlCoverage = validRisks.length > 0 
        ? Math.round((linkedControls.length / validRisks.length) * 100)
        : 0;

      const context = {
        total_risks: validRisks.length,
        critical_risks: criticalRisks.length,
        high_risks: highRisks.length,
        overdue_risks: overdueRisks.length,
        by_category: byCategory,
        by_status: byStatus,
        control_coverage: controlCoverage,
        total_controls: validControls.length,
        total_incidents: validIncidents.length,
        open_risks: byStatus.identified + byStatus.assessing + byStatus.mitigating + byStatus.monitoring || 0
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a risk management expert, analyze this risk portfolio and provide actionable insights:

RISK PORTFOLIO:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall risk posture (High/Elevated/Moderate/Low)
   - Total risks: ${validRisks.length}
   - Critical risks: ${criticalRisks.length}
   - High risks: ${highRisks.length}
   - Overdue items: ${overdueRisks.length}
   - Control coverage: ${controlCoverage}%
   - Key concerns and strengths
   - Immediate priorities

2. RISK LANDSCAPE:
   - Distribution by category
   - Risk concentrations
   - Emerging patterns

3. CRITICALITY ANALYSIS:
   - Critical and high risk items
   - Trending severity
   - Escalation concerns

4. CONTROL EFFECTIVENESS:
   - Coverage: ${controlCoverage}%
   - Gaps and weaknesses
   - Enhancement opportunities

5. MITIGATION STATUS:
   - Overdue: ${overdueRisks.length}
   - In progress status
   - Workflow bottlenecks

6. PRIORITY ACTIONS (Top 5):
   - Specific, actionable recommendations
   - Urgency and timeline
   - Expected impact

Focus on proactive risk management and mitigation effectiveness.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            risk_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            risk_landscape: {
              type: "object",
              properties: {
                summary: { type: "string" },
                concentrations: { type: "array", items: { type: "string" } }
              }
            },
            criticality_analysis: {
              type: "object",
              properties: {
                summary: { type: "string" },
                trends: { type: "array", items: { type: "string" } }
              }
            },
            control_effectiveness: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            mitigation_status: { type: "string" },
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
    high: 'bg-rose-500/20 text-rose-400',
    elevated: 'bg-amber-500/20 text-amber-400',
    moderate: 'bg-blue-500/20 text-blue-400',
    low: 'bg-emerald-500/20 text-emerald-400'
  };

  return (
    <Card className="bg-gradient-to-br from-rose-500/5 to-orange-500/5 border-rose-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-400" />
            <CardTitle className="text-base text-white">Risk Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered risk insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-rose-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-semibold text-white">Risk Portfolio Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.risk_posture?.toLowerCase()] || postureColors.moderate
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
              {/* Risk Landscape */}
              {insights.risk_landscape && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-rose-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-rose-400" /> Landscape
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.risk_landscape.summary}</p>
                </div>
              )}

              {/* Criticality */}
              {insights.criticality_analysis && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" /> Criticality
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.criticality_analysis.summary}</p>
                </div>
              )}
            </div>

            {/* Control Effectiveness */}
            {insights.control_effectiveness && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" /> Control Effectiveness
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.control_effectiveness.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.control_effectiveness.summary}</p>
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
                      {item.timeline && <p className="text-[10px] text-rose-400 mt-0.5">{item.timeline}</p>}
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