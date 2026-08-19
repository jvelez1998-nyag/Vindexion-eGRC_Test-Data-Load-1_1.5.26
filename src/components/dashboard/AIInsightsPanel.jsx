import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Clock, Activity, Brain } from "lucide-react";
import DrillDownModal from "@/components/ui/drill-down-modal";

export default function AIInsightsPanel({ risks, compliance, controls, audits, controlTests = [], incidents = [], findings = [], vendors = [] }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null, type: '' });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [expandedSummary, setExpandedSummary] = useState(false);

  useEffect(() => {
    const hasData = (Array.isArray(risks) && risks.length > 0) || 
                    (Array.isArray(compliance) && compliance.length > 0) || 
                    (Array.isArray(controls) && controls.length > 0);
    
    if (hasData && !insights && !loading) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risks, compliance, controls]);

  const generateInsights = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    try {
      // Ensure we have valid data with null filtering
      const validRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
      const validCompliance = Array.isArray(compliance) ? compliance.filter(c => c) : [];
      const validControls = Array.isArray(controls) ? controls.filter(c => c) : [];
      const validAudits = Array.isArray(audits) ? audits.filter(a => a) : [];
      const validIncidents = Array.isArray(incidents) ? incidents.filter(i => i) : [];
      const validFindings = Array.isArray(findings) ? findings.filter(f => f) : [];
      
      // Calculate audit metrics for predictive analytics
      const inProgressAudits = validAudits.filter(a => a?.status === 'in_progress');
      const completedAudits = validAudits.filter(a => a?.status === 'completed');
      
      // Calculate control test failure rates
      const recentTests = Array.isArray(controlTests) ? controlTests.filter(t => t).slice(0, 50) : [];
      const failedTests = recentTests.filter(t => t && t.test_result === 'failed');
      const failureRate = recentTests.length ? ((failedTests.length / recentTests.length) * 100).toFixed(1) : 0;

      // Identify trending control weaknesses
      const controlFailures = {};
      failedTests.forEach(test => {
        if (test && test.control_id) {
          controlFailures[test.control_id] = (controlFailures[test.control_id] || 0) + 1;
        }
      });

      const weakControls = Array.isArray(controls) ? controls.filter(c => 
        c && (c.effectiveness < 3 || c.status === 'ineffective' || (c.id && controlFailures[c.id] >= 2))
      ) : [];

      const context = {
        risks: validRisks.slice(0, 15).map(r => ({ 
          title: r.title || 'Untitled Risk', 
          category: r.category || 'uncategorized', 
          status: r.status || 'open', 
          likelihood: r.likelihood || 0, 
          impact: r.impact || 0,
          score: (r.likelihood || 0) * (r.impact || 0)
        })),
        compliance: validCompliance.slice(0, 15).map(c => ({ 
          framework: c.framework || 'Unknown', 
          status: c.status || 'pending',
          requirement: c.requirement || 'N/A'
        })),
        controls: validControls.slice(0, 15).map(c => ({ 
          name: c.name || 'Unnamed Control', 
          domain: c.domain || 'general', 
          status: c.status || 'planned', 
          effectiveness: c.effectiveness || 0 
        })),
        audits: validAudits.slice(0, 10).map(a => ({ 
          title: a.title || 'Untitled Audit', 
          status: a.status || 'planned', 
          start_date: a.start_date || null,
          target_date: a.target_date || null
        })),
        audit_metrics: {
          total_audits: validAudits.length,
          in_progress: inProgressAudits.length,
          completed: completedAudits.length,
          avg_findings_per_audit: validFindings.length && validAudits.length ? (validFindings.length / validAudits.length).toFixed(1) : 0
        },
        control_health: {
          total_tests: recentTests.length,
          failure_rate: failureRate + '%',
          weak_controls_count: weakControls.length,
          weak_controls: weakControls.slice(0, 5).map(c => ({ name: c.name || 'Unknown', domain: c.domain || 'general', effectiveness: c.effectiveness || 0 }))
        },
        recent_incidents: validIncidents.slice(0, 10).map(i => ({
          type: i.incident_type || 'unknown',
          severity: i.severity || 'low',
          status: i.status || 'open'
        })),
        findings_summary: {
          total: validFindings.length,
          critical: validFindings.filter(f => f && f.severity === 'critical').length,
          high: validFindings.filter(f => f && f.severity === 'high').length,
          open: validFindings.filter(f => f && f.status === 'open').length
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As an expert GRC analyst, provide a comprehensive real-time executive dashboard summary analyzing ALL GRC data:

DASHBOARD DATA SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE DETAILED ANALYSIS:

 1. EXECUTIVE SUMMARY:
    Provide a concise structured summary with these key points as separate bullet items (max 3-4 sentences each):
    - Status Overview: Overall GRC posture and key metrics
    - Critical Focus: Top 2 immediate concerns
    - Trend: Overall direction (improving/declining/stable)
    Keep each bullet point brief and scannable for mobile viewing.

 2. RISK LANDSCAPE:
    - Critical risks: ${validRisks.filter(r => r && ((r.likelihood || 0) * (r.impact || 0)) >= 16).length}
   - Risk distribution by category and severity  
   - Emerging risk patterns
   - Top 3 risks by impact

   3. COMPLIANCE STATUS:
   - Compliance rate analysis
   - Framework coverage assessment
   - Critical gaps requiring immediate action
   - Frameworks at risk

4. CONTROL EFFECTIVENESS:
   - Control health score (0-100)
   - Test failure rate: ${failureRate}%
   - Controls requiring attention: ${weakControls.length}
   - Top 3 weak controls with remediation priority

5. AUDIT & INCIDENT INSIGHTS:
   - Active audits: ${inProgressAudits.length}
   - Critical findings: ${validFindings.filter(f => f && f.severity === 'critical').length}
   - Recent incident trends
   - Predicted completion dates for in-progress audits

6. PRIORITY ACTIONS (Top 5):
   - Specific, actionable items with timelines
   - Clear rationale and expected impact

Be specific, use actual numbers, and provide actionable intelligence.

CRITICAL: Ensure all recommendations are based on actual data provided.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { 
              type: "object",
              properties: {
                status_overview: { type: "string" },
                critical_focus: { type: "string" },
                trend: { type: "string" }
              }
            },
            overall_status: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            risk_landscape: {
              type: "object",
              properties: {
                summary: { type: "string" },
                top_risks: { type: "array", items: { type: "string" } }
              }
            },
            compliance_status: {
              type: "object",
              properties: {
                summary: { type: "string" },
                critical_gaps: { type: "array", items: { type: "string" } }
              }
            },
            control_health: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" },
                weak_controls: { type: "array", items: { type: "string" } }
              }
            },
            audit_insights: {
              type: "object",
              properties: {
                summary: { type: "string" },
                predictions: { type: "array", items: { 
                  type: "object",
                  properties: {
                    audit: { type: "string" },
                    eta: { type: "string" }
                  }
                }}
              }
            },
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
      setLastUpdate(new Date());
      if (!isAutoRefresh) {
        // Only show toast for manual refresh
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights({
        executive_summary: {
          status_overview: "Unable to generate insights at this time.",
          critical_focus: "AI service temporarily unavailable",
          trend: "Please try again"
        },
        overall_status: "Error",
        critical_alerts: ["AI service temporarily unavailable"],
        priority_actions: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh insights every 60 seconds
  useEffect(() => {
    if (!insights) return;
    
    const interval = setInterval(() => {
      generateInsights(true);
    }, 60000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights]);

  const urgencyColors = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#1e2840] to-violet-950/20 border border-violet-500/20 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <CardHeader className="relative pb-3 sm:pb-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 flex-shrink-0">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                AI Control Enhancement Engine
              </CardTitle>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden sm:block">Proactive control improvements & new control suggestions</p>
            </div>
          </div>
          <Button size="sm" onClick={() => generateInsights(false)} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg text-xs flex-shrink-0">
            {loading ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline ml-1.5">{insights ? 'Analyze Now' : 'Analyze Now'}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {!insights && !loading && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-violet-400/30 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-2">Ready to generate AI-powered insights</p>
            <p className="text-xs text-slate-500">Click "Generate Insights" to analyze your GRC data</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-violet-400 animate-spin mb-4" />
            <p className="text-sm text-slate-400">Analyzing GRC data with AI...</p>
          </div>
        )}
        
        {insights && (
          <div className="space-y-4">
            {/* Executive Summary - Mobile Optimized */}
            {insights.executive_summary && (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-violet-500/5 border border-indigo-500/20">
                <div className="relative p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-lg">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          Executive Summary
                        </h3>
                      </div>
                    </div>
                    <Badge className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 font-semibold flex-shrink-0 ${
                      insights.overall_status?.toLowerCase().includes('critical') ? 'bg-rose-500/20 text-rose-200 border-rose-400/40' :
                      insights.overall_status?.toLowerCase().includes('good') ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' :
                      'bg-amber-500/20 text-amber-200 border-amber-400/40'
                    }`}>
                      {insights.overall_status}
                    </Badge>
                  </div>
                  
                  <div className="relative p-3 sm:p-4 bg-[#0f1623]/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/5">
                    {typeof insights.executive_summary === 'string' ? (
                      <>
                        <p className={`text-xs sm:text-sm text-slate-100 leading-relaxed ${!expandedSummary ? 'line-clamp-3 sm:line-clamp-none' : ''}`}>
                          {insights.executive_summary}
                        </p>
                        <button 
                          onClick={() => setExpandedSummary(!expandedSummary)}
                          className="sm:hidden mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          {expandedSummary ? 'Show less' : 'Read more'}
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        {insights.executive_summary?.status_overview && (
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide">Status</span>
                              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed mt-0.5">{insights.executive_summary.status_overview}</p>
                            </div>
                          </div>
                        )}
                        {insights.executive_summary?.critical_focus && (
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">Critical</span>
                              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed mt-0.5">{insights.executive_summary.critical_focus}</p>
                            </div>
                          </div>
                        )}
                        {insights.executive_summary?.trend && (
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                            <div>
                              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Trend</span>
                              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed mt-0.5">{insights.executive_summary.trend}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-indigo-300">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">Updated {new Date(lastUpdate).toLocaleTimeString()}</span>
                      <span className="sm:hidden">{new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-indigo-400/40"></div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-indigo-300">
                      <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>AI-Powered</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Concerns Section - Mobile Optimized */}
            {insights.critical_alerts?.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Key Concerns</h4>
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px] sm:text-xs">
                    {insights.critical_alerts.length}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:gap-2.5">
                  {insights.critical_alerts.slice(0, 3).map((alert, i) => (
                    <div 
                      key={i} 
                      className="relative overflow-hidden p-2.5 sm:p-4 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent rounded-lg sm:rounded-xl border border-rose-500/20"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-rose-500 to-orange-500"></div>
                      <div className="relative flex items-start gap-2 sm:gap-3 pl-2 sm:pl-0">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-rose-400">
                          {i + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-white leading-relaxed flex-1">{alert}</p>
                      </div>
                    </div>
                  ))}
                  {insights.critical_alerts.length > 3 && (
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 text-center py-1">
                      +{insights.critical_alerts.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {/* Risk Landscape */}
              {insights.risk_landscape && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-lg sm:rounded-xl border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-rose-500/20">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-rose-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Risk Landscape</h4>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">{insights.risk_landscape.summary}</p>
                </div>
              )}

              {/* Compliance Status */}
              {insights.compliance_status && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg sm:rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-blue-500/20">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white">Compliance</h4>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">{insights.compliance_status.summary}</p>
                </div>
              )}

              {/* Control Health */}
              {insights.control_health && (
                <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg sm:rounded-xl border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/20">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Control Health</h4>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                      {insights.control_health.score}
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">{insights.control_health.summary}</p>
                </div>
              )}
            </div>

            {/* Priority Actions */}
            {insights.priority_actions?.length > 0 && (
              <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg sm:rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Top Priority Actions</h4>
                </div>
                <div className="space-y-2">
                  {insights.priority_actions.slice(0, 3).map((item, i) => (
                    <div 
                      key={i} 
                      className="relative p-2.5 sm:p-3 bg-[#0f1623]/60 rounded-lg border border-[#2a3548]"
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-indigo-400">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                            <Badge className={`text-[9px] sm:text-[10px] ${urgencyColors[item.urgency?.toLowerCase()] || urgencyColors.medium}`}>
                              {item.urgency}
                            </Badge>
                            {item.timeline && (
                              <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] text-indigo-400">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="truncate">{item.timeline}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-white leading-relaxed">{item.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {insights.priority_actions.length > 3 && (
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 text-center w-full py-1">
                      +{insights.priority_actions.length - 3} more actions
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <DrillDownModal 
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null, type: '' })}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
      />
    </Card>
  );
}