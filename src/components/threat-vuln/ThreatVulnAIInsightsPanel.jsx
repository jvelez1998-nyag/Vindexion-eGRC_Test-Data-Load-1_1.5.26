import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, Crosshair, Bug } from "lucide-react";

export default function ThreatVulnAIInsightsPanel({ risks, incidents, controls, assessments }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (((Array.isArray(risks) && risks.length > 0) || (Array.isArray(incidents) && incidents.length > 0)) && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risks, incidents]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validRisks = Array.isArray(risks) ? risks : [];
      const validIncidents = Array.isArray(incidents) ? incidents : [];
      const validControls = Array.isArray(controls) ? controls : [];
      const validAssessments = Array.isArray(assessments) ? assessments : [];

      // Threat-specific filtering
      const threatRisks = validRisks.filter(r => 
        r?.category === 'cybersecurity' || 
        r?.category === 'technology' ||
        r?.title?.toLowerCase().includes('threat') ||
        r?.title?.toLowerCase().includes('vulnerability')
      );
      const criticalThreats = threatRisks.filter(r => (r?.likelihood || 0) * (r?.impact || 0) >= 16);
      const activeThreats = threatRisks.filter(r => r?.status === 'identified' || r?.status === 'mitigating');

      // Security incidents
      const securityIncidents = validIncidents.filter(i => 
        i?.incident_type === 'security_breach' ||
        i?.incident_type === 'cyber_attack' ||
        i?.incident_type === 'malware'
      );
      const criticalIncidents = securityIncidents.filter(i => i?.severity === 'critical');
      const recentIncidents = securityIncidents.filter(i => {
        if (!i?.occurred_date) return false;
        const daysSince = (new Date() - new Date(i.occurred_date)) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });

      // Security controls
      const securityControls = validControls.filter(c => 
        c?.domain === 'network_security' || 
        c?.domain === 'security_operations' ||
        c?.category === 'detective' ||
        c?.category === 'preventive'
      );
      const effectiveControls = securityControls.filter(c => c?.effectiveness >= 4);
      const controlEffectiveness = securityControls.length > 0
        ? Math.round((effectiveControls.length / securityControls.length) * 100)
        : 0;

      // Security assessments
      const securityAssessments = validAssessments.filter(a => 
        a?.assessment_type === 'security' || a?.assessment_type === 'it'
      );
      const completedAssessments = securityAssessments.filter(a => a?.status === 'completed');

      // Threat categories
      const byCategoryOrType = {};
      threatRisks.forEach(r => {
        const cat = r?.category || 'other';
        byCategoryOrType[cat] = (byCategoryOrType[cat] || 0) + 1;
      });

      // Attack vectors (from incidents)
      const attackVectors = {};
      securityIncidents.forEach(i => {
        const type = i?.incident_type || 'unknown';
        attackVectors[type] = (attackVectors[type] || 0) + 1;
      });

      // Average threat score
      const threatsWithScores = threatRisks.filter(r => r?.likelihood && r?.impact);
      const avgThreatScore = threatsWithScores.length > 0
        ? Math.round(threatsWithScores.reduce((sum, r) => sum + ((r.likelihood || 0) * (r.impact || 0)), 0) / threatsWithScores.length)
        : 0;

      const context = {
        total_threats: threatRisks.length,
        critical: criticalThreats.length,
        active: activeThreats.length,
        avg_threat_score: avgThreatScore,
        threat_distribution: byCategoryOrType,
        security_incidents: {
          total: securityIncidents.length,
          critical: criticalIncidents.length,
          recent_30d: recentIncidents.length
        },
        attack_vectors: attackVectors,
        security_controls: {
          total: securityControls.length,
          effective: effectiveControls.length,
          effectiveness_rate: controlEffectiveness
        },
        security_assessments: {
          total: securityAssessments.length,
          completed: completedAssessments.length
        },
        top_threats: threatRisks.slice(0, 10).map(r => ({
          title: r?.title,
          category: r?.category,
          score: (r?.likelihood || 0) * (r?.impact || 0),
          status: r?.status
        }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a threat intelligence and vulnerability management expert, analyze this threat landscape and provide actionable insights:

THREAT LANDSCAPE SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED THREAT ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall threat posture (Secure/Monitored/Elevated/Critical)
   - Total threats: ${threatRisks.length} (${criticalThreats.length} critical, ${activeThreats.length} active)
   - Average threat score: ${avgThreatScore}/25
   - Security incidents: ${securityIncidents.length} (${recentIncidents.length} in last 30 days)
   - Control effectiveness: ${controlEffectiveness}%
   - Key threat exposures and priorities
   - Immediate response needs

2. THREAT LANDSCAPE:
   - Total threats: ${threatRisks.length}
   - Critical: ${criticalThreats.length}
   - Active: ${activeThreats.length}
   - Threat distribution by category
   - Emerging threat patterns
   - Top threat vectors

3. INCIDENT ANALYSIS:
   - Security incidents: ${securityIncidents.length}
   - Critical: ${criticalIncidents.length}
   - Recent (30d): ${recentIncidents.length}
   - Attack vector trends
   - Incident patterns
   - Repeat attack indicators

4. CONTROL EFFECTIVENESS:
   - Security controls: ${securityControls.length}
   - Effectiveness rate: ${controlEffectiveness}%
   - Control gaps
   - Detection vs. prevention balance
   - Recommended improvements

5. VULNERABILITY ASSESSMENT:
   - Assessments completed: ${completedAssessments.length}
   - Coverage gaps
   - Assessment priorities
   - Risk exposure areas

6. PRIORITY ACTIONS (Top 5):
   - Threat mitigation priorities
   - Incident response needs
   - Control implementation/improvement
   - Assessment completion priorities
   - Timeline-critical actions

Focus on threat intelligence and vulnerability management. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            threat_posture: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            threat_landscape: {
              type: "object",
              properties: {
                summary: { type: "string" },
                vectors: { type: "array", items: { type: "string" } }
              }
            },
            incident_analysis: {
              type: "object",
              properties: {
                summary: { type: "string" },
                patterns: { type: "array", items: { type: "string" } }
              }
            },
            control_effectiveness: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            vulnerability_assessment: { type: "string" },
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
      console.error('Error generating threat insights:', error);
      setInsights({
        executive_summary: "Unable to generate threat insights at this time. Please try again.",
        threat_posture: "Error",
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
    secure: 'bg-emerald-500/20 text-emerald-400',
    monitored: 'bg-blue-500/20 text-blue-400',
    elevated: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-400" />
            <CardTitle className="text-base text-white">Threat Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-red-600 hover:bg-red-700 text-xs">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for AI-powered threat intelligence insights</p>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-red-400 animate-spin" />
          </div>
        )}
        {insights && (
          <div className="space-y-3">
            {/* Executive Summary */}
            {insights.executive_summary && (
              <div className="p-3 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-white">Threat Landscape Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    postureColors[insights.threat_posture?.toLowerCase()] || postureColors.monitored
                  }`}>
                    {insights.threat_posture}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Threat Alerts
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
              {/* Threat Landscape */}
              {insights.threat_landscape && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-red-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Crosshair className="h-3 w-3 text-red-400" /> Threats
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.threat_landscape.summary}</p>
                </div>
              )}

              {/* Incident Analysis */}
              {insights.incident_analysis && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Bug className="h-3 w-3 text-amber-400" /> Incidents
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.incident_analysis.summary}</p>
                </div>
              )}
            </div>

            {/* Control Effectiveness */}
            {insights.control_effectiveness && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" /> Controls
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.control_effectiveness.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.control_effectiveness.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Threat Actions
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
                      {item.timeline && <p className="text-[10px] text-red-400 mt-0.5">{item.timeline}</p>}
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