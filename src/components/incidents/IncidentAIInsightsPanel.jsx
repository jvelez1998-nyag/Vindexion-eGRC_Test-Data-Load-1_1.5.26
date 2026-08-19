import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, Clock } from "lucide-react";

export default function IncidentAIInsightsPanel({ incidents, risks, controls }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(incidents) && incidents.length > 0) {
      if (!insights && !loading) {
        generateInsights();
      }
    }
  }, [incidents, risks, controls]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validIncidents = Array.isArray(incidents) ? incidents : [];
      const validRisks = Array.isArray(risks) ? risks : [];
      const validControls = Array.isArray(controls) ? controls : [];

      // Incident-specific metrics
      const criticalIncidents = validIncidents.filter(i => i?.severity === 'critical');
      const highIncidents = validIncidents.filter(i => i?.severity === 'high');
      const openIncidents = validIncidents.filter(i => !['closed', 'remediated'].includes(i?.status));
      const regulatoryReportable = validIncidents.filter(i => i?.regulatory_reportable);
      
      const incidentsByType = {};
      validIncidents.forEach(i => {
        const type = i?.incident_type || 'unknown';
        incidentsByType[type] = (incidentsByType[type] || 0) + 1;
      });

      const incidentsByStatus = {};
      validIncidents.forEach(i => {
        const status = i?.status || 'unknown';
        incidentsByStatus[status] = (incidentsByStatus[status] || 0) + 1;
      });

      // Calculate average response times
      const closedIncidents = validIncidents.filter(i => i?.resolution_date && i?.reported_date);
      const avgResponseTime = closedIncidents.length > 0 
        ? closedIncidents.reduce((sum, i) => {
            const days = (new Date(i.resolution_date) - new Date(i.reported_date)) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / closedIncidents.length
        : 0;

      // Risk correlation
      const incidentsWithRisks = validIncidents.filter(i => i?.linked_risks?.length > 0);
      const realizedRisks = validRisks.filter(r => 
        validIncidents.some(i => i?.linked_risks?.includes(r?.id))
      );

      // Control failures
      const incidentsWithControls = validIncidents.filter(i => i?.linked_controls?.length > 0);
      const failedControls = validControls.filter(c => 
        validIncidents.some(i => i?.linked_controls?.includes(c?.id)) && 
        (c?.status === 'ineffective' || c?.effectiveness < 3)
      );

      // Recent trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentIncidents = validIncidents.filter(i => 
        i?.reported_date && new Date(i.reported_date) > thirtyDaysAgo
      );

      const context = {
        total_incidents: validIncidents.length,
        critical_incidents: criticalIncidents.length,
        high_incidents: highIncidents.length,
        open_incidents: openIncidents.length,
        regulatory_reportable: regulatoryReportable.length,
        incidents_by_type: incidentsByType,
        incidents_by_status: incidentsByStatus,
        avg_response_time_days: Math.round(avgResponseTime * 10) / 10,
        recent_trend: {
          last_30_days: recentIncidents.length,
          critical_last_30_days: recentIncidents.filter(i => i?.severity === 'critical').length
        },
        top_incidents: validIncidents.slice(0, 10).map(i => ({
          title: i?.title,
          type: i?.incident_type,
          severity: i?.severity,
          status: i?.status,
          reported_date: i?.reported_date,
          regulatory_reportable: i?.regulatory_reportable
        })),
        risk_correlation: {
          incidents_with_risks: incidentsWithRisks.length,
          realized_risks: realizedRisks.length,
          risk_realization_rate: validRisks.length > 0 ? Math.round((realizedRisks.length / validRisks.length) * 100) : 0
        },
        control_analysis: {
          incidents_with_controls: incidentsWithControls.length,
          failed_controls: failedControls.length,
          control_failure_rate: validControls.length > 0 ? Math.round((failedControls.length / validControls.length) * 100) : 0
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As an incident response expert, analyze this incident portfolio and provide actionable insights:

INCIDENT PORTFOLIO SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED INCIDENT ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall incident response posture (Critical/Elevated/Stable/Good)
   - Total incidents: ${validIncidents.length} (${criticalIncidents.length} critical, ${highIncidents.length} high)
   - Open incidents: ${openIncidents.length}
   - Key incident trends and patterns
   - Immediate response priorities

2. INCIDENT LANDSCAPE:
   - Critical incident breakdown by type
   - Emerging incident patterns and attack vectors
   - Incident velocity and frequency trends
   - Top 3 highest priority active incidents

3. RESPONSE EFFECTIVENESS:
   - Average response time: ${Math.round(avgResponseTime)} days
   - Open incident backlog: ${openIncidents.length}
   - Regulatory reportable incidents: ${regulatoryReportable.length}
   - Response capability gaps

4. ROOT CAUSE INSIGHTS:
   - Risk realization rate: ${context.risk_correlation.risk_realization_rate}%
   - Control failures linked to incidents: ${failedControls.length}
   - Common failure patterns
   - Systemic weaknesses identified

5. TREND ANALYSIS:
   - Recent activity (30 days): ${recentIncidents.length} incidents
   - Incident type distribution and shifts
   - Severity escalation patterns
   - Predicted future incidents based on patterns

6. PRIORITY ACTIONS (Top 5):
   - Incident-specific response actions
   - Investigation priorities
   - Control remediation needs
   - Process improvement recommendations
   - Timeline expectations

Focus on incident response and management, not general risk. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            response_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            incident_landscape: {
              type: "object",
              properties: {
                summary: { type: "string" },
                top_incidents: { type: "array", items: { type: "string" } },
                trending: { type: "string" }
              }
            },
            response_effectiveness: {
              type: "object",
              properties: {
                summary: { type: "string" },
                gaps: { type: "array", items: { type: "string" } }
              }
            },
            root_cause_insights: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            trend_analysis: { type: "string" },
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
      console.error('Error generating incident insights:', error);
      setInsights({
        executive_summary: "Unable to generate incident insights at this time. Please try again.",
        response_posture: "Error",
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
    critical: 'bg-rose-500/20 text-rose-400',
    elevated: 'bg-orange-500/20 text-orange-400',
    stable: 'bg-amber-500/20 text-amber-400',
    good: 'bg-emerald-500/20 text-emerald-400'
  };

  return (
    <Card className="bg-gradient-to-br from-rose-500/5 to-red-500/5 border-rose-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-400" />
            <CardTitle className="text-base text-white">Incident Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered incident insights</p>
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
              <div className="p-3 bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-semibold text-white">Incident Response Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.response_posture?.toLowerCase()] || postureColors.stable
                  }`}>
                    {insights.response_posture}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Incident Alerts
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
              {/* Incident Landscape */}
              {insights.incident_landscape && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-rose-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-rose-400" /> Incident Landscape
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.incident_landscape.summary}</p>
                </div>
              )}

              {/* Response Effectiveness */}
              {insights.response_effectiveness && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400" /> Response Time
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.response_effectiveness.summary}</p>
                </div>
              )}
            </div>

            {/* Root Cause Analysis */}
            {insights.root_cause_insights && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-violet-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-violet-400" /> Root Cause Analysis
                  </p>
                  <span className="text-sm font-bold text-violet-400">{insights.root_cause_insights.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.root_cause_insights.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Response Actions
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