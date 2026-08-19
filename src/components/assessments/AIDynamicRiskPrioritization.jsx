import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Loader2, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  Activity,
  Flame,
  Zap,
  Target,
  ArrowUp,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function AIDynamicRiskPrioritization({ risks = [] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [prioritizedRisks, setPrioritizedRisks] = useState(null);

  const { data: controls = [] } = useQuery({
    queryKey: ['controls'],
    queryFn: () => base44.entities.Control.list('-created_date', 200),
    staleTime: 300000
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-created_date', 200),
    staleTime: 300000
  });

  const { data: controlTests = [] } = useQuery({
    queryKey: ['control-tests'],
    queryFn: () => base44.entities.ControlTest.list('-test_date', 200),
    staleTime: 300000
  });

  const analyzePrioritization = async () => {
    setAnalyzing(true);
    try {
      // Prepare data for AI analysis
      const riskData = risks.slice(0, 50).map(risk => {
        const linkedControls = controls.filter(c => 
          risk.linked_controls?.includes(c.id)
        );
        
        const relatedIncidents = incidents.filter(i => 
          risk.linked_incidents?.includes(i.id) || 
          i.incident_type?.toLowerCase().includes(risk.category?.toLowerCase())
        );

        const controlTests = controlTests.filter(t => 
          linkedControls.some(c => c.id === t.control_id)
        );

        const failedTests = controlTests.filter(t => t.test_result === 'failed').length;
        const controlEffectiveness = linkedControls.length > 0 
          ? linkedControls.reduce((sum, c) => sum + (c.effectiveness || 3), 0) / linkedControls.length 
          : 3;

        return {
          id: risk.id,
          title: risk.title,
          category: risk.category,
          residual_score: risk.residual_risk_score || (risk.residual_likelihood * risk.residual_impact),
          inherent_score: risk.inherent_risk_score || (risk.inherent_likelihood * risk.inherent_impact),
          control_count: linkedControls.length,
          control_effectiveness: controlEffectiveness,
          failed_control_tests: failedTests,
          related_incidents: relatedIncidents.length,
          critical_incidents: relatedIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length,
          status: risk.status,
          owner: risk.owner,
          last_assessment: risk.last_assessment_date,
          mitigation_progress: risk.mitigation_progress || 0
        };
      });

      const prompt = `As an expert risk analyst, perform dynamic risk prioritization using multiple factors.

RISK DATA:
${JSON.stringify(riskData, null, 2)}

ANALYSIS FRAMEWORK:
For each risk, calculate a dynamic priority score (0-100) considering:

1. RESIDUAL RISK SCORE (30% weight)
   - Current residual risk level after controls
   - Higher scores = higher priority

2. CONTROL EFFECTIVENESS (25% weight)
   - Number and effectiveness of linked controls
   - Failed control tests significantly increase priority
   - Fewer/weaker controls = higher priority

3. INCIDENT HISTORY (25% weight)
   - Related incidents (especially critical/high severity)
   - Recent incident patterns
   - More incidents = higher priority

4. TREND & MOMENTUM (20% weight)
   - Mitigation progress (low progress = higher priority)
   - Time since last assessment
   - Status (open/in_progress get higher priority than closed)

PROVIDE:
- Dynamic priority score for each risk (0-100)
- Priority tier: CRITICAL (90-100), HIGH (70-89), MEDIUM (50-69), LOW (0-49)
- Top 3 factors driving the priority
- Urgency level: IMMEDIATE, URGENT, MODERATE, LOW
- Recommended timeline for action
- Risk velocity indicator (ACCELERATING, STABLE, IMPROVING)

Return the top 20 risks ranked by priority score.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_summary: { type: "string" },
            prioritization_methodology: { type: "string" },
            prioritized_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_id: { type: "string" },
                  risk_title: { type: "string" },
                  priority_score: { type: "number" },
                  priority_tier: { type: "string" },
                  urgency: { type: "string" },
                  velocity: { type: "string" },
                  driving_factors: { 
                    type: "array", 
                    items: { type: "string" } 
                  },
                  recommended_timeline: { type: "string" },
                  immediate_actions: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                }
              }
            },
            critical_attention_needed: { 
              type: "array", 
              items: { type: "string" } 
            },
            trend_analysis: { type: "string" }
          }
        }
      });

      setPrioritizedRisks(result);
      toast.success(`Prioritized ${result.prioritized_risks?.length || 0} risks`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze risk prioritization");
    } finally {
      setAnalyzing(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'immediate': return Flame;
      case 'urgent': return Zap;
      case 'moderate': return Clock;
      default: return Activity;
    }
  };

  const getVelocityColor = (velocity) => {
    switch (velocity?.toLowerCase()) {
      case 'accelerating': return 'text-rose-400';
      case 'stable': return 'text-amber-400';
      case 'improving': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/5 border border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 shadow-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                  AI Dynamic Risk Prioritization
                </CardTitle>
                <p className="text-sm text-slate-400 mt-0.5">
                  Multi-factor intelligent risk ranking & urgency analysis
                </p>
              </div>
            </div>
            <Button
              onClick={analyzePrioritization}
              disabled={analyzing || risks.length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {analyzing ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Analyze Priorities</>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Summary */}
      {prioritizedRisks && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-5 w-5 text-rose-400" />
                  <div className="text-2xl font-bold text-white">
                    {prioritizedRisks.prioritized_risks?.filter(r => r.priority_tier === 'CRITICAL').length || 0}
                  </div>
                </div>
                <div className="text-xs text-slate-400">Critical Priority Risks</div>
                <div className="text-[10px] text-rose-400 mt-0.5">Immediate action required</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                  <div className="text-2xl font-bold text-white">
                    {prioritizedRisks.prioritized_risks?.filter(r => r.priority_tier === 'HIGH').length || 0}
                  </div>
                </div>
                <div className="text-xs text-slate-400">High Priority Risks</div>
                <div className="text-[10px] text-orange-400 mt-0.5">Urgent attention needed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                  <div className="text-2xl font-bold text-white">
                    {prioritizedRisks.prioritized_risks?.filter(r => r.velocity === 'ACCELERATING').length || 0}
                  </div>
                </div>
                <div className="text-xs text-slate-400">Accelerating Risks</div>
                <div className="text-[10px] text-indigo-400 mt-0.5">Worsening trend</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Analysis Summary</h3>
              </div>
              <p className="text-sm text-slate-200 mb-4 leading-relaxed">{prioritizedRisks.analysis_summary}</p>
              
              {prioritizedRisks.critical_attention_needed?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Attention Required:
                  </h4>
                  <ul className="space-y-1">
                    {prioritizedRisks.critical_attention_needed.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prioritized Risks List */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base">
                Prioritized Risks ({prioritizedRisks.prioritized_risks?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px]">
                <div className="space-y-3">
                  {prioritizedRisks.prioritized_risks?.map((risk, idx) => {
                    const UrgencyIcon = getUrgencyIcon(risk.urgency);
                    return (
                      <Card 
                        key={idx} 
                        className={`bg-[#151d2e] border-2 transition-all hover:scale-[1.01] ${
                          risk.priority_tier === 'CRITICAL' 
                            ? 'border-rose-500/50 shadow-lg shadow-rose-500/20' 
                            : risk.priority_tier === 'HIGH'
                            ? 'border-orange-500/40 shadow-md shadow-orange-500/10'
                            : 'border-[#2a3548] hover:border-indigo-500/30'
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="text-2xl font-bold text-white bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg w-10 h-10 flex items-center justify-center">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-white mb-2">{risk.risk_title}</h4>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getTierColor(risk.priority_tier)}>
                                    {risk.priority_tier}
                                  </Badge>
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1">
                                    <UrgencyIcon className="h-3 w-3" />
                                    {risk.urgency}
                                  </Badge>
                                  <Badge className={`border ${getVelocityColor(risk.velocity)}`} variant="outline">
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                    {risk.velocity}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                {risk.priority_score}
                              </div>
                              <div className="text-[10px] text-slate-500">Priority Score</div>
                            </div>
                          </div>

                          <Progress 
                            value={risk.priority_score} 
                            className="h-2 mb-4"
                          />

                          <div className="space-y-3">
                            <div>
                              <div className="text-xs text-slate-500 mb-1.5">Driving Factors:</div>
                              <div className="space-y-1">
                                {risk.driving_factors?.slice(0, 3).map((factor, i) => (
                                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                    <Shield className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                    <span>{factor}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-2 bg-[#1a2332] rounded border border-purple-500/20">
                                <div className="text-xs text-slate-500 mb-1">Timeline:</div>
                                <div className="text-xs font-semibold text-purple-400">{risk.recommended_timeline}</div>
                              </div>
                              <div className="p-2 bg-[#1a2332] rounded border border-indigo-500/20">
                                <div className="text-xs text-slate-500 mb-1">Velocity:</div>
                                <div className={`text-xs font-semibold ${getVelocityColor(risk.velocity)}`}>
                                  {risk.velocity}
                                </div>
                              </div>
                            </div>

                            {risk.immediate_actions?.length > 0 && (
                              <div>
                                <div className="text-xs text-slate-500 mb-1.5">Immediate Actions:</div>
                                <ul className="space-y-1">
                                  {risk.immediate_actions.slice(0, 3).map((action, i) => (
                                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                      <span className="text-indigo-400 mt-0.5">→</span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}