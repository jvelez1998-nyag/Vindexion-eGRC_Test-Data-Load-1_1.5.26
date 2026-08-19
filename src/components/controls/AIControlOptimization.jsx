import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle2, Zap, Target, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AIControlOptimization({ controls }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list()
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['risks'],
    queryFn: () => base44.entities.Risk.list()
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list()
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings'],
    queryFn: () => base44.entities.AuditFinding.list()
  });

  const generateOptimization = async () => {
    setLoading(true);
    try {
      // Prepare data summary
      const ineffectiveControls = controls.filter(c => c.status === 'ineffective' || c.effectiveness < 3);
      const failedTests = controlTests.filter(t => t.test_result === 'failed');
      const criticalRisks = risks.filter(r => (r.likelihood || 3) * (r.impact || 3) >= 12);
      const recentIncidents = incidents.filter(i => 
        new Date(i.created_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      );

      // Advanced ML-style analytics
      // 1. Effectiveness Trends Over Time
      const effectivenessTrends = controls.map(control => {
        const tests = controlTests
          .filter(t => t.control_id === control.id)
          .sort((a, b) => new Date(a.test_date) - new Date(b.test_date));
        
        if (tests.length < 2) return null;
        
        const recentTests = tests.slice(-5);
        const passRate = recentTests.filter(t => t.test_result === 'passed').length / recentTests.length;
        const trend = tests.length >= 3 ? 
          (recentTests.slice(-3).filter(t => t.test_result === 'passed').length / 3) - 
          (tests.slice(0, 3).filter(t => t.test_result === 'passed').length / 3) : 0;
        
        return {
          control_id: control.id,
          control_name: control.name,
          pass_rate: (passRate * 100).toFixed(1),
          trend: trend > 0.1 ? 'improving' : trend < -0.1 ? 'deteriorating' : 'stable',
          test_count: tests.length,
          prediction: trend < -0.2 ? 'high_risk_failure' : trend > 0.2 ? 'will_improve' : 'steady'
        };
      }).filter(Boolean);

      // 2. Co-Testing Patterns (controls tested together)
      const testingPatterns = {};
      controlTests.forEach(test => {
        const sameDay = controlTests.filter(t => 
          t.test_date === test.test_date && t.control_id !== test.control_id
        );
        sameDay.forEach(other => {
          const key = [test.control_id, other.control_id].sort().join('-');
          testingPatterns[key] = (testingPatterns[key] || 0) + 1;
        });
      });

      const frequentCoTests = Object.entries(testingPatterns)
        .filter(([_, count]) => count >= 3)
        .map(([key, count]) => {
          const [id1, id2] = key.split('-');
          const c1 = controls.find(c => c.id === id1);
          const c2 = controls.find(c => c.id === id2);
          return {
            control1: c1?.name || id1,
            control2: c2?.name || id2,
            co_test_frequency: count,
            domains: [c1?.domain, c2?.domain],
            potential_redundancy: c1?.domain === c2?.domain && c1?.category === c2?.category
          };
        });

      // 3. Control-Incident Correlation
      const controlIncidentCorrelation = controls.map(control => {
        const linkedRisks = risks.filter(r => control.linked_risks?.includes(r.id));
        const realizedIncidents = recentIncidents.filter(inc => 
          inc.linked_risks?.some(rId => linkedRisks.some(lr => lr.id === rId))
        );
        const controlFailures = controlTests.filter(t => 
          t.control_id === control.id && t.test_result === 'failed'
        );
        
        return {
          control_name: control.name,
          incident_count: realizedIncidents.length,
          failure_count: controlFailures.length,
          correlation_strength: realizedIncidents.length > 0 && controlFailures.length > 0 ? 'high' : 'low'
        };
      }).filter(c => c.incident_count > 0 || c.failure_count > 0);

      // Build comprehensive analysis prompt with ML insights
      const prompt = `As an advanced GRC AI optimization engine with predictive ML capabilities, analyze the control environment and provide strategic, context-aware recommendations.

CONTROL LANDSCAPE:
Total Controls: ${controls.length}
Ineffective/Weak Controls: ${ineffectiveControls.length}
Average Effectiveness: ${(controls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / controls.filter(c => c.effectiveness).length).toFixed(1)}/5

Control Domains Coverage:
${[...new Set(controls.map(c => c.domain))].map(d => `- ${d}: ${controls.filter(c => c.domain === d).length} controls`).join('\n')}

TESTING DATA:
Total Tests Conducted: ${controlTests.length}
Failed Tests: ${failedTests.length}
Test Failure Rate: ${controlTests.length ? ((failedTests.length / controlTests.length) * 100).toFixed(1) : 0}%

Recurring Failures:
${Object.entries(controlTests.reduce((acc, test) => {
  if (test.test_result === 'failed') {
    acc[test.control_id] = (acc[test.control_id] || 0) + 1;
  }
  return acc;
}, {})).slice(0, 5).map(([id, count]) => {
  const control = controls.find(c => c.id === id);
  return `- ${control?.name || id}: ${count} failures`;
}).join('\n')}

RISK & INCIDENT CONTEXT:
Critical Risks: ${criticalRisks.length}
Recent Incidents (90 days): ${recentIncidents.length}
Audit Findings: ${findings.length}

===== ADVANCED ML INSIGHTS =====

1. EFFECTIVENESS TREND ANALYSIS (Predictive):
${effectivenessTrends.slice(0, 10).map(t => 
  `- ${t.control_name}: ${t.pass_rate}% pass rate, trend: ${t.trend}, prediction: ${t.prediction} (${t.test_count} tests)`
).join('\n')}

Key Insights:
- Deteriorating Controls: ${effectivenessTrends.filter(t => t.trend === 'deteriorating').length}
- High-Risk Predictions: ${effectivenessTrends.filter(t => t.prediction === 'high_risk_failure').length}
- Improving Controls: ${effectivenessTrends.filter(t => t.trend === 'improving').length}

2. CO-TESTING PATTERN ANALYSIS (Redundancy Detection):
${frequentCoTests.slice(0, 8).map(p => 
  `- "${p.control1}" + "${p.control2}": tested together ${p.co_test_frequency}x, redundancy: ${p.potential_redundancy ? 'YES' : 'no'}`
).join('\n')}

Potential Redundancies Identified: ${frequentCoTests.filter(p => p.potential_redundancy).length}

3. CONTROL-INCIDENT CORRELATION (Weakness-Threat Mapping):
${controlIncidentCorrelation.slice(0, 8).map(c => 
  `- ${c.control_name}: ${c.incident_count} incidents, ${c.failure_count} failures, correlation: ${c.correlation_strength}`
).join('\n')}

High-Correlation Weaknesses: ${controlIncidentCorrelation.filter(c => c.correlation_strength === 'high').length}

4. CURRENT THREAT LANDSCAPE & REGULATORY CHANGES (Context for 2025):
Consider these emerging threats and regulations:
- AI/ML Security Risks: GenAI data leakage, model poisoning, prompt injection attacks
- Supply Chain Security: Third-party SaaS vulnerabilities, open-source dependencies
- Regulatory: EU AI Act compliance, SEC cybersecurity disclosure rules, DORA (Digital Operational Resilience Act)
- Zero Trust Architecture: Identity-centric security, continuous verification
- Cloud Security: Multi-cloud misconfigurations, container security, serverless risks

Provide a comprehensive, ML-enhanced optimization strategy with:

1. CONTROL IMPROVEMENTS (prioritize controls with deteriorating trends & high incident correlation):
   - Specific enhancement recommendations
   - Root cause analysis linked to trend data
   - Predictive failure risk assessment
   - Expected impact on incident reduction
   - Implementation timeline

2. CONTROL RETIREMENTS (focus on co-tested redundancies):
   - Justification based on co-testing patterns
   - Risk assessment of removal
   - Consolidation opportunities
   - Transition plan

3. NEW CONTROL RECOMMENDATIONS (address emerging threats & regulatory gaps):
   - Control description targeting 2025 threat landscape
   - Rationale citing specific industry threats (AI security, supply chain, etc.)
   - Regulatory driver (EU AI Act, DORA, SEC rules, etc.)
   - Priority level based on threat severity
   - Implementation guidance
   - Framework mappings (NIST AI RMF, ISO 42001 for AI, etc.)

4. PREDICTIVE REMEDIATION PRIORITIES:
   - Controls predicted to fail soon (from trend analysis)
   - Controls with high incident correlation
   - Streamlining opportunities (co-tested controls)
   - Threat-aligned quick wins

5. PRIORITIZED ACTION PLAN:
   - Ranked by predicted impact and urgency
   - Quick wins vs. strategic initiatives
   - Resource requirements
   - Timeline and milestones
   - Success metrics tied to incident reduction

Return detailed, actionable, ML-informed JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            overall_health_score: { type: "number" },
            control_improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  control_name: { type: "string" },
                  current_issues: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } },
                  root_cause: { type: "string" },
                  trend_analysis: { type: "string" },
                  failure_prediction: { type: "string" },
                  incident_correlation: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  effort_level: { type: "string" }
                }
              }
            },
            control_retirements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_id: { type: "string" },
                  control_name: { type: "string" },
                  retirement_reason: { type: "string" },
                  redundancy_analysis: { type: "string" },
                  co_tested_with: { type: "array", items: { type: "string" } },
                  consolidation_opportunity: { type: "string" },
                  risk_assessment: { type: "string" },
                  transition_plan: { type: "string" },
                  alternative_controls: { type: "array", items: { type: "string" } }
                }
              }
            },
            new_control_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_name: { type: "string" },
                  description: { type: "string" },
                  domain: { type: "string" },
                  category: { type: "string" },
                  rationale: { type: "string" },
                  threat_alignment: { type: "string" },
                  regulatory_driver: { type: "string" },
                  industry_trend: { type: "string" },
                  priority: { type: "string" },
                  implementation_steps: { type: "array", items: { type: "string" } },
                  framework_mappings: {
                    type: "object",
                    properties: {
                      COSO: { type: "array", items: { type: "string" } },
                      COBIT: { type: "array", items: { type: "string" } },
                      ISO27001: { type: "array", items: { type: "string" } },
                      NIST: { type: "array", items: { type: "string" } },
                      EU_AI_ACT: { type: "array", items: { type: "string" } },
                      DORA: { type: "array", items: { type: "string" } }
                    }
                  },
                  estimated_effort: { type: "string" }
                }
              }
            },
            predictive_insights: {
              type: "object",
              properties: {
                high_risk_controls: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      control_name: { type: "string" },
                      failure_probability: { type: "string" },
                      trend: { type: "string" },
                      recommended_action: { type: "string" }
                    }
                  }
                },
                redundancy_opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      control_pair: { type: "string" },
                      co_test_frequency: { type: "string" },
                      consolidation_benefit: { type: "string" }
                    }
                  }
                },
                threat_correlated_weaknesses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      control_name: { type: "string" },
                      threat_type: { type: "string" },
                      incident_count: { type: "string" },
                      urgency: { type: "string" }
                    }
                  }
                }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rank: { type: "number" },
                  action: { type: "string" },
                  type: { type: "string" },
                  priority: { type: "string" },
                  quick_win: { type: "boolean" },
                  impact: { type: "string" },
                  effort: { type: "string" },
                  timeline: { type: "string" },
                  dependencies: { type: "array", items: { type: "string" } },
                  success_metrics: { type: "array", items: { type: "string" } }
                }
              }
            },
            key_insights: {
              type: "array",
              items: { type: "string" }
            },
            risk_mitigation_impact: { type: "string" }
          }
        }
      });

      setAnalysis(response);
      toast.success("Control optimization analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate optimization analysis");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">AI Control Optimization Engine</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl mx-auto">
          Analyze {controls.length} controls, {controlTests.length} test results, and {risks.length} risks to generate strategic recommendations for control improvements, retirements, and new control implementations
        </p>
        <div className="grid grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-blue-400">{controls.length}</div>
            <div className="text-xs text-slate-500">Controls</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-amber-400">{controlTests.filter(t => t.test_result === 'failed').length}</div>
            <div className="text-xs text-slate-500">Failed Tests</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-rose-400">{risks.filter(r => (r.likelihood || 3) * (r.impact || 3) >= 12).length}</div>
            <div className="text-xs text-slate-500">Critical Risks</div>
          </div>
          <div className="p-3 bg-[#151d2e] rounded-lg border border-[#2a3548]">
            <div className="text-2xl font-bold text-indigo-400">{controls.filter(c => c.status === 'ineffective').length}</div>
            <div className="text-xs text-slate-500">Ineffective</div>
          </div>
        </div>
        <Button onClick={generateOptimization} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Optimization Plan
            </>
          )}
        </Button>
      </Card>
    );
  }

  const priorityColors = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Control Optimization Strategy</h3>
        <Button onClick={() => setAnalysis(null)} variant="outline" className="border-[#2a3548]">
          Generate New Analysis
        </Button>
      </div>

      {/* Executive Summary Card */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h4 className="text-sm text-slate-400 mb-2">Overall Control Health Score</h4>
            <div className="text-5xl font-bold text-white mb-4">{analysis.overall_health_score}<span className="text-2xl text-slate-400">/100</span></div>
            <p className="text-sm text-slate-300">{analysis.executive_summary}</p>
          </div>
          <TrendingUp className="h-16 w-16 text-indigo-400 opacity-20" />
        </div>
      </Card>

      {/* Key Insights */}
      {analysis.key_insights?.length > 0 && (
        <Card className="bg-[#1a2332] border-[#2a3548] p-6">
          <h4 className="font-semibold text-white mb-4">Key Insights</h4>
          <div className="space-y-2">
            {analysis.key_insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <Zap className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                {insight}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs defaultValue="improvements" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          <TabsTrigger value="improvements">Improvements ({analysis.control_improvements?.length || 0})</TabsTrigger>
          <TabsTrigger value="new">New Controls ({analysis.new_control_recommendations?.length || 0})</TabsTrigger>
          <TabsTrigger value="retirements">Retirements ({analysis.control_retirements?.length || 0})</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan ({analysis.action_plan?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="predictive">
          {analysis.predictive_insights && (
            <div className="space-y-6">
              {/* High Risk Controls */}
              <Card className="bg-[#1a2332] border-[#2a3548] p-5">
                <h4 className="font-semibold text-rose-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  High-Risk Control Predictions ({analysis.predictive_insights.high_risk_controls?.length || 0})
                </h4>
                <div className="space-y-3">
                  {analysis.predictive_insights.high_risk_controls?.map((control, idx) => (
                    <div key={idx} className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-white">{control.control_name}</h5>
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          {control.failure_probability}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-300 space-y-1">
                        <div><span className="text-slate-500">Trend:</span> {control.trend}</div>
                        <div><span className="text-slate-500">Action:</span> {control.recommended_action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Redundancy Opportunities */}
              <Card className="bg-[#1a2332] border-[#2a3548] p-5">
                <h4 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Control Redundancy & Streamlining ({analysis.predictive_insights.redundancy_opportunities?.length || 0})
                </h4>
                <div className="space-y-3">
                  {analysis.predictive_insights.redundancy_opportunities?.map((opp, idx) => (
                    <div key={idx} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-white">{opp.control_pair}</h5>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {opp.co_test_frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{opp.consolidation_benefit}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Threat-Correlated Weaknesses */}
              <Card className="bg-[#1a2332] border-[#2a3548] p-5">
                <h4 className="font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Threat-Correlated Control Weaknesses ({analysis.predictive_insights.threat_correlated_weaknesses?.length || 0})
                </h4>
                <div className="space-y-3">
                  {analysis.predictive_insights.threat_correlated_weaknesses?.map((weakness, idx) => (
                    <div key={idx} className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-white mb-1">{weakness.control_name}</h5>
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                            {weakness.threat_type}
                          </Badge>
                        </div>
                        <Badge className={weakness.urgency === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-400'}>
                          {weakness.urgency}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-300">
                        <span className="text-slate-500">Incidents:</span> {weakness.incident_count}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="improvements">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.control_improvements?.map((improvement, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-white mb-1">{improvement.control_name}</h5>
                      <Badge className={priorityColors[improvement.priority?.toLowerCase() || 'medium']}>
                        {improvement.priority} Priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-500/10 text-slate-400 text-[10px]">{improvement.effort_level}</Badge>
                      <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">{improvement.timeline}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">Current Issues:</span>
                      <ul className="mt-1 space-y-1">
                        {improvement.current_issues?.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-rose-300">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {improvement.trend_analysis && (
                      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                        <span className="text-slate-500 font-medium">📊 Trend Analysis:</span>
                        <p className="text-slate-300 mt-1">{improvement.trend_analysis}</p>
                      </div>
                    )}

                    {improvement.failure_prediction && (
                      <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded">
                        <span className="text-slate-500 font-medium">🔮 Failure Prediction:</span>
                        <p className="text-slate-300 mt-1">{improvement.failure_prediction}</p>
                      </div>
                    )}

                    {improvement.incident_correlation && (
                      <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded">
                        <span className="text-slate-500 font-medium">🎯 Incident Correlation:</span>
                        <p className="text-slate-300 mt-1">{improvement.incident_correlation}</p>
                      </div>
                    )}

                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded">
                      <span className="text-slate-500 font-medium">Root Cause:</span>
                      <p className="text-slate-300 mt-1">{improvement.root_cause}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Recommendations:</span>
                      <ul className="mt-1 space-y-1">
                        {improvement.recommendations?.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-emerald-300">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded">
                      <span className="text-slate-500 font-medium">Expected Impact:</span>
                      <p className="text-slate-300 mt-1">{improvement.expected_impact}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="new">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.new_control_recommendations?.map((control, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-white mb-1">{control.control_name}</h5>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
                          {control.domain}
                        </Badge>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                          {control.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={priorityColors[control.priority?.toLowerCase() || 'medium']}>
                      {control.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">{control.description}</p>

                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded">
                      <span className="text-slate-500 font-medium">Rationale:</span>
                      <p className="text-slate-300 mt-1">{control.rationale}</p>
                    </div>

                    {control.threat_alignment && (
                      <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded">
                        <span className="text-slate-500 font-medium">🎯 Threat Alignment:</span>
                        <p className="text-slate-300 mt-1">{control.threat_alignment}</p>
                      </div>
                    )}

                    {control.regulatory_driver && (
                      <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded">
                        <span className="text-slate-500 font-medium">⚖️ Regulatory Driver:</span>
                        <p className="text-slate-300 mt-1">{control.regulatory_driver}</p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
                      <span className="text-slate-500 font-medium">Industry Trend:</span>
                      <p className="text-slate-300 mt-1">{control.industry_trend}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium">Implementation Steps:</span>
                      <ol className="mt-1 space-y-1 list-decimal list-inside">
                        {control.implementation_steps?.map((step, i) => (
                          <li key={i} className="text-slate-300">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {control.framework_mappings && Object.entries(control.framework_mappings).some(([_, ids]) => ids?.length > 0) && (
                      <div>
                        <span className="text-slate-500 font-medium">Framework Mappings:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(control.framework_mappings).map(([framework, ids]) =>
                            ids?.length > 0 && (
                              <Badge key={framework} className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
                                {framework}: {ids.join(', ')}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span>Estimated Effort: {control.estimated_effort}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="retirements">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {analysis.control_retirements?.length === 0 ? (
                <Card className="bg-[#1a2332] border-[#2a3548] p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-400">No controls recommended for retirement</p>
                </Card>
              ) : (
                analysis.control_retirements?.map((retirement, idx) => (
                  <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                    <h5 className="font-semibold text-white mb-3">{retirement.control_name}</h5>

                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded">
                        <span className="text-slate-500 font-medium">Retirement Reason:</span>
                        <p className="text-slate-300 mt-1">{retirement.retirement_reason}</p>
                      </div>

                      {retirement.redundancy_analysis && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded">
                          <span className="text-slate-500 font-medium">🔄 Redundancy Analysis:</span>
                          <p className="text-slate-300 mt-1">{retirement.redundancy_analysis}</p>
                        </div>
                      )}

                      {retirement.co_tested_with?.length > 0 && (
                        <div>
                          <span className="text-slate-500 font-medium">Co-Tested With:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {retirement.co_tested_with.map((control, i) => (
                              <Badge key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                                {control}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {retirement.consolidation_opportunity && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded">
                          <span className="text-slate-500 font-medium">💡 Consolidation Opportunity:</span>
                          <p className="text-slate-300 mt-1">{retirement.consolidation_opportunity}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-500 font-medium">Risk Assessment:</span>
                        <p className="text-slate-300 mt-1">{retirement.risk_assessment}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium">Transition Plan:</span>
                        <p className="text-slate-300 mt-1">{retirement.transition_plan}</p>
                      </div>

                      {retirement.alternative_controls?.length > 0 && (
                        <div>
                          <span className="text-slate-500 font-medium">Alternative Controls:</span>
                          <ul className="mt-1 space-y-1">
                            {retirement.alternative_controls.map((alt, i) => (
                              <li key={i} className="flex items-start gap-2 text-emerald-300">
                                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {alt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="action-plan">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {analysis.action_plan?.map((action, idx) => (
                <Card key={idx} className="bg-[#1a2332] border-[#2a3548] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                      <span className="text-lg font-bold text-indigo-400">{action.rank}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-white">{action.action}</h5>
                        <div className="flex items-center gap-2">
                          {action.quick_win && (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                              <Zap className="h-3 w-3 mr-1" />
                              Quick Win
                            </Badge>
                          )}
                          <Badge className={priorityColors[action.priority?.toLowerCase() || 'medium']}>
                            {action.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-xs">
                          <span className="text-slate-500">Type:</span>
                          <div className="text-white font-medium">{action.type}</div>
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-500">Impact:</span>
                          <div className="text-white font-medium">{action.impact}</div>
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-500">Effort:</span>
                          <div className="text-white font-medium">{action.effort}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <Clock className="h-3 w-3" />
                        Timeline: {action.timeline}
                      </div>

                      {action.dependencies?.length > 0 && (
                        <div className="text-xs mb-2">
                          <span className="text-slate-500">Dependencies:</span>
                          <div className="text-slate-300 mt-1">{action.dependencies.join(', ')}</div>
                        </div>
                      )}

                      {action.success_metrics?.length > 0 && (
                        <div className="text-xs">
                          <span className="text-slate-500">Success Metrics:</span>
                          <ul className="mt-1 space-y-1">
                            {action.success_metrics.map((metric, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-slate-300">
                                <Target className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {analysis.risk_mitigation_impact && (
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-4 mt-4">
              <h5 className="text-sm font-semibold text-emerald-400 mb-2">Risk Mitigation Impact</h5>
              <p className="text-sm text-slate-300">{analysis.risk_mitigation_impact}</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}