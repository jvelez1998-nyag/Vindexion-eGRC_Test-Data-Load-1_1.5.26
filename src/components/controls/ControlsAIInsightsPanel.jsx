import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Shield, Target, Activity, CheckCircle2, Settings } from "lucide-react";

export default function ControlsAIInsightsPanel({ controls, risks, tests, compliance }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(controls) && controls.length > 0 && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const validControls = Array.isArray(controls) ? controls : [];
      const validRisks = Array.isArray(risks) ? risks : [];
      const validTests = Array.isArray(tests) ? tests : [];
      const validCompliance = Array.isArray(compliance) ? compliance : [];

      // Control effectiveness
      const effective = validControls.filter(c => c?.status === 'effective');
      const ineffective = validControls.filter(c => c?.status === 'ineffective');
      const implemented = validControls.filter(c => c?.status === 'implemented');
      const planned = validControls.filter(c => c?.status === 'planned');
      const effectivenessRate = validControls.length > 0
        ? Math.round((effective.length / validControls.length) * 100)
        : 0;

      // Control types
      const byCategory = {};
      validControls.forEach(c => {
        const cat = c?.category || 'other';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });

      // Control domains
      const byDomain = {};
      validControls.forEach(c => {
        const domain = c?.domain || 'other';
        byDomain[domain] = (byDomain[domain] || 0) + 1;
      });

      // Testing status
      const tested = validControls.filter(c => c?.last_tested_date);
      const overdueTesting = validControls.filter(c => {
        if (!c?.last_tested_date || !c?.review_frequency) return false;
        const lastTest = new Date(c.last_tested_date);
        const now = new Date();
        const monthsSince = (now - lastTest) / (1000 * 60 * 60 * 24 * 30);
        const frequencies = { monthly: 1, quarterly: 3, semi_annually: 6, annually: 12 };
        return monthsSince > (frequencies[c.review_frequency] || 12);
      });

      // Risk linkage
      const linkedToRisks = validControls.filter(c => c?.linked_risks?.length > 0);
      const controlsForHighRisks = validControls.filter(c => {
        const linkedRiskIds = c?.linked_risks || [];
        return linkedRiskIds.some(riskId => {
          const risk = validRisks.find(r => r.id === riskId);
          return risk && (risk.likelihood || 0) * (risk.impact || 0) >= 12;
        });
      });

      // Compliance mapping
      const mappedToCompliance = validControls.filter(c => 
        c?.regulatory_mappings?.length > 0 || 
        Object.keys(c?.framework_mappings || {}).length > 0
      );
      const mappingCoverage = validControls.length > 0
        ? Math.round((mappedToCompliance.length / validControls.length) * 100)
        : 0;

      // Test results
      const testPassed = validTests.filter(t => t?.result === 'passed');
      const testFailed = validTests.filter(t => t?.result === 'failed');
      const testPassRate = validTests.length > 0
        ? Math.round((testPassed.length / validTests.length) * 100)
        : 0;

      const context = {
        total_controls: validControls.length,
        effectiveness: {
          effective: effective.length,
          ineffective: ineffective.length,
          implemented: implemented.length,
          planned: planned.length,
          rate: effectivenessRate
        },
        control_types: byCategory,
        control_domains: byDomain,
        testing: {
          tested: tested.length,
          overdue: overdueTesting.length,
          tests_total: validTests.length,
          pass_rate: testPassRate
        },
        risk_linkage: {
          linked: linkedToRisks.length,
          for_high_risks: controlsForHighRisks.length
        },
        compliance_mapping: {
          mapped: mappedToCompliance.length,
          coverage: mappingCoverage
        },
        top_controls: validControls.slice(0, 10).map(c => ({
          name: c?.name,
          category: c?.category,
          domain: c?.domain,
          status: c?.status,
          effectiveness: c?.effectiveness
        }))
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a controls management expert, analyze this control environment and provide actionable insights:

CONTROL ENVIRONMENT SNAPSHOT:
${JSON.stringify(context, null, 2)}

PROVIDE FOCUSED CONTROL ANALYSIS:

1. EXECUTIVE SUMMARY (80-120 words):
   - Overall control environment health (Strong/Adequate/Needs Improvement/Weak)
   - Total controls: ${validControls.length}
   - Effectiveness rate: ${effectivenessRate}%
   - Test pass rate: ${testPassRate}%
   - Compliance mapping: ${mappingCoverage}%
   - Key control gaps and priorities
   - Immediate actions needed

2. EFFECTIVENESS ANALYSIS:
   - Effective: ${effective.length}
   - Ineffective: ${ineffective.length}
   - Effectiveness rate: ${effectivenessRate}%
   - Control performance trends
   - Areas of concern
   - Improvement opportunities

3. CONTROL TESTING:
   - Tests conducted: ${validTests.length}
   - Pass rate: ${testPassRate}%
   - Overdue testing: ${overdueTesting.length}
   - Testing coverage gaps
   - Priority testing needs

4. RISK COVERAGE:
   - Controls linked to risks: ${linkedToRisks.length}
   - High-risk controls: ${controlsForHighRisks.length}
   - Risk mitigation effectiveness
   - Coverage gaps
   - Recommended improvements

5. COMPLIANCE MAPPING:
   - Mapping coverage: ${mappingCoverage}%
   - Unmapped controls: ${validControls.length - mappedToCompliance.length}
   - Framework coverage
   - Mapping quality

6. PRIORITY ACTIONS (Top 5):
   - Control implementation/improvement
   - Testing priorities
   - Risk coverage gaps
   - Compliance mapping needs
   - Timeline expectations

Focus on control effectiveness and operational excellence. Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            control_health: { type: "string" },
            critical_alerts: { type: "array", items: { type: "string" } },
            effectiveness_analysis: {
              type: "object",
              properties: {
                summary: { type: "string" },
                concerns: { type: "array", items: { type: "string" } }
              }
            },
            testing_status: {
              type: "object",
              properties: {
                summary: { type: "string" },
                priorities: { type: "array", items: { type: "string" } }
              }
            },
            risk_coverage: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" }
              }
            },
            compliance_mapping: { type: "string" },
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
      console.error('Error generating control insights:', error);
      setInsights({
        executive_summary: "Unable to generate control insights at this time. Please try again.",
        control_health: "Error",
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
    'needs improvement': 'bg-amber-500/20 text-amber-400',
    weak: 'bg-rose-500/20 text-rose-400'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-base text-white">Control Intelligence</CardTitle>
          </div>
          <Button size="sm" onClick={generateInsights} disabled={loading} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xs shadow-lg shadow-blue-500/20">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {insights ? 'Refresh' : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <p className="text-xs text-slate-500 text-center py-4">Click Generate for control environment insights</p>
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
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-white">Control Environment Summary</span>
                  <Badge className={`text-[10px] ml-auto ${
                    healthColors[insights.control_health?.toLowerCase()] || healthColors.adequate
                  }`}>
                    {insights.control_health}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              </div>
            )}

            {/* Critical Alerts */}
            {insights.critical_alerts?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Critical Control Alerts
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
              {/* Effectiveness Analysis */}
              {insights.effectiveness_analysis && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-blue-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-blue-400" /> Effectiveness
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.effectiveness_analysis.summary}</p>
                </div>
              )}

              {/* Testing Status */}
              {insights.testing_status && (
                <div className="p-2 bg-[#151d2e] rounded-lg border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-white mb-1 flex items-center gap-1">
                    <Settings className="h-3 w-3 text-amber-400" /> Testing
                  </p>
                  <p className="text-[10px] text-slate-400">{insights.testing_status.summary}</p>
                </div>
              )}
            </div>

            {/* Risk Coverage */}
            {insights.risk_coverage && (
              <div className="p-2 bg-[#151d2e] rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-white flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" /> Risk Coverage
                  </p>
                  <span className="text-sm font-bold text-emerald-400">{insights.risk_coverage.score}/100</span>
                </div>
                <p className="text-[10px] text-slate-400">{insights.risk_coverage.summary}</p>
              </div>
            )}

            {/* Priority Actions */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <Target className="h-3 w-3" /> Priority Control Actions
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